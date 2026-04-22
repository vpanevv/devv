import Foundation
import SwiftData

enum TaskPriority: String, CaseIterable, Identifiable, Codable {
    case low
    case medium
    case high

    var id: String { rawValue }

    var title: String {
        switch self {
        case .low: "Low"
        case .medium: "Medium"
        case .high: "High"
        }
    }
}

@Model
final class TaskItem {
    @Attribute(.unique) var id: UUID
    var title: String
    var notes: String?
    var isCompleted: Bool
    var createdAt: Date
    var priorityRawValue: String?

    var priority: TaskPriority {
        get {
            guard let priorityRawValue else { return .medium }
            return TaskPriority(rawValue: priorityRawValue) ?? .medium
        }
        set {
            priorityRawValue = newValue.rawValue
        }
    }

    init(
        id: UUID = UUID(),
        title: String,
        notes: String? = nil,
        isCompleted: Bool = false,
        createdAt: Date = .now,
        priority: TaskPriority = .medium
    ) {
        self.id = id
        self.title = title
        self.notes = notes
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.priorityRawValue = priority.rawValue
    }
}
