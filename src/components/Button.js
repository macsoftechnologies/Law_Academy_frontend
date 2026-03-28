import React from "react";
import "./Button.css";

/**
 * Button Component — Brand Palette
 *
 * variants : primary | secondary | gold | outline | outline-gold | outline-danger | success | danger
 * sizes    : small | medium | large
 *
 * Usage examples:
 *   <Button text="+ Add Admin"  variant="primary"   size="medium" onClick={...} />
 *   <Button text="Edit"         variant="gold"      icon={<FaEdit />} />
 *   <Button text="Delete"       variant="secondary" icon={<FaTrash />} />
 *   <Button text="Cancel"       variant="outline"   onClick={...} />
 *   <Button text="Save"         variant="success"   fullWidth />
 *   <Button text="Submitting…"  variant="primary"   disabled />
 */

function Button({
  text,
  children,
  onClick,
  variant = "primary",
  size = "medium",
  rounded = false,
  fullWidth = false,
  disabled = false,
  icon = null,
  iconPosition = "left",
  type = "button",
  className = "",
  style = {},
}) {
  const sizeClass = {
    small:  "btn-sm",
    medium: "btn-md",
    large:  "btn-lg",
  }[size] || "btn-md";

  const variantClass = `btn-${variant}`;

  const classes = [
    "btn",
    variantClass,
    sizeClass,
    rounded   ? "btn-rounded" : "",
    fullWidth ? "btn-full"    : "",
    disabled  ? "disabled"    : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={classes}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={style}
    >
      {icon && iconPosition === "left" && (
        <span className="btn-icon">{icon}</span>
      )}

      {text || children}

      {icon && iconPosition === "right" && (
        <span className="btn-icon">{icon}</span>
      )}
    </button>
  );
}

export default Button;