import AppIntents
import OSLog
import SwiftData
import SwiftUI

enum LiquidTasksLaunchAction: String {
    case none
    case addTask
    case showTodayTasks
}

enum LiquidTasksRuntime {
    private static let logger = Logger(subsystem: "com.vpanevv.LiquidTasks", category: "LiquidTasksRuntime")
    static let launchActionKey = "liquidTasksPendingLaunchAction"
    static let currentProfileNameKey = LocalProfile.currentProfileNameKey
    static let legacyUserNameKey = LocalProfile.legacyUserNameKey
    static let xpDateKey = "liquidTasksXPDateByProfile"
    static let todayXPKey = "liquidTasksTodayXPByProfile"
    static let recordXPKey = "liquidTasksRecordXPByProfile"
    static let dailyTargetXPKey = "liquidTasksDailyTargetXP"
    static let lastTargetHitDateKey = "liquidTasksLastTargetHitDateByProfile"

    static let modelContainer: ModelContainer = {
        do {
            return try ModelContainer(for: TaskItem.self)
        } catch {
            fatalError("Unable to create Liquid Tasks model container: \(error.localizedDescription)")
        }
    }()

    static func queueLaunchAction(_ action: LiquidTasksLaunchAction) {
        logger.debug("Queueing launch action: \(action.rawValue, privacy: .public)")
        UserDefaults.standard.set(action.rawValue, forKey: launchActionKey)
    }

    static func currentProfileName() -> String {
        let defaults = UserDefaults.standard
        let stored = defaults.string(forKey: currentProfileNameKey)
            ?? defaults.string(forKey: legacyUserNameKey)
            ?? ""
        return LocalProfile.displayName(from: stored)
    }

    static func currentProfileID() -> String {
        LocalProfile.normalizedID(from: currentProfileName())
    }

    static func setCurrentProfileName(_ rawName: String) {
        let displayName = LocalProfile.displayName(from: rawName)
        let defaults = UserDefaults.standard
        defaults.set(displayName, forKey: currentProfileNameKey)
        defaults.set(displayName, forKey: legacyUserNameKey)
        logger.notice("Activated local profile \(profileLogName(for: displayName), privacy: .public)")
    }

    static func peekLaunchAction() -> LiquidTasksLaunchAction {
        LiquidTasksLaunchAction(rawValue: UserDefaults.standard.string(forKey: launchActionKey) ?? "") ?? .none
    }

    static func consumeLaunchAction() -> LiquidTasksLaunchAction {
        let action = peekLaunchAction()
        UserDefaults.standard.set(LiquidTasksLaunchAction.none.rawValue, forKey: launchActionKey)
        logger.debug("Consuming launch action: \(action.rawValue, privacy: .public)")
        return action
    }

    @MainActor
    static func completeTask(id: UUID, source: String = "notification") async -> Bool {
        let context = ModelContext(modelContainer)
        guard let task = fetchTask(id: id, context: context) else {
            logger.warning("Complete task skipped. Missing task \(id.uuidString, privacy: .public) from \(source, privacy: .public)")
            return false
        }

        guard !task.isCompleted else {
            logger.debug("Complete task skipped. Task \(id.uuidString, privacy: .public) already completed from \(source, privacy: .public)")
            return false
        }

        task.isCompleted = true
        task.scheduledAt = nil

        do {
            try context.save()
        } catch {
            logger.error("Unable to complete task \(id.uuidString, privacy: .public) from \(source, privacy: .public): \(error.localizedDescription, privacy: .public)")
            return false
        }

        let allTasks = fetchAllTasks(context: context)
        synchronizeXPState(tasks: allTasks)
        await ReminderManager.shared.synchronize(tasks: allTasks.map(ReminderTaskSnapshot.init(task:)))
        logger.notice("Completed task \(id.uuidString, privacy: .public) from \(source, privacy: .public)")
        return true
    }

    @MainActor
    static func snoozeTask(id: UUID, until scheduledAt: Date, source: String = "notification") async -> ReminderTaskSnapshot? {
        let context = ModelContext(modelContainer)
        guard let task = fetchTask(id: id, context: context) else {
            logger.warning("Snooze skipped. Missing task \(id.uuidString, privacy: .public) from \(source, privacy: .public)")
            return nil
        }

        guard !task.isCompleted else {
            logger.debug("Snooze skipped. Task \(id.uuidString, privacy: .public) already completed from \(source, privacy: .public)")
            return nil
        }

        task.scheduledAt = scheduledAt

        do {
            try context.save()
        } catch {
            logger.error("Unable to snooze task \(id.uuidString, privacy: .public) until \(scheduledAt.formatted(date: .abbreviated, time: .shortened), privacy: .public): \(error.localizedDescription, privacy: .public)")
            return nil
        }

        logger.notice("Snoozed task \(id.uuidString, privacy: .public) until \(scheduledAt.formatted(date: .abbreviated, time: .shortened), privacy: .public)")
        return ReminderTaskSnapshot(task: task)
    }

    @MainActor
    static func synchronizeXPState(tasks: [TaskItem]) {
        let defaults = UserDefaults.standard
        let currentDayKey = Self.currentDayKey()
        var todayXPByProfile = defaults.dictionary(forKey: todayXPKey) as? [String: Int] ?? [:]
        var recordXPByProfile = defaults.dictionary(forKey: recordXPKey) as? [String: Int] ?? [:]
        var xpDateByProfile = defaults.dictionary(forKey: xpDateKey) as? [String: String] ?? [:]
        var lastTargetHitDateByProfile = defaults.dictionary(forKey: lastTargetHitDateKey) as? [String: String] ?? [:]

        let allProfileIDs = Set(
            tasks.map { normalizedOwnerName(for: $0.ownerName) }
        ).union(todayXPByProfile.keys)

        let target = defaults.integer(forKey: dailyTargetXPKey)

        for profileID in allProfileIDs {
            let profileTasks = tasks.filter { normalizedOwnerName(for: $0.ownerName) == profileID }
            let totalXP = profileTasks
                .filter(\.isCompleted)
                .reduce(into: 0) { result, task in
                    result += task.priority.xpValue
                }

            if xpDateByProfile[profileID] != currentDayKey {
                xpDateByProfile[profileID] = currentDayKey
                lastTargetHitDateByProfile[profileID] = ""
            }

            todayXPByProfile[profileID] = totalXP
            recordXPByProfile[profileID] = max(recordXPByProfile[profileID] ?? 0, totalXP)

            if totalXP >= target, target > 0 {
                lastTargetHitDateByProfile[profileID] = currentDayKey
            }

            logger.debug("Synchronized XP state for profile \(profileID, privacy: .public). Completed tasks: \(profileTasks.filter(\.isCompleted).count, privacy: .public), total XP: \(totalXP, privacy: .public)")
        }

        defaults.set(todayXPByProfile, forKey: todayXPKey)
        defaults.set(recordXPByProfile, forKey: recordXPKey)
        defaults.set(xpDateByProfile, forKey: xpDateKey)
        defaults.set(lastTargetHitDateByProfile, forKey: lastTargetHitDateKey)
    }

    static func todayXP(for profileID: String) -> Int {
        profileIntDictionaryValue(forKey: todayXPKey, profileID: profileID)
    }

    static func recordXP(for profileID: String) -> Int {
        profileIntDictionaryValue(forKey: recordXPKey, profileID: profileID)
    }

    static func xpDate(for profileID: String) -> String {
        profileStringDictionaryValue(forKey: xpDateKey, profileID: profileID)
    }

    static func lastTargetHitDate(for profileID: String) -> String {
        profileStringDictionaryValue(forKey: lastTargetHitDateKey, profileID: profileID)
    }

    @MainActor
    static func migrateLegacyTasksIfNeeded() {
        let context = ModelContext(modelContainer)
        let fallbackOwner = currentProfileID()
        let allTasks = fetchAllTasks(context: context)
        var didChange = false

        for task in allTasks {
            let normalizedOwner = normalizedOwnerName(for: task.ownerName)
            if task.ownerName != normalizedOwner {
                task.ownerName = normalizedOwner.isEmpty ? fallbackOwner : normalizedOwner
                didChange = true
            }
        }

        let currentDisplayName = currentProfileName()
        if UserDefaults.standard.string(forKey: currentProfileNameKey) == nil,
           !currentDisplayName.isEmpty {
            setCurrentProfileName(currentDisplayName)
        }

        guard didChange else { return }

        do {
            try context.save()
            logger.notice("Migrated legacy tasks to profile ownership")
        } catch {
            logger.error("Failed to migrate legacy tasks: \(error.localizedDescription, privacy: .public)")
        }
    }

    @MainActor
    private static func fetchTask(id: UUID, context: ModelContext) -> TaskItem? {
        var descriptor = FetchDescriptor<TaskItem>(
            predicate: #Predicate<TaskItem> { $0.id == id }
        )
        descriptor.fetchLimit = 1
        return try? context.fetch(descriptor).first
    }

    @MainActor
    private static func fetchAllTasks(context: ModelContext) -> [TaskItem] {
        (try? context.fetch(FetchDescriptor<TaskItem>())) ?? []
    }

    static func currentDayKey() -> String {
        let formatter = DateFormatter()
        formatter.calendar = .current
        formatter.locale = .current
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter.string(from: .now)
    }

    private static func normalizedOwnerName(for rawOwnerName: String?) -> String {
        let candidate = rawOwnerName ?? ""
        let normalized = LocalProfile.normalizedID(from: candidate)
        return normalized.isEmpty ? LocalProfile.guestProfileID : normalized
    }

    private static func profileIntDictionaryValue(forKey key: String, profileID: String) -> Int {
        let dictionary = UserDefaults.standard.dictionary(forKey: key) as? [String: Int] ?? [:]
        return dictionary[profileID] ?? 0
    }

    private static func profileStringDictionaryValue(forKey key: String, profileID: String) -> String {
        let dictionary = UserDefaults.standard.dictionary(forKey: key) as? [String: String] ?? [:]
        return dictionary[profileID] ?? ""
    }

    private static func profileLogName(for displayName: String) -> String {
        displayName.isEmpty ? LocalProfile.guestProfileID : displayName
    }
}

struct AddTaskShortcutIntent: AppIntent {
    static let title: LocalizedStringResource = "Add Task in Liquid Tasks"
    static let description = IntentDescription("Open Liquid Tasks directly into the new task flow.")
    static let openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        LiquidTasksRuntime.queueLaunchAction(.addTask)
        return .result()
    }
}

struct ShowTodayTasksShortcutIntent: AppIntent {
    static let title: LocalizedStringResource = "Show Today's Tasks"
    static let description = IntentDescription("Open Liquid Tasks to the main dashboard.")
    static let openAppWhenRun = true

    @MainActor
    func perform() async throws -> some IntentResult {
        LiquidTasksRuntime.queueLaunchAction(.showTodayTasks)
        return .result()
    }
}

struct LiquidTasksShortcutsProvider: AppShortcutsProvider {
    static let shortcutTileColor: ShortcutTileColor = .purple

    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: AddTaskShortcutIntent(),
            phrases: [
                "Add task in \(.applicationName)",
                "Create task in \(.applicationName)"
            ],
            shortTitle: "Add Task",
            systemImageName: "plus.circle.fill"
        )

        AppShortcut(
            intent: ShowTodayTasksShortcutIntent(),
            phrases: [
                "Show today's tasks in \(.applicationName)",
                "Open \(.applicationName)"
            ],
            shortTitle: "Show Tasks",
            systemImageName: "checklist"
        )
    }
}

@main
struct LiquidTasksApp: App {
    init() {
        ReminderManager.shared.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(LiquidTasksRuntime.modelContainer)
    }
}
