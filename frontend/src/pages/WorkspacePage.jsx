
import TopBar from "../components/TopBar";
import ConceptPanel from "../components/ConceptPanel";
import { mockWorkspace } from "../api/mockData";
import "../styles/workspace.css";
import CharacterList from "../components/CharacterList";

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
          <ConceptPanel project={project} />

          <CharacterList characters={characters} />
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
