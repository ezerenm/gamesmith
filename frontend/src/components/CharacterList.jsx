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
        <p className="character-empty">
          No characters generated yet.
        </p>
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
