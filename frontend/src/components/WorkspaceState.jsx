import "../styles/components/workspace-state.css";

// Reuse with operation-specific copy when project loading or generation is integrated.
// Keep existing content mounted beside this status while a real request is pending.
export default function WorkspaceState({
  title,
  description,
  actionLabel,
  onAction,
  loading = false
}) {
  return (
    <section className="workspace-state" aria-busy={loading}>
      <div role={loading ? "status" : undefined} aria-atomic={loading ? true : undefined}>
        {loading && <span className="workspace-state-spinner" aria-hidden="true" />}
        <h2 className="workspace-state-title">{title}</h2>
        <p className="workspace-state-description">{description}</p>
      </div>
      {actionLabel && typeof onAction === "function" && (
        <button
          type="button"
          className="workspace-state-action"
          onClick={onAction}
          disabled={loading}
        >
          {actionLabel}
        </button>
      )}
    </section>
  );
}
