import TopBar from "../components/TopBar";
import { mockWorkspace } from "../api/mockData";
import "../styles/workspace.css";

export default function WorkspacePage() {
  const { project, characters, scenes } = mockWorkspace;
  const currentScene = scenes.find(
    (scene) => scene.id === project.current_scene_id
  );

  return (
    <>
      <TopBar project={project} />

      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <h2>Concept</h2>
          <h3>{project.title}</h3>
          <p>{project.premise}</p>

          <h2>Characters</h2>
          {characters.map((character) => (
            <p key={character.id}>{character.name}</p>
          ))}
        </aside>

        <main className="workspace-main">
          <article className="parchment-panel">
            <h2>Current Scene</h2>
            <p>{currentScene?.text || "No scene generated yet."}</p>
          </article>
        </main>
      </div>
    </>
  );
}
