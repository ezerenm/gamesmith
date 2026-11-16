import EditableText from "./EditableText";
import "../styles/components/scene-view.css";

export default function SceneView({ scene, onUpdate }) {
  if (!scene) {
    return (
      <article className="parchment-panel scene-view">
        <div className="scene-empty">
          <h2>No Scene Yet</h2>
          <p>Generate an opening scene to begin your story.</p>
        </div>
      </article>
    );
  }

  return (
    <article className="parchment-panel scene-view">
      <div className="scene-heading">
        <span className="scene-label">CURRENT SCENE</span>
        <span className="scene-number">SCENE #{scene.id}</span>
      </div>

      <div className="scene-content">
        <h2 className="scene-title">
          {typeof scene.title === "string" && scene.title.trim()
            ? scene.title.trim()
            : `Scene ${scene.id}`}
        </h2>

        <div className="scene-text">
          <EditableText
            value={scene.text}
            multiline
            label="Edit scene narrative"
            onSave={(value) => onUpdate?.(scene.id, { text: value })}
          />
        </div>
      </div>
    </article>
  );
}
