import SwiftUI

struct GlassCard<Content: View>: View {
    @Environment(\.colorScheme) private var colorScheme

    let cornerRadius: CGFloat
    let content: Content

    init(cornerRadius: CGFloat = 30, @ViewBuilder content: () -> Content) {
        self.cornerRadius = cornerRadius
        self.content = content()
    }

    var body: some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial.opacity(colorScheme == .dark ? 0.88 : 0.96))
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .fill(surfaceTint)
                    )
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: borderColors,
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(color: .cyan.opacity(colorScheme == .dark ? 0.16 : 0.10), radius: 26, y: 16)
            .shadow(color: .black.opacity(colorScheme == .dark ? 0.18 : 0.10), radius: 18, y: 10)
    }

    private var surfaceTint: Color {
        colorScheme == .dark
            ? .black.opacity(0.10)
            : .white.opacity(0.18)
    }

    private var borderColors: [Color] {
        colorScheme == .dark
            ? [.white.opacity(0.34), .white.opacity(0.08)]
            : [.white.opacity(0.62), .cyan.opacity(0.18)]
    }
}

#Preview {
    ZStack {
        LiquidBackground()
        GlassCard {
            Text("Glass")
                .font(.title)
                .foregroundStyle(.white)
                .padding(40)
        }
        .padding()
    }
}
