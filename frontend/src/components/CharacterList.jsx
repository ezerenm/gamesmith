import WorkspaceState from "./WorkspaceState";
import CharacterCard from "./CharacterCard";
import "../styles/components/characters.css";

export default function CharacterList({
  characters = [],
  onCharacterUpdate
}) {
  return (
    <section className="character-list">
      <div className="character-list-heading">
        <span className="panel-label">CHARACTERS</span>
        <span className="character-count">{characters.length}</span>
      </div>

      {characters.length === 0 ? (
        <WorkspaceState
          title="No characters yet"
          description="Generate characters to begin populating your game world."
        />
      ) : (
        <div className="character-cards">
          {characters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onUpdate={onCharacterUpdate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
