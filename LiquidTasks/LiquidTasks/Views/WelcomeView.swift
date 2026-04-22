import SwiftUI

struct WelcomeView: View {
    @AppStorage("liquidTasksAppearance") private var appearanceRawValue = AppearanceMode.dark.rawValue
    @Environment(\.colorScheme) private var colorScheme
    @State private var selectedPage = 0
    @State private var glowPulse = false

    let onStart: () -> Void

    private let cards = OnboardingCard.cards

    private var appearanceBinding: Binding<AppearanceMode> {
        Binding(
            get: { AppearanceMode(rawValue: appearanceRawValue) ?? .dark },
            set: { appearanceRawValue = $0.rawValue }
        )
    }

    var body: some View {
        ZStack {
            LiquidBackground()

            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    AppearanceToggle(mode: appearanceBinding)
                }
                .padding(.horizontal, 22)
                .padding(.top, 58)

                Spacer()

                VStack(spacing: 22) {
                    VStack(spacing: 10) {
                        Text("Liquid Tasks")
                            .font(.system(size: 45, weight: .semibold, design: .rounded))
                            .foregroundStyle(primaryText)
                            .multilineTextAlignment(.center)
                            .shadow(color: textShadow, radius: 14, y: 4)

                        Text("A calm AI-shaped space for the next thing that matters.")
                            .font(.system(.body, design: .rounded, weight: .medium))
                            .foregroundStyle(secondaryText)
                            .multilineTextAlignment(.center)
                            .lineSpacing(3)
                            .padding(.horizontal, 28)
                    }

                    TabView(selection: $selectedPage) {
                        ForEach(cards.indices, id: \.self) { index in
                            onboardingCard(cards[index], index: index)
                                .padding(.horizontal, 22)
                                .tag(index)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .never))
                    .frame(height: 330)

                    pageDots

                    Button(action: onStart) {
                        HStack(spacing: 10) {
                            Text(selectedPage == cards.indices.last ? "Get Started" : "Start")
                                .font(.system(.headline, design: .rounded, weight: .semibold))

                            Image(systemName: "sparkles")
                                .font(.system(size: 17, weight: .semibold))
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 62)
                        .background(
                            LinearGradient(
                                colors: [.cyan, .blue, .indigo, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            in: RoundedRectangle(cornerRadius: 24, style: .continuous)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 24, style: .continuous)
                                .stroke(.white.opacity(0.26), lineWidth: 1)
                        )
                        .shadow(color: .cyan.opacity(glowPulse ? 0.34 : 0.20), radius: glowPulse ? 30 : 18, y: 12)
                        .scaleEffect(glowPulse ? 1.015 : 1.0)
                    }
                    .buttonStyle(.plain)
                    .padding(.horizontal, 22)
                    .animation(.easeInOut(duration: 1.8).repeatForever(autoreverses: true), value: glowPulse)
                }

                Spacer()
                Spacer().frame(height: 24)
            }
        }
        .onAppear {
            glowPulse = true
        }
    }

    private func onboardingCard(_ card: OnboardingCard, index: Int) -> some View {
        let isSelected = selectedPage == index

        return GlassCard(cornerRadius: 36) {
            VStack(spacing: 24) {
                ZStack {
                    Circle()
                        .fill(card.glow.opacity(isSelected ? 0.22 : 0.12))
                        .frame(width: 112, height: 112)
                        .blur(radius: 20)

                    Circle()
                        .fill(.white.opacity(colorScheme == .dark ? 0.11 : 0.24))
                        .frame(width: 86, height: 86)
                        .overlay(Circle().stroke(.white.opacity(0.28), lineWidth: 1))

                    Image(systemName: card.icon)
                        .font(.system(size: 34, weight: .semibold))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.20), radius: 10, y: 4)
                }

                VStack(spacing: 9) {
                    Text(card.title)
                        .font(.system(.title2, design: .rounded, weight: .semibold))
                        .foregroundStyle(primaryText)
                        .multilineTextAlignment(.center)

                    Text(card.subtitle)
                        .font(.system(.body, design: .rounded, weight: .medium))
                        .foregroundStyle(secondaryText)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 28)
            .padding(.vertical, 30)
        }
        .scaleEffect(isSelected ? 1 : 0.94)
        .offset(y: isSelected ? 0 : 10)
        .animation(.smooth(duration: 0.36), value: selectedPage)
    }

    private var pageDots: some View {
        HStack(spacing: 9) {
            ForEach(cards.indices, id: \.self) { index in
                Capsule()
                    .fill(index == selectedPage ? .white : .white.opacity(0.34))
                    .frame(width: index == selectedPage ? 24 : 8, height: 8)
                    .animation(.smooth(duration: 0.25), value: selectedPage)
            }
        }
        .frame(height: 32)
        .accessibilityHidden(true)
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.74) : Color(red: 0.08, green: 0.15, blue: 0.30).opacity(0.82)
    }

    private var textShadow: Color {
        colorScheme == .dark ? .black.opacity(0.22) : .white.opacity(0.32)
    }
}

private struct OnboardingCard {
    let icon: String
    let title: String
    let subtitle: String
    let glow: Color

    static let cards = [
        OnboardingCard(
            icon: "bolt.fill",
            title: "Capture fast",
            subtitle: "Drop the next task before momentum fades.",
            glow: .cyan
        ),
        OnboardingCard(
            icon: "checkmark.circle.fill",
            title: "Tap to complete",
            subtitle: "A single touch clears the signal with a calm response.",
            glow: .blue
        ),
        OnboardingCard(
            icon: "sparkles",
            title: "Stay organized",
            subtitle: "Active and completed work settle into their own quiet spaces.",
            glow: .purple
        )
    ]
}

#Preview {
    WelcomeView {}
}
