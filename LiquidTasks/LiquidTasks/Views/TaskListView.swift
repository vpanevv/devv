import AudioToolbox
import SwiftData
import SwiftUI
import UIKit

struct TaskListView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.accessibilityReduceMotion) private var accessibilityReduceMotion
    private let reminderManager = ReminderManager.shared
    @Query(sort: \TaskItem.createdAt, order: .reverse) private var tasks: [TaskItem]
    @AppStorage("hasStartedLiquidTasks") private var hasStarted = true
    @AppStorage("liquidTasksAppearance") private var appearanceRawValue = AppearanceMode.dark.rawValue
    @AppStorage(LiquidTasksRuntime.launchActionKey) private var pendingLaunchAction = LiquidTasksLaunchAction.none.rawValue
    @AppStorage(LiquidTasksRuntime.currentProfileNameKey) private var currentProfileName = ""
    @AppStorage("liquidTasksDailyTargetXP") private var dailyTargetXP = 50
    @State private var todayXP = 0
    @State private var recordXP = 0
    @State private var xpDateKey = ""
    @State private var lastTargetHitDate = ""
    @State private var taskToEdit: TaskItem?
    @State private var isAddingTask = false
    @State private var isXPStatsPresented = false
    @State private var isCompletedTasksPresented = false
    @State private var completionBurstID: UUID?
    @State private var achievementPopup: AchievementPopupData?
    @State private var taskPendingDeletion: TaskItem?
    @State private var xpGlowVisible = false

    private var store: TaskStore {
        TaskStore(context: modelContext, activeProfileID: activeProfileID)
    }

    private var profileTasks: [TaskItem] {
        tasks.filter { task in
            profileID(for: task) == activeProfileID
        }
    }

    private var activeTasks: [TaskItem] {
        profileTasks.filter { !$0.isCompleted }
    }

    private var completedTasks: [TaskItem] {
        profileTasks.filter(\.isCompleted)
    }

    private var sortedActiveTasks: [TaskItem] {
        activeTasks.sorted { lhs, rhs in
            let lhsDate = lhs.scheduledAt ?? lhs.createdAt
            let rhsDate = rhs.scheduledAt ?? rhs.createdAt

            if lhsDate == rhsDate {
                return lhs.createdAt < rhs.createdAt
            }

            return lhsDate < rhsDate
        }
    }

    private var nextUpTask: TaskItem? {
        let futureScheduledTask = sortedActiveTasks.first { task in
            guard let scheduledAt = task.scheduledAt else { return false }
            return scheduledAt >= .now
        }

        return futureScheduledTask ?? sortedActiveTasks.first
    }

    private var todayTasks: [TaskItem] {
        let calendar = Calendar.current

        return sortedActiveTasks.filter { task in
            guard task.id != nextUpTask?.id else { return false }
            guard let scheduledAt = task.scheduledAt else { return true }
            return calendar.isDateInToday(scheduledAt) || scheduledAt < .now
        }
    }

    private var laterTasks: [TaskItem] {
        let calendar = Calendar.current

        return sortedActiveTasks.filter { task in
            guard task.id != nextUpTask?.id else { return false }
            guard let scheduledAt = task.scheduledAt else { return false }
            return !calendar.isDateInToday(scheduledAt) && scheduledAt > .now
        }
    }

    private var totalXP: Int {
        currentXPFromTasks
    }

    private var currentLevel: Int {
        max(1, (totalXP / 40) + 1)
    }

    private var appearanceBinding: Binding<AppearanceMode> {
        Binding(
            get: { AppearanceMode(rawValue: appearanceRawValue) ?? .dark },
            set: { appearanceRawValue = $0.rawValue }
        )
    }

    private var currentXPFromTasks: Int {
        completedTasks.reduce(into: 0) { partialResult, task in
            partialResult += task.priority.xpValue
        }
    }

    private var completionProgress: Double {
        guard !profileTasks.isEmpty else { return 0 }
        return Double(completedTasks.count) / Double(profileTasks.count)
    }

    private var completionProgressPercent: Int {
        Int((completionProgress * 100).rounded())
    }

    private var xpSyncSignature: [String] {
        profileTasks
            .map {
                "\($0.id.uuidString):\($0.isCompleted):\($0.priority.rawValue):\($0.scheduledAt?.timeIntervalSince1970 ?? 0):\($0.title):\($0.notes ?? ""):\(profileID(for: $0))"
            }
            .sorted()
    }

    private var reminderSnapshots: [ReminderTaskSnapshot] {
        tasks.map(ReminderTaskSnapshot.init(task:))
    }

    private var activeProfileID: String {
        LocalProfile.normalizedID(from: currentProfileName)
    }

    private var activeProfileDisplayName: String {
        LocalProfile.displayName(from: currentProfileName)
    }

    private var highPriorityActiveCount: Int {
        activeTasks.filter { $0.priority == .high }.count
    }

    private var remindersLaterTodayCount: Int {
        let calendar = Calendar.current
        return activeTasks.filter { task in
            guard let scheduledAt = task.scheduledAt else { return false }
            return calendar.isDateInToday(scheduledAt) && scheduledAt > .now
        }.count
    }

    private var listAnimation: Animation {
        accessibilityReduceMotion
            ? .easeOut(duration: 0.18)
            : .spring(response: 0.46, dampingFraction: 0.84, blendDuration: 0.14)
    }

    var body: some View {
        ZStack {
            LiquidBackground()

            VStack(spacing: 0) {
                header
                taskList
                    .transition(.opacity)
                    .animation(.smooth(duration: 0.34), value: profileTasks.count)

                Spacer(minLength: 0)
            }

            if let completionBurstID {
                CompletionBurstView(id: completionBurstID)
                    .transition(.scale(scale: 0.74).combined(with: .opacity))
                    .zIndex(3)
                    .allowsHitTesting(false)
            }

            if let achievementPopup {
                AchievementPopupView(data: achievementPopup)
                    .padding(.horizontal, 24)
                    .transition(.asymmetric(
                        insertion: .scale(scale: 0.82).combined(with: .opacity),
                        removal: .scale(scale: 0.94).combined(with: .opacity)
                    ))
                    .zIndex(4)
                    .allowsHitTesting(false)
            }

            if isXPStatsPresented {
                Color.black.opacity(colorScheme == .dark ? 0.30 : 0.16)
                    .ignoresSafeArea()
                    .transition(.opacity)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.34, dampingFraction: 0.86)) {
                            isXPStatsPresented = false
                        }
                    }

                XPStatsSheet(
                    todayXP: todayXP,
                    recordXP: recordXP,
                    targetXP: $dailyTargetXP,
                    onClose: {
                        withAnimation(.spring(response: 0.34, dampingFraction: 0.86)) {
                            isXPStatsPresented = false
                        }
                    }
                )
                .padding(.horizontal, 20)
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.92).combined(with: .opacity),
                    removal: .scale(scale: 0.98).combined(with: .opacity)
                ))
                .zIndex(5)
            }

            if isCompletedTasksPresented {
                Color.black.opacity(colorScheme == .dark ? 0.30 : 0.16)
                    .ignoresSafeArea()
                    .transition(.opacity)
                    .onTapGesture {
                        withAnimation(.spring(response: 0.34, dampingFraction: 0.86)) {
                            isCompletedTasksPresented = false
                        }
                    }

                CompletedTasksSheet(
                    tasks: completedTasks,
                    primaryText: primaryText,
                    secondaryText: secondaryText,
                    completedText: completedText,
                    editIconTint: editIconTint,
                    editButtonFill: editButtonFill,
                    priorityColor: priorityColor(for:),
                    onClose: {
                        withAnimation(.spring(response: 0.34, dampingFraction: 0.86)) {
                            isCompletedTasksPresented = false
                        }
                    },
                    onClear: {
                        withAnimation(.smooth(duration: 0.30)) {
                            store.deleteCompleted(completedTasks)
                            isCompletedTasksPresented = false
                        }
                    },
                    onSelectTask: { task in
                        toggle(task)
                    },
                    onEditTask: { task in
                        taskToEdit = task
                    }
                )
                .padding(.horizontal, 20)
                .transition(.asymmetric(
                    insertion: .scale(scale: 0.92).combined(with: .opacity),
                    removal: .scale(scale: 0.98).combined(with: .opacity)
                ))
                .zIndex(5)
            }
        }
        .onAppear {
            LiquidTasksRuntime.migrateLegacyTasksIfNeeded()
            loadProfileXPState()
            resetDailyXPIfNeeded()
            synchronizeXPState()
            synchronizeReminders()
            processPendingLaunchAction()
        }
        .onChange(of: xpSyncSignature) { _, _ in
            resetDailyXPIfNeeded()
            synchronizeXPState()
            synchronizeReminders()
        }
        .onChange(of: scenePhase) { _, newPhase in
            guard newPhase == .active else { return }
            processPendingLaunchAction()
        }
        .onChange(of: pendingLaunchAction) { _, _ in
            processPendingLaunchAction()
        }
        .onChange(of: currentProfileName) { _, _ in
            loadProfileXPState()
            resetDailyXPIfNeeded()
            synchronizeXPState()
        }
        .sheet(isPresented: $isAddingTask) {
            TaskEditorSheet(mode: .add) { title, notes, priority, scheduledAt in
                store.addTask(title: title, notes: notes, priority: priority, scheduledAt: scheduledAt)
            }
        }
        .sheet(item: $taskToEdit) { task in
            TaskEditorSheet(
                mode: .edit(
                    title: task.title,
                    notes: task.notes,
                    priority: task.priority,
                    scheduledAt: task.scheduledAt
                )
            ) { title, notes, priority, scheduledAt in
                store.update(task, title: title, notes: notes, priority: priority, scheduledAt: scheduledAt)
            }
        }
        .confirmationDialog(
            "Delete task?",
            isPresented: Binding(
                get: { taskPendingDeletion != nil },
                set: { isPresented in
                    if !isPresented {
                        taskPendingDeletion = nil
                    }
                }
            ),
            titleVisibility: .visible
        ) {
            Button("Delete Task", role: .destructive) {
                guard let taskPendingDeletion else { return }
                withAnimation(.smooth(duration: 0.28)) {
                    store.delete(taskPendingDeletion)
                }
                self.taskPendingDeletion = nil
            }

            Button("Cancel", role: .cancel) {
                taskPendingDeletion = nil
            }
        } message: {
            Text("This task will be removed from Liquid Tasks.")
        }
        .animation(.spring(response: 0.34, dampingFraction: 0.86), value: isXPStatsPresented)
        .animation(.spring(response: 0.34, dampingFraction: 0.86), value: isCompletedTasksPresented)
        .animation(listAnimation, value: activeTasks.map(\.id))
        .animation(listAnimation, value: completedTasks.map(\.id))
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 18) {
            VStack(alignment: .leading, spacing: 10) {
                Text("\(dashboardGreeting) 👋")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundStyle(primaryText)
                    .multilineTextAlignment(.leading)
                    .lineLimit(2)
                    .minimumScaleFactor(0.86)

                Text("Let’s make it a productive day.")
                    .font(.system(.title3, design: .rounded, weight: .medium))
                    .foregroundStyle(statusText)
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            VStack(alignment: .trailing, spacing: 10) {
                DashboardXPSummaryPill(
                    xp: totalXP,
                    level: currentLevel,
                    isGlowing: xpGlowVisible
                ) {
                    isXPStatsPresented = true
                }

                HStack(spacing: 10) {
                    compactToolbarButton(
                        systemImage: appearanceBinding.wrappedValue.icon,
                        accessibilityLabel: "Toggle appearance"
                    ) {
                        withAnimation(.smooth(duration: 0.28)) {
                            appearanceBinding.wrappedValue.toggle()
                        }
                    }

                    compactToolbarButton(
                        systemImage: "person.crop.circle",
                        accessibilityLabel: "Switch profile"
                    ) {
                        withAnimation(.smooth(duration: 0.52)) {
                            hasStarted = false
                        }
                    }
                }
            }
        }
        .padding(.horizontal, 22)
        .padding(.top, 54)
        .padding(.bottom, 22)
    }

    private var taskList: some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(alignment: .leading, spacing: 24) {
                NextUpCardView(
                    task: nextUpTask,
                    primaryText: primaryText,
                    secondaryText: secondaryText,
                    onTap: {
                        if let nextUpTask {
                            taskToEdit = nextUpTask
                        } else {
                            isAddingTask = true
                        }
                    },
                    subtitle: nextUpTask.map { task in
                        scheduledLabel(for: task.scheduledAt ?? task.createdAt)
                    } ?? "Nothing scheduled next"
                )

                VStack(alignment: .leading, spacing: 14) {
                    DashboardSectionHeader(
                        title: "Today",
                        count: todayTasks.count,
                        primaryText: primaryText,
                        secondaryText: secondaryText,
                        showsAddButton: true,
                        onAdd: { isAddingTask = true }
                    )

                    if todayTasks.isEmpty {
                        sectionEmptyState("Everything is done for now")
                    } else {
                        ForEach(todayTasks) { task in
                            taskRow(task, isCompletedSection: false)
                                .transition(taskRowTransition(forCompletedSection: false))
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 14) {
                    DashboardSectionHeader(
                        title: "Later",
                        count: laterTasks.count,
                        primaryText: primaryText,
                        secondaryText: secondaryText,
                        showsAddButton: false,
                        onAdd: nil
                    )

                    if laterTasks.isEmpty {
                        sectionEmptyState("No tasks for later")
                    } else {
                        ForEach(laterTasks) { task in
                            taskRow(task, isCompletedSection: false)
                                .transition(taskRowTransition(forCompletedSection: false))
                        }
                    }
                }

                if !completedTasks.isEmpty {
                    VStack(alignment: .leading, spacing: 14) {
                        completedSectionHeader
                        completedSummaryButton
                    }
                }
            }
            .padding(.horizontal, 22)
            .padding(.bottom, 44)
        }
    }

    private var emptyState: some View {
        SpacerView {
            GlassCard(cornerRadius: 34) {
                VStack(spacing: 18) {
                    ZStack {
                        Circle()
                            .fill(.teal.opacity(0.14))
                            .frame(width: 86, height: 86)
                            .blur(radius: 14)

                        Image(systemName: "checklist.unchecked")
                            .font(.system(size: 38, weight: .medium))
                            .symbolRenderingMode(.hierarchical)
                            .foregroundStyle(.white)
                            .shadow(color: .black.opacity(0.20), radius: 10, y: 4)
                    }

                    VStack(spacing: 8) {
                        Text(emptyStateCopy.title)
                            .font(.system(.title2, design: .rounded, weight: .semibold))
                            .foregroundStyle(primaryText)

                        Text(emptyStateCopy.subtitle)
                            .font(.system(.body, design: .rounded, weight: .medium))
                            .foregroundStyle(secondaryText)
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(28)
            }
            .padding(.horizontal, 24)
        }
    }

    private func taskRow(_ task: TaskItem, isCompletedSection: Bool) -> some View {
        DashboardTaskRow(
            task: task,
            primaryText: primaryText,
            secondaryText: secondaryText,
            completedText: completedText,
            priorityColor: priorityColor(for: task.priority),
            trailingIconTint: editIconTint,
            trailingFill: editButtonFill,
            scheduledLabel: scheduledLabel(for: task.scheduledAt ?? task.createdAt),
            onToggle: { toggle(task) },
            onEdit: { taskToEdit = task }
        )
        .opacity(isCompletedSection ? 0.82 : 1)
        .contentTransition(.interpolate)
        .contextMenu {
            Button("Edit", systemImage: "pencil") {
                taskToEdit = task
            }

            Button("Delete", systemImage: "trash", role: .destructive) {
                taskPendingDeletion = task
            }
        }
    }

    private var inlineEmptyState: some View {
        GlassCard(cornerRadius: 26) {
            HStack(spacing: 15) {
                ZStack {
                    Circle()
                        .fill(.cyan.opacity(0.15))
                        .frame(width: 58, height: 58)
                        .blur(radius: 10)

                    Image(systemName: "sparkles")
                        .font(.system(size: 24, weight: .semibold))
                        .foregroundStyle(.cyan)
                }

                VStack(alignment: .leading, spacing: 5) {
                    Text(emptyStateCopy.title)
                        .font(.system(.headline, design: .rounded, weight: .semibold))
                        .foregroundStyle(primaryText)

                    Text(emptyStateCopy.subtitle)
                        .font(.system(.subheadline, design: .rounded, weight: .medium))
                        .foregroundStyle(secondaryText)
                        .lineLimit(2)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(20)
        }
    }

    private func toggle(_ task: TaskItem) {
        let previousXP = currentXPFromTasks
        let didComplete = !task.isCompleted
        let rewardXP = task.priority.xpValue
        store.toggle(task)

        guard didComplete else { return }
        playCompletionFeedback()
        synchronizeXPState(previousXP: previousXP, rewardXP: rewardXP)

        withAnimation(.spring(response: 0.42, dampingFraction: 0.72)) {
            completionBurstID = UUID()
        }

        Swift.Task {
            try? await Swift.Task.sleep(for: .milliseconds(980))
            await MainActor.run {
                withAnimation(.easeOut(duration: 0.24)) {
                    completionBurstID = nil
                }
            }
        }
    }

    private func playCompletionFeedback() {
        triggerSuccessHaptic()
        playSystemSound(Self.completionSoundID)
    }

    private func triggerSuccessHaptic() {
#if !targetEnvironment(simulator)
        UINotificationFeedbackGenerator().notificationOccurred(.success)
#endif
    }

    private func playSystemSound(_ soundID: SystemSoundID) {
#if !targetEnvironment(simulator)
        AudioServicesPlaySystemSound(soundID)
#endif
    }

    private func synchronizeXPState(previousXP: Int? = nil, rewardXP: Int? = nil) {
        let resolvedPreviousXP = previousXP ?? todayXP
        let resolvedXP = currentXPFromTasks
        todayXP = resolvedXP
        recordXP = max(recordXP, resolvedXP)
        persistProfileXPState(todayXP: resolvedXP, recordXP: recordXP)

        guard let rewardXP else { return }

        showAchievement(
            AchievementPopupData(
                title: "+\(rewardXP) XP",
                message: "Task complete",
                icon: "sparkles",
                isMajor: false
            )
        )
        triggerXPGlow()

        let reachedTarget = resolvedPreviousXP < dailyTargetXP && resolvedXP >= dailyTargetXP
        guard reachedTarget, lastTargetHitDate != currentDayKey else { return }

        lastTargetHitDate = currentDayKey
        persistProfileXPState(todayXP: resolvedXP, recordXP: recordXP)
        Swift.Task {
            try? await Swift.Task.sleep(for: .milliseconds(720))
            await MainActor.run {
                playSystemSound(1026)
                triggerSuccessHaptic()
                showAchievement(
                    AchievementPopupData(
                        title: "Daily Target Hit",
                        message: "\(resolvedXP) XP collected today",
                        icon: "crown.fill",
                        isMajor: true
                    )
                )
            }
        }
    }

    private func synchronizeReminders() {
        let snapshots = reminderSnapshots
        Task {
            await reminderManager.synchronize(tasks: snapshots)
        }
    }

    private func triggerXPGlow() {
        withAnimation(.easeOut(duration: 0.18)) {
            xpGlowVisible = true
        }

        Swift.Task {
            try? await Swift.Task.sleep(for: .milliseconds(accessibilityReduceMotion ? 420 : 880))
            await MainActor.run {
                withAnimation(.easeOut(duration: accessibilityReduceMotion ? 0.18 : 0.56)) {
                    xpGlowVisible = false
                }
            }
        }
    }

    private func showAchievement(_ data: AchievementPopupData) {
        withAnimation(.spring(response: 0.44, dampingFraction: 0.74)) {
            achievementPopup = data
        }

        Swift.Task {
            try? await Swift.Task.sleep(for: .milliseconds(data.isMajor ? 1900 : 1250))
            await MainActor.run {
                guard achievementPopup?.id == data.id else { return }
                withAnimation(.easeOut(duration: 0.24)) {
                    achievementPopup = nil
                }
            }
        }
    }

    private func resetDailyXPIfNeeded() {
        let key = currentDayKey
        guard xpDateKey != key else { return }
        xpDateKey = key
        lastTargetHitDate = ""
        persistProfileXPState(todayXP: todayXP, recordXP: recordXP)
    }

    private func sectionEmptyState(_ text: String) -> some View {
        GlassCard(cornerRadius: 22) {
            Text(text)
                .font(.system(.subheadline, design: .rounded, weight: .medium))
                .foregroundStyle(secondaryText)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 18)
                .padding(.vertical, 16)
        }
    }

    private var completedSectionHeader: some View {
        Button {
            withAnimation(.spring(response: 0.34, dampingFraction: 0.86)) {
                isCompletedTasksPresented = true
            }
        } label: {
            HStack(spacing: 10) {
                Text("Completed")
                    .font(.system(.title3, design: .rounded, weight: .bold))
                    .foregroundStyle(primaryText)

                Text("\(completedTasks.count)")
                    .font(.system(.caption, design: .rounded, weight: .bold))
                    .foregroundStyle(secondaryText)
                    .padding(.horizontal, 8)
                    .frame(height: 24)
                    .background(.white.opacity(0.10), in: Capsule())

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(secondaryText.opacity(0.72))
            }
            .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
        .accessibilityLabel("Open completed tasks")
    }

    private var completedSummaryButton: some View {
        Button {
            withAnimation(.spring(response: 0.34, dampingFraction: 0.86)) {
                isCompletedTasksPresented = true
            }
        } label: {
            GlassCard(cornerRadius: 24) {
                HStack(spacing: 14) {
                    ZStack {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 22, weight: .semibold))
                            .foregroundStyle(.cyan.opacity(0.82))
                    }
                    .frame(width: 32, height: 32)

                    VStack(alignment: .leading, spacing: 5) {
                        Text("\(completedTasks.count) completed \(completedTasks.count == 1 ? "task" : "tasks")")
                            .font(.system(.headline, design: .rounded, weight: .medium))
                            .foregroundStyle(primaryText)

                        Text("Tap to view or clear finished tasks.")
                            .font(.system(.subheadline, design: .rounded, weight: .regular))
                            .foregroundStyle(secondaryText.opacity(0.84))
                            .lineLimit(2)
                    }

                    Spacer(minLength: 0)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(secondaryText.opacity(0.72))
                }
                .padding(18)
            }
        }
        .buttonStyle(.plain)
    }

    private func editButton(for task: TaskItem) -> some View {
        Button {
            taskToEdit = task
        } label: {
            Label("Edit", systemImage: "pencil")
        }
        .tint(.indigo)
    }

    private func deleteButton(for task: TaskItem) -> some View {
        Button(role: .destructive) {
            taskPendingDeletion = task
        } label: {
            Label("Delete", systemImage: "trash")
        }
        .tint(.purple)
    }

    private var dashboardGreeting: String {
        let hour = Calendar.current.component(.hour, from: .now)
        let baseGreeting = switch hour {
        case 5..<12:
            "Good morning"
        case 12..<18:
            "Good afternoon"
        default:
            "Good evening"
        }

        guard !activeProfileDisplayName.isEmpty else { return baseGreeting }
        return "\(baseGreeting), \(activeProfileDisplayName)"
    }

    private var dashboardStatusText: String {
        if profileTasks.isEmpty {
            return "A calmer space for the next thing that matters."
        }

        if activeTasks.isEmpty {
            return "Everything is done for now."
        }

        if highPriorityActiveCount > 0 {
            return highPriorityActiveCount == 1
                ? "You have one high priority task ready for attention."
                : "You have \(highPriorityActiveCount) high priority tasks ready for attention."
        }

        if remindersLaterTodayCount > 0 {
            return remindersLaterTodayCount == 1
                ? "You have one reminder lined up later today."
                : "You have \(remindersLaterTodayCount) reminders lined up later today."
        }

        return "Let’s make it a productive day."
    }

    private var emptyStateCopy: EmptyStateCopy {
        if profileTasks.isEmpty {
            EmptyStateCopy(
                title: "Your space is clear",
                subtitle: "Capture the next useful thought when it arrives."
            )
        } else if activeTasks.isEmpty {
            EmptyStateCopy(
                title: "Everything is done for now",
                subtitle: "Nothing urgent right now. Your attention can stay quiet."
            )
        } else {
            EmptyStateCopy(
                title: "Nothing urgent right now",
                subtitle: "The active lane is calm and ready for the next signal."
            )
        }
    }

    private var currentDayKey: String {
        Self.dayFormatter.string(from: .now)
    }

    private func compactToolbarButton(
        systemImage: String,
        accessibilityLabel: String,
        action: @escaping () -> Void
    ) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 15, weight: .bold))
                .foregroundStyle(controlText)
                .frame(width: 42, height: 42)
                .background(controlFill, in: Circle())
                .overlay(Circle().stroke(.white.opacity(0.20), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .accessibilityLabel(accessibilityLabel)
    }

    private func scheduledLabel(for date: Date) -> String {
        let calendar = Calendar.current

        if calendar.isDateInToday(date) {
            return "Today, \(date.formatted(date: .omitted, time: .shortened))"
        }

        if calendar.isDateInTomorrow(date) {
            return "Tomorrow, \(date.formatted(date: .omitted, time: .shortened))"
        }

        return date.formatted(date: .abbreviated, time: .shortened)
    }

    private func profileID(for task: TaskItem) -> String {
        LocalProfile.normalizedID(from: task.ownerName ?? "")
    }

    private func persistProfileXPState(todayXP: Int, recordXP: Int) {
        let defaults = UserDefaults.standard
        let profileID = activeProfileID

        var todayXPByProfile = defaults.dictionary(forKey: LiquidTasksRuntime.todayXPKey) as? [String: Int] ?? [:]
        var recordXPByProfile = defaults.dictionary(forKey: LiquidTasksRuntime.recordXPKey) as? [String: Int] ?? [:]
        var xpDateByProfile = defaults.dictionary(forKey: LiquidTasksRuntime.xpDateKey) as? [String: String] ?? [:]
        var lastTargetHitDateByProfile = defaults.dictionary(forKey: LiquidTasksRuntime.lastTargetHitDateKey) as? [String: String] ?? [:]

        todayXPByProfile[profileID] = todayXP
        recordXPByProfile[profileID] = recordXP
        xpDateByProfile[profileID] = xpDateKey
        lastTargetHitDateByProfile[profileID] = lastTargetHitDate

        defaults.set(todayXPByProfile, forKey: LiquidTasksRuntime.todayXPKey)
        defaults.set(recordXPByProfile, forKey: LiquidTasksRuntime.recordXPKey)
        defaults.set(xpDateByProfile, forKey: LiquidTasksRuntime.xpDateKey)
        defaults.set(lastTargetHitDateByProfile, forKey: LiquidTasksRuntime.lastTargetHitDateKey)
    }

    private func loadProfileXPState() {
        let profileID = activeProfileID
        todayXP = LiquidTasksRuntime.todayXP(for: profileID)
        recordXP = LiquidTasksRuntime.recordXP(for: profileID)
        xpDateKey = LiquidTasksRuntime.xpDate(for: profileID)
        lastTargetHitDate = LiquidTasksRuntime.lastTargetHitDate(for: profileID)
    }

    private func processPendingLaunchAction() {
        let action = LiquidTasksLaunchAction(rawValue: pendingLaunchAction) ?? .none
        guard action != .none else { return }

        pendingLaunchAction = LiquidTasksLaunchAction.none.rawValue

        guard action == .addTask else { return }
        isAddingTask = true
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.68) : Color(red: 0.07, green: 0.14, blue: 0.28).opacity(0.78)
    }

    private var greetingText: Color {
        colorScheme == .dark ? .cyan : Color.black.opacity(0.88)
    }

    private var statusText: Color {
        colorScheme == .dark ? secondaryText : Color.black.opacity(0.82)
    }

    private var completedText: Color {
        colorScheme == .dark ? .white.opacity(0.46) : Color(red: 0.10, green: 0.18, blue: 0.32).opacity(0.52)
    }

    private var iconText: Color {
        colorScheme == .dark ? .white.opacity(0.76) : Color(red: 0.08, green: 0.16, blue: 0.32).opacity(0.72)
    }

    private var editIconTint: Color {
        colorScheme == .dark ? .white.opacity(0.78) : Color.black.opacity(0.78)
    }

    private var editButtonFill: Color {
        colorScheme == .dark ? .white.opacity(0.10) : .white.opacity(0.46)
    }

    private var controlText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var controlFill: Color {
        colorScheme == .dark ? .white.opacity(0.15) : .white.opacity(0.42)
    }

    private var textShadow: Color {
        colorScheme == .dark ? .black.opacity(0.22) : .white.opacity(0.28)
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

    private static let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = .current
        formatter.locale = .current
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    private static let completionSoundID: SystemSoundID = 1117

    private func taskRowTransition(forCompletedSection isCompletedSection: Bool) -> AnyTransition {
        let moveEdge: Edge = isCompletedSection ? .bottom : .top
        return .asymmetric(
            insertion: .move(edge: moveEdge).combined(with: .opacity).combined(with: .scale(scale: 0.98)),
            removal: .opacity.combined(with: .scale(scale: 0.98))
        )
    }
}

private struct EmptyStateCopy {
    let title: String
    let subtitle: String
}

private struct DashboardXPSummaryPill: View {
    @Environment(\.colorScheme) private var colorScheme

    let xp: Int
    let level: Int
    let isGlowing: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 10) {
                Image(systemName: "drop.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.cyan, .blue, .purple],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                VStack(alignment: .leading, spacing: 2) {
                    Text("\(xp) XP")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(primaryText)
                        .monospacedDigit()

                    Text("Level \(level)")
                        .font(.system(.caption, design: .rounded, weight: .semibold))
                        .foregroundStyle(secondaryText)
                }
            }
            .padding(.horizontal, 16)
            .frame(height: 58)
            .background(cardFill, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(.white.opacity(0.18), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
        .shadow(color: .cyan.opacity(isGlowing ? 0.20 : 0.08), radius: isGlowing ? 18 : 10, y: 8)
        .shadow(color: .purple.opacity(isGlowing ? 0.18 : 0.06), radius: isGlowing ? 16 : 8, y: 4)
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.72) : Color(red: 0.08, green: 0.15, blue: 0.30).opacity(0.78)
    }

    private var cardFill: some ShapeStyle {
        LinearGradient(
            colors: colorScheme == .dark
                ? [
                    Color(red: 0.11, green: 0.21, blue: 0.42).opacity(0.78),
                    Color(red: 0.20, green: 0.19, blue: 0.46).opacity(0.80)
                ]
                : [
                    Color.white.opacity(0.72),
                    Color(red: 0.85, green: 0.91, blue: 1.00).opacity(0.74)
                ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }
}

private struct NextUpCardView: View {
    @Environment(\.colorScheme) private var colorScheme

    let task: TaskItem?
    let primaryText: Color
    let secondaryText: Color
    let onTap: () -> Void
    let subtitle: String

    var body: some View {
        Button(action: onTap) {
            ZStack {
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: gradientColors,
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )

                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(.white.opacity(0.18), lineWidth: 1)

                HStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 14) {
                        Text("Next up")
                            .font(.system(.subheadline, design: .rounded, weight: .bold))
                            .foregroundStyle(.white.opacity(0.74))

                        HStack(spacing: 12) {
                            Image(systemName: task == nil ? "sparkles" : "calendar")
                                .font(.system(size: 20, weight: .semibold))
                                .foregroundStyle(.white.opacity(0.92))
                                .frame(width: 26)

                            VStack(alignment: .leading, spacing: 6) {
                                Text(task?.title ?? "Nothing scheduled next")
                                    .font(.system(.title3, design: .rounded, weight: .semibold))
                                    .foregroundStyle(.white)
                                    .multilineTextAlignment(.leading)
                                    .lineLimit(2)

                                Text(subtitle)
                                    .font(.system(.subheadline, design: .rounded, weight: .medium))
                                    .foregroundStyle(.white.opacity(0.74))
                                    .lineLimit(1)
                            }
                        }
                    }

                    Spacer(minLength: 0)

                    ZStack {
                        Circle()
                            .fill(
                                LinearGradient(
                                    colors: [.cyan.opacity(0.90), .purple.opacity(0.92)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 60, height: 60)

                        Image(systemName: task == nil ? "plus" : "arrow.right")
                            .font(.system(size: 20, weight: .bold))
                            .foregroundStyle(.white)
                    }
                }
                .padding(22)
            }
        }
        .buttonStyle(.plain)
        .shadow(color: .cyan.opacity(colorScheme == .dark ? 0.12 : 0.06), radius: 24, y: 12)
        .shadow(color: .purple.opacity(colorScheme == .dark ? 0.18 : 0.08), radius: 20, y: 8)
    }

    private var gradientColors: [Color] {
        colorScheme == .dark
            ? [
                Color(red: 0.07, green: 0.25, blue: 0.44),
                Color(red: 0.16, green: 0.22, blue: 0.56),
                Color(red: 0.29, green: 0.18, blue: 0.70)
            ]
            : [
                Color(red: 0.42, green: 0.70, blue: 0.96).opacity(0.82),
                Color(red: 0.42, green: 0.52, blue: 0.94).opacity(0.80),
                Color(red: 0.60, green: 0.44, blue: 0.92).opacity(0.84)
            ]
    }
}

private struct DashboardSectionHeader: View {
    let title: String
    let count: Int
    let primaryText: Color
    let secondaryText: Color
    let showsAddButton: Bool
    let onAdd: (() -> Void)?

    var body: some View {
        HStack(spacing: 10) {
            Text(title)
                .font(.system(.title3, design: .rounded, weight: .bold))
                .foregroundStyle(primaryText)

            Text("\(count)")
                .font(.system(.caption, design: .rounded, weight: .bold))
                .foregroundStyle(secondaryText)
                .padding(.horizontal, 8)
                .frame(height: 24)
                .background(.white.opacity(0.10), in: Capsule())

            Spacer()

            if showsAddButton, let onAdd {
                Button(action: onAdd) {
                    HStack(spacing: 7) {
                        Image(systemName: "plus")
                            .font(.system(size: 13, weight: .bold))

                        Text("Add Task")
                            .font(.system(.subheadline, design: .rounded, weight: .bold))
                    }
                    .foregroundStyle(.white)
                    .padding(.horizontal, 16)
                    .frame(height: 40)
                    .background(
                        LinearGradient(
                            colors: [
                                Color(red: 0.18, green: 0.74, blue: 1.00),
                                Color(red: 0.54, green: 0.32, blue: 0.98)
                            ],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        in: Capsule()
                    )
                    .overlay(
                        Capsule()
                            .stroke(.white.opacity(0.22), lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }
}

private struct DashboardTaskRow: View {
    let task: TaskItem
    let primaryText: Color
    let secondaryText: Color
    let completedText: Color
    let priorityColor: Color
    let trailingIconTint: Color
    let trailingFill: Color
    let scheduledLabel: String
    let onToggle: () -> Void
    let onEdit: () -> Void

    var body: some View {
        Button(action: onToggle) {
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .fill(Color.white.opacity(0.06))

                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .stroke(.white.opacity(0.10), lineWidth: 1)

                RoundedRectangle(cornerRadius: 99, style: .continuous)
                    .fill(priorityAccent)
                    .frame(width: 6)
                    .padding(.vertical, 14)
                    .padding(.leading, 10)

                HStack(spacing: 14) {
                    Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                        .font(.system(size: 26, weight: .semibold))
                        .foregroundStyle(task.isCompleted ? .cyan : priorityColor.opacity(0.96))
                        .frame(width: 42, height: 42)

                    VStack(alignment: .leading, spacing: 8) {
                        Text(task.title)
                            .font(.system(.headline, design: .rounded, weight: .semibold))
                            .foregroundStyle(task.isCompleted ? completedText : primaryText)
                            .strikethrough(task.isCompleted, color: completedText)
                            .multilineTextAlignment(.leading)
                            .lineLimit(2)

                        HStack(spacing: 8) {
                            Image(systemName: "calendar")
                                .font(.system(size: 13, weight: .bold))

                            Text(scheduledLabel)
                                .lineLimit(1)
                        }
                        .font(.system(.subheadline, design: .rounded, weight: .medium))
                        .foregroundStyle(task.isCompleted ? completedText : secondaryText)
                    }

                    Spacer(minLength: 0)

                    Button(action: onEdit) {
                        Image(systemName: task.scheduledAt == nil ? "ellipsis" : "bell")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundStyle(trailingIconTint)
                            .frame(width: 42, height: 42)
                            .background(trailingFill, in: Circle())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.leading, 24)
                .padding(.trailing, 14)
                .padding(.vertical, 18)
            }
        }
        .buttonStyle(.plain)
    }

    private var priorityAccent: some ShapeStyle {
        LinearGradient(
            colors: [priorityColor.opacity(0.96), priorityColor.opacity(0.42)],
            startPoint: .top,
            endPoint: .bottom
        )
    }
}

private struct XPStatusPill: View {
    @Environment(\.colorScheme) private var colorScheme

    let points: Int
    let isGlowing: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 7) {
                Image(systemName: "bolt.fill")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(.cyan)

                Text("\(points) XP")
                    .font(.system(.subheadline, design: .rounded, weight: .bold))
                    .foregroundStyle(controlText)
                    .monospacedDigit()
            }
            .padding(.horizontal, 14)
            .frame(height: 48)
            .background(controlFill, in: Capsule())
            .overlay(Capsule().stroke(.white.opacity(0.24), lineWidth: 1))
            .shadow(color: .cyan.opacity(0.14), radius: 18, y: 8)
            .contentShape(Capsule())
        }
        .buttonStyle(.plain)
        .background(
            ZStack {
                Capsule()
                    .fill(
                        LinearGradient(
                            colors: [.cyan.opacity(0.30), .blue.opacity(0.24), .purple.opacity(0.22)],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .blur(radius: isGlowing ? 22 : 8)
                    .scaleEffect(isGlowing ? 1.18 : 0.94)
                    .opacity(isGlowing ? 0.92 : 0)

                Capsule()
                    .fill(.white.opacity(0.22))
                    .blur(radius: isGlowing ? 12 : 4)
                    .scaleEffect(isGlowing ? 1.08 : 0.96)
                    .opacity(isGlowing ? 0.34 : 0)
            }
            .padding(.horizontal, -8)
            .padding(.vertical, -8)
        )
        .animation(.easeOut(duration: 0.45), value: isGlowing)
        .accessibilityLabel("Daily XP")
        .accessibilityValue("\(points) points")
    }

    private var controlText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var controlFill: Color {
        colorScheme == .dark ? .white.opacity(0.15) : .white.opacity(0.42)
    }
}

private struct XPStatsSheet: View {
    @Environment(\.colorScheme) private var colorScheme

    let todayXP: Int
    let recordXP: Int
    @Binding var targetXP: Int
    let onClose: () -> Void

    private var progress: Double {
        guard targetXP > 0 else { return 0 }
        return min(Double(todayXP) / Double(targetXP), 1)
    }

    private var remainingXP: Int {
        max(targetXP - todayXP, 0)
    }

    private var progressPercent: Int {
        Int((progress * 100).rounded())
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            header
            heroCard
            secondaryStats
            progressPanel
            targetPanel
        }
        .padding(20)
        .frame(maxWidth: 430)
        .background(
            ZStack {
                backgroundGlow

                RoundedRectangle(cornerRadius: 34, style: .continuous)
                    .fill(.ultraThinMaterial)

                LinearGradient(
                    colors: sheetColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .opacity(colorScheme == .dark ? 0.94 : 0.84)
                .clipShape(RoundedRectangle(cornerRadius: 34, style: .continuous))
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 34, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
        .shadow(color: .black.opacity(colorScheme == .dark ? 0.28 : 0.16), radius: 28, y: 16)
        .shadow(color: .purple.opacity(colorScheme == .dark ? 0.14 : 0.08), radius: 18, y: 6)
    }

    private var header: some View {
        HStack(alignment: .top, spacing: 16) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Daily XP")
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(primaryText)

                Text("Low tasks add 2 XP, medium 5, and high priority 8.")
                    .font(.system(.subheadline, design: .rounded, weight: .semibold))
                    .foregroundStyle(secondaryText)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 0)

            Button {
                onClose()
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundStyle(primaryText)
                    .frame(width: 44, height: 44)
                    .background(.white.opacity(colorScheme == .dark ? 0.14 : 0.30), in: Circle())
                    .overlay(Circle().stroke(.white.opacity(0.22), lineWidth: 1))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Close Daily XP")
        }
    }

    private var heroCard: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(.white.opacity(colorScheme == .dark ? 0.10 : 0.26))

            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: heroGradientColors,
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .opacity(colorScheme == .dark ? 0.96 : 0.86)

            RoundedRectangle(cornerRadius: 30, style: .continuous)
                .stroke(.white.opacity(0.22), lineWidth: 1)

            VStack(alignment: .leading, spacing: 18) {
                HStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(.white.opacity(0.16))
                            .frame(width: 64, height: 64)

                        Circle()
                            .fill(.cyan.opacity(0.22))
                            .frame(width: 74, height: 74)
                            .blur(radius: 16)

                        Image(systemName: "bolt.fill")
                            .font(.system(size: 28, weight: .bold))
                            .foregroundStyle(.white)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text("Today")
                            .font(.system(.subheadline, design: .rounded, weight: .bold))
                            .foregroundStyle(.white.opacity(0.78))

                        Text("\(todayXP) XP")
                            .font(.system(size: 36, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .monospacedDigit()
                    }

                    Spacer(minLength: 0)

                    VStack(alignment: .trailing, spacing: 6) {
                        Text(progress >= 1 ? "Target reached" : "\(remainingXP) XP left")
                            .font(.system(.caption, design: .rounded, weight: .bold))
                            .foregroundStyle(.white.opacity(0.76))

                        Text("\(progressPercent)%")
                            .font(.system(.title3, design: .rounded, weight: .bold))
                            .foregroundStyle(.white)
                            .monospacedDigit()
                    }
                }

                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Progress")
                            .font(.system(.caption, design: .rounded, weight: .bold))
                            .foregroundStyle(.white.opacity(0.74))

                        Spacer()

                        Text("\(todayXP) / \(targetXP)")
                            .font(.system(.caption, design: .rounded, weight: .bold))
                            .foregroundStyle(.white.opacity(0.88))
                            .monospacedDigit()
                    }

                    GeometryReader { proxy in
                        ZStack(alignment: .leading) {
                            Capsule()
                                .fill(.white.opacity(0.16))

                            Capsule()
                                .fill(
                                    LinearGradient(
                                        colors: [.cyan, .blue, .purple, .pink],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: max(proxy.size.width * progress, 18))
                                .shadow(color: .cyan.opacity(0.40), radius: 16, y: 6)
                        }
                    }
                    .frame(height: 14)
                }
            }
            .padding(22)
        }
        .frame(minHeight: 186)
        .shadow(color: .purple.opacity(colorScheme == .dark ? 0.24 : 0.14), radius: 22, y: 12)
    }

    private var secondaryStats: some View {
        HStack(spacing: 12) {
            statTile(
                title: "Record",
                value: "\(recordXP)",
                subtitle: "Best day",
                colors: [.blue.opacity(0.82), .indigo.opacity(0.90)],
                icon: "trophy.fill"
            )

            statTile(
                title: "Target",
                value: "\(targetXP)",
                subtitle: "Today",
                colors: [.purple.opacity(0.88), .pink.opacity(0.74)],
                icon: "scope"
            )
        }
    }

    private var progressPanel: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("Momentum")
                    .font(.system(.headline, design: .rounded, weight: .bold))
                    .foregroundStyle(primaryText)

                Spacer()

                Text(progress >= 1 ? "Goal unlocked" : "Keep going")
                    .font(.system(.caption, design: .rounded, weight: .bold))
                    .foregroundStyle(.cyan)
            }

            HStack(spacing: 12) {
                circleBadge(
                    text: "\(progressPercent)",
                    caption: "%"
                )

                VStack(alignment: .leading, spacing: 6) {
                    Text(progress >= 1 ? "You’ve cleared the daily target." : "You’re building a strong day.")
                        .font(.system(.subheadline, design: .rounded, weight: .semibold))
                        .foregroundStyle(primaryText)

                    Text(progress >= 1 ? "Everything past this point is extra lift." : "\(remainingXP) XP to reach the next milestone.")
                        .font(.system(.caption, design: .rounded, weight: .medium))
                        .foregroundStyle(secondaryText)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
        }
        .padding(18)
        .background(panelFill, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
    }

    private var targetPanel: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Daily target")
                .font(.system(.headline, design: .rounded, weight: .bold))
                .foregroundStyle(primaryText)

            HStack(spacing: 14) {
                targetAdjustButton(systemImage: "minus", disabled: targetXP <= 5) {
                    adjustTarget(by: -5)
                }

                VStack(spacing: 4) {
                    Text("\(targetXP) XP")
                        .font(.system(.title2, design: .rounded, weight: .bold))
                        .foregroundStyle(primaryText)
                        .monospacedDigit()

                    Text("Move in 5 XP steps")
                        .font(.system(.caption, design: .rounded, weight: .medium))
                        .foregroundStyle(secondaryText)
                }
                .frame(maxWidth: .infinity)

                targetAdjustButton(systemImage: "plus", disabled: targetXP >= 500) {
                    adjustTarget(by: 5)
                }
            }
        }
        .padding(18)
        .background(panelFill, in: RoundedRectangle(cornerRadius: 26, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 26, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
    }

    private func statTile(title: String, value: String, subtitle: String, colors: [Color], icon: String) -> some View {
        ZStack(alignment: .topLeading) {
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: colors,
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .opacity(colorScheme == .dark ? 0.95 : 0.84)

            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)

            VStack(alignment: .leading, spacing: 10) {
                Image(systemName: icon)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundStyle(.white.opacity(0.92))

                Spacer(minLength: 0)

                Text(value)
                    .font(.system(.title2, design: .rounded, weight: .bold))
                    .foregroundStyle(.white)
                    .monospacedDigit()

                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.system(.caption, design: .rounded, weight: .bold))
                        .foregroundStyle(.white.opacity(0.88))

                    Text(subtitle)
                        .font(.system(.caption2, design: .rounded, weight: .medium))
                        .foregroundStyle(.white.opacity(0.72))
                }
            }
            .padding(16)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 132)
        .shadow(color: colors.first?.opacity(0.22) ?? .clear, radius: 18, y: 10)
    }

    private func circleBadge(text: String, caption: String) -> some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [.cyan.opacity(0.92), .blue.opacity(0.88), .purple.opacity(0.84)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            Circle()
                .stroke(.white.opacity(0.24), lineWidth: 1)

            VStack(spacing: 0) {
                Text(text)
                    .font(.system(.title3, design: .rounded, weight: .bold))
                    .foregroundStyle(.white)
                    .monospacedDigit()

                Text(caption)
                    .font(.system(.caption2, design: .rounded, weight: .bold))
                    .foregroundStyle(.white.opacity(0.78))
            }
        }
        .frame(width: 72, height: 72)
        .shadow(color: .cyan.opacity(0.26), radius: 18, y: 8)
    }

    private func targetAdjustButton(systemImage: String, disabled: Bool, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.system(size: 18, weight: .bold))
                .foregroundStyle(disabled ? secondaryText.opacity(0.6) : primaryText)
                .frame(width: 52, height: 52)
                .background(.white.opacity(colorScheme == .dark ? 0.14 : 0.30), in: Circle())
                .overlay(Circle().stroke(.white.opacity(0.18), lineWidth: 1))
        }
        .buttonStyle(.plain)
        .disabled(disabled)
        .accessibilityLabel(systemImage == "minus" ? "Decrease daily target" : "Increase daily target")
    }

    private func adjustTarget(by amount: Int) {
        targetXP = min(max(targetXP + amount, 5), 500)
    }

    private var backgroundGlow: some View {
        ZStack {
            Circle()
                .fill(.cyan.opacity(colorScheme == .dark ? 0.22 : 0.14))
                .frame(width: 260, height: 260)
                .blur(radius: 34)
                .offset(x: -120, y: -180)

            Circle()
                .fill(.purple.opacity(colorScheme == .dark ? 0.24 : 0.14))
                .frame(width: 320, height: 320)
                .blur(radius: 42)
                .offset(x: 140, y: 220)

            Circle()
                .fill(.pink.opacity(colorScheme == .dark ? 0.14 : 0.08))
                .frame(width: 180, height: 180)
                .blur(radius: 28)
                .offset(x: 120, y: -110)
        }
        .clipShape(RoundedRectangle(cornerRadius: 34, style: .continuous))
    }

    private var heroGradientColors: [Color] {
        [
            Color(red: 0.12, green: 0.72, blue: 0.98),
            Color(red: 0.18, green: 0.42, blue: 1.00),
            Color(red: 0.42, green: 0.28, blue: 0.98),
            Color(red: 0.88, green: 0.36, blue: 0.82)
        ]
    }

    private var panelFill: Color {
        colorScheme == .dark ? .white.opacity(0.10) : .white.opacity(0.34)
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.70) : Color(red: 0.08, green: 0.15, blue: 0.30).opacity(0.82)
    }

    private var sheetColors: [Color] {
        if colorScheme == .dark {
            [
                Color(red: 0.02, green: 0.05, blue: 0.13),
                Color(red: 0.05, green: 0.08, blue: 0.22),
                Color(red: 0.07, green: 0.11, blue: 0.28),
                Color(red: 0.06, green: 0.18, blue: 0.24)
            ]
        } else {
            [
                Color(red: 0.84, green: 0.95, blue: 1.00),
                Color(red: 0.76, green: 0.88, blue: 1.00),
                Color(red: 0.74, green: 0.86, blue: 0.98),
                Color(red: 0.78, green: 0.90, blue: 0.96)
            ]
        }
    }
}

private struct CompletedTasksSheet: View {
    @Environment(\.colorScheme) private var colorScheme

    let tasks: [TaskItem]
    let primaryText: Color
    let secondaryText: Color
    let completedText: Color
    let editIconTint: Color
    let editButtonFill: Color
    let priorityColor: (TaskPriority) -> Color
    let onClose: () -> Void
    let onClear: () -> Void
    let onSelectTask: (TaskItem) -> Void
    let onEditTask: (TaskItem) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .top, spacing: 16) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Completed")
                        .font(.system(.largeTitle, design: .rounded, weight: .bold))
                        .foregroundStyle(primaryText)

                    Text("\(tasks.count) finished \(tasks.count == 1 ? "task" : "tasks")")
                        .font(.system(.subheadline, design: .rounded, weight: .semibold))
                        .foregroundStyle(secondaryText)
                }

                Spacer(minLength: 0)

                Button {
                    onClose()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(primaryText)
                        .frame(width: 44, height: 44)
                        .background(.white.opacity(colorScheme == .dark ? 0.14 : 0.30), in: Circle())
                        .overlay(Circle().stroke(.white.opacity(0.22), lineWidth: 1))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Close completed tasks")
            }

            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(tasks) { task in
                        completedTaskRow(task)
                    }
                }
                .padding(.vertical, 2)
            }
            .frame(maxHeight: 360)

            HStack(spacing: 12) {
                Button {
                    onClear()
                } label: {
                    Text("Clear completed")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(
                            LinearGradient(
                                colors: [.purple, .indigo],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            in: RoundedRectangle(cornerRadius: 20, style: .continuous)
                        )
                }
                .buttonStyle(.plain)

                Button {
                    onClose()
                } label: {
                    Text("Done")
                        .font(.system(.headline, design: .rounded, weight: .bold))
                        .foregroundStyle(primaryText)
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(.white.opacity(colorScheme == .dark ? 0.12 : 0.28), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 20, style: .continuous)
                                .stroke(.white.opacity(0.18), lineWidth: 1)
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(20)
        .frame(maxWidth: 430)
        .background(
            ZStack {
                backgroundGlow

                RoundedRectangle(cornerRadius: 34, style: .continuous)
                    .fill(.ultraThinMaterial)

                LinearGradient(
                    colors: sheetColors,
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .opacity(colorScheme == .dark ? 0.94 : 0.84)
                .clipShape(RoundedRectangle(cornerRadius: 34, style: .continuous))
            }
        )
        .overlay(
            RoundedRectangle(cornerRadius: 34, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
        .shadow(color: .black.opacity(colorScheme == .dark ? 0.28 : 0.16), radius: 28, y: 16)
        .shadow(color: .purple.opacity(colorScheme == .dark ? 0.14 : 0.08), radius: 18, y: 6)
    }

    private func completedTaskRow(_ task: TaskItem) -> some View {
        GlassCard(cornerRadius: 24) {
            HStack(spacing: 14) {
                RoundedRectangle(cornerRadius: 99, style: .continuous)
                    .fill(priorityColor(task.priority))
                    .frame(width: 4)
                    .frame(maxHeight: .infinity)
                    .opacity(0.50)

                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 25, weight: .semibold))
                    .symbolRenderingMode(.hierarchical)
                    .foregroundStyle(.cyan)
                    .frame(width: 42, height: 42)

                VStack(alignment: .leading, spacing: 7) {
                    Text(task.title)
                        .font(.system(.body, design: .rounded, weight: .semibold))
                        .foregroundStyle(completedText)
                        .strikethrough(true, color: completedText)
                        .lineLimit(3)

                    if let notes = task.notes, !notes.isEmpty {
                        Text(notes)
                            .font(.system(.subheadline, design: .rounded, weight: .medium))
                            .foregroundStyle(completedText)
                            .lineLimit(2)
                            .truncationMode(.tail)
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Label(task.createdAt.formatted(date: .abbreviated, time: .shortened), systemImage: "clock")
                            .labelStyle(.titleAndIcon)
                            .lineLimit(1)
                            .minimumScaleFactor(0.88)

                        if let scheduledAt = task.scheduledAt {
                            Label(
                                scheduledAt.formatted(date: .abbreviated, time: .shortened),
                                systemImage: "bell.fill"
                            )
                            .labelStyle(.titleAndIcon)
                            .lineLimit(1)
                            .minimumScaleFactor(0.88)
                        }

                        HStack(spacing: 5) {
                            Circle()
                                .fill(priorityColor(task.priority))
                                .frame(width: 6, height: 6)

                            Text(task.priority.title)
                        }
                    }
                    .font(.system(.caption, design: .rounded, weight: .semibold))
                    .foregroundStyle(completedText)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                Button {
                    onEditTask(task)
                } label: {
                    Image(systemName: "pencil")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(editIconTint)
                        .frame(width: 44, height: 44)
                        .background(editButtonFill, in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Edit completed task")
            }
            .padding(.vertical, 13)
            .padding(.leading, 12)
            .padding(.trailing, 12)
            .frame(minHeight: task.notes?.isEmpty == false ? 102 : 78)
            .contentShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .onTapGesture {
                onSelectTask(task)
            }
        }
        .opacity(0.88)
    }

    private var backgroundGlow: some View {
        ZStack {
            Circle()
                .fill(.cyan.opacity(colorScheme == .dark ? 0.22 : 0.14))
                .frame(width: 260, height: 260)
                .blur(radius: 34)
                .offset(x: -120, y: -180)

            Circle()
                .fill(.purple.opacity(colorScheme == .dark ? 0.24 : 0.14))
                .frame(width: 320, height: 320)
                .blur(radius: 42)
                .offset(x: 140, y: 220)
        }
        .clipShape(RoundedRectangle(cornerRadius: 34, style: .continuous))
    }

    private var sheetColors: [Color] {
        if colorScheme == .dark {
            [
                Color(red: 0.02, green: 0.05, blue: 0.13),
                Color(red: 0.05, green: 0.08, blue: 0.22),
                Color(red: 0.07, green: 0.11, blue: 0.28),
                Color(red: 0.06, green: 0.18, blue: 0.24)
            ]
        } else {
            [
                Color(red: 0.84, green: 0.95, blue: 1.00),
                Color(red: 0.76, green: 0.88, blue: 1.00),
                Color(red: 0.74, green: 0.86, blue: 0.98),
                Color(red: 0.78, green: 0.90, blue: 0.96)
            ]
        }
    }
}

private struct AchievementPopupData: Identifiable, Equatable {
    let id = UUID()
    let title: String
    let message: String
    let icon: String
    let isMajor: Bool
}

private struct AchievementPopupView: View {
    let data: AchievementPopupData

    @State private var animate = false

    var body: some View {
        GlassCard(cornerRadius: data.isMajor ? 34 : 28) {
            HStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill((data.isMajor ? Color.purple : Color.cyan).opacity(animate ? 0.26 : 0.12))
                        .frame(width: data.isMajor ? 78 : 62, height: data.isMajor ? 78 : 62)
                        .blur(radius: animate ? 12 : 5)

                    Image(systemName: data.icon)
                        .font(.system(size: data.isMajor ? 32 : 25, weight: .bold))
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(.white)
                        .shadow(color: .cyan.opacity(0.34), radius: 16, y: 6)
                }

                VStack(alignment: .leading, spacing: 4) {
                    Text(data.title)
                        .font(.system(data.isMajor ? .title2 : .headline, design: .rounded, weight: .bold))
                        .foregroundStyle(.white)

                    Text(data.message)
                        .font(.system(.subheadline, design: .rounded, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.72))
                }

                Spacer(minLength: 0)
            }
            .padding(data.isMajor ? 22 : 18)
        }
        .frame(maxWidth: data.isMajor ? 350 : 300)
        .scaleEffect(animate ? 1 : 0.86)
        .offset(y: animate ? -18 : 8)
        .onAppear {
            withAnimation(.spring(response: 0.46, dampingFraction: 0.68)) {
                animate = true
            }
        }
    }
}

private struct CompletionBurstView: View {
    let id: UUID

    @State private var animate = false

    private let symbols = ["sparkles", "checkmark", "circle.hexagongrid.fill", "diamond.fill", "plus"]

    var body: some View {
        ZStack {
            Circle()
                .stroke(
                    LinearGradient(
                        colors: [.cyan, .blue, .purple],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: animate ? 2 : 12
                )
                .frame(width: animate ? 190 : 58, height: animate ? 190 : 58)
                .opacity(animate ? 0 : 0.95)

            Circle()
                .fill(.cyan.opacity(animate ? 0 : 0.24))
                .frame(width: animate ? 160 : 72, height: animate ? 160 : 72)
                .blur(radius: animate ? 24 : 8)

            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: animate ? 62 : 38, weight: .semibold))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(.white)
                .shadow(color: .cyan.opacity(0.42), radius: 24, y: 8)
                .scaleEffect(animate ? 1.0 : 0.62)

            ForEach(symbols.indices, id: \.self) { index in
                Image(systemName: symbols[index])
                    .font(.system(size: index == 0 ? 18 : 13, weight: .bold))
                    .foregroundStyle(index.isMultiple(of: 2) ? .cyan : .purple)
                    .offset(particleOffset(index))
                    .opacity(animate ? 0 : 1)
                    .scaleEffect(animate ? 1.15 : 0.2)
            }
        }
        .id(id)
        .onAppear {
            withAnimation(.easeOut(duration: 0.92)) {
                animate = true
            }
        }
    }

    private func particleOffset(_ index: Int) -> CGSize {
        guard animate else { return .zero }
        let angle = Double(index) / Double(symbols.count) * .pi * 2
        let distance: CGFloat = index.isMultiple(of: 2) ? 96 : 78
        return CGSize(
            width: cos(angle) * distance,
            height: sin(angle) * distance
        )
    }
}

private struct SpacerView<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        VStack {
            Spacer()
            content
            Spacer()
            Spacer().frame(height: 60)
        }
    }
}

#Preview {
    TaskListView()
        .modelContainer(for: TaskItem.self, inMemory: true)
}
