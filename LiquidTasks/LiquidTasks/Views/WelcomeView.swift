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
            ambientGlow

            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    AppearanceToggle(mode: appearanceBinding)
                }
                .padding(.horizontal, 22)
                .padding(.top, 58)

                Spacer(minLength: 18)

                VStack(spacing: 24) {
                    VStack(spacing: 12) {
                        Text("Liquid Tasks")
                            .font(.system(size: 46, weight: .bold, design: .rounded))
                            .foregroundStyle(primaryText)
                            .multilineTextAlignment(.center)
                            .shadow(color: textShadow, radius: 18, y: 5)

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
                    .frame(height: 356)

                    pageDots

                    Button(action: onStart) {
                        HStack(spacing: 10) {
                            Text(selectedPage == cards.indices.last ? "Get Started" : "Start")
                                .font(.system(.headline, design: .rounded, weight: .bold))

                            Image(systemName: "sparkles")
                                .font(.system(size: 17, weight: .bold))
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 64)
                        .background(
                            LinearGradient(
                                colors: [.cyan, .blue, .indigo, .purple, .pink],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            in: RoundedRectangle(cornerRadius: 26, style: .continuous)
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 26, style: .continuous)
                                .stroke(.white.opacity(0.28), lineWidth: 1)
                        )
                        .shadow(color: .cyan.opacity(glowPulse ? 0.30 : 0.18), radius: glowPulse ? 34 : 20, y: 12)
                        .shadow(color: .purple.opacity(glowPulse ? 0.26 : 0.14), radius: glowPulse ? 28 : 14, y: 8)
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

        return ZStack {
            RoundedRectangle(cornerRadius: 38, style: .continuous)
                .fill(.white.opacity(colorScheme == .dark ? 0.08 : 0.22))

            RoundedRectangle(cornerRadius: 38, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: card.gradient,
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .opacity(isSelected ? 0.92 : 0.76)

            RoundedRectangle(cornerRadius: 38, style: .continuous)
                .fill(.ultraThinMaterial.opacity(colorScheme == .dark ? 0.28 : 0.42))

            RoundedRectangle(cornerRadius: 38, style: .continuous)
                .stroke(.white.opacity(isSelected ? 0.28 : 0.18), lineWidth: 1)

            cardAccentOrbs(card: card, isSelected: isSelected)

            VStack(spacing: 26) {
                ZStack {
                    Circle()
                        .fill(card.glow.opacity(isSelected ? 0.26 : 0.14))
                        .frame(width: 132, height: 132)
                        .blur(radius: 22)

                    Circle()
                        .fill(
                            LinearGradient(
                                colors: [card.glow.opacity(0.40), .white.opacity(colorScheme == .dark ? 0.12 : 0.34)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 96, height: 96)
                        .overlay(Circle().stroke(.white.opacity(0.24), lineWidth: 1))

                    Image(systemName: card.icon)
                        .font(.system(size: 34, weight: .bold))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(.white)
                        .shadow(color: .black.opacity(0.20), radius: 10, y: 4)
                }

                VStack(spacing: 10) {
                    Text(card.title)
                        .font(.system(.title2, design: .rounded, weight: .bold))
                        .foregroundStyle(primaryText)
                        .multilineTextAlignment(.center)

                    Text(card.subtitle)
                        .font(.system(.body, design: .rounded, weight: .medium))
                        .foregroundStyle(secondaryText)
                        .multilineTextAlignment(.center)
                        .lineSpacing(3)
                }

                HStack(spacing: 8) {
                    ForEach(0..<3, id: \.self) { marker in
                        Capsule()
                            .fill(marker == 1 ? .white.opacity(0.82) : .white.opacity(0.28))
                            .frame(width: marker == 1 ? 30 : 8, height: 8)
                    }
                }
                .opacity(isSelected ? 1 : 0.55)
            }
            .frame(maxWidth: .infinity)
            .padding(.horizontal, 28)
            .padding(.vertical, 30)
        }
        .shadow(color: card.glow.opacity(isSelected ? 0.24 : 0.10), radius: isSelected ? 28 : 14, y: 14)
        .scaleEffect(isSelected ? 1 : 0.94)
        .offset(y: isSelected ? 0 : 10)
        .animation(.smooth(duration: 0.36), value: selectedPage)
    }

    private func cardAccentOrbs(card: OnboardingCard, isSelected: Bool) -> some View {
        ZStack {
            Circle()
                .fill(card.secondaryGlow.opacity(isSelected ? 0.22 : 0.10))
                .frame(width: 160, height: 160)
                .blur(radius: 28)
                .offset(x: 122, y: -120)

            Circle()
                .fill(card.glow.opacity(isSelected ? 0.20 : 0.08))
                .frame(width: 150, height: 150)
                .blur(radius: 30)
                .offset(x: -128, y: 112)
        }
    }

    private var pageDots: some View {
        HStack(spacing: 10) {
            ForEach(cards.indices, id: \.self) { index in
                Capsule()
                    .fill(index == selectedPage ? .white : .white.opacity(0.24))
                    .frame(width: index == selectedPage ? 28 : 9, height: 9)
                    .shadow(color: index == selectedPage ? .cyan.opacity(0.24) : .clear, radius: 12, y: 4)
                    .animation(.smooth(duration: 0.25), value: selectedPage)
            }
        }
        .padding(.horizontal, 16)
        .frame(height: 38)
        .background(.white.opacity(colorScheme == .dark ? 0.08 : 0.20), in: Capsule())
        .overlay(Capsule().stroke(.white.opacity(0.16), lineWidth: 1))
        .accessibilityHidden(true)
    }

    private var ambientGlow: some View {
        ZStack {
            Circle()
                .fill(.cyan.opacity(colorScheme == .dark ? 0.20 : 0.10))
                .frame(width: 280, height: 280)
                .blur(radius: 34)
                .offset(x: -120, y: -200)

            Circle()
                .fill(.purple.opacity(colorScheme == .dark ? 0.22 : 0.10))
                .frame(width: 320, height: 320)
                .blur(radius: 40)
                .offset(x: 140, y: 180)

            Circle()
                .fill(.pink.opacity(colorScheme == .dark ? 0.12 : 0.08))
                .frame(width: 180, height: 180)
                .blur(radius: 26)
                .offset(x: 120, y: -80)
        }
        .ignoresSafeArea()
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.76) : Color(red: 0.08, green: 0.15, blue: 0.30).opacity(0.84)
    }

    private var textShadow: Color {
        colorScheme == .dark ? .black.opacity(0.24) : .white.opacity(0.32)
    }
}

private struct OnboardingCard {
    let icon: String
    let title: String
    let subtitle: String
    let glow: Color
    let secondaryGlow: Color
    let gradient: [Color]

    static let cards = [
        OnboardingCard(
            icon: "bolt.fill",
            title: "Capture fast",
            subtitle: "Drop the next task before momentum fades.",
            glow: .cyan,
            secondaryGlow: .blue,
            gradient: [
                Color(red: 0.10, green: 0.68, blue: 0.94),
                Color(red: 0.16, green: 0.38, blue: 0.98),
                Color(red: 0.34, green: 0.24, blue: 0.92)
            ]
        ),
        OnboardingCard(
            icon: "checkmark.circle.fill",
            title: "Tap to complete",
            subtitle: "A single touch clears the signal with a calm response.",
            glow: .blue,
            secondaryGlow: .purple,
            gradient: [
                Color(red: 0.08, green: 0.46, blue: 0.96),
                Color(red: 0.20, green: 0.28, blue: 0.94),
                Color(red: 0.52, green: 0.24, blue: 0.88)
            ]
        ),
        OnboardingCard(
            icon: "bolt.badge.checkmark.fill",
            title: "Earn XP",
            subtitle: "Low tasks give 2 XP, medium gives 5, and high-priority work earns 8.",
            glow: .teal,
            secondaryGlow: .pink,
            gradient: [
                Color(red: 0.08, green: 0.70, blue: 0.82),
                Color(red: 0.18, green: 0.40, blue: 0.92),
                Color(red: 0.78, green: 0.32, blue: 0.78)
            ]
        ),
        OnboardingCard(
            icon: "sparkles",
            title: "Stay organized",
            subtitle: "Active and completed work settle into their own quiet spaces.",
            glow: .purple,
            secondaryGlow: .cyan,
            gradient: [
                Color(red: 0.26, green: 0.26, blue: 0.90),
                Color(red: 0.42, green: 0.24, blue: 0.94),
                Color(red: 0.80, green: 0.34, blue: 0.74)
            ]
        )
    ]
}

#Preview {
    WelcomeView {}
}
