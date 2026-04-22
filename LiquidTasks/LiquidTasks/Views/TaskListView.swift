import AudioToolbox
import SwiftData
import SwiftUI
import UIKit

struct TaskListView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.colorScheme) private var colorScheme
    @Query(sort: \TaskItem.createdAt, order: .reverse) private var tasks: [TaskItem]
    @AppStorage("hasStartedLiquidTasks") private var hasStarted = true
    @AppStorage("liquidTasksAppearance") private var appearanceRawValue = AppearanceMode.dark.rawValue
    @AppStorage("liquidTasksXPDate") private var xpDateKey = ""
    @AppStorage("liquidTasksTodayXP") private var todayXP = 0
    @AppStorage("liquidTasksRecordXP") private var recordXP = 0
    @AppStorage("liquidTasksDailyTargetXP") private var dailyTargetXP = 50
    @AppStorage("liquidTasksLastTargetHitDate") private var lastTargetHitDate = ""
    @State private var taskToEdit: TaskItem?
    @State private var isAddingTask = false
    @State private var isXPStatsPresented = false
    @State private var completionBurstID: UUID?
    @State private var achievementPopup: AchievementPopupData?

    private var store: TaskStore {
        TaskStore(context: modelContext)
    }

    private var activeTasks: [TaskItem] {
        tasks.filter { !$0.isCompleted }
    }

    private var completedTasks: [TaskItem] {
        tasks.filter(\.isCompleted)
    }

    private var appearanceBinding: Binding<AppearanceMode> {
        Binding(
            get: { AppearanceMode(rawValue: appearanceRawValue) ?? .dark },
            set: { appearanceRawValue = $0.rawValue }
        )
    }

    var body: some View {
        ZStack {
            LiquidBackground()

            VStack(spacing: 0) {
                header

                Group {
                    if tasks.isEmpty {
                        emptyState
                            .transition(.scale(scale: 0.96).combined(with: .opacity))
                    } else {
                        taskList
                            .transition(.opacity)
                    }
                }
                .animation(.smooth(duration: 0.34), value: tasks.count)
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
        }
        .onAppear {
            resetDailyXPIfNeeded()
        }
        .sheet(isPresented: $isAddingTask) {
            TaskEditorSheet(mode: .add) { title in
                store.addTask(title: title)
            }
        }
        .sheet(item: $taskToEdit) { task in
            TaskEditorSheet(mode: .edit(task.title)) { title in
                store.update(task, title: title)
            }
        }
        .sheet(isPresented: $isXPStatsPresented) {
            XPStatsSheet(todayXP: todayXP, recordXP: recordXP, targetXP: $dailyTargetXP)
        }
    }

    private var header: some View {
        VStack(alignment: .leading, spacing: 18) {
            HStack(alignment: .center, spacing: 12) {
                Button {
                    withAnimation(.smooth(duration: 0.52)) {
                        hasStarted = false
                    }
                } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(controlText)
                        .frame(width: 52, height: 52)
                        .background(controlFill, in: Circle())
                        .overlay(Circle().stroke(.white.opacity(0.24), lineWidth: 1))
                        .contentShape(Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Back to onboarding")

                Spacer()

                XPStatusPill(points: todayXP) {
                    isXPStatsPresented = true
                }

                AppearanceToggle(mode: appearanceBinding)

                Button {
                    isAddingTask = true
                } label: {
                    Image(systemName: "plus")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(.white)
                        .frame(width: 54, height: 54)
                        .background(.white.opacity(0.14), in: Circle())
                        .overlay(Circle().stroke(.white.opacity(0.22), lineWidth: 1))
                        .shadow(color: .cyan.opacity(0.22), radius: 18, y: 8)
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Add task")
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Liquid Tasks")
                    .font(.system(size: 34, weight: .semibold, design: .rounded))
                    .foregroundStyle(primaryText)
                    .shadow(color: textShadow, radius: 12, y: 4)

                Text(summaryText)
                    .font(.system(.subheadline, design: .rounded, weight: .medium))
                    .foregroundStyle(secondaryText)
            }
        }
        .padding(.horizontal, 22)
        .padding(.top, 54)
        .padding(.bottom, 22)
    }

    private var taskList: some View {
        List {
            if !activeTasks.isEmpty {
                Section {
                    ForEach(activeTasks) { task in
                        taskRow(task, isCompletedSection: false)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 7, leading: 18, bottom: 7, trailing: 18))
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                deleteButton(for: task)
                                editButton(for: task)
                            }
                    }
                } header: {
                    sectionHeader("Active", count: activeTasks.count)
                }
            }

            if !completedTasks.isEmpty {
                Section {
                    ForEach(completedTasks) { task in
                        taskRow(task, isCompletedSection: true)
                            .listRowBackground(Color.clear)
                            .listRowSeparator(.hidden)
                            .listRowInsets(EdgeInsets(top: 7, leading: 18, bottom: 7, trailing: 18))
                            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                                deleteButton(for: task)
                                editButton(for: task)
                            }
                    }
                } header: {
                    completedSectionHeader
                }
            }
        }
        .listStyle(.plain)
        .scrollContentBackground(.hidden)
        .contentMargins(.bottom, 28, for: .scrollContent)
        .scrollIndicators(.hidden)
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
                        Text("Clear field")
                            .font(.system(.title2, design: .rounded, weight: .semibold))
                            .foregroundStyle(primaryText)

                        Text("Add one task and let the interface breathe.")
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
        GlassCard(cornerRadius: 26) {
            HStack(spacing: 14) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 25, weight: .semibold))
                    .symbolRenderingMode(.hierarchical)
                    .foregroundStyle(task.isCompleted ? .cyan : iconText)
                    .frame(width: 42, height: 42)

                VStack(alignment: .leading, spacing: 5) {
                    Text(task.title)
                        .font(.system(.body, design: .rounded, weight: .semibold))
                        .foregroundStyle(task.isCompleted ? completedText : primaryText)
                        .strikethrough(task.isCompleted, color: completedText)
                        .lineLimit(3)

                    Label(task.createdAt.formatted(date: .abbreviated, time: .shortened), systemImage: "clock")
                        .font(.system(.caption, design: .rounded, weight: .semibold))
                        .foregroundStyle(task.isCompleted ? completedText : secondaryText)
                        .labelStyle(.titleAndIcon)
                }
                    .frame(maxWidth: .infinity, alignment: .leading)

                Button {
                    taskToEdit = task
                } label: {
                    Image(systemName: "pencil")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(.white.opacity(0.78))
                        .frame(width: 44, height: 44)
                        .background(.white.opacity(0.10), in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Edit task")
            }
            .padding(.vertical, 13)
            .padding(.leading, 16)
            .padding(.trailing, 12)
            .frame(minHeight: 72)
            .contentShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
            .onTapGesture {
                toggle(task)
            }
            .contextMenu {
                Button("Edit", systemImage: "pencil") {
                    taskToEdit = task
                }

                Button("Delete", systemImage: "trash", role: .destructive) {
                    withAnimation(.smooth(duration: 0.28)) {
                        store.delete(task)
                    }
                }
            }
        }
        .opacity(isCompletedSection ? 0.82 : 1)
    }

    private func toggle(_ task: TaskItem) {
        let didComplete = !task.isCompleted
        store.toggle(task)

        guard didComplete else { return }
        playCompletionFeedback()
        awardCompletionXP()

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
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        AudioServicesPlaySystemSound(1025)
    }

    private func awardCompletionXP() {
        resetDailyXPIfNeeded()

        let previousXP = todayXP
        todayXP += 5
        recordXP = max(recordXP, todayXP)

        showAchievement(
            AchievementPopupData(
                title: "+5 XP",
                message: "Task complete",
                icon: "sparkles",
                isMajor: false
            )
        )

        let reachedTarget = previousXP < dailyTargetXP && todayXP >= dailyTargetXP
        guard reachedTarget, lastTargetHitDate != currentDayKey else { return }

        lastTargetHitDate = currentDayKey
        Swift.Task {
            try? await Swift.Task.sleep(for: .milliseconds(720))
            await MainActor.run {
                AudioServicesPlaySystemSound(1026)
                UINotificationFeedbackGenerator().notificationOccurred(.success)
                showAchievement(
                    AchievementPopupData(
                        title: "Daily Target Hit",
                        message: "\(todayXP) XP collected today",
                        icon: "crown.fill",
                        isMajor: true
                    )
                )
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
        todayXP = 0
        lastTargetHitDate = ""
    }

    private func sectionHeader(_ title: String, count: Int) -> some View {
        HStack(spacing: 8) {
            Text(title)
                .font(.system(.subheadline, design: .rounded, weight: .bold))

            Text("\(count)")
                .font(.system(.caption, design: .rounded, weight: .bold))
                .padding(.horizontal, 8)
                .frame(height: 24)
                .background(.white.opacity(0.14), in: Capsule())
        }
        .foregroundStyle(secondaryText)
        .textCase(nil)
        .padding(.top, 4)
        .padding(.bottom, 4)
    }

    private var completedSectionHeader: some View {
        HStack(spacing: 10) {
            sectionHeader("Completed", count: completedTasks.count)

            Spacer()

            Button(role: .destructive) {
                withAnimation(.smooth(duration: 0.30)) {
                    store.deleteCompleted(completedTasks)
                }
            } label: {
                Text("Clear")
                    .font(.system(.caption, design: .rounded, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 12)
                    .frame(height: 32)
                    .background(
                        LinearGradient(
                            colors: [.purple, .indigo],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        in: Capsule()
                    )
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Delete all completed tasks")
        }
        .padding(.trailing, 18)
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
            withAnimation(.smooth(duration: 0.28)) {
                store.delete(task)
            }
        } label: {
            Label("Delete", systemImage: "trash")
        }
        .tint(.purple)
    }

    private var summaryText: String {
        let openCount = activeTasks.count
        return openCount == 1 ? "1 signal waiting" : "\(openCount) signals waiting"
    }

    private var currentDayKey: String {
        Self.dayFormatter.string(from: .now)
    }

    private var primaryText: Color {
        colorScheme == .dark ? .white : Color(red: 0.04, green: 0.10, blue: 0.22)
    }

    private var secondaryText: Color {
        colorScheme == .dark ? .white.opacity(0.68) : Color(red: 0.07, green: 0.14, blue: 0.28).opacity(0.78)
    }

    private var completedText: Color {
        colorScheme == .dark ? .white.opacity(0.46) : Color(red: 0.10, green: 0.18, blue: 0.32).opacity(0.52)
    }

    private var iconText: Color {
        colorScheme == .dark ? .white.opacity(0.76) : Color(red: 0.08, green: 0.16, blue: 0.32).opacity(0.72)
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

    private static let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = .current
        formatter.locale = .current
        formatter.timeZone = .current
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()
}

private struct XPStatusPill: View {
    @Environment(\.colorScheme) private var colorScheme

    let points: Int
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
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme

    let todayXP: Int
    let recordXP: Int
    @Binding var targetXP: Int

    private var progress: Double {
        guard targetXP > 0 else { return 0 }
        return min(Double(todayXP) / Double(targetXP), 1)
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
                    .fill(.white.opacity(0.26))
                    .frame(width: 42, height: 5)
                    .padding(.top, 10)

                VStack(alignment: .leading, spacing: 18) {
                    HStack {
                        VStack(alignment: .leading, spacing: 5) {
                            Text("Daily XP")
                                .font(.system(.largeTitle, design: .rounded, weight: .semibold))
                                .foregroundStyle(primaryText)

                            Text("Every completed task adds 5 XP.")
                                .font(.system(.subheadline, design: .rounded, weight: .semibold))
                                .foregroundStyle(secondaryText)
                        }

                        Spacer()

                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "xmark")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundStyle(primaryText)
                                .frame(width: 44, height: 44)
                                .background(.white.opacity(0.16), in: Circle())
                        }
                        .buttonStyle(.plain)
                    }

                    VStack(spacing: 12) {
                        HStack(spacing: 12) {
                            statTile(title: "Today", value: "\(todayXP)")
                            statTile(title: "Record", value: "\(recordXP)")
                            statTile(title: "Target", value: "\(targetXP)")
                        }

                        ProgressView(value: progress)
                            .tint(.cyan)
                            .scaleEffect(y: 1.4)
                            .padding(.vertical, 8)

                        Stepper(value: $targetXP, in: 5...500, step: 5) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text("Daily target")
                                    .font(.system(.headline, design: .rounded, weight: .semibold))
                                    .foregroundStyle(primaryText)

                                Text("\(max(targetXP - todayXP, 0)) XP left today")
                                    .font(.system(.caption, design: .rounded, weight: .semibold))
                                    .foregroundStyle(secondaryText)
                            }
                        }
                        .padding(16)
                        .background(.white.opacity(colorScheme == .dark ? 0.12 : 0.24), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                    }
                }
                .padding(.horizontal, 22)

                Spacer()
            }
        }
        .presentationDetents([.height(390)])
        .presentationDragIndicator(.hidden)
        .presentationCornerRadius(34)
    }

    private func statTile(title: String, value: String) -> some View {
        VStack(spacing: 5) {
            Text(value)
                .font(.system(.title3, design: .rounded, weight: .bold))
                .foregroundStyle(primaryText)
                .monospacedDigit()

            Text(title)
                .font(.system(.caption, design: .rounded, weight: .bold))
                .foregroundStyle(secondaryText)
        }
        .frame(maxWidth: .infinity)
        .frame(height: 76)
        .background(.white.opacity(colorScheme == .dark ? 0.12 : 0.25), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(.white.opacity(0.18), lineWidth: 1)
        )
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
