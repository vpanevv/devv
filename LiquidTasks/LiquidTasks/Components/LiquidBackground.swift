import SwiftUI

struct LiquidBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            if colorScheme == .dark {
                MeshGradient(
                    width: 3,
                    height: 3,
                    points: [
                        [0.00, 0.00], [0.52, 0.00], [1.00, 0.00],
                        [0.00, 0.48], [0.58, 0.42], [1.00, 0.54],
                        [0.00, 1.00], [0.48, 1.00], [1.00, 1.00]
                    ],
                    colors: meshColors
                )

                RadialGradient(
                    colors: [.cyan.opacity(0.34), .clear],
                    center: .topTrailing,
                    startRadius: 20,
                    endRadius: 340
                )

                RadialGradient(
                    colors: [.purple.opacity(0.28), .clear],
                    center: .bottomLeading,
                    startRadius: 40,
                    endRadius: 360
                )

                LinearGradient(
                    colors: overlayColors,
                    startPoint: .top,
                    endPoint: .bottom
                )
            } else {
                Color.white

                LinearGradient(
                    colors: [
                        Color(red: 0.97, green: 0.99, blue: 1.00),
                        Color(red: 0.95, green: 0.98, blue: 1.00),
                        Color.white
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )

                RadialGradient(
                    colors: [Color(red: 0.40, green: 0.82, blue: 1.00).opacity(0.16), .clear],
                    center: .topLeading,
                    startRadius: 16,
                    endRadius: 300
                )

                RadialGradient(
                    colors: [Color(red: 0.62, green: 0.72, blue: 1.00).opacity(0.12), .clear],
                    center: .topTrailing,
                    startRadius: 28,
                    endRadius: 340
                )

                LinearGradient(
                    colors: overlayColors,
                    startPoint: .top,
                    endPoint: .bottom
                )
            }
        }
        .ignoresSafeArea()
    }

    private var meshColors: [Color] {
        if colorScheme == .dark {
            [
                Color(red: 0.02, green: 0.05, blue: 0.15),
                Color(red: 0.02, green: 0.30, blue: 0.45),
                Color(red: 0.10, green: 0.08, blue: 0.34),
                Color(red: 0.02, green: 0.12, blue: 0.25),
                Color(red: 0.00, green: 0.62, blue: 0.72),
                Color(red: 0.28, green: 0.12, blue: 0.62),
                Color(red: 0.02, green: 0.10, blue: 0.20),
                Color(red: 0.04, green: 0.18, blue: 0.38),
                Color(red: 0.12, green: 0.04, blue: 0.30)
            ]
        } else {
            [
                Color.white,
                Color(red: 0.94, green: 0.98, blue: 1.00),
                Color(red: 0.96, green: 0.97, blue: 1.00),
                Color(red: 0.95, green: 0.99, blue: 1.00),
                Color(red: 0.88, green: 0.97, blue: 1.00),
                Color(red: 0.92, green: 0.94, blue: 1.00),
                Color.white,
                Color(red: 0.96, green: 0.98, blue: 1.00),
                Color(red: 0.97, green: 0.96, blue: 1.00)
            ]
        }
    }

    private var overlayColors: [Color] {
        colorScheme == .dark
            ? [.black.opacity(0.10), .black.opacity(0.44)]
            : [.white.opacity(0.04), .white.opacity(0.12)]
    }
}

#Preview {
    LiquidBackground()
}
