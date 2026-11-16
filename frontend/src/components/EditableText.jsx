import { useState } from "react";

import "../styles/components/editable-text.css";

export default function EditableText({
  value = "",
  onSave,
  multiline = false,
  placeholder = "Enter text...",
  label = "Edit text",
  disabled = false,
  onEditingChange,
  displayValue
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");

  function changeEditing(next) {
    setEditing(next);
    onEditingChange?.(next);
  }

  function handleEdit() {
    setDraft(value ?? "");
    changeEditing(true);
  }

  function handleCancel() {
    setDraft(value ?? "");
    changeEditing(false);
  }

  function handleSave() {
    const nextValue = draft.trim();

    if (!nextValue) return;

    onSave?.(nextValue);
    changeEditing(false);
  }

  if (!editing) {
    return (
      <div className="editable-text">
        <div className="editable-display">
          <span>{displayValue ?? (value || placeholder)}</span>

          <button
            type="button"
            className="edit-button"
            onClick={handleEdit}
            disabled={disabled}
            aria-label={label}
          >
            Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editable-text">
      {multiline ? (
        <textarea
          className="editable-input"
          aria-label={label}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          autoFocus
        />
      ) : (
        <input
          className="editable-input"
          aria-label={label}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoFocus
        />
      )}

      <div className="editable-actions">
        <button
          type="button"
          className="editable-save"
          onClick={handleSave}
          disabled={!draft.trim()}
        >
          Save
        </button>

        <button
          type="button"
          className="editable-cancel"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
