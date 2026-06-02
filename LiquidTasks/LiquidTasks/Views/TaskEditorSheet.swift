import SwiftUI

struct TaskEditorSheet: View {
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.dismiss) private var dismiss

    private let reminderManager = ReminderManager.shared
    private enum FocusedField {
        case title
        case notes
    }

    enum Mode {
        case add
        case edit(title: String, notes: String?, priority: TaskPriority, scheduledAt: Date?, reminderRepeat: TaskReminderRepeat)

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

        var showsCloseButton: Bool {
            switch self {
            case .add:
                true
            case .edit:
                false
            }
        }

        var initialText: String {
            switch self {
            case .add:
                ""
            case .edit(let title, _, _, _, _):
                title
            }
        }

        var initialNotes: String {
            switch self {
            case .add:
                ""
            case .edit(_, let notes, _, _, _):
                notes ?? ""
            }
        }

        var initialPriority: TaskPriority {
            switch self {
            case .add:
                .medium
            case .edit(_, _, let priority, _, _):
                priority
            }
        }

        var initialReminderDate: Date {
            switch self {
            case .add:
                return defaultReminderDate()
            case .edit(_, _, _, let scheduledAt, let reminderRepeat):
                if reminderRepeat == .none {
                    return defaultReminderDate(from: scheduledAt)
                }
                return scheduledAt ?? defaultReminderDate()
            }
        }

        var isReminderInitiallyEnabled: Bool {
            switch self {
            case .add:
                false
            case .edit(_, _, _, let scheduledAt, _):
                scheduledAt != nil
            }
        }

        var initialReminderRepeat: TaskReminderRepeat {
            switch self {
            case .add:
                .none
            case .edit(_, _, _, _, let reminderRepeat):
                reminderRepeat
            }
        }
    }

    @State private var title: String
    @State private var notes: String
    @State private var priority: TaskPriority
    @State private var isReminderEnabled: Bool
    @State private var reminderDate: Date
    @State private var reminderRepeat: TaskReminderRepeat
    @State private var reminderPermissionState: ReminderPermissionState = .unknown
    @State private var reminderPermissionTask: Task<Void, Never>?
    @State private var isReminderSchedulerPresented = false
    @State private var pendingReminderDate: Date
    @State private var pendingReminderRepeat: TaskReminderRepeat
    @State private var reminderWasEnabledBeforeScheduling = false
    @FocusState private var focusedField: FocusedField?

    let mode: Mode
    let onCommit: (String, String?, TaskPriority, Date?, TaskReminderRepeat) -> Void

    init(mode: Mode, onCommit: @escaping (String, String?, TaskPriority, Date?, TaskReminderRepeat) -> Void) {
        self.mode = mode
        self.onCommit = onCommit
        _title = State(initialValue: mode.initialText)
        _notes = State(initialValue: mode.initialNotes)
        _priority = State(initialValue: mode.initialPriority)
        _isReminderEnabled = State(initialValue: mode.isReminderInitiallyEnabled)
        _reminderDate = State(initialValue: mode.initialReminderDate)
        _reminderRepeat = State(initialValue: mode.isReminderInitiallyEnabled ? mode.initialReminderRepeat : .none)
        _pendingReminderDate = State(initialValue: mode.initialReminderDate)
        _pendingReminderRepeat = State(initialValue: mode.initialReminderRepeat)
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: sheetColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            .contentShape(Rectangle())
            .onTapGesture {
                dismissKeyboard()
            }

            VStack(spacing: 22) {
                Capsule()
                    .fill(.white.opacity(0.24))
                    .frame(width: 42, height: 5)
                    .padding(.top, 10)

                VStack(alignment: .leading, spacing: 18) {
                    HStack(alignment: .top, spacing: 16) {
                        Text(mode.title)
                            .font(.system(.largeTitle, design: .rounded, weight: .semibold))
                            .foregroundStyle(primaryText)

                        Spacer(minLength: 0)

                        if mode.showsCloseButton {
                            Button {
                                dismissKeyboard()
                                dismiss()
                            } label: {
                                Image(systemName: "xmark")
                                    .font(.system(size: 15, weight: .bold))
                                    .foregroundStyle(primaryText)
                                    .frame(width: 44, height: 44)
                                    .background(fieldFill.opacity(0.92), in: Circle())
                                    .overlay(
                                        Circle()
                                            .stroke(.white.opacity(0.18), lineWidth: 1)
                                    )
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("Close new task")
                        }
                    }

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
                        .focused($focusedField, equals: .title)

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
                        .focused($focusedField, equals: .notes)

                    priorityPicker
                    reminderSection

                    Button {
                        dismissKeyboard()
                        onCommit(
                            title,
                            notes,
                            priority,
                            isReminderEnabled ? reminderDate : nil,
                            isReminderEnabled ? reminderRepeat : .none
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
                            .opacity(isCommitDisabled ? 0.45 : 1)
                    }
                    .disabled(isCommitDisabled)
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 22)

                Spacer()
            }
            .blur(radius: isReminderSchedulerPresented ? 10 : 0)
            .scaleEffect(isReminderSchedulerPresented ? 0.985 : 1)
            .allowsHitTesting(!isReminderSchedulerPresented)

            if isReminderSchedulerPresented {
                Color.black.opacity(colorScheme == .dark ? 0.34 : 0.18)
                    .ignoresSafeArea()
                    .transition(.opacity)
                    .onTapGesture {
                        dismissKeyboard()
                        cancelReminderScheduling()
                    }

                ReminderSchedulerPopup(
                    reminderDate: $pendingReminderDate,
                    reminderRepeat: $pendingReminderRepeat,
                    onClose: cancelReminderScheduling,
                    onCancel: cancelReminderScheduling,
                    onSave: confirmReminderScheduling
                )
                .padding(.horizontal, 20)
                .padding(.top, 22)
                .padding(.bottom, 18)
                .frame(maxHeight: .infinity, alignment: .top)
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.92).combined(with: .opacity),
                    removal: .scale(scale: 0.98).combined(with: .opacity)
                ))
                .zIndex(2)
            }
        }
        .presentationDetents([.height(620)])
        .presentationDragIndicator(.hidden)
        .presentationCornerRadius(34)
        .onAppear {
            Task {
                reminderPermissionState = await reminderManager.authorizationState()
            }
        }
        .onDisappear {
            reminderPermissionTask?.cancel()
            reminderPermissionTask = nil
        }
        .animation(.spring(response: 0.34, dampingFraction: 0.84), value: isReminderSchedulerPresented)
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
                        dismissKeyboard()
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

                        Text(reminderSummaryText)
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

                if isReminderEnabled {
                    Button {
                        dismissKeyboard()
                        beginReminderScheduling(editingExistingReminder: true)
                    } label: {
                        Text("Change")
                            .font(.system(.caption, design: .rounded, weight: .bold))
                            .foregroundStyle(primaryText)
                            .padding(.horizontal, 12)
                            .frame(height: 34)
                            .background(.white.opacity(colorScheme == .dark ? 0.12 : 0.28), in: Capsule())
                            .overlay(
                                Capsule()
                                    .stroke(.white.opacity(0.18), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Change reminder")
                }

                Toggle("", isOn: reminderToggleBinding)
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
                reminderSummaryPill
            }

            if let reminderValidationMessage {
                Label(reminderValidationMessage, systemImage: "exclamationmark.triangle.fill")
                    .font(.system(.caption, design: .rounded, weight: .medium))
                    .foregroundStyle(Color(red: 1.00, green: 0.72, blue: 0.48))
                    .padding(.horizontal, 4)
            }

            if let reminderStatusMessage {
                Label(reminderStatusMessage.text, systemImage: reminderStatusMessage.icon)
                    .font(.system(.caption, design: .rounded, weight: .medium))
                    .foregroundStyle(reminderStatusMessage.color)
                    .padding(.horizontal, 4)
            }
        }
    }

    private var reminderSummaryPill: some View {
        HStack(spacing: 10) {
            Image(systemName: "calendar.badge.clock")
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(.cyan)

            VStack(alignment: .leading, spacing: 3) {
                Text(reminderPrimarySummary)
                    .font(.system(.subheadline, design: .rounded, weight: .semibold))
                    .foregroundStyle(primaryText)
                    .lineLimit(2)

                Text(reminderSecondarySummary)
                    .font(.system(.caption, design: .rounded, weight: .medium))
                    .foregroundStyle(secondaryText)
                    .lineLimit(2)
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(.white.opacity(colorScheme == .dark ? 0.08 : 0.22), in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(.white.opacity(0.16), lineWidth: 1)
        )
    }

    private var reminderToggleBinding: Binding<Bool> {
        Binding(
            get: { isReminderEnabled },
            set: { newValue in
                dismissKeyboard()
                if newValue {
                    beginReminderScheduling(editingExistingReminder: false)
                } else {
                    reminderPermissionTask?.cancel()
                    isReminderEnabled = false
                    reminderRepeat = .none
                }
            }
        )
    }

    private var reminderSummaryText: String {
        isReminderEnabled ? reminderRepeat.detailDescription(for: reminderDate) : "Schedule a date and time."
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
        currentReminderDate()
    }

    private var reminderValidationMessage: String? {
        validateReminder(date: reminderDate, recurrence: reminderRepeat)
    }

    private var isCommitDisabled: Bool {
        title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || (isReminderEnabled && reminderValidationMessage != nil)
    }

    private var reminderPrimarySummary: String {
        if reminderRepeat == .none {
            return reminderDate.formatted(date: .abbreviated, time: .shortened)
        }

        return reminderRepeat.detailDescription(for: reminderDate)
    }

    private var reminderSecondarySummary: String {
        if reminderRepeat == .none {
            return reminderRepeat.detailDescription(for: reminderDate)
        }

        guard let nextOccurrence = reminderRepeat.nextOccurrence(from: reminderDate) else {
            return reminderRepeat.shortDescription
        }

        return "Next: \(nextOccurrence.formatted(date: .abbreviated, time: .shortened))"
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.62) : Color(red: 0.07, green: 0.14, blue: 0.28).opacity(0.70)
    }

    private var selectedPriorityText: Color {
        colorScheme == .dark ? .white : Color(red: 0.03, green: 0.09, blue: 0.18)
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

    private func beginReminderScheduling(editingExistingReminder: Bool) {
        dismissKeyboard()
        reminderWasEnabledBeforeScheduling = editingExistingReminder || isReminderEnabled
        pendingReminderDate = isReminderEnabled ? reminderDate : defaultReminderDate()
        pendingReminderRepeat = isReminderEnabled ? reminderRepeat : .none
        isReminderSchedulerPresented = true
        requestReminderPermission()
    }

    private func confirmReminderScheduling() {
        dismissKeyboard()
        reminderDate = pendingReminderDate
        reminderRepeat = pendingReminderRepeat
        isReminderEnabled = true
        isReminderSchedulerPresented = false
    }

    private func cancelReminderScheduling() {
        dismissKeyboard()
        pendingReminderDate = reminderDate
        pendingReminderRepeat = reminderRepeat
        if !reminderWasEnabledBeforeScheduling {
            isReminderEnabled = false
            reminderRepeat = .none
        }
        isReminderSchedulerPresented = false
    }

    private func requestReminderPermission() {
        reminderPermissionTask?.cancel()
        reminderPermissionTask = Task {
            try? await Task.sleep(for: .milliseconds(180))
            guard !Task.isCancelled else { return }
            reminderPermissionState = await reminderManager.requestAuthorizationIfNeeded()
        }
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

    private func validateReminder(date: Date, recurrence: TaskReminderRepeat) -> String? {
        guard recurrence == .none else { return nil }
        guard date > minimumReminderDate else {
            return "Choose a future date and time for a one-time reminder."
        }
        return nil
    }

    private func dismissKeyboard() {
        focusedField = nil
    }
}

private struct ReminderSchedulerPopup: View {
    @Environment(\.colorScheme) private var colorScheme
    @Binding var reminderDate: Date
    @Binding var reminderRepeat: TaskReminderRepeat

    let onClose: () -> Void
    let onCancel: () -> Void
    let onSave: () -> Void

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                header
                reminderPreview
                quickScheduleRow
                dateRow
                timeRow
                repeatRow

                if let validationMessage {
                    Label(validationMessage, systemImage: "exclamationmark.triangle.fill")
                        .font(.system(.caption, design: .rounded, weight: .medium))
                        .foregroundStyle(Color(red: 1.00, green: 0.72, blue: 0.48))
                        .padding(.horizontal, 4)
                }

                actionRow
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 20)
        }
        .scrollIndicators(.hidden)
        .frame(maxWidth: 430)
        .frame(maxHeight: 650)
        .background(
            ZStack {
                RoundedRectangle(cornerRadius: 32, style: .continuous)
                    .fill(.ultraThinMaterial)

                LinearGradient(
                    colors: sheetColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .opacity(colorScheme == .dark ? 0.94 : 0.82)
                .clipShape(RoundedRectangle(cornerRadius: 32, style: .continuous))
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
        .shadow(color: .black.opacity(colorScheme == .dark ? 0.32 : 0.18), radius: 26, y: 16)
        .shadow(color: .cyan.opacity(colorScheme == .dark ? 0.12 : 0.08), radius: 18, y: 0)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 14) {
            ZStack {
                Circle()
                    .fill(.white.opacity(0.14))
                    .frame(width: 56, height: 56)

                Circle()
                    .fill(.cyan.opacity(0.20))
                    .frame(width: 74, height: 74)
                    .blur(radius: 18)

                Image(systemName: "bell.badge.fill")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundStyle(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text("Schedule Reminder")
                    .font(.system(.title2, design: .rounded, weight: .bold))
                    .foregroundStyle(primaryText)
                    .lineLimit(2)
                    .minimumScaleFactor(0.86)

                Text("Choose a date, time, and repeat style for this task.")
                    .font(.system(.subheadline, design: .rounded, weight: .medium))
                    .foregroundStyle(secondaryText)
                    .lineLimit(2)
            }

            Spacer(minLength: 0)

            Button {
                onClose()
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(primaryText)
                    .frame(width: 40, height: 40)
                    .background(.white.opacity(colorScheme == .dark ? 0.12 : 0.26), in: Circle())
                    .overlay(
                        Circle()
                            .stroke(.white.opacity(0.18), lineWidth: 1)
                    )
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Close reminder scheduling")
        }
    }

    private var actionRow: some View {
        HStack(spacing: 12) {
            Button {
                onCancel()
            } label: {
                Text("Cancel")
                    .font(.system(.headline, design: .rounded, weight: .bold))
                    .foregroundStyle(primaryText)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(.white.opacity(colorScheme == .dark ? 0.12 : 0.26), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 20, style: .continuous)
                            .stroke(.white.opacity(0.18), lineWidth: 1)
                    )
            }
            .buttonStyle(.plain)

            Button {
                onSave()
            } label: {
                Text("Save")
                    .font(.system(.headline, design: .rounded, weight: .bold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .frame(height: 52)
                    .background(
                        LinearGradient(
                            colors: [.cyan, .blue, .indigo],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        in: RoundedRectangle(cornerRadius: 20, style: .continuous)
                    )
                    .opacity(validationMessage == nil ? 1 : 0.45)
            }
            .disabled(validationMessage != nil)
            .buttonStyle(.plain)
        }
    }

    private var quickScheduleRow: some View {
        HStack(spacing: 10) {
            quickActionButton(title: "In 1 hour") {
                reminderDate = Calendar.current.date(byAdding: .hour, value: 1, to: currentReminderDate()) ?? reminderDate
            }

            quickActionButton(title: "Tonight") {
                reminderDate = eveningReminderDate()
            }

            quickActionButton(title: "Tomorrow") {
                reminderDate = tomorrowReminderDate()
            }
        }
    }

    private var dateRow: some View {
        HStack(spacing: 12) {
            Label("Date", systemImage: "calendar")
                .font(.system(.subheadline, design: .rounded, weight: .bold))
                .foregroundStyle(primaryText)

            Spacer()

            DatePicker(
                "",
                selection: $reminderDate,
                displayedComponents: .date
            )
            .labelsHidden()
            .datePickerStyle(.compact)
            .tint(.cyan)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 16)
        .background(panelFill, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
    }

    private var timeRow: some View {
        HStack(spacing: 12) {
            Label("Time", systemImage: "clock")
                .font(.system(.subheadline, design: .rounded, weight: .bold))
                .foregroundStyle(primaryText)

            Spacer()

            DatePicker(
                "",
                selection: $reminderDate,
                displayedComponents: .hourAndMinute
            )
            .labelsHidden()
            .datePickerStyle(.compact)
            .tint(.cyan)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 16)
        .background(panelFill, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
    }

    private var reminderPreview: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Selected schedule")
                    .font(.system(.caption, design: .rounded, weight: .bold))
                    .foregroundStyle(secondaryText)
                    .textCase(.uppercase)

                Text(reminderRepeat.detailDescription(for: reminderDate))
                    .font(.system(.headline, design: .rounded, weight: .semibold))
                    .foregroundStyle(primaryText)
                    .fixedSize(horizontal: false, vertical: true)

                Text(nextOccurrenceSummary)
                    .font(.system(.caption, design: .rounded, weight: .medium))
                    .foregroundStyle(secondaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)
        }
        .padding(16)
        .background(panelFill, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
    }

    private var repeatRow: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Repeat")
                .font(.system(.caption, design: .rounded, weight: .bold))
                .foregroundStyle(secondaryText)
                .textCase(.uppercase)

            HStack(spacing: 10) {
                ForEach(TaskReminderRepeat.allCases) { option in
                    Button {
                        withAnimation(.smooth(duration: 0.22)) {
                            reminderRepeat = option
                        }
                    } label: {
                        Text(option.title)
                            .font(.system(.caption, design: .rounded, weight: .bold))
                            .foregroundStyle(reminderRepeat == option ? selectedText : primaryText)
                            .frame(maxWidth: .infinity)
                            .frame(height: 40)
                            .background(
                                reminderRepeat == option
                                    ? Color.cyan.opacity(colorScheme == .dark ? 0.22 : 0.18)
                                    : .white.opacity(colorScheme == .dark ? 0.10 : 0.24),
                                in: Capsule()
                            )
                            .overlay(
                                Capsule()
                                    .stroke(reminderRepeat == option ? Color.cyan.opacity(0.72) : .white.opacity(0.16), lineWidth: 1)
                            )
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(option.title)
                }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 16)
        .background(panelFill, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 22, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
    }

    private func quickActionButton(title: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Text(title)
                .font(.system(.caption, design: .rounded, weight: .bold))
                .foregroundStyle(primaryText)
                .frame(maxWidth: .infinity)
                .frame(height: 40)
                .background(.white.opacity(colorScheme == .dark ? 0.12 : 0.26), in: Capsule())
                .overlay(
                    Capsule()
                        .stroke(.white.opacity(0.16), lineWidth: 1)
                )
        }
        .buttonStyle(.plain)
    }

    private func eveningReminderDate() -> Date {
        let now = Date()
        let evening = Calendar.current.date(bySettingHour: 19, minute: 0, second: 0, of: now) ?? now
        if evening > now {
            return evening
        }

        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: now) ?? now
        return Calendar.current.date(bySettingHour: 19, minute: 0, second: 0, of: tomorrow) ?? tomorrow
    }

    private func tomorrowReminderDate() -> Date {
        let tomorrow = Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date()
        return Calendar.current.date(
            bySettingHour: Calendar.current.component(.hour, from: reminderDate),
            minute: Calendar.current.component(.minute, from: reminderDate),
            second: 0,
            of: tomorrow
        ) ?? tomorrow
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.70) : Color(red: 0.08, green: 0.15, blue: 0.30).opacity(0.82)
    }

    private var selectedText: Color {
        colorScheme == .dark ? .white : Color(red: 0.03, green: 0.09, blue: 0.18)
    }

    private var panelFill: Color {
        colorScheme == .dark ? .white.opacity(0.10) : .white.opacity(0.28)
    }

    private var sheetColors: [Color] {
        if colorScheme == .dark {
            [
                Color(red: 0.02, green: 0.05, blue: 0.13),
                Color(red: 0.05, green: 0.08, blue: 0.22),
                Color(red: 0.07, green: 0.12, blue: 0.26)
            ]
        } else {
            [
                Color(red: 0.82, green: 0.95, blue: 1.00),
                Color(red: 0.74, green: 0.88, blue: 1.00),
                Color(red: 0.70, green: 0.84, blue: 0.98)
            ]
        }
    }

    private var validationMessage: String? {
        guard reminderRepeat == .none else { return nil }
        guard reminderDate > currentReminderDate() else {
            return "Choose a future date and time for a one-time reminder."
        }
        return nil
    }

    private var nextOccurrenceSummary: String {
        switch reminderRepeat {
        case .none:
            return "One-time reminder"
        case .daily, .weekly, .monthly:
            guard let nextOccurrence = reminderRepeat.nextOccurrence(from: reminderDate) else {
                return reminderRepeat.shortDescription
            }
            return "Next reminder: \(nextOccurrence.formatted(date: .abbreviated, time: .shortened))"
        }
    }

}

#Preview {
    TaskEditorSheet(mode: .add) { _, _, _, _, _ in }
}

private func defaultReminderDate(from date: Date? = nil) -> Date {
    let fallback = currentReminderDate()
    return max(date ?? fallback, fallback)
}

private func currentReminderDate() -> Date {
    let now = Date()
    return Calendar.current.date(
        bySettingHour: Calendar.current.component(.hour, from: now),
        minute: Calendar.current.component(.minute, from: now),
        second: 0,
        of: now
    ) ?? now
}
