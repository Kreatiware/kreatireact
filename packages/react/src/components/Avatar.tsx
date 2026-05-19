import React, { useState, useRef, useImperativeHandle } from "react";
import { USER_PATH } from "./iconPaths";
import "./Avatar.css";

/** Avatar shape */
export type AvatarShape = "circle" | "square";

export interface AvatarProps {
  /** Image URL */
  image?: string;
  /** Alt text for the image */
  alt?: string;
  /** Label text (initials) — shown when no image */
  label?: string;
  /** Icon element — shown when no image or label */
  icon?: React.ReactNode;
  /** Size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Shape */
  shape?: AvatarShape;
  /** Severity color for the background (when no image) */
  severity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Avatar component for user or entity representation.
 *
 * @description Displays a user avatar as an image, initials label, or icon.
 * Falls back gracefully: image > label > icon > default placeholder.
 * Supports 5 sizes, circle/square shapes, and severity background colors.
 *
 * @example
 * ```tsx
 * <Avatar image="/photo.jpg" alt="User" />
 * <Avatar label="JD" severity="primary" />
 * <Avatar shape="square" size="lg" />
 * ```
 */
export const Avatar = ({
  image,
  alt,
  label,
  icon,
  size = "md",
  shape = "circle",
  severity,
  className = "",
  style,
  ref,
}: AvatarProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const elRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => elRef.current as HTMLDivElement);
  const [imgError, setImgError] = useState(false);

  const base = "k-avatar";
  const showImage = image && !imgError;

  const classes = [
    base,
    `${base}--${size}`,
    `${base}--${shape}`,
    !showImage && severity && `${base}--${severity}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={elRef}
      className={classes}
      style={style}
      role="img"
      aria-label={alt || label || "Avatar"}
    >
      {showImage ? (
        <img
          className={`${base}__image`}
          src={image}
          alt={alt || ""}
          onError={() => setImgError(true)}
        />
      ) : label ? (
        <span className={`${base}__label`}>{label}</span>
      ) : icon ? (
        <span className={`${base}__icon`}>{icon}</span>
      ) : (
        <svg
          className={`${base}__placeholder`}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d={USER_PATH} />
        </svg>
      )}
    </div>
  );
};
