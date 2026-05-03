import SwiftUI

struct WelcomeView: View {
    @Environment(\.colorScheme) private var colorScheme
    @AppStorage(LiquidTasksRuntime.currentProfileNameKey) private var currentProfileName = ""
    @State private var ctaPulse = false
    @State private var nameInput = ""
    @FocusState private var isNameFieldFocused: Bool

    let onStart: () -> Void

    var body: some View {
        ZStack {
            LiquidBackground()
            ambientGlow

            VStack(spacing: 0) {
                Spacer(minLength: 0)

                VStack(spacing: 24) {
                    appIcon

                    VStack(spacing: 14) {
                        Text("Liquid Tasks")
                            .font(.system(size: 18, weight: .semibold, design: .rounded))
                            .foregroundStyle(secondaryText)

                        AnimatedHeadlineText(
                            messages: [
                                "Less noice",
                                "Better focus",
                                "Track your habits"
                            ],
                            textColor: primaryText,
                            accentColor: accentColor
                        )

                        Text("A focused place for what needs your attention today.")
                            .font(.system(.body, design: .rounded, weight: .medium))
                            .foregroundStyle(secondaryText)
                            .multilineTextAlignment(.center)
                            .lineSpacing(3)
                            .padding(.horizontal, 16)

                        nameFieldSection

                        startButton
                            .padding(.top, 8)
                    }
                }
                .frame(maxWidth: 420)
                .padding(.horizontal, 28)

                Spacer(minLength: 0)
            }
        }
        .onAppear {
            ctaPulse = true
            if nameInput.isEmpty {
                nameInput = currentProfileName
            }
        }
    }

    private var startButton: some View {
        Button {
            let resolvedName = normalizedNameInput
            LiquidTasksRuntime.setCurrentProfileName(resolvedName)
            currentProfileName = LocalProfile.displayName(from: resolvedName)
            isNameFieldFocused = false
            onStart()
        } label: {
            Text("GET STARTED")
                .font(.system(.subheadline, design: .rounded, weight: .bold))
                .foregroundStyle(.white)
                .padding(.horizontal, 28)
                .frame(height: 52)
                .background(
                    LinearGradient(
                        colors: buttonGradient,
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    in: Capsule(style: .continuous)
                )
                .overlay(
                    Capsule(style: .continuous)
                        .stroke(.white.opacity(colorScheme == .dark ? 0.20 : 0.34), lineWidth: 1)
                )
                .shadow(color: .cyan.opacity(ctaPulse ? 0.16 : 0.08), radius: ctaPulse ? 22 : 14, y: 8)
                .shadow(color: .purple.opacity(ctaPulse ? 0.16 : 0.08), radius: ctaPulse ? 18 : 10, y: 6)
                .scaleEffect(ctaPulse ? 1.01 : 1.0)
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 2.0).repeatForever(autoreverses: true), value: ctaPulse)
    }

    private var nameFieldSection: some View {
        VStack(spacing: 12) {
            Text("Enter your name")
                .font(.system(.title3, design: .rounded, weight: .bold))
                .foregroundStyle(primaryText)
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity)

            TextField("Your name", text: $nameInput)
                .textInputAutocapitalization(.words)
                .disableAutocorrection(true)
                .submitLabel(.done)
                .focused($isNameFieldFocused)
                .font(.system(.body, design: .rounded, weight: .semibold))
                .foregroundStyle(primaryText)
                .padding(.horizontal, 18)
                .frame(height: 54)
                .background(nameFieldFill, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(nameFieldStroke, lineWidth: 1)
                )
                .shadow(color: .cyan.opacity(colorScheme == .dark ? 0.08 : 0.04), radius: 14, y: 6)
                .onSubmit {
                    let resolvedName = normalizedNameInput
                    LiquidTasksRuntime.setCurrentProfileName(resolvedName)
                    currentProfileName = LocalProfile.displayName(from: resolvedName)
                    isNameFieldFocused = false
                }
        }
    }

    private var appIcon: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 42, style: .continuous)
                .fill(.white.opacity(colorScheme == .dark ? 0.08 : 0.34))
                .frame(width: 190, height: 190)
                .blur(radius: 22)

            Image("AppIconPreview")
                .resizable()
                .scaledToFill()
                .frame(width: 144, height: 144)
                .clipShape(RoundedRectangle(cornerRadius: 34, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 34, style: .continuous)
                        .stroke(.white.opacity(colorScheme == .dark ? 0.22 : 0.52), lineWidth: 1)
                )
                .shadow(color: .black.opacity(colorScheme == .dark ? 0.28 : 0.10), radius: 28, y: 14)
        }
        .frame(height: 190)
    }

    private var ambientGlow: some View {
        ZStack {
            Circle()
                .fill(.cyan.opacity(colorScheme == .dark ? 0.18 : 0.08))
                .frame(width: 300, height: 300)
                .blur(radius: 42)
                .offset(x: -120, y: -180)

            Circle()
                .fill(.blue.opacity(colorScheme == .dark ? 0.14 : 0.06))
                .frame(width: 260, height: 260)
                .blur(radius: 36)
                .offset(x: 130, y: -40)

            Circle()
                .fill(.purple.opacity(colorScheme == .dark ? 0.16 : 0.05))
                .frame(width: 280, height: 280)
                .blur(radius: 42)
                .offset(x: 100, y: 220)
        }
        .ignoresSafeArea()
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.05, green: 0.09, blue: 0.18)
    }

    private var secondaryText: Color {
        colorScheme == .dark
            ? .white.opacity(0.62)
            : Color(red: 0.15, green: 0.20, blue: 0.30).opacity(0.72)
    }

    private var accentColor: Color {
        colorScheme == .dark
            ? Color(red: 0.49, green: 0.88, blue: 1.00)
            : Color(red: 0.08, green: 0.58, blue: 0.94)
    }

    private var nameFieldFill: Color {
        colorScheme == .dark ? .white.opacity(0.10) : .white.opacity(0.68)
    }

    private var nameFieldStroke: Color {
        colorScheme == .dark ? .white.opacity(0.18) : .white.opacity(0.72)
    }

    private var normalizedNameInput: String {
        nameInput.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    private var buttonGradient: [Color] {
        [
            Color(red: 0.10, green: 0.72, blue: 0.96),
            Color(red: 0.24, green: 0.48, blue: 1.00),
            Color(red: 0.52, green: 0.30, blue: 0.94)
        ]
    }
}

private struct AnimatedHeadlineText: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    let messages: [String]
    let textColor: Color
    let accentColor: Color

    @State private var currentIndex = 0
    @State private var scheduledAdvance: Task<Void, Never>?

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                ForEach(Array(messages.enumerated()), id: \.offset) { index, message in
                    headline(message)
                        .opacity(index == currentIndex ? 1 : 0)
                        .offset(y: index == currentIndex ? 0 : 8)
                        .scaleEffect(index == currentIndex ? 1 : 0.985)
                        .animation(animation, value: currentIndex)
                        .accessibilityHidden(index != currentIndex)
                }
            }
            .frame(height: 92)

            Capsule()
                .fill(accentColor.opacity(0.18))
                .frame(width: 56, height: 4)
                .overlay(
                    Capsule()
                        .fill(accentColor)
                        .frame(width: 22, height: 4)
                )
                .accessibilityHidden(true)
        }
        .onAppear {
            guard messages.count > 1 else { return }
            startLoop()
        }
        .onDisappear {
            scheduledAdvance?.cancel()
            scheduledAdvance = nil
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel(messages[safe: currentIndex] ?? "")
    }

    private func headline(_ message: String) -> some View {
        Text(message)
            .font(.system(size: 34, weight: .bold, design: .rounded))
            .foregroundStyle(textColor)
            .multilineTextAlignment(.center)
            .lineLimit(3)
            .minimumScaleFactor(0.84)
            .frame(maxWidth: 340)
    }

    private var animation: Animation {
        reduceMotion
            ? .easeOut(duration: 0.18)
            : .spring(response: 0.48, dampingFraction: 0.86)
    }

    private func startLoop() {
        scheduledAdvance?.cancel()
        scheduledAdvance = Task {
            while !Task.isCancelled {
                try? await Task.sleep(for: .seconds(reduceMotion ? 2.2 : 2.8))
                guard !Task.isCancelled else { return }
                await MainActor.run {
                    withAnimation(animation) {
                        currentIndex = (currentIndex + 1) % messages.count
                    }
                }
            }
        }
    }
}

private extension Array {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

#Preview {
    WelcomeView {}
}
