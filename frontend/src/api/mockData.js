
export const mockProject = {
  id: 1,
  original_idea: "A poor boy dreams of becoming the king of pirates.",
  title: "Crown of the Endless Sea",
  premise: "A young pirate sets out to conquer the seas and uncover a legendary treasure.",
  genre: "Action Adventure",
  tone: "Hopeful, Swashbuckling",
  setting: "A scattered archipelago ruled by rival pirate lords.",
  current_scene_id: 1,
  created_at: "2026-11-16T10:30:00Z",
  updated_at: "2026-11-16T10:30:00Z"
};

export const mockCharacters = [
  {
    id: 1,
    project_id: 1,
    name: "Kael Vance",
    role: "First Mate",
    traits: ["Loyal", "Hot-tempered", "Superstitious"],
    backstory: "A former sailor who abandoned his crew after a mysterious betrayal."
  },
  {
    id: 2,
    project_id: 1,
    name: "Mira Solis",
    role: "Navigator",
    traits: ["Intelligent", "Curious", "Brave"],
    backstory: "A talented navigator searching for a legendary lost island."
  },
  {
    id: 3,
    project_id: 1,
    name: "Darius Blackwell",
    role: "Rival Captain",
    traits: ["Ambitious", "Ruthless", "Cunning"],
    backstory: "A feared pirate captain determined to rule the seas."
  }
];

export const mockScenes = [
  {
    id: 1,
    project_id: 1,
    parent_scene_id: null,
    from_choice_index: null,
    text: "The harbor bell rings twice. Kael grabs your sleeve as a mysterious ship approaches the docks.",
    choices: [
      { index: 0, text: "Board the mysterious ship." },
      { index: 1, text: "Follow the stranger into the alley." }
    ],
    selected_choice: null,
    created_at: "2026-11-16T10:42:00Z"
  }
];

export const mockWorkspace = {
  project: mockProject,
  characters: mockCharacters,
  scenes: mockScenes
};
