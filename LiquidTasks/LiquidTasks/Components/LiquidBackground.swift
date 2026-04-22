import SwiftUI

struct LiquidBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
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
                colors: [.cyan.opacity(colorScheme == .dark ? 0.34 : 0.26), .clear],
                center: .topTrailing,
                startRadius: 20,
                endRadius: 340
            )

            RadialGradient(
                colors: [.purple.opacity(colorScheme == .dark ? 0.28 : 0.18), .clear],
                center: .bottomLeading,
                startRadius: 40,
                endRadius: 360
            )

            LinearGradient(
                colors: overlayColors,
                startPoint: .top,
                endPoint: .bottom
            )
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
                Color(red: 0.70, green: 0.92, blue: 1.00),
                Color(red: 0.40, green: 0.78, blue: 0.95),
                Color(red: 0.65, green: 0.58, blue: 0.96),
                Color(red: 0.56, green: 0.86, blue: 0.94),
                Color(red: 0.16, green: 0.66, blue: 0.82),
                Color(red: 0.42, green: 0.38, blue: 0.84),
                Color(red: 0.86, green: 0.96, blue: 1.00),
                Color(red: 0.52, green: 0.78, blue: 0.94),
                Color(red: 0.78, green: 0.70, blue: 0.98)
            ]
        }
    }

    private var overlayColors: [Color] {
        colorScheme == .dark
            ? [.black.opacity(0.10), .black.opacity(0.44)]
            : [.white.opacity(0.18), .black.opacity(0.22)]
    }
}

#Preview {
    LiquidBackground()
}
