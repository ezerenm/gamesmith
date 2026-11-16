import "../styles/components/choice-buttons.css";

export default function ChoiceButtons({
  choices = [],
  selectedChoice = null,
  onSelect,
  loading = false
}) {
  if (choices.length === 0) return null;

  return (
    <section className="choice-section">
      <h3 className="choice-heading">WHAT HAPPENS NEXT?</h3>

      <div className="choice-list">
        {choices.map((choice) => (
          <button
            key={choice.index}
            type="button"
            className={`choice-button ${
              selectedChoice === choice.index ? "selected" : ""
            }`}
            onClick={() => onSelect?.(choice.index)}
            disabled={loading}
            aria-pressed={selectedChoice === choice.index}
          >
            <span className="choice-index">
              {String(choice.index + 1).padStart(2, "0")}
            </span>

            <span className="choice-text">{choice.text}</span>

            <span className="choice-arrow">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}
