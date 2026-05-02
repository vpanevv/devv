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
    static let xpDateKey = "liquidTasksXPDate"
    static let todayXPKey = "liquidTasksTodayXP"
    static let recordXPKey = "liquidTasksRecordXP"
    static let dailyTargetXPKey = "liquidTasksDailyTargetXP"
    static let lastTargetHitDateKey = "liquidTasksLastTargetHitDate"

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
        let totalXP = tasks
            .filter(\.isCompleted)
            .reduce(into: 0) { result, task in
                result += task.priority.xpValue
            }

        if defaults.string(forKey: xpDateKey) != currentDayKey {
            defaults.set(currentDayKey, forKey: xpDateKey)
            defaults.set("", forKey: lastTargetHitDateKey)
        }

        defaults.set(totalXP, forKey: todayXPKey)
        defaults.set(max(defaults.integer(forKey: recordXPKey), totalXP), forKey: recordXPKey)
        logger.debug("Synchronized XP state. Completed tasks: \(tasks.filter(\.isCompleted).count, privacy: .public), total XP: \(totalXP, privacy: .public)")

        let target = defaults.integer(forKey: dailyTargetXPKey)
        if totalXP >= target, target > 0 {
            defaults.set(currentDayKey, forKey: lastTargetHitDateKey)
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
