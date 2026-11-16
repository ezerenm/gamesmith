
import { useState } from "react";

export default function CharacterCard({ character }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="character-card">
      <button
        type="button"
        className="character-card-header"
        onClick={() => setExpanded(!expanded)}
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
          <div className="character-traits">
            {character.traits.map((trait, index) => (
              <span className="trait-tag" key={index}>
                {trait}
              </span>
            ))}
          </div>

          <p className="character-backstory">{character.backstory}</p>
        </div>
      )}
    </article>
  );
}
