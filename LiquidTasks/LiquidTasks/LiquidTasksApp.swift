import SwiftData
import SwiftUI

@main
struct LiquidTasksApp: App {
    init() {
        ReminderManager.shared.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: TaskItem.self)
    }
}
