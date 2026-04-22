import SwiftUI

enum AppearanceMode: String, CaseIterable {
    case dark
    case light

    var colorScheme: ColorScheme {
        switch self {
        case .dark: .dark
        case .light: .light
        }
    }

    var icon: String {
        switch self {
        case .dark: "moon.fill"
        case .light: "sun.max.fill"
        }
    }

    var title: String {
        switch self {
        case .dark: "Dark"
        case .light: "Light"
        }
    }

    mutating func toggle() {
        self = self == .dark ? .light : .dark
    }
}

struct AppearanceToggle: View {
    @Environment(\.colorScheme) private var colorScheme
    @Binding var mode: AppearanceMode

    var body: some View {
        Button {
            withAnimation(.smooth(duration: 0.28)) {
                mode.toggle()
            }
        } label: {
            HStack(spacing: 9) {
                Image(systemName: mode.icon)
                    .font(.system(size: 15, weight: .bold))
                    .frame(width: 20, height: 20)

                Text(mode.title)
                    .font(.system(.subheadline, design: .rounded, weight: .semibold))
            }
            .foregroundStyle(controlText)
            .padding(.horizontal, 16)
            .frame(height: 48)
            .background(controlFill, in: Capsule())
            .overlay(Capsule().stroke(.white.opacity(0.24), lineWidth: 1))
            .shadow(color: .cyan.opacity(0.14), radius: 18, y: 8)
            .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Toggle appearance")
        .accessibilityValue(mode.title)
    }

    private var controlText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var controlFill: Color {
        colorScheme == .dark ? .white.opacity(0.15) : .white.opacity(0.42)
    }
}

struct ContentView: View {
    @AppStorage("hasStartedLiquidTasks") private var hasStarted = false
    @AppStorage("liquidTasksAppearance") private var appearanceRawValue = AppearanceMode.dark.rawValue

    private var appearance: AppearanceMode {
        AppearanceMode(rawValue: appearanceRawValue) ?? .dark
    }

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
        .preferredColorScheme(appearance.colorScheme)
    }
}

#Preview {
    ContentView()
        .modelContainer(for: TaskItem.self, inMemory: true)
}
