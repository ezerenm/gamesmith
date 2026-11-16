import "../styles/components/scene-history.css";

export default function SceneHistory({
  scenes = [],
  currentSceneId,
  onSelect
}) {
  if (scenes.length === 0) return null;

  return (
    <nav className="scene-history" aria-label="Scene history">
      <span className="history-label">STORY HISTORY</span>

      <div className="history-list">
        {scenes.map((scene, index) => (
          <button
            key={scene.id}
            type="button"
            aria-label={`Go to scene ${scene.id}`}
            className={`history-item ${
              scene.id === currentSceneId ? "active" : ""
            }`}
            onClick={() => onSelect?.(scene.id)}
            aria-current={
              scene.id === currentSceneId ? "step" : undefined
            }
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </nav>
  );
}
