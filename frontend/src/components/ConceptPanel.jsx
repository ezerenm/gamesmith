import EditableText from "./EditableText";
import "../styles/components/concept-panel.css";

export default function ConceptPanel({
  project,
  onUpdate,
  onRegenerate
}) {
  if (!project) return null;

  return (
    <section className="concept-panel">
      <div className="panel-heading">
        <span className="panel-label">YOUR CONCEPT</span>
      </div>

      <div className="concept-title" role="heading" aria-level={2}>
        <EditableText value={project.title} placeholder="Untitled Project" label="Edit project title" onSave={(value) => onUpdate?.({ title: value })} />
      </div>

      <div className="concept-premise">
        <EditableText value={project.premise} multiline placeholder="Generate a concept to get started." label="Edit project premise" onSave={(value) => onUpdate?.({ premise: value })} />
      </div>

      <div className="concept-details">
        <div className="concept-detail">
          <span className="detail-label">Genre</span>
          <div className="detail-value"><EditableText value={project.genre} label="Edit project genre" onSave={(value) => onUpdate?.({ genre: value })} /></div>
        </div>

        <div className="concept-detail">
          <span className="detail-label">Tone</span>
          <div className="detail-value"><EditableText value={project.tone} label="Edit project tone" onSave={(value) => onUpdate?.({ tone: value })} /></div>
        </div>

        <div className="concept-detail">
          <span className="detail-label">Setting</span>
          <div className="detail-value"><EditableText value={project.setting} label="Edit project setting" onSave={(value) => onUpdate?.({ setting: value })} /></div>
        </div>
      </div>

      {onRegenerate && (
        <div className="concept-regenerate">
          <button
            type="button"
            className="concept-regenerate-button"
            onClick={onRegenerate}
          >
            Regenerate Concept
          </button>
        </div>
      )}
    </section>
  );
}
