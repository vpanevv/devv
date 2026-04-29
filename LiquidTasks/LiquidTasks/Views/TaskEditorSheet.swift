import SwiftUI

struct TaskEditorSheet: View {
    @Environment(\.colorScheme) private var colorScheme
    private let reminderManager = ReminderManager.shared
    enum Mode {
        case add
        case edit(title: String, notes: String?, priority: TaskPriority, scheduledAt: Date?)

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
            case .edit(let title, _, _, _): title
            }
        }

        var initialNotes: String {
            switch self {
            case .add: ""
            case .edit(_, let notes, _, _): notes ?? ""
            }
        }

        var initialPriority: TaskPriority {
            switch self {
            case .add: .medium
            case .edit(_, _, let priority, _): priority
            }
        }

        var initialReminderDate: Date {
            switch self {
            case .add:
                defaultReminderDate()
            case .edit(_, _, _, let scheduledAt):
                defaultReminderDate(from: scheduledAt)
            }
        }

        var isReminderInitiallyEnabled: Bool {
            switch self {
            case .add:
                false
            case .edit(_, _, _, let scheduledAt):
                scheduledAt != nil
            }
        }
    }

    @Environment(\.dismiss) private var dismiss
    @FocusState private var isFocused: Bool
    @State private var title: String
    @State private var notes: String
    @State private var priority: TaskPriority
    @State private var isReminderEnabled: Bool
    @State private var reminderDate: Date
    @State private var reminderPermissionState: ReminderPermissionState = .unknown
    @State private var reminderPermissionTask: Task<Void, Never>?

    let mode: Mode
    let onCommit: (String, String?, TaskPriority, Date?) -> Void

    init(mode: Mode, onCommit: @escaping (String, String?, TaskPriority, Date?) -> Void) {
        self.mode = mode
        self.onCommit = onCommit
        _title = State(initialValue: mode.initialText)
        _notes = State(initialValue: mode.initialNotes)
        _priority = State(initialValue: mode.initialPriority)
        _isReminderEnabled = State(initialValue: mode.isReminderInitiallyEnabled)
        _reminderDate = State(initialValue: mode.initialReminderDate)
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

                    reminderSection

                    Button {
                        onCommit(
                            title,
                            notes,
                            priority,
                            isReminderEnabled ? max(reminderDate, minimumReminderDate) : nil
                        )
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
        .presentationDetents([.height(620)])
        .presentationDragIndicator(.hidden)
        .presentationCornerRadius(34)
        .onAppear {
            isFocused = true
            Task {
                reminderPermissionState = await reminderManager.authorizationState()
            }
        }
        .onChange(of: isReminderEnabled) { _, isEnabled in
            reminderPermissionTask?.cancel()

            guard isEnabled else { return }
            if reminderDate < minimumReminderDate {
                reminderDate = minimumReminderDate
            }

            reminderPermissionTask = Task {
                try? await Task.sleep(for: .milliseconds(220))
                guard !Task.isCancelled, isReminderEnabled else { return }
                reminderPermissionState = await reminderManager.requestAuthorizationIfNeeded()
            }
        }
        .onChange(of: reminderDate) { _, newValue in
            if newValue < minimumReminderDate {
                reminderDate = minimumReminderDate
            }
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

    private var reminderSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 12) {
                Label {
                    VStack(alignment: .leading, spacing: 3) {
                        Text("Remind me")
                            .font(.system(.headline, design: .rounded, weight: .semibold))
                            .foregroundStyle(primaryText)

                        Text("Schedule a date and time.")
                            .font(.system(.caption, design: .rounded, weight: .medium))
                            .foregroundStyle(secondaryText)
                    }
                } icon: {
                    Image(systemName: isReminderEnabled ? "bell.badge.fill" : "bell")
                        .font(.system(size: 17, weight: .bold))
                        .foregroundStyle(.cyan)
                        .frame(width: 24, height: 24)
                }

                Spacer()

                Toggle("", isOn: $isReminderEnabled)
                    .labelsHidden()
                    .tint(.cyan)
            }
            .padding(16)
            .background(fieldFill.opacity(0.70), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(.white.opacity(0.18), lineWidth: 1)
            )

            if isReminderEnabled {
                VStack(alignment: .leading, spacing: 12) {
                    reminderPickerRow(
                        title: "Date",
                        systemImage: "calendar",
                        content: AnyView(
                            DatePicker(
                                "",
                                selection: $reminderDate,
                                in: minimumReminderDate...,
                                displayedComponents: .date
                            )
                            .labelsHidden()
                            .datePickerStyle(.compact)
                            .tint(.cyan)
                        )
                    )

                    reminderPickerRow(
                        title: "Time",
                        systemImage: "clock",
                        content: AnyView(
                            DatePicker(
                                "",
                                selection: $reminderDate,
                                in: minimumReminderDate...,
                                displayedComponents: .hourAndMinute
                            )
                            .labelsHidden()
                            .datePickerStyle(.compact)
                            .tint(.cyan)
                        )
                    )
                }
                .padding(16)
                .background(fieldFill.opacity(0.60), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 22, style: .continuous)
                        .stroke(.white.opacity(0.16), lineWidth: 1)
                )
                .transition(
                    .asymmetric(
                        insertion: .scale(scale: 0.98, anchor: .top).combined(with: .opacity),
                        removal: .opacity
                    )
                )

                if let reminderStatusMessage {
                    Label(reminderStatusMessage.text, systemImage: reminderStatusMessage.icon)
                        .font(.system(.caption, design: .rounded, weight: .medium))
                        .foregroundStyle(reminderStatusMessage.color)
                        .padding(.horizontal, 4)
                }
            }
        }
        .animation(.spring(response: 0.28, dampingFraction: 0.86), value: isReminderEnabled)
    }

    private func reminderPickerRow(title: String, systemImage: String, content: AnyView) -> some View {
        HStack(spacing: 12) {
            Label(title, systemImage: systemImage)
                .font(.system(.subheadline, design: .rounded, weight: .semibold))
                .foregroundStyle(primaryText)

            Spacer()

            content
        }
    }

    private var reminderStatusMessage: (text: String, icon: String, color: Color)? {
        switch reminderPermissionState {
        case .authorized, .unknown:
            nil
        case .notDetermined:
            (
                text: "Liquid Tasks will ask once to allow local reminders.",
                icon: "bell.badge",
                color: secondaryText
            )
        case .denied:
            (
                text: "Notifications are off. The schedule will save, but iPhone reminders are disabled.",
                icon: "bell.slash",
                color: Color(red: 1.00, green: 0.70, blue: 0.48)
            )
        }
    }

    private var minimumReminderDate: Date {
        Calendar.current.date(byAdding: .minute, value: 1, to: .now) ?? .now
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
    TaskEditorSheet(mode: .add) { _, _, _, _ in }
}

private func defaultReminderDate(from date: Date? = nil) -> Date {
    let fallback = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
    return max(date ?? fallback, fallback)
}
