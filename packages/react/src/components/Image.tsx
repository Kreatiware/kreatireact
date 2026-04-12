import React, { forwardRef, useState, useCallback, useRef, useEffect, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import './Image.css';

export interface ImageProps {
  /** Image source URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Width */
  width?: string | number;
  /** Height */
  height?: string | number;
  /** Enable click-to-preview overlay */
  preview?: boolean;
  /** Fallback content when image fails to load */
  fallback?: React.ReactNode;
  /** Lazy loading */
  lazy?: boolean;
  /** Object-fit CSS property */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Border radius — uses Kreati radius tokens */
  rounded?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = 'k-image';

/**
 * Image component with lazy loading, fallback, and preview overlay.
 *
 * @description An enhanced image element with loading states, error
 * fallback, optional click-to-preview lightbox, and lazy loading.
 * Accessible with proper alt text support.
 *
 * @example
 * ```tsx
 * <Image src="/photo.jpg" alt="Photo" preview />
 * <Image src="/avatar.jpg" alt="Avatar" width={64} height={64} rounded />
 * <Image src="/broken.jpg" alt="Missing" fallback={<span>No image</span>} />
 * ```
 */
export const Image = forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src,
      alt,
      width,
      height,
      preview = false,
      fallback,
      lazy = false,
      objectFit,
      rounded = false,
      className = '',
      style,
    },
    ref,
  ) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const [showPreview, setShowPreview] = useState(false);

    const handleLoad = useCallback(() => setStatus('loaded'), []);
    const handleError = useCallback(() => setStatus('error'), []);

    useEffect(() => { setStatus('loading'); }, [src]);

    useEffect(() => {
      if (!showPreview) return;
      const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPreview(false); };
      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [showPreview]);

    const cls = [base, preview && `${base}--preview`, className].filter(Boolean).join(' ');
    const imgStyle: React.CSSProperties = {
      objectFit,
      borderRadius: rounded ? 'var(--kreati-radius-full)' : undefined,
      width: width ?? undefined,
      height: height ?? undefined,
    };

    return (
      <div ref={elRef} className={cls} style={{ ...style, width, height }}>
        {status === 'error' ? (
          <div className={`${base}__fallback`} style={{ borderRadius: rounded ? 'var(--kreati-radius-full)' : undefined }}>
            {fallback ?? alt}
          </div>
        ) : (
          <img
            className={`${base}__img ${base}__img--${status}`}
            src={src}
            alt={alt}
            loading={lazy ? 'lazy' : undefined}
            style={imgStyle}
            onLoad={handleLoad}
            onError={handleError}
            onClick={preview && status === 'loaded' ? () => setShowPreview(true) : undefined}
          />
        )}
        {showPreview &&
          createPortal(
            <div
              className={`${base}__overlay ${base}__overlay--visible`}
              onClick={() => setShowPreview(false)}
              role="dialog"
              aria-label={alt}
            >
              <img src={src} alt={alt} />
            </div>,
            document.body,
          )}
      </div>
    );
  },
);

Image.displayName = 'Image';
