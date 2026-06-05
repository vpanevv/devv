import SwiftUI

enum LiquidTasksAppFont: String, CaseIterable, Identifiable {
    case systemDefault
    case rounded
    case serif
    case monospaced
    case compact
    case wide
    case narrow
    case roundedCompact
    case serifCompact
    case monoCompact

    var id: String { rawValue }

    var title: String {
        switch self {
        case .systemDefault:
            "System Default"
        case .rounded:
            "Rounded"
        case .serif:
            "Serif"
        case .monospaced:
            "Monospaced"
        case .compact:
            "Compact"
        case .wide:
            "Wide"
        case .narrow:
            "Narrow"
        case .roundedCompact:
            "Rounded Compact"
        case .serifCompact:
            "Serif Compact"
        case .monoCompact:
            "Mono Compact"
        }
    }

    var subtitle: String {
        switch self {
        case .systemDefault:
            "Native iOS feel"
        case .rounded:
            "Soft and friendly"
        case .serif:
            "Calm editorial style"
        case .monospaced:
            "Structured and precise"
        case .compact:
            "Dense and efficient"
        case .wide:
            "Open and spacious"
        case .narrow:
            "Slim and focused"
        case .roundedCompact:
            "Friendly and tidy"
        case .serifCompact:
            "Editorial and neat"
        case .monoCompact:
            "Precise and tight"
        }
    }

    var design: Font.Design? {
        switch self {
        case .systemDefault, .compact, .wide, .narrow:
            nil
        case .rounded, .roundedCompact:
            .rounded
        case .serif, .serifCompact:
            .serif
        case .monospaced, .monoCompact:
            .monospaced
        }
    }

    var width: Font.Width? {
        switch self {
        case .compact, .roundedCompact, .serifCompact, .monoCompact:
            .condensed
        case .wide:
            .expanded
        case .narrow:
            .compressed
        case .systemDefault, .rounded, .serif, .monospaced:
            nil
        }
    }
}
