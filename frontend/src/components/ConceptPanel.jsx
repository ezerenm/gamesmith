
export default function ConceptPanel({ project }) {
  if (!project) return null;

  return (
    <section className="concept-panel">
      <div className="panel-heading">
        <span className="panel-label">YOUR CONCEPT</span>
      </div>

      <h2 className="concept-title">
        {project.title || "Untitled Project"}
      </h2>

      <p className="concept-premise">
        {project.premise || "Generate a concept to get started."}
      </p>

      <div className="concept-details">
        <div className="concept-detail">
          <span className="detail-label">Genre</span>
          <span className="detail-value">{project.genre || "—"}</span>
        </div>

        <div className="concept-detail">
          <span className="detail-label">Tone</span>
          <span className="detail-value">{project.tone || "—"}</span>
        </div>

        <div className="concept-detail">
          <span className="detail-label">Setting</span>
          <span className="detail-value">{project.setting || "—"}</span>
        </div>
      </div>
    </section>
  );
}
