import { useState } from "react";

import TopBar from "../components/TopBar";
import ConceptPanel from "../components/ConceptPanel";
import CharacterList from "../components/CharacterList";
import SceneView from "../components/SceneView";
import ChoiceButtons from "../components/ChoiceButtons";
import SceneHistory from "../components/SceneHistory";

import { mockWorkspace } from "../api/mockData";
import "../styles/workspace.css";

export default function WorkspacePage() {
  const { project, characters, scenes } = mockWorkspace;

  const [currentSceneId, setCurrentSceneId] = useState(
    project.current_scene_id
  );

  // Tracks the furthest scene on the active branch.
  const [activeBranchEndId, setActiveBranchEndId] = useState(
    project.current_scene_id
  );

  const [selectedChoices, setSelectedChoices] = useState({});

  const currentScene = scenes.find(
    (scene) => scene.id === currentSceneId
  );

  // Build history from the active branch's endpoint,
  // not the scene currently being viewed.
  const scenePath = [];

  let scene = scenes.find(
    (scene) => scene.id === activeBranchEndId
  );

  while (scene) {
    scenePath.unshift(scene);

    scene = scenes.find(
      (candidate) => candidate.id === scene.parent_scene_id
    );
  }

  function handleSceneSelect(sceneId) {
    setCurrentSceneId(sceneId);
  }

  function handleChoiceSelect(choiceIndex) {
    setSelectedChoices((previous) => ({
      ...previous,
      [currentSceneId]: choiceIndex
    }));

    const nextScene = scenes.find(
      (scene) =>
        scene.parent_scene_id === currentSceneId &&
        scene.from_choice_index === choiceIndex
    );

    if (nextScene) {
      setCurrentSceneId(nextScene.id);
      setActiveBranchEndId(nextScene.id);
    } else {
      console.log(
        "No mock scene exists for this choice yet.",
        choiceIndex
      );
    }
  }

  const selectedChoice =
    selectedChoices[currentSceneId] ??
    currentScene?.selected_choice ??
    null;

  return (
    <>
      <TopBar project={project} />

      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <ConceptPanel project={project} />
          <CharacterList characters={characters} />
        </aside>

        <main className="workspace-main">
          <SceneHistory
            scenes={scenePath}
            currentSceneId={currentSceneId}
            onSelect={handleSceneSelect}
          />

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
