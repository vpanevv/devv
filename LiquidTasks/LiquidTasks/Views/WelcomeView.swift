import SwiftUI

struct WelcomeView: View {
    let onStart: () -> Void

    var body: some View {
        ZStack {
            LiquidBackground()

            VStack(spacing: 28) {
                Spacer()

                GlassCard(cornerRadius: 36) {
                    VStack(spacing: 24) {
                        emblem

                        VStack(spacing: 10) {
                            Text("Liquid Tasks")
                                .font(.system(size: 46, weight: .semibold, design: .rounded))
                                .foregroundStyle(.white)
                                .multilineTextAlignment(.center)

                            Text("A calm AI-shaped space for the next thing that matters.")
                                .font(.system(.body, design: .rounded, weight: .medium))
                                .foregroundStyle(.white.opacity(0.72))
                                .multilineTextAlignment(.center)
                                .lineSpacing(3)
                                .padding(.horizontal, 8)
                        }

                        Button(action: onStart) {
                            HStack(spacing: 10) {
                                Text("Start")
                                    .font(.system(.headline, design: .rounded, weight: .semibold))

                                Image(systemName: "sparkles")
                                    .font(.system(size: 17, weight: .semibold))
                            }
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 58)
                            .background(
                                LinearGradient(
                                    colors: [.cyan, .blue, .indigo, .purple],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
                            .shadow(color: .cyan.opacity(0.34), radius: 28, y: 12)
                        }
                        .buttonStyle(.plain)
                    }
                    .padding(28)
                }
                .padding(.horizontal, 22)

                Spacer()
                Spacer().frame(height: 28)
            }
        }
    }

    private var emblem: some View {
        ZStack {
            Circle()
                .fill(.cyan.opacity(0.16))
                .frame(width: 92, height: 92)
                .blur(radius: 18)

            Circle()
                .fill(.white.opacity(0.10))
                .frame(width: 82, height: 82)
                .overlay(
                    Circle()
                        .stroke(.white.opacity(0.24), lineWidth: 1)
                )

            Image(systemName: "brain.head.profile")
                .font(.system(size: 34, weight: .medium))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(.white)
        }
    }
}

#Preview {
    WelcomeView {}
}
