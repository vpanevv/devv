import SwiftUI

struct ContentView: View {
    @AppStorage("hasStartedLiquidTasks") private var hasStarted = false

    var body: some View {
        ZStack {
            if hasStarted {
                TaskListView()
                    .transition(.blurReplace.combined(with: .opacity))
            } else {
                WelcomeView {
                    withAnimation(.smooth(duration: 0.72)) {
                        hasStarted = true
                    }
                }
                .transition(.blurReplace.combined(with: .opacity))
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: TaskItem.self, inMemory: true)
}
