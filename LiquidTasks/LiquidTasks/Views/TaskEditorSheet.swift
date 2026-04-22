import SwiftUI

struct TaskEditorSheet: View {
    enum Mode {
        case add
        case edit(String)

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
            case .edit(let title): title
            }
        }
    }

    @Environment(\.dismiss) private var dismiss
    @FocusState private var isFocused: Bool
    @State private var title: String

    let mode: Mode
    let onCommit: (String) -> Void

    init(mode: Mode, onCommit: @escaping (String) -> Void) {
        self.mode = mode
        self.onCommit = onCommit
        _title = State(initialValue: mode.initialText)
    }

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.02, green: 0.05, blue: 0.13),
                    Color(red: 0.05, green: 0.08, blue: 0.22),
                    Color(red: 0.02, green: 0.16, blue: 0.20)
                ],
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
                        .foregroundStyle(.white)

                    TextField("Name the task", text: $title, axis: .vertical)
                        .font(.system(.title3, design: .rounded, weight: .semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1...4)
                        .padding(18)
                        .background(.white.opacity(0.12), in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 22, style: .continuous)
                                .stroke(.white.opacity(0.22), lineWidth: 1)
                        )
                        .focused($isFocused)

                    Button {
                        onCommit(title)
                        dismiss()
                    } label: {
                        Text(mode.actionTitle)
                            .font(.system(.headline, design: .rounded, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .frame(height: 56)
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
        .presentationDetents([.height(330)])
        .presentationDragIndicator(.hidden)
        .presentationCornerRadius(34)
        .onAppear {
            isFocused = true
        }
    }
}

#Preview {
    TaskEditorSheet(mode: .add) { _ in }
}
