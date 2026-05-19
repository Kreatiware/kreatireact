import React, {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  useId,
} from "react";
import { TIMES_PATH, UPLOAD_PATH } from "./iconPaths";
import { FieldWrapper } from "./FieldWrapper";
import { useKreatiLocale } from "../locale";
import "./FileUpload.css";

export interface FileUploadProps {
  /** Accepted file types (e.g. "image/*,.pdf") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Max file size in bytes */
  maxFileSize?: number;
  /** Max number of files */
  maxFiles?: number;
  /** Fires when files are added */
  onSelect?: (files: File[]) => void;
  /** Fires when a file is removed */
  onRemove?: (file: File) => void;
  /** Fires when files are cleared */
  onClear?: () => void;
  /** Fires on blur */
  onBlur?: (e: React.FocusEvent) => void;
  /** Custom dropzone content */
  dropzoneTemplate?: (props: { isDragging: boolean }) => React.ReactNode;
  /** Custom file item render */
  fileTemplate?: (file: File, onRemove: () => void) => React.ReactNode;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: React.ReactNode;
  /** Error state */
  error?: React.ReactNode | boolean;
  /** Success state */
  success?: boolean;
  /** Helper text severity color */
  helperSeverity?:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "help"
    | "danger"
    | "accent";
  /** Component size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Required indicator */
  required?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** HTML name for form submission */
  name?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = "k-file-upload";

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

/**
 * FileUpload component with drag-and-drop support.
 *
 * @description A dropzone for file selection via click or drag-and-drop.
 * Supports file type filtering, size limits, multiple files, custom
 * templates, and FieldWrapper integration. All user-facing text comes
 * from the locale system. Compatible with Formik and React Hook Form
 * via name, onBlur, and ref.
 *
 * @example
 * ```tsx
 * <FileUpload label="Documents" accept="image/*,.pdf" multiple
 *   maxFileSize={5242880} onSelect={(files) => console.log(files)} />
 * ```
 */
export const FileUpload = ({
  accept,
  multiple = false,
  maxFileSize,
  maxFiles,
  onSelect,
  onRemove: onRemoveProp,
  onClear,
  onBlur,
  dropzoneTemplate,
  fileTemplate,
  label,
  helperText,
  error,
  success,
  helperSeverity,
  size,
  required,
  disabled = false,
  fullWidth = false,
  name,
  className = "",
  style,
  ref,
}: FileUploadProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const elRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => elRef.current as HTMLDivElement);
  const locale = useKreatiLocale();
  const uid = useId();
  const dropzoneId = `${uid}-dropzone`;

  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: File[]) => {
      let valid = incoming;
      if (maxFileSize) valid = valid.filter(f => f.size <= maxFileSize);
      if (maxFiles) valid = valid.slice(0, maxFiles - files.length);
      if (!multiple) valid = valid.slice(0, 1);
      const next = multiple ? [...files, ...valid] : valid;
      setFiles(next);
      onSelect?.(next);
    },
    [files, multiple, maxFileSize, maxFiles, onSelect]
  );

  const removeFile = useCallback(
    (index: number) => {
      const removed = files[index];
      const next = files.filter((_, i) => i !== index);
      setFiles(next);
      onRemoveProp?.(removed);
      if (next.length === 0) onClear?.();
    },
    [files, onRemoveProp, onClear]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      addFiles(Array.from(e.dataTransfer.files));
    },
    [disabled, addFiles]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) addFiles(Array.from(e.target.files));
      e.target.value = "";
    },
    [addFiles]
  );

  const hasError = !!error;
  const errorMessage = typeof error === "boolean" ? undefined : error;

  const dropCls = [
    `${base}__dropzone`,
    dragging && `${base}__dropzone--dragging`,
    hasError && `${base}__dropzone--error`,
    !hasError && success && `${base}__dropzone--success`,
  ]
    .filter(Boolean)
    .join(" ");

  const dropzone = (
    <div
      id={dropzoneId}
      className={dropCls}
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={e => {
        e.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onBlur={onBlur}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={label ?? locale.fileUpload.clickToUpload}
      aria-disabled={disabled || undefined}
      aria-required={required || undefined}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
    >
      {dropzoneTemplate ? (
        dropzoneTemplate({ isDragging: dragging })
      ) : (
        <>
          <span className={`${base}__icon`} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d={UPLOAD_PATH} />
            </svg>
          </span>
          <span className={`${base}__text`}>
            <strong>{locale.fileUpload.clickToUpload}</strong>{" "}
            {locale.fileUpload.dragAndDrop}
          </span>
          {accept && <span className={`${base}__hint`}>{accept}</span>}
          {maxFileSize && (
            <span className={`${base}__hint`}>
              {locale.fileUpload.maxSize} {formatSize(maxFileSize)}
            </span>
          )}
        </>
      )}
    </div>
  );

  const fileList =
    files.length > 0 ? (
      <div className={`${base}__list`} role="list">
        {files.map((file, i) =>
          fileTemplate ? (
            <React.Fragment key={`${file.name}-${i}`}>
              {fileTemplate(file, () => removeFile(i))}
            </React.Fragment>
          ) : (
            <div
              key={`${file.name}-${i}`}
              className={`${base}__file`}
              role="listitem"
            >
              <span className={`${base}__file-name`}>{file.name}</span>
              <span className={`${base}__file-size`}>
                {formatSize(file.size)}
              </span>
              <button
                type="button"
                className={`${base}__file-remove`}
                onClick={() => removeFile(i)}
                aria-label={`${locale.fileUpload.removeFile} ${file.name}`}
              >
                <svg
                  width={14}
                  height={14}
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={TIMES_PATH} />
                </svg>
              </button>
            </div>
          )
        )}
      </div>
    ) : null;

  const content = (
    <>
      {dropzone}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        style={{ display: "none" }}
        name={name}
        aria-hidden="true"
        tabIndex={-1}
      />
      {fileList}
    </>
  );

  const wrapperCls = [base, disabled && `${base}--disabled`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={elRef} className={wrapperCls} style={style}>
      <FieldWrapper
        label={label}
        htmlFor={dropzoneId}
        required={required}
        helperText={helperText}
        error={errorMessage}
        success={success}
        helperSeverity={helperSeverity}
        size={size}
        disabled={disabled}
        fullWidth={fullWidth}
      >
        {content}
      </FieldWrapper>
    </div>
  );
};
