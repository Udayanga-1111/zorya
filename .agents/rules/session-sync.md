---
trigger: always
---

# Session Auto-Synchronization Rule

To maintain persistent memory across workspace sessions for Zorya, you **MUST** execute the following synchronization protocol at the end of every successful task or development session.

---

## 🔄 End-of-Session Sync Workflow

Whenever you complete a task, fix a bug, merge a feature, or wrap up a coding session, perform these 4 updates in order before concluding your response:

### 1. Update `task_plan.md`

- Locate the relevant task item(s) in `task_plan.md`.
- Mark completed items as done by changing `- [ ]` to `- [x]`.
- If new sub-tasks or unforeseen technical blockers were discovered during the session, append them under the appropriate Phase or in the **Blockers & Risk Tracking** section.

### 2. Update `progress.md`

- **Session Log:** Append a new session entry under `## 📅 Session Activity Log` with:
  - Date & Session Number.
  - Key achievements and completed code features.
  - Active blockers or open risks.
- **Commit / Ticket Table:** Update the completion status in the `Ticket Completion Tracker` table.
- **Next Actions:** Update the `Next Actions for Resuming Session` section with clear guidance on what the next session should focus on.

### 3. Update `findings.md` (If Applicable)

- If the session yielded new technical insights (e.g., FastMCP quirks, `pyswisseph` behaviors, Next.js streaming optimizations, or LangGraph state handling discoveries), log a brief summary in `findings.md` under the appropriate header.

### 4. Provide Final User Summary

In your final output message to the user, include a brief **"Memory Sync Summary"** block showing:

- 📌 **Completed:** Items checked off in `task_plan.md`.
- 📝 **Files Updated:** Confirmation that `task_plan.md`, `progress.md`, and/or `findings.md` were saved.
- 🚀 **Next Up:** The recommended next step for the next session.

---

## 🛑 Strict Execution Guardrails

- **DO NOT** skip updating these files if code edits, config changes, or technical decisions were made during the session.
- Keep updates concise and structured using existing Markdown formats in the files.
