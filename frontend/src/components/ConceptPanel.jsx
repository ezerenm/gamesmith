import WorkspaceState from "./WorkspaceState";
import EditableText from "./EditableText";
import "../styles/components/concept-panel.css";

export default function ConceptPanel({
  project,
  onUpdate,
  onRegenerate,
  onGenerate,
  regenerationBlocked = false,
  generationNotice = ""
}) {
  if (!project) return null;

  // A project name can exist before AI has generated any structured content.
  const hasConcept = [project.premise, project.genre, project.tone, project.setting]
    .some((value) => typeof value === "string" && value.trim().length > 0);
  const hasOriginalIdea = typeof project.original_idea === "string"
    && project.original_idea.trim().length > 0;
  const actionDisabled = !hasOriginalIdea || (hasConcept && regenerationBlocked);
  const actionHelp = hasConcept && regenerationBlocked
    ? "Regeneration is unavailable because this project already has characters or scenes. You can still edit your concept."
    : !hasOriginalIdea
      ? "An original game idea is required before generating a concept."
      : "AI concept generation is not connected yet. Your project will remain unchanged.";

  return (
    <section className="concept-panel">
      <div className="concept-original-idea">
        <span className="detail-label">Original game idea</span>
        <p>{hasOriginalIdea ? project.original_idea : "No original game idea saved."}</p>
      </div>

      <div className="panel-heading">
        <span className="panel-label">YOUR CONCEPT</span>
      </div>

      {hasConcept ? (
        <>
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

        </>
      ) : (
        <WorkspaceState
          title="Bring your idea into focus"
          description="Expand your original game idea with AI into a concept you can review and edit."
        />
      )}

      <div className="concept-regenerate">
        {typeof (hasConcept ? onRegenerate : onGenerate) === "function" && (
          <button
            type="button"
            className="concept-regenerate-button"
            onClick={hasConcept ? onRegenerate : onGenerate}
            disabled={actionDisabled}
            aria-describedby="concept-action-help"
          >
            {hasConcept ? "Regenerate Concept" : "Generate Concept"}
          </button>
        )}
        <p id="concept-action-help" className="concept-action-help">{actionHelp}</p>
        <p className="concept-action-help" role="status">{generationNotice}</p>
      </div>
    </section>
  );
}
