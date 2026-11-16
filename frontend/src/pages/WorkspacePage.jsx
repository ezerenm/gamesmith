import { useState } from "react";

import TopBar from "../components/TopBar";
import ConceptPanel from "../components/ConceptPanel";
import CharacterList from "../components/CharacterList";
import SceneView from "../components/SceneView";
import ChoiceButtons from "../components/ChoiceButtons";

import { mockWorkspace } from "../api/mockData";
import "../styles/workspace.css";

export default function WorkspacePage() {
  const { project, characters, scenes } = mockWorkspace;

  const currentScene = scenes.find(
    (scene) => scene.id === project.current_scene_id
  );

  const [selectedChoice, setSelectedChoice] = useState(
    currentScene?.selected_choice ?? null
  );

  function handleChoiceSelect(choiceIndex) {
    setSelectedChoice(choiceIndex);
    console.log("Selected choice:", choiceIndex);
  }

  return (
    <>
      <TopBar project={project} />

      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <ConceptPanel project={project} />
          <CharacterList characters={characters} />
        </aside>

        <main className="workspace-main">
          <SceneView scene={currentScene} />

          <ChoiceButtons
            choices={currentScene?.choices ?? []}
            selectedChoice={selectedChoice}
            onSelect={handleChoiceSelect}
          />
        </main>
      </div>
    </>
  );
}
