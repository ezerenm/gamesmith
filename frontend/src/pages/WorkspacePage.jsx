import { useState } from "react";

import TopBar from "../components/TopBar";
import ConceptPanel from "../components/ConceptPanel";
import CharacterList from "../components/CharacterList";
import SceneView from "../components/SceneView";
import SceneHistory from "../components/SceneHistory";
import ChoiceButtons from "../components/ChoiceButtons";
import ConfirmDialog from "../components/ConfirmDialog";
import WorkspaceState from "../components/WorkspaceState";

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

  const [generationNotice, setGenerationNotice] = useState("");
  const regenerationBlocked = characters.length > 0 || scenes.length > 0;
  const hasOriginalIdea = typeof project.original_idea === "string"
    && project.original_idea.trim().length > 0;

  function handleGenerateRequest() {
    if (!hasOriginalIdea) return;

    // Future integration: POST /projects/{id}/concept uses the saved original_idea.
    // Only a successful API response should update the generated concept fields.
    setGenerationNotice("Concept generation is not connected yet. Your project has not been changed.");
  }

  function handleRegenerateRequest() {
    if (regenerationBlocked || !hasOriginalIdea) return;
    setGenerationNotice("");
    setShowRegenerateDialog(true);
  }

  function handleRegenerateConfirm() {
    setShowRegenerateDialog(false);
    if (regenerationBlocked || !hasOriginalIdea) return;
    handleGenerateRequest();
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
            onGenerate={handleGenerateRequest}
            regenerationBlocked={regenerationBlocked}
            generationNotice={generationNotice}
          />

          <CharacterList
            characters={characters}
            onCharacterUpdate={handleCharacterUpdate}
          />
        </aside>

        <main className="workspace-main">
          {scenes.length === 0 ? (
            <WorkspaceState
              title="Your Story Awaits"
              description="Your game world is ready for its first chapter. Generate an opening scene to begin shaping the narrative."
            />
          ) : (
            <>
              <SceneHistory
                scenes={scenes}
                currentSceneId={currentSceneId}
                onSelect={handleSceneSelect}
              />

              {currentScene ? (
                <>
                  <SceneView
                    scene={currentScene}
                    onUpdate={handleSceneUpdate}
                  />

                  <ChoiceButtons
                    choices={currentScene.choices ?? []}
                    selectedChoice={selectedChoice}
                    onSelect={handleChoiceSelect}
                  />
                </>
              ) : (
                <WorkspaceState
                  title="Scene unavailable"
                  description="This scene could not be found. Select a scene from Story History to continue."
                />
              )}
            </>
          )}

          <ConfirmDialog
            open={showRegenerateDialog}
            title="Regenerate your concept?"
            message="GameSmith will create a new interpretation of your original game idea. Your current generated concept may be replaced, including any manual edits."
            confirmLabel="Regenerate"
            onConfirm={handleRegenerateConfirm}
            onCancel={() => setShowRegenerateDialog(false)}
          />
        </main>
      </div>
    </>
  );
}
