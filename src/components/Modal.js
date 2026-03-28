import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./Modal.css";

/**
 * Modal Component — Brand Palette
 *
 * Props:
 *   open              {boolean}   — controls visibility
 *   onClose           {function}  — close handler
 *   title             {string}    — header title
 *   children          {node}      — modal body content
 *   size              {string}    — "sm" | "md" | "lg" | "xl"
 *   centered          {boolean}   — vertically center modal
 *   backdropClosable  {boolean}   — close on backdrop click (default true)
 */
function Modal({
  open,
  onClose,
  title,
  children,
  size = "md",
  centered = false,
  backdropClosable = true,
}) {
  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on ESC key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" && open && onClose) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass =
    size === "sm" ? "modal-sm" :
    size === "lg" ? "modal-lg" :
    size === "xl" ? "modal-xl" : "";

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        className="custom-modal-backdrop"
        onClick={() => backdropClosable && onClose && onClose()}
      />

      {/* Modal */}
      <div
        className="modal d-block"
        tabIndex="-1"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={`modal-dialog ${sizeClass} ${centered ? "modal-dialog-centered" : ""}`}
          role="document"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title" id="modal-title">
                {title}
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              />
            </div>

            {/* Body */}
            <div className="modal-body">
              {children}
            </div>

          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

export default Modal;