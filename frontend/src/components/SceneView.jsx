export default function SceneView({ scene }) {
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
        <h2 className="scene-title">The Story Continues</h2>
        <p className="scene-text">{scene.text}</p>
      </div>
    </article>
  );
}
