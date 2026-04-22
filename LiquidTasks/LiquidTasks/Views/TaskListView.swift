import SwiftData
import SwiftUI

struct TaskListView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \TaskItem.createdAt, order: .reverse) private var tasks: [TaskItem]
    @State private var taskToEdit: TaskItem?
    @State private var isAddingTask = false

    private var store: TaskStore {
        TaskStore(context: modelContext)
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
    }

    private var header: some View {
        HStack(alignment: .center) {
            VStack(alignment: .leading, spacing: 6) {
                Text("Liquid Tasks")
                    .font(.system(size: 34, weight: .semibold, design: .rounded))
                    .foregroundStyle(.white)

                Text(summaryText)
                    .font(.system(.subheadline, design: .rounded, weight: .medium))
                    .foregroundStyle(.white.opacity(0.64))
            }

            Spacer()

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
        }
        .padding(.horizontal, 22)
        .padding(.top, 62)
        .padding(.bottom, 22)
    }

    private var taskList: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                ForEach(tasks) { task in
                    taskRow(task)
                        .transition(.asymmetric(
                            insertion: .scale(scale: 0.94).combined(with: .opacity),
                            removal: .scale(scale: 0.90).combined(with: .opacity)
                        ))
                }
            }
            .padding(.horizontal, 18)
            .padding(.bottom, 34)
        }
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
                    }

                    VStack(spacing: 8) {
                        Text("Clear field")
                            .font(.system(.title2, design: .rounded, weight: .semibold))
                            .foregroundStyle(.white)

                        Text("Add one task and let the interface breathe.")
                            .font(.system(.body, design: .rounded, weight: .medium))
                            .foregroundStyle(.white.opacity(0.66))
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(28)
            }
            .padding(.horizontal, 24)
        }
    }

    private func taskRow(_ task: TaskItem) -> some View {
        GlassCard(cornerRadius: 26) {
            HStack(spacing: 14) {
                Image(systemName: task.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 25, weight: .semibold))
                    .symbolRenderingMode(.hierarchical)
                    .foregroundStyle(task.isCompleted ? .cyan : .white.opacity(0.72))
                    .frame(width: 34, height: 34)

                Text(task.title)
                    .font(.system(.body, design: .rounded, weight: .semibold))
                    .foregroundStyle(task.isCompleted ? .white.opacity(0.45) : .white)
                    .strikethrough(task.isCompleted, color: .white.opacity(0.45))
                    .lineLimit(3)
                    .frame(maxWidth: .infinity, alignment: .leading)

                Button {
                    taskToEdit = task
                } label: {
                    Image(systemName: "pencil")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundStyle(.white.opacity(0.78))
                        .frame(width: 38, height: 38)
                        .background(.white.opacity(0.10), in: Circle())
                }
                .buttonStyle(.plain)
            }
            .padding(.vertical, 14)
            .padding(.leading, 16)
            .padding(.trailing, 12)
            .contentShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
            .onTapGesture {
                store.toggle(task)
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
    }

    private var summaryText: String {
        let openCount = tasks.filter { !$0.isCompleted }.count
        return openCount == 1 ? "1 signal waiting" : "\(openCount) signals waiting"
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
