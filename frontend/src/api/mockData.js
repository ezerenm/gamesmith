export const mockWorkspace = {
  project: {
    id: 1,
    original_idea: "A young pirate sets out to conquer the seas and uncover a legendary treasure.",
    title: "Crown of the Endless Sea",
    premise: "A young pirate sets out to conquer the seas and uncover a legendary treasure.",
    genre: "Action Adventure",
    tone: "Hopeful, Swashbuckling",
    setting: "A scattered archipelago ruled by rival pirate lords.",
    current_scene_id: 4,
    created_at: "2026-11-16T08:00:00",
    updated_at: "2026-11-16T09:00:00"
  },

  characters: [
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
  ],

  scenes: [
    {
      id: 1,
      project_id: 1,
      parent_scene_id: null,
      from_choice_index: null,
      text: "The harbor bell rings twice. Kael grabs your sleeve as a mysterious ship approaches the docks. Its black sails ripple against the evening sky, and a strange symbol glows beneath its bow.",
      choices: [
        { index: 0, text: "Board the mysterious ship." },
        { index: 1, text: "Follow the stranger into the alley." }
      ],
      selected_choice: 0
    },
    {
      id: 2,
      project_id: 1,
      parent_scene_id: 1,
      from_choice_index: 0,
      text: "You and Kael climb aboard the silent vessel. The deck is deserted, but a lantern flickers inside the captain's quarters. A weathered map lies beneath a dagger on the captain's desk.",
      choices: [
        { index: 0, text: "Examine the mysterious map." },
        { index: 1, text: "Search the lower deck." }
      ],
      selected_choice: 0
    },
    {
      id: 3,
      project_id: 1,
      parent_scene_id: 2,
      from_choice_index: 0,
      text: "Mira studies the map and recognizes an island erased from every official chart. As she traces its coastline, the ink begins to glow. A distant voice whispers a warning about the Crown of the Endless Sea.",
      choices: [
        { index: 0, text: "Sail toward the hidden island." },
        { index: 1, text: "Investigate the warning first." }
      ],
      selected_choice: 0
    },
    {
      id: 4,
      project_id: 1,
      parent_scene_id: 3,
      from_choice_index: 0,
      text: "After three days at sea, the crew reaches an island concealed by thick fog. Ancient stone towers rise above the treeline, and a ruined lighthouse burns with an unnatural blue flame. Kael insists someone is watching from the shore.",
      choices: [
        { index: 0, text: "Explore the ruined lighthouse." },
        { index: 1, text: "Enter the forest and investigate the watcher." }
      ],
      selected_choice: null
    },
    {
      id: 5,
      project_id: 1,
      parent_scene_id: 1,
      from_choice_index: 1,
      text: "You follow the stranger through narrow streets until the harbor disappears behind you. He reveals a stolen chart bearing the same symbol as the black-sailed ship and warns that Captain Blackwell is already hunting its secrets.",
      choices: [
        { index: 0, text: "Trust the stranger and study the chart." },
        { index: 1, text: "Confront him about Captain Blackwell." }
      ],
      selected_choice: null
    }
  ]
};
