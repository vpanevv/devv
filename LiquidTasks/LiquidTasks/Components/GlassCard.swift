import SwiftUI

struct GlassCard<Content: View>: View {
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
                    .fill(.ultraThinMaterial.opacity(0.86))
            )
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [.white.opacity(0.34), .white.opacity(0.08)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(color: .cyan.opacity(0.16), radius: 26, y: 16)
            .shadow(color: .black.opacity(0.18), radius: 18, y: 10)
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
