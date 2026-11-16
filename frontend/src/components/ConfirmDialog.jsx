import { useEffect, useRef } from "react";
import "../styles/components/confirm-dialog.css";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  function handleClose() {
    onCancel?.();
  }

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      onClose={handleClose}
    >
      <div className="confirm-dialog-content">
        <span className="confirm-dialog-eyebrow">
          CONFIRM ACTION
        </span>

        <h2>{title}</h2>
        <p>{message}</p>

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-dialog-cancel"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className="confirm-dialog-confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
