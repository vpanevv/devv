import SwiftUI

struct TaskEditorSheet: View {
    @Environment(\.colorScheme) private var colorScheme
    enum Mode {
        case add
        case edit(title: String, notes: String?, priority: TaskPriority)

        var title: String {
            switch self {
            case .add: "New Task"
            case .edit: "Edit Task"
            }
        }

        var actionTitle: String {
            switch self {
            case .add: "Add"
            case .edit: "Save"
            }
        }

        var initialText: String {
            switch self {
            case .add: ""
            case .edit(let title, _, _): title
            }
        }

        var initialNotes: String {
            switch self {
            case .add: ""
            case .edit(_, let notes, _): notes ?? ""
            }
        }

        var initialPriority: TaskPriority {
            switch self {
            case .add: .medium
            case .edit(_, _, let priority): priority
            }
        }
    }

    @Environment(\.dismiss) private var dismiss
    @FocusState private var isFocused: Bool
    @State private var title: String
    @State private var notes: String
    @State private var priority: TaskPriority

    let mode: Mode
    let onCommit: (String, String?, TaskPriority) -> Void

    init(mode: Mode, onCommit: @escaping (String, String?, TaskPriority) -> Void) {
        self.mode = mode
        self.onCommit = onCommit
        _title = State(initialValue: mode.initialText)
        _notes = State(initialValue: mode.initialNotes)
        _priority = State(initialValue: mode.initialPriority)
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: sheetColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 22) {
                Capsule()
                    .fill(.white.opacity(0.24))
                    .frame(width: 42, height: 5)
                    .padding(.top, 10)

                VStack(alignment: .leading, spacing: 18) {
                    Text(mode.title)
                        .font(.system(.largeTitle, design: .rounded, weight: .semibold))
                        .foregroundStyle(primaryText)

                    TextField("Name the task", text: $title, axis: .vertical)
                        .font(.system(.title3, design: .rounded, weight: .semibold))
                        .foregroundStyle(primaryText)
                        .lineLimit(1...4)
                        .padding(18)
                        .frame(minHeight: 58)
                        .background(fieldFill, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 22, style: .continuous)
                                .stroke(.white.opacity(0.22), lineWidth: 1)
                        )
                        .focused($isFocused)

                    TextField("Add notes, if useful", text: $notes, axis: .vertical)
                        .font(.system(.body, design: .rounded, weight: .medium))
                        .foregroundStyle(primaryText)
                        .lineLimit(2...5)
                        .padding(18)
                        .frame(minHeight: 82, alignment: .topLeading)
                        .background(fieldFill.opacity(0.82), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 22, style: .continuous)
                                .stroke(.white.opacity(0.18), lineWidth: 1)
                        )

                    priorityPicker

                    Button {
                        onCommit(title, notes, priority)
                        dismiss()
                    } label: {
                        Text(mode.actionTitle)
                            .font(.system(.headline, design: .rounded, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 60)
                            .background(
                                LinearGradient(
                                    colors: [.cyan, .blue, .indigo],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                in: RoundedRectangle(cornerRadius: 22, style: .continuous)
                            )
                            .opacity(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.45 : 1)
                    }
                    .disabled(title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 22)

                Spacer()
            }
        }
        .presentationDetents([.height(500)])
        .presentationDragIndicator(.hidden)
        .presentationCornerRadius(34)
        .onAppear {
            isFocused = true
        }
    }

    private var priorityPicker: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Priority")
                .font(.system(.caption, design: .rounded, weight: .bold))
                .foregroundStyle(secondaryText)
                .textCase(.uppercase)

            HStack(spacing: 10) {
                ForEach(TaskPriority.allCases) { option in
                    Button {
                        withAnimation(.smooth(duration: 0.22)) {
                            priority = option
                        }
                    } label: {
                        HStack(spacing: 7) {
                            Circle()
                                .fill(priorityColor(for: option))
                                .frame(width: 9, height: 9)

                            Text(option.title)
                                .font(.system(.subheadline, design: .rounded, weight: .bold))
                                .foregroundStyle(priority == option ? selectedPriorityText : primaryText)
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 46)
                        .background(
                            priority == option ? priorityColor(for: option).opacity(colorScheme == .dark ? 0.24 : 0.18) : fieldFill.opacity(0.66),
                            in: Capsule()
                        )
                        .overlay(
                            Capsule()
                                .stroke(priority == option ? priorityColor(for: option).opacity(0.72) : .white.opacity(0.18), lineWidth: 1)
                        )
                        .contentShape(Capsule())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("\(option.title) priority")
                }
            }
        }
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.62) : Color(red: 0.07, green: 0.14, blue: 0.28).opacity(0.70)
    }

    private var selectedPriorityText: Color {
        colorScheme == .dark ? .white : Color(red: 0.03, green: 0.09, blue: 0.18)
    }

    private func priorityColor(for priority: TaskPriority) -> Color {
        switch priority {
        case .low:
            Color(red: 0.43, green: 0.82, blue: 1.00)
        case .medium:
            Color(red: 0.22, green: 0.82, blue: 0.56)
        case .high:
            Color(red: 1.00, green: 0.32, blue: 0.38)
        }
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var fieldFill: Color {
        colorScheme == .dark ? .white.opacity(0.12) : .white.opacity(0.28)
    }

    private var sheetColors: [Color] {
        if colorScheme == .dark {
            [
                Color(red: 0.02, green: 0.05, blue: 0.13),
                Color(red: 0.05, green: 0.08, blue: 0.22),
                Color(red: 0.02, green: 0.16, blue: 0.20)
            ]
        } else {
            [
                Color(red: 0.80, green: 0.95, blue: 1.00),
                Color(red: 0.70, green: 0.82, blue: 0.98),
                Color(red: 0.58, green: 0.86, blue: 0.92)
            ]
        }
    }
}

#Preview {
    TaskEditorSheet(mode: .add) { _, _, _ in }
}
