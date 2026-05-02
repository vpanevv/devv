import Foundation
import OSLog
import UserNotifications

struct ReminderTaskSnapshot: Sendable {
    let id: UUID
    let title: String
    let notes: String?
    let isCompleted: Bool
    let scheduledAt: Date?

    init(task: TaskItem) {
        id = task.id
        title = task.title
        notes = task.notes
        isCompleted = task.isCompleted
        scheduledAt = task.scheduledAt
    }
}

enum ReminderPermissionState {
    case unknown
    case notDetermined
    case denied
    case authorized
}

private actor ReminderActionTracker {
    private var activeActionKeys = Set<String>()
    private var recentlyProcessed = [String: Date]()
    private let recencyWindow: TimeInterval = 8

    func beginProcessing(key: String, now: Date = .now) -> Bool {
        prune(now: now)

        guard !activeActionKeys.contains(key), recentlyProcessed[key] == nil else {
            return false
        }

        activeActionKeys.insert(key)
        return true
    }

    func finishProcessing(key: String, now: Date = .now) {
        activeActionKeys.remove(key)
        recentlyProcessed[key] = now
        prune(now: now)
    }

    private func prune(now: Date) {
        recentlyProcessed = recentlyProcessed.filter { now.timeIntervalSince($0.value) < recencyWindow }
    }
}

private struct ReminderPayload: Sendable {
    let taskID: UUID
    let title: String
    let notes: String?
    let requestIdentifier: String

    init?(request: UNNotificationRequest) {
        guard let taskIDString = request.content.userInfo["taskID"] as? String,
              let taskID = UUID(uuidString: taskIDString) else {
            return nil
        }

        self.taskID = taskID
        self.title = request.content.title
        self.notes = request.content.body.isEmpty ? nil : request.content.body
        self.requestIdentifier = request.identifier
    }
}

final class ReminderManager: NSObject, UNUserNotificationCenterDelegate, @unchecked Sendable {
    static let shared = ReminderManager()

    private let logger = Logger(subsystem: "com.vpanevv.LiquidTasks", category: "ReminderManager")
    private let center = UNUserNotificationCenter.current()
    private let actionTracker = ReminderActionTracker()
    private let categoryIdentifier = "liquidtasks.reminder"
    private let snooze15Identifier = "liquidtasks.snooze.15"
    private let snooze60Identifier = "liquidtasks.snooze.60"
    private let completeIdentifier = "liquidtasks.complete"
    private let managedPrefix = "liquidtasks.task."
    private let taskIDKey = "taskID"
    private let taskTitleKey = "taskTitle"
    private let taskNotesKey = "taskNotes"

    private override init() {
        super.init()
    }

    func configure() {
        center.delegate = self
        center.setNotificationCategories([reminderCategory])
        logger.notice("Configured reminder notification categories and delegate")
    }

    func authorizationState() async -> ReminderPermissionState {
        await withCheckedContinuation { continuation in
            center.getNotificationSettings { settings in
                let resolvedState: ReminderPermissionState
                switch settings.authorizationStatus {
                case .authorized, .provisional, .ephemeral:
                    resolvedState = .authorized
                case .denied:
                    resolvedState = .denied
                case .notDetermined:
                    resolvedState = .notDetermined
                @unknown default:
                    resolvedState = .unknown
                }

                continuation.resume(returning: resolvedState)
            }
        }
    }

    func requestAuthorizationIfNeeded() async -> ReminderPermissionState {
        let state = await authorizationState()
        guard state == .notDetermined else { return state }

        let granted = await requestAuthorization(options: [.alert, .badge, .sound])
        logger.notice("Notification authorization requested. Granted: \(granted, privacy: .public)")
        return granted ? .authorized : .denied
    }

    func synchronize(tasks: [ReminderTaskSnapshot]) async {
        let state = await authorizationState()
        let desiredIdentifiers = Set(tasks.compactMap { snapshot in
            shouldKeepReminder(snapshot) ? identifier(for: snapshot.id) : nil
        })

        let pendingIdentifiers = await pendingNotificationIdentifiers()
        let deliveredIdentifiers = await deliveredNotificationIdentifiers()

        let managedIdentifiers = Set(pendingIdentifiers).union(deliveredIdentifiers)
        let identifiersToRemove = Array(managedIdentifiers.subtracting(desiredIdentifiers))
        if !identifiersToRemove.isEmpty {
            center.removePendingNotificationRequests(withIdentifiers: identifiersToRemove)
            center.removeDeliveredNotifications(withIdentifiers: identifiersToRemove)
            logger.debug("Removed \(identifiersToRemove.count, privacy: .public) stale reminder notifications")
        }

        guard state == .authorized else {
            logger.debug("Skipping reminder scheduling. Authorization state: \(self.authorizationDescription(for: state), privacy: .public)")
            return
        }

        for snapshot in tasks where shouldSchedule(snapshot) {
            guard let request = makeRequest(for: snapshot) else { continue }
            do {
                try await add(request)
                logger.debug("Scheduled reminder \(request.identifier, privacy: .public) for \(snapshot.scheduledAt?.formatted(date: .abbreviated, time: .shortened) ?? "unknown", privacy: .public)")
            } catch {
                logger.error("Failed to schedule reminder \(request.identifier, privacy: .public): \(error.localizedDescription, privacy: .public)")
            }
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        logger.notice("Foreground reminder delivery for \(notification.request.identifier, privacy: .public)")
        return [.banner, .list, .sound]
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        let key = actionKey(for: response)
        let shouldProcess = await actionTracker.beginProcessing(key: key)
        guard shouldProcess else {
            logger.debug("Ignoring duplicate reminder action \(response.actionIdentifier, privacy: .public) for \(response.notification.request.identifier, privacy: .public)")
            return
        }

        defer {
            Task {
                await self.actionTracker.finishProcessing(key: key)
            }
        }

        let request = response.notification.request
        let action = response.actionIdentifier
        logger.notice("Received reminder action \(action, privacy: .public) for \(request.identifier, privacy: .public)")

        switch response.actionIdentifier {
        case snooze15Identifier:
            await scheduleSnooze(for: request, interval: 15 * 60)
        case snooze60Identifier:
            await scheduleSnooze(for: request, interval: 60 * 60)
        case completeIdentifier:
            await completeTask(for: request)
        case UNNotificationDefaultActionIdentifier:
            logger.debug("Opened app from reminder body for \(request.identifier, privacy: .public)")
        case UNNotificationDismissActionIdentifier:
            logger.debug("Dismissed reminder \(request.identifier, privacy: .public)")
        default:
            logger.warning("Unhandled reminder action \(action, privacy: .public) for \(request.identifier, privacy: .public)")
            break
        }
    }

    private var reminderCategory: UNNotificationCategory {
        UNNotificationCategory(
            identifier: categoryIdentifier,
            actions: [
                UNNotificationAction(
                    identifier: snooze15Identifier,
                    title: "Snooze 15 min"
                ),
                UNNotificationAction(
                    identifier: snooze60Identifier,
                    title: "Snooze 1 hour"
                ),
                UNNotificationAction(
                    identifier: completeIdentifier,
                    title: "Complete task"
                )
            ],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )
    }

    private func shouldSchedule(_ snapshot: ReminderTaskSnapshot) -> Bool {
        guard !snapshot.isCompleted, let scheduledAt = snapshot.scheduledAt else { return false }
        return scheduledAt > Date()
    }

    private func shouldKeepReminder(_ snapshot: ReminderTaskSnapshot) -> Bool {
        !snapshot.isCompleted && snapshot.scheduledAt != nil
    }

    private func identifier(for taskID: UUID) -> String {
        managedPrefix + taskID.uuidString
    }

    private func scheduleSnooze(for request: UNNotificationRequest, interval: TimeInterval) async {
        let snoozedDate = Date().addingTimeInterval(interval)
        guard let payload = ReminderPayload(request: request) else {
            logger.warning("Skipping snooze for malformed reminder payload \(request.identifier, privacy: .public)")
            removeNotifications(for: request.identifier)
            return
        }

        removeNotifications(for: request.identifier)

        guard let snapshot = await LiquidTasksRuntime.snoozeTask(
            id: payload.taskID,
            until: snoozedDate,
            source: "notification-snooze"
        ) else {
            logger.warning("Skipping snooze because task is stale or missing for \(request.identifier, privacy: .public)")
            return
        }

        guard let snoozedRequest = makeRequest(for: snapshot, requestIdentifierOverride: request.identifier, snoozeInterval: interval) else {
            logger.warning("Unable to rebuild snoozed reminder request for \(request.identifier, privacy: .public)")
            return
        }

        do {
            try await add(snoozedRequest)
            logger.notice("Snoozed reminder \(request.identifier, privacy: .public) for \(interval, privacy: .public) seconds")
        } catch {
            logger.error("Unable to schedule snoozed reminder \(request.identifier, privacy: .public): \(error.localizedDescription, privacy: .public)")
        }
    }

    private func completeTask(for request: UNNotificationRequest) async {
        guard let payload = ReminderPayload(request: request) else {
            logger.warning("Skipping complete action for malformed reminder payload \(request.identifier, privacy: .public)")
            removeNotifications(for: request.identifier)
            return
        }

        removeNotifications(for: request.identifier)
        let didComplete = await LiquidTasksRuntime.completeTask(id: payload.taskID, source: "notification-complete")
        logger.notice("Complete reminder action finished for \(request.identifier, privacy: .public). Completed: \(didComplete, privacy: .public)")
    }

    private func removeNotifications(for identifier: String) {
        guard identifier.hasPrefix(managedPrefix) else { return }
        center.removeDeliveredNotifications(withIdentifiers: [identifier])
        center.removePendingNotificationRequests(withIdentifiers: [identifier])
    }

    private func requestAuthorization(options: UNAuthorizationOptions) async -> Bool {
        await withCheckedContinuation { continuation in
            center.requestAuthorization(options: options) { granted, _ in
                continuation.resume(returning: granted)
            }
        }
    }

    private func pendingNotificationIdentifiers() async -> [String] {
        await withCheckedContinuation { continuation in
            center.getPendingNotificationRequests { requests in
                continuation.resume(
                    returning: requests
                        .map(\.identifier)
                        .filter { $0.hasPrefix(self.managedPrefix) }
                )
            }
        }
    }

    private func deliveredNotificationIdentifiers() async -> [String] {
        await withCheckedContinuation { continuation in
            center.getDeliveredNotifications { notifications in
                continuation.resume(
                    returning: notifications
                        .map(\.request.identifier)
                        .filter { $0.hasPrefix(self.managedPrefix) }
                )
            }
        }
    }

    private func actionKey(for response: UNNotificationResponse) -> String {
        let request = response.notification.request
        let deliveryTime = Int(response.notification.date.timeIntervalSince1970)
        let taskID = (request.content.userInfo[taskIDKey] as? String) ?? "unknown"
        return "\(request.identifier)|\(response.actionIdentifier)|\(taskID)|\(deliveryTime)"
    }

    private func makeRequest(
        for snapshot: ReminderTaskSnapshot,
        requestIdentifierOverride: String? = nil,
        snoozeInterval: TimeInterval? = nil
    ) -> UNNotificationRequest? {
        guard let scheduledAt = snapshot.scheduledAt else { return nil }

        let content = UNMutableNotificationContent()
        content.title = snapshot.title
        if let notes = snapshot.notes, !notes.isEmpty {
            content.body = notes
        }
        content.sound = .default
        content.categoryIdentifier = categoryIdentifier

        var userInfo: [String: Any] = [
            taskIDKey: snapshot.id.uuidString,
            taskTitleKey: snapshot.title,
            taskNotesKey: snapshot.notes ?? ""
        ]

        if let snoozeInterval {
            userInfo["liquidtasks.snoozedAt"] = Date().timeIntervalSince1970
            userInfo["liquidtasks.snoozeInterval"] = snoozeInterval
        }

        content.userInfo = userInfo

        let triggerDate = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute, .second],
            from: scheduledAt
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: triggerDate, repeats: false)
        return UNNotificationRequest(
            identifier: requestIdentifierOverride ?? identifier(for: snapshot.id),
            content: content,
            trigger: trigger
        )
    }

    private func authorizationDescription(for state: ReminderPermissionState) -> String {
        switch state {
        case .unknown:
            "unknown"
        case .notDetermined:
            "notDetermined"
        case .denied:
            "denied"
        case .authorized:
            "authorized"
        }
    }

    private func add(_ request: UNNotificationRequest) async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            center.add(request) { error in
                if let error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume(returning: ())
                }
            }
        }
    }
}
