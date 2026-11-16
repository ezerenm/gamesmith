import { useState } from "react";

import TopBar from "../components/TopBar";
import ConceptPanel from "../components/ConceptPanel";
import CharacterList from "../components/CharacterList";
import SceneView from "../components/SceneView";
import SceneHistory from "../components/SceneHistory";
import ChoiceButtons from "../components/ChoiceButtons";
import ConfirmDialog from "../components/ConfirmDialog";

import { mockWorkspace } from "../api/mockData";
import "../styles/layout/workspace.css";


export default function WorkspacePage() {
  // Mock project data
  const [project, setProject] = useState(() => ({
    ...mockWorkspace.project
  }));

  // Mock character data
  const [characters, setCharacters] = useState(() =>
    mockWorkspace.characters.map((character) => ({
      ...character,
      traits: [...character.traits]
    }))
  );

  // Mock scene data
  const [scenes, setScenes] = useState(() =>
    mockWorkspace.scenes.map((scene) => ({
      ...scene,
      choices: scene.choices.map((choice) => ({ ...choice }))
    }))
  );

  // Track which scene the user is viewing
  const [currentSceneId, setCurrentSceneId] = useState(
    mockWorkspace.project.current_scene_id
  );

  // Track mock choice selections
  const [selectedChoices, setSelectedChoices] = useState({});

  // Find the currently displayed scene
  const currentScene = scenes.find(
    (scene) => scene.id === currentSceneId
  );

  // Get the selected choice for the current scene
  const selectedChoice =
    selectedChoices[currentSceneId] ??
    currentScene?.selected_choice ??
    null;

  const [showRegenerateDialog, setShowRegenerateDialog] =
    useState(false);

  function handleRegenerateRequest() {
    setShowRegenerateDialog(true);
  }

  function handleRegenerateConfirm() {
    setShowRegenerateDialog(false);

    // TODO: Connect POST /projects/{id}/concept.
    // Do not overwrite local data until the API succeeds.
    console.log("Concept regeneration confirmed.");
  }

  // Update project information
  function handleProjectUpdate(changes) {
    setProject((previous) => ({
      ...previous,
      ...changes
    }));
  }

  // Update a specific character
  function handleCharacterUpdate(characterId, changes) {
    setCharacters((previous) =>
      previous.map((character) =>
        character.id === characterId
          ? { ...character, ...changes }
          : character
      )
    );
  }

  // Update a specific scene
  function handleSceneUpdate(sceneId, changes) {
    setScenes((previous) =>
      previous.map((scene) =>
        scene.id === sceneId
          ? { ...scene, ...changes }
          : scene
      )
    );
  }

  // Handle narrative choice selection
  function handleChoiceSelect(choiceIndex) {
    setSelectedChoices((previous) => ({
      ...previous,
      [currentSceneId]: choiceIndex
    }));

    console.log("Selected choice:", choiceIndex);
  }

  // Navigate to a previous scene
  function handleSceneSelect(sceneId) {
    setCurrentSceneId(sceneId);

    setProject((previous) => ({
      ...previous,
      current_scene_id: sceneId
    }));
  }

  return (
    <>
      <TopBar project={project} />

      <div className="workspace-layout">
        <aside className="workspace-sidebar">
          <ConceptPanel
            project={project}
            onUpdate={handleProjectUpdate}
            onRegenerate={handleRegenerateRequest}
          />

          <CharacterList
            characters={characters}
            onCharacterUpdate={handleCharacterUpdate}
          />
        </aside>

        <main className="workspace-main">
          <SceneHistory
            scenes={scenes}
            currentSceneId={currentSceneId}
            onSelect={handleSceneSelect}
          />

          <SceneView
            scene={currentScene}
            onUpdate={handleSceneUpdate}
          />

          <ChoiceButtons
            choices={currentScene?.choices ?? []}
            selectedChoice={selectedChoice}
            onSelect={handleChoiceSelect}
          />

          <ConfirmDialog
            open={showRegenerateDialog}
            title="Regenerate this concept?"
            message="Generating a new concept may replace your current title, premise, genre, tone, and setting. Review your existing work before continuing."
            confirmLabel="Regenerate"
            onConfirm={handleRegenerateConfirm}
            onCancel={() => setShowRegenerateDialog(false)}
          />
        </main>
      </div>
    </>
  );
}
