import { useState } from "react";
import EditableText from "./EditableText";
import "../styles/components/characters.css";

export default function CharacterCard({ character, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [activeField, setActiveField] = useState(null);

  function editingProps(field) {
    return {
      disabled: activeField !== null && activeField !== field,
      onEditingChange: (editing) => setActiveField(editing ? field : null)
    };
  }

  function updateField(field, value) {
    onUpdate?.(character.id, { [field]: value });
  }

  function updateTraits(value) {
    const traits = value
      .split(",")
      .map((trait) => trait.trim())
      .filter(Boolean);

    onUpdate?.(character.id, { traits });
  }

  return (
    <article className="character-card">
      <button
        type="button"
        className="character-card-header"
        onClick={() => {
          setExpanded(!expanded);
          setActiveField(null);
        }}
        aria-expanded={expanded}
      >
        <div className="character-info">
          <span className="character-name">{character.name}</span>
          <span className="character-role">{character.role}</span>
        </div>

        <span className="character-toggle">
          {expanded ? "−" : "+"}
        </span>
      </button>

      {expanded && (
        <div className="character-details">
          <div className="character-edit-field">
            <span className="detail-label">NAME</span>
            <EditableText
              {...editingProps("name")}
              value={character.name}
              label="Edit character name"
              onSave={(value) => updateField("name", value)}
            />
          </div>

          <div className="character-edit-field">
            <span className="detail-label">ROLE</span>
            <EditableText
              {...editingProps("role")}
              value={character.role}
              label="Edit character role"
              onSave={(value) => updateField("role", value)}
            />
          </div>

          <div className="character-edit-field">
            <span className="detail-label">TRAITS</span>
            <EditableText
              {...editingProps("traits")}
              value={character.traits.join(", ")}
              displayValue={
                <span className="character-traits">
                  {character.traits.map((trait, index) => (
                    <span className="trait-tag" key={index}>{trait}</span>
                  ))}
                </span>
              }
              label="Edit character traits"
              onSave={updateTraits}
            />
          </div>

          <div className="character-edit-field">
            <span className="detail-label">BACKSTORY</span>
            <EditableText
              {...editingProps("backstory")}
              value={character.backstory}
              multiline
              label="Edit character backstory"
              onSave={(value) => updateField("backstory", value)}
            />
          </div>
        </div>
      )}
    </article>
  );
}
