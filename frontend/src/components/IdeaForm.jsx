import { useId, useRef, useState } from "react";

export default function IdeaForm({ onCreate }) {
  const [idea, setIdea] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const submitting = useRef(false);
  const textareaRef = useRef(null);
  const submitButtonRef = useRef(null);
  const [shortcutModifier] = useState(() => {
    const platform = typeof navigator === "undefined"
      ? ""
      : navigator.userAgentData?.platform || navigator.platform || navigator.userAgent;
    return /Mac|iPhone|iPad|iPod/i.test(platform) ? "\u2318" : "Ctrl";
  });
  const fieldId = useId();
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting.current) return;

    if (!idea.trim()) {
      setError("Tell us your game idea before creating a project.");
      textareaRef.current?.focus();
      return;
    }

    if (typeof onCreate !== "function") {
      setError("Project creation is awaiting backend integration. Your draft is preserved here.");
      return;
    }

    submitting.current = true;
    setCreating(true);
    setError("");
    try {
      // Integration boundary: POST /projects with original_idea.
      // The caller navigates only after receiving a real project ID.
      await onCreate({ original_idea: idea });
    } catch {
      setError("We couldn't create your project. Your idea is still here. Please try again.");
    } finally {
      submitting.current = false;
      setCreating(false);
    }
  }

  function handleKeyDown(event) {
    if (
      event.key !== "Enter"
      || !(event.ctrlKey || event.metaKey)
      || event.shiftKey
      || event.altKey
      || event.nativeEvent?.isComposing
    ) return;

    event.preventDefault();
    if (submitting.current || event.repeat) return;

    // Use the same native submitter and onSubmit path as clicking the gold button.
    event.currentTarget.form?.requestSubmit(submitButtonRef.current ?? undefined);
  }

  function selectStarter(text) {
    if (submitting.current) return;
    setIdea(typeof text === "function" ? text() : text);
    setError("");
    textareaRef.current?.focus();
  }

  const surpriseIdeas = [
    "A puzzle adventure where a lighthouse keeper rearranges constellations to guide lost ships through a sea of memories.",
    "A cooperative exploration game where tiny gardeners restore an abandoned city one rooftop ecosystem at a time.",
    "A mystery game where a traveling cartographer discovers that every map they draw changes the town overnight.",
    "A strategy game about running a midnight train that carries dreams between rival sleeping kingdoms."
  ];

  const starters = [
    ["Dark fantasy RPG", "A dark fantasy RPG where every spell costs a memory, and a wandering knight must decide what to forget."],
    ["Sci-fi mystery", "A sci-fi mystery aboard a silent space station where the crew has vanished and every recording tells a different story."],
    ["Co-op survival", "A co-op survival game where a stranded crew builds a floating settlement on an ocean that changes each night."],
    ["Surprise me", () => surpriseIdeas[Math.floor(Math.random() * surpriseIdeas.length)]]
  ];

  return (
    <form className="landing-idea-form" onSubmit={handleSubmit} noValidate aria-busy={creating}>
      <label className="landing-input-label" htmlFor={fieldId}>Your original game idea</label>
      <div className="landing-composer">
        <textarea
          ref={textareaRef}
          id={fieldId}
          name="original_idea"
          rows={4}
          placeholder="Describe your game idea..."
          value={idea}
          onChange={(event) => {
            setIdea(event.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          required
          readOnly={creating}
          aria-invalid={Boolean(error)}
          aria-describedby={`${helpId}${error ? ` ${errorId}` : ""}`}
        />
        <div className="landing-composer-toolbar">
          <span id={helpId} className="landing-keyboard-hint">{shortcutModifier} + Enter to create</span>
          <button
            ref={submitButtonRef}
            type="submit"
            className="landing-create-button"
            disabled={creating}
            aria-label={creating ? "Creating Project" : "Create Project"}
            title="Create Project"
          >
            {creating ? (
              <span className="landing-submit-spinner" aria-hidden="true" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5m-6 6 6-6 6 6" />
              </svg>
            )}
          </button>
        </div>
      </div>
      {error && <p id={errorId} className="landing-form-error" role="alert">{error}</p>}
      <div className="landing-starters" role="group" aria-label="Idea starters">
        {starters.map(([label, text]) => (
          <button key={label} type="button" className="landing-starter" onClick={() => selectStarter(text)} disabled={creating}>
            {label}
          </button>
        ))}
      </div>
      <p className="landing-form-status" role="status">{creating ? "Creating your project. Please wait." : ""}</p>
    </form>
  );
}
