import SwiftData
import SwiftUI

@MainActor
struct TaskStore {
    let context: ModelContext
    let activeProfileID: String

    func addTask(
        title: String,
        notes: String?,
        priority: TaskPriority,
        scheduledAt: Date?,
        reminderRepeat: TaskReminderRepeat
    ) {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanTitle.isEmpty else { return }

        context.insert(
            TaskItem(
                title: cleanTitle,
                notes: cleanedNotes(notes),
                scheduledAt: scheduledAt,
                reminderRepeat: scheduledAt == nil ? .none : reminderRepeat,
                ownerName: activeProfileID,
                priority: priority
            )
        )
        save()
    }

    func update(
        _ task: TaskItem,
        title: String,
        notes: String?,
        priority: TaskPriority,
        scheduledAt: Date?,
        reminderRepeat: TaskReminderRepeat
    ) {
        let cleanTitle = title.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleanTitle.isEmpty else { return }

        task.title = cleanTitle
        task.notes = cleanedNotes(notes)
        task.priority = priority
        task.scheduledAt = scheduledAt
        task.reminderRepeat = scheduledAt == nil ? .none : reminderRepeat
        task.reminderSnoozedUntil = nil
        if task.ownerName == nil || task.ownerName?.isEmpty == true {
            task.ownerName = activeProfileID
        }
        save()
    }

    func toggle(_ task: TaskItem) {
        withAnimation(.spring(response: 0.34, dampingFraction: 0.82)) {
            task.isCompleted.toggle()
        }
        if task.ownerName == nil || task.ownerName?.isEmpty == true {
            task.ownerName = activeProfileID
        }
        save()
    }

    func delete(_ task: TaskItem) {
        context.delete(task)
        save()
    }

    func deleteCompleted(_ tasks: [TaskItem]) {
        tasks.forEach(context.delete)
        save()
    }

    private func save() {
        do {
            try context.save()
        } catch {
            assertionFailure("Unable to persist tasks: \(error.localizedDescription)")
        }
    }

    private func cleanedNotes(_ notes: String?) -> String? {
        let cleanNotes = notes?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
        return cleanNotes.isEmpty ? nil : cleanNotes
    }
}
