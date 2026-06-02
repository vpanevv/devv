import Foundation
import SwiftData

enum TaskPriority: String, CaseIterable, Identifiable, Codable {
    case low
    case medium
    case high

    var id: String { rawValue }

    var xpValue: Int {
        switch self {
        case .low: 2
        case .medium: 5
        case .high: 8
        }
    }

    var title: String {
        switch self {
        case .low: "Low"
        case .medium: "Medium"
        case .high: "High"
        }
    }
}

enum TaskReminderRepeat: String, CaseIterable, Identifiable, Codable {
    case none
    case daily
    case weekly
    case monthly

    var id: String { rawValue }

    var title: String {
        switch self {
        case .none: "None"
        case .daily: "Daily"
        case .weekly: "Weekly"
        case .monthly: "Monthly"
        }
    }

    var shortDescription: String {
        switch self {
        case .none:
            "Does not repeat"
        case .daily:
            "Repeats every day"
        case .weekly:
            "Repeats every week"
        case .monthly:
            "Repeats every month"
        }
    }

    func detailDescription(for date: Date, calendar: Calendar = .current) -> String {
        let time = date.formatted(date: .omitted, time: .shortened)
        switch self {
        case .none:
            return "Does not repeat"
        case .daily:
            return "Every day at \(time)"
        case .weekly:
            let weekdayIndex = calendar.component(.weekday, from: date) - 1
            let weekday = calendar.weekdaySymbols[weekdayIndex]
            return "Every \(weekday) at \(time)"
        case .monthly:
            let day = calendar.component(.day, from: date)
            return "Every month on day \(day) at \(time)"
        }
    }

    func nextOccurrence(from anchorDate: Date, now: Date = .now, calendar: Calendar = .current) -> Date? {
        switch self {
        case .none:
            return anchorDate > now ? anchorDate : nil
        case .daily:
            return calendar.nextDate(
                after: now,
                matching: calendar.dateComponents([.hour, .minute, .second], from: anchorDate),
                matchingPolicy: .nextTime,
                repeatedTimePolicy: .first,
                direction: .forward
            )
        case .weekly:
            return calendar.nextDate(
                after: now,
                matching: calendar.dateComponents([.weekday, .hour, .minute, .second], from: anchorDate),
                matchingPolicy: .nextTime,
                repeatedTimePolicy: .first,
                direction: .forward
            )
        case .monthly:
            return calendar.nextDate(
                after: now,
                matching: calendar.dateComponents([.day, .hour, .minute, .second], from: anchorDate),
                matchingPolicy: .nextTime,
                repeatedTimePolicy: .first,
                direction: .forward
            )
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
    var scheduledAt: Date?
    var reminderRepeatRawValue: String?
    var reminderSnoozedUntil: Date?
    var ownerName: String?
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

    var reminderRepeat: TaskReminderRepeat {
        get {
            guard let reminderRepeatRawValue else { return .none }
            return TaskReminderRepeat(rawValue: reminderRepeatRawValue) ?? .none
        }
        set {
            reminderRepeatRawValue = newValue.rawValue
        }
    }

    init(
        id: UUID = UUID(),
        title: String,
        notes: String? = nil,
        isCompleted: Bool = false,
        createdAt: Date = .now,
        scheduledAt: Date? = nil,
        reminderRepeat: TaskReminderRepeat = .none,
        reminderSnoozedUntil: Date? = nil,
        ownerName: String? = nil,
        priority: TaskPriority = .medium
    ) {
        self.id = id
        self.title = title
        self.notes = notes
        self.isCompleted = isCompleted
        self.createdAt = createdAt
        self.scheduledAt = scheduledAt
        self.reminderRepeatRawValue = reminderRepeat.rawValue
        self.reminderSnoozedUntil = reminderSnoozedUntil
        self.ownerName = ownerName
        self.priorityRawValue = priority.rawValue
    }
}
