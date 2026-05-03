import Foundation

enum LocalProfile {
    static let currentProfileNameKey = "liquidTasksCurrentProfileName"
    static let legacyUserNameKey = "liquidTasksUserName"
    static let guestProfileID = "default"
    static let guestDisplayName = ""

    static func normalizedID(from rawName: String) -> String {
        let trimmed = trimmedDisplayName(from: rawName)
        guard !trimmed.isEmpty else { return guestProfileID }

        return trimmed
            .folding(options: [.caseInsensitive, .diacriticInsensitive], locale: .current)
            .lowercased()
    }

    static func trimmedDisplayName(from rawName: String) -> String {
        rawName.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static func displayName(from storedName: String) -> String {
        let trimmed = trimmedDisplayName(from: storedName)
        return trimmed.isEmpty ? guestDisplayName : trimmed
    }
}
