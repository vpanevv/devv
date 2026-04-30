import Foundation
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

final class ReminderManager: NSObject, UNUserNotificationCenterDelegate, @unchecked Sendable {
    static let shared = ReminderManager()

    private let center = UNUserNotificationCenter.current()
    private let categoryIdentifier = "liquidtasks.reminder"
    private let snooze15Identifier = "liquidtasks.snooze.15"
    private let snooze60Identifier = "liquidtasks.snooze.60"
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
        }

        guard state == .authorized else { return }

        for snapshot in tasks where shouldSchedule(snapshot) {
            guard let request = makeRequest(for: snapshot) else { continue }
            try? await add(request)
        }
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .list, .sound]
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse
    ) async {
        switch response.actionIdentifier {
        case snooze15Identifier:
            await scheduleSnooze(for: response.notification.request, interval: 15 * 60)
        case snooze60Identifier:
            await scheduleSnooze(for: response.notification.request, interval: 60 * 60)
        default:
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

    private func makeRequest(for snapshot: ReminderTaskSnapshot) -> UNNotificationRequest? {
        guard let scheduledAt = snapshot.scheduledAt else { return nil }

        let content = UNMutableNotificationContent()
        content.title = snapshot.title
        if let notes = snapshot.notes, !notes.isEmpty {
            content.body = notes
        }
        content.sound = .default
        content.categoryIdentifier = categoryIdentifier
        content.userInfo = [
            taskIDKey: snapshot.id.uuidString,
            taskTitleKey: snapshot.title,
            taskNotesKey: snapshot.notes ?? ""
        ]

        let triggerDate = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: scheduledAt
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: triggerDate, repeats: false)
        return UNNotificationRequest(
            identifier: identifier(for: snapshot.id),
            content: content,
            trigger: trigger
        )
    }

    private func identifier(for taskID: UUID) -> String {
        managedPrefix + taskID.uuidString
    }

    private func scheduleSnooze(for request: UNNotificationRequest, interval: TimeInterval) async {
        guard let content = request.content.mutableCopy() as? UNMutableNotificationContent else { return }

        content.sound = .default
        content.categoryIdentifier = categoryIdentifier

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: interval, repeats: false)
        let snoozedRequest = UNNotificationRequest(
            identifier: request.identifier,
            content: content,
            trigger: trigger
        )

        try? await add(snoozedRequest)
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
