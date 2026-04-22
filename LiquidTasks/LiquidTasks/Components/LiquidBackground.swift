import SwiftUI

struct LiquidBackground: View {
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
                colors: [
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
                colors: [.black.opacity(0.10), .black.opacity(0.40)],
                startPoint: .top,
                endPoint: .bottom
            )
        }
        .ignoresSafeArea()
    }
}

#Preview {
    LiquidBackground()
}
