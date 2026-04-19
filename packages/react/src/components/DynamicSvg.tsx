import React, {
  useEffect,
  useState,
  useId,
  useMemo,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import "./DynamicSvg.css";

/** SVG presentational attributes that can be applied to elements */
export interface SvgElementStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number | string;
  opacity?: number | string;
  fillOpacity?: number | string;
  strokeOpacity?: number | string;
  strokeLinecap?: "butt" | "round" | "square";
  strokeLinejoin?: "miter" | "round" | "bevel";
  strokeDasharray?: string;
  strokeDashoffset?: string | number;
  transform?: string;
  display?: string;
  visibility?: "visible" | "hidden" | "collapse";
}

/** Animation definition for SVG elements */
export interface SvgAnimation {
  /** CSS keyframes as object — e.g. { '0%': { opacity: 0 }, '100%': { opacity: 1 } } */
  keyframes?: Record<string, React.CSSProperties>;
  /** Shorthand: CSS transition property — e.g. 'fill 0.3s ease' */
  transition?: string;
  /** Animation duration — e.g. '2s', '500ms' */
  duration?: string;
  /** Animation timing function — e.g. 'ease-in-out', 'linear' */
  easing?: string;
  /** Animation iteration count — e.g. 'infinite', '3' */
  iterations?: string | number;
  /** Animation direction — e.g. 'alternate' */
  direction?: "normal" | "reverse" | "alternate" | "alternate-reverse";
  /** Animation delay */
  delay?: string;
}

/** Event listeners for SVG elements */
export interface SvgElementListeners {
  onClick?: (e: Event) => void;
  onMouseEnter?: (e: Event) => void;
  onMouseLeave?: (e: Event) => void;
  onMouseMove?: (e: Event) => void;
  onMouseDown?: (e: Event) => void;
  onMouseUp?: (e: Event) => void;
}

/** Override config for a specific element targeted by id or class */
export interface SvgElementOverride extends SvgElementStyle {
  /** CSS class name to add to the element */
  className?: string;
  /** Animation config */
  animation?: SvgAnimation;
  /** DOM event listeners attached to the targeted element(s) */
  listeners?: SvgElementListeners;
  /** Cursor style — e.g. 'pointer' */
  cursor?: string;
}

export interface DynamicSvgProps {
  /** Local asset path (imported by bundler) */
  src?: string;
  /** External URL to fetch SVG from */
  url?: string;
  /** SVG width */
  width?: number | string;
  /** SVG height */
  height?: number | string;
  /** Additional CSS class for the root SVG */
  className?: string;
  /** Inline style for the root SVG */
  style?: React.CSSProperties;
  /** Global fill applied to all elements without specific override */
  fill?: string;
  /** Global stroke applied to all elements without specific override */
  stroke?: string;
  /** Global stroke width */
  strokeWidth?: number | string;
  /** Global opacity */
  opacity?: number | string;
  /**
   * Per-element overrides keyed by id or .className
   *
   * - `"myId"` targets element with id="myId"
   * - `".myClass"` targets elements with class="myClass"
   *
   * @example
   * ```tsx
   * overrides={{
   *   hull: {
   *     fill: '#095172',
   *     strokeWidth: 2,
   *     cursor: 'pointer',
   *     listeners: {
   *       onClick: (e) => console.log('hull clicked', e),
   *       onMouseEnter: (e) => console.log('hull hover'),
   *     },
   *   },
   *   '.accent': { fill: '#ffdb4f', opacity: 0.8 },
   * }}
   * ```
   */
  overrides?: Record<string, SvgElementOverride>;
  /** Accessible title for the SVG */
  title?: string;
  /** aria-label */
  ariaLabel?: string;
  /** Called when SVG is loaded and parsed */
  onLoad?: () => void;
  /** Called on fetch/parse error */
  onError?: (error: Error) => void;
  /** Click handler on the entire SVG wrapper */
  onClick?: (e: React.MouseEvent) => void;
  /** Mouse enter handler on the entire SVG wrapper */
  onMouseEnter?: (e: React.MouseEvent) => void;
  /** Mouse leave handler on the entire SVG wrapper */
  onMouseLeave?: (e: React.MouseEvent) => void;
  /** Mouse move handler on the entire SVG wrapper */
  onMouseMove?: (e: React.MouseEvent) => void;
}

/** Attributes that map directly from override keys to SVG attributes */
const STYLE_ATTR_MAP: Record<string, string> = {
  fill: "fill",
  stroke: "stroke",
  strokeWidth: "stroke-width",
  opacity: "opacity",
  fillOpacity: "fill-opacity",
  strokeOpacity: "stroke-opacity",
  strokeLinecap: "stroke-linecap",
  strokeLinejoin: "stroke-linejoin",
  strokeDasharray: "stroke-dasharray",
  strokeDashoffset: "stroke-dashoffset",
  transform: "transform",
  display: "display",
  visibility: "visibility",
};

const RESERVED_KEYS = new Set([
  "className",
  "animation",
  "listeners",
  "cursor",
]);

/** Listener key to DOM event name */
const LISTENER_MAP: Record<string, string> = {
  onClick: "click",
  onMouseEnter: "mouseenter",
  onMouseLeave: "mouseleave",
  onMouseMove: "mousemove",
  onMouseDown: "mousedown",
  onMouseUp: "mouseup",
};

/**
 * Apply style overrides to a single SVG element
 */
function applyStylesToElement(el: Element, styles: SvgElementOverride) {
  for (const [key, value] of Object.entries(styles)) {
    if (RESERVED_KEYS.has(key) || value === undefined) continue;
    const attr = STYLE_ATTR_MAP[key];
    if (attr) {
      el.setAttribute(attr, String(value));
    }
  }
  if (styles.className) {
    const existing = el.getAttribute("class") || "";
    el.setAttribute("class", `${existing} ${styles.className}`.trim());
  }
  if (styles.cursor) {
    (el as HTMLElement).style.cursor = styles.cursor;
  }
}

/**
 * Apply global styles to all graphical elements that don't have a specific override
 */
function applyGlobalStyles(
  svg: SVGSVGElement,
  globals: SvgElementStyle,
  overriddenIds: Set<string>,
  overriddenClasses: Set<string>
) {
  const graphicalTags = [
    "path",
    "circle",
    "ellipse",
    "rect",
    "line",
    "polyline",
    "polygon",
    "text",
    "g",
  ];
  const elements = svg.querySelectorAll(graphicalTags.join(","));

  elements.forEach(el => {
    const id = el.getAttribute("id");
    if (id && overriddenIds.has(id)) return;

    const classes = el.getAttribute("class")?.split(/\s+/) || [];
    if (classes.some(c => overriddenClasses.has(c))) return;

    for (const [key, value] of Object.entries(globals)) {
      if (value === undefined) continue;
      const attr = STYLE_ATTR_MAP[key];
      if (attr) {
        el.setAttribute(attr, String(value));
      }
    }
  });
}

/**
 * Generate CSS keyframes string from animation config
 */
function buildAnimationCSS(
  instanceId: string,
  overrides: Record<string, SvgElementOverride>
): string {
  const rules: string[] = [];
  let keyframeIndex = 0;

  for (const [selector, config] of Object.entries(overrides)) {
    if (!config.animation) continue;
    const { animation } = config;

    const isClass = selector.startsWith(".");
    const cssSelector = isClass
      ? `.kreati-dsvg--${instanceId} .${selector.slice(1)}`
      : `.kreati-dsvg--${instanceId} [id="${selector}"]`;

    if (animation.keyframes) {
      const animName = `kreati-dsvg-${instanceId}-${keyframeIndex++}`;
      const keyframeEntries = Object.entries(animation.keyframes)
        .map(([step, props]) => {
          const cssProps = Object.entries(props)
            .map(
              ([p, v]) => `${p.replace(/([A-Z])/g, "-$1").toLowerCase()}: ${v}`
            )
            .join("; ");
          return `  ${step} { ${cssProps} }`;
        })
        .join("\n");

      rules.push(`@keyframes ${animName} {\n${keyframeEntries}\n}`);

      const duration = animation.duration || "1s";
      const easing = animation.easing || "ease";
      const iterations = animation.iterations ?? "infinite";
      const direction = animation.direction || "normal";
      const delay = animation.delay || "0s";

      rules.push(
        `${cssSelector} { animation: ${animName} ${duration} ${easing} ${delay} ${iterations} ${direction}; }`
      );
    }

    if (animation.transition) {
      rules.push(`${cssSelector} { transition: ${animation.transition}; }`);
    }
  }

  return rules.join("\n");
}

/**
 * DynamicSvg — Loads an SVG and allows dynamic styling and event handling of its internal elements
 *
 * @description Fetches an SVG from a local asset (src) or external URL (url),
 * parses it, and renders it inline with support for per-element style overrides
 * and event listeners targeted by id or class, global style defaults, CSS
 * animations, and full accessibility support.
 *
 * @example
 * ```tsx
 * import boatSvg from './assets/boat.svg';
 *
 * <DynamicSvg
 *   src={boatSvg}
 *   width={400}
 *   fill="#333"
 *   onClick={(e) => console.log('SVG clicked')}
 *   overrides={{
 *     hull: {
 *       fill: '#095172',
 *       cursor: 'pointer',
 *       listeners: {
 *         onClick: () => console.log('hull clicked!'),
 *         onMouseEnter: () => console.log('hull hover'),
 *       },
 *     },
 *     '.accent': { fill: '#ffdb4f', opacity: 0.8 },
 *     sail: {
 *       fill: '#0f78a5',
 *       animation: {
 *         keyframes: { '0%': { opacity: 0.5 }, '100%': { opacity: 1 } },
 *         duration: '2s',
 *         iterations: 'infinite',
 *         direction: 'alternate',
 *       },
 *     },
 *   }}
 * />
 * ```
 */
export const DynamicSvg = forwardRef<HTMLSpanElement, DynamicSvgProps>(
  (
    {
      src,
      url,
      width,
      height,
      className = "",
      style,
      fill,
      stroke,
      strokeWidth,
      opacity,
      overrides = {},
      title: svgTitle,
      ariaLabel,
      onLoad,
      onError,
      onClick,
      onMouseEnter,
      onMouseLeave,
      onMouseMove,
    },
    ref
  ) => {
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLSpanElement>(null);
    useImperativeHandle(ref, () => wrapperRef.current as HTMLSpanElement);
    const cleanupRef = useRef<(() => void) | null>(null);
    const reactId = useId();
    const instanceId = reactId.replace(/:/g, "");

    // Fetch SVG content
    useEffect(() => {
      const source = src || url;
      if (!source) return;

      setLoading(true);
      setError(null);

      fetch(source)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load SVG: ${res.status}`);
          return res.text();
        })
        .then(text => {
          setSvgContent(text);
          onLoad?.();
        })
        .catch(err => {
          const e = err instanceof Error ? err : new Error(String(err));
          setError(e);
          onError?.(e);
        })
        .finally(() => setLoading(false));
    }, [src, url]);

    // Process SVG HTML and animation CSS
    const processed = useMemo(() => {
      if (!svgContent) return null;

      const parser = new DOMParser();
      const doc = parser.parseFromString(svgContent, "image/svg+xml");
      const svg = doc.querySelector("svg");

      if (!svg) return null;

      const overriddenIds = new Set<string>();
      const overriddenClasses = new Set<string>();

      // Apply per-element style overrides (not listeners — those go in the effect)
      for (const [selector, config] of Object.entries(overrides)) {
        if (selector.startsWith(".")) {
          const cls = selector.slice(1);
          overriddenClasses.add(cls);
          const elements = svg.querySelectorAll(`.${cls}`);
          elements.forEach(el => applyStylesToElement(el, config));
        } else {
          overriddenIds.add(selector);
          const el = svg.querySelector(`[id="${selector}"]`);
          if (el) applyStylesToElement(el, config);
        }
      }

      // Apply global styles
      const globals: SvgElementStyle = {};
      if (fill) globals.fill = fill;
      if (stroke) globals.stroke = stroke;
      if (strokeWidth) globals.strokeWidth = strokeWidth;
      if (opacity) globals.opacity = opacity;

      if (Object.keys(globals).length > 0) {
        applyGlobalStyles(svg, globals, overriddenIds, overriddenClasses);
      }

      // Root SVG attributes
      if (width) svg.setAttribute("width", String(width));
      if (height) svg.setAttribute("height", String(height));

      const existingClass = svg.getAttribute("class") || "";
      svg.setAttribute(
        "class",
        `kreati-dsvg kreati-dsvg--${instanceId} ${existingClass} ${className}`.trim()
      );

      // Accessibility
      if (svgTitle) {
        let titleEl = svg.querySelector("title") as SVGTitleElement | null;
        if (!titleEl) {
          titleEl = doc.createElementNS(
            "http://www.w3.org/2000/svg",
            "title"
          ) as SVGTitleElement;
          svg.prepend(titleEl);
        }
        titleEl.textContent = svgTitle;
        svg.setAttribute("role", "img");
      }
      if (ariaLabel) {
        svg.setAttribute("aria-label", ariaLabel);
        svg.setAttribute("role", "img");
      }
      if (!svgTitle && !ariaLabel) {
        svg.setAttribute("aria-hidden", "true");
      }

      const animCSS = buildAnimationCSS(instanceId, overrides);

      return {
        html: svg.outerHTML,
        animCSS,
      };
    }, [
      svgContent,
      overrides,
      fill,
      stroke,
      strokeWidth,
      opacity,
      width,
      height,
      className,
      instanceId,
      svgTitle,
      ariaLabel,
    ]);

    // Attach per-element listeners after DOM is rendered
    const attachListeners = useCallback(() => {
      // Cleanup previous listeners
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const removers: (() => void)[] = [];

      for (const [selector, config] of Object.entries(overrides)) {
        if (!config.listeners) continue;

        const isClass = selector.startsWith(".");
        const elements = isClass
          ? wrapper.querySelectorAll(`.${selector.slice(1)}`)
          : wrapper.querySelectorAll(`[id="${selector}"]`);

        elements.forEach(el => {
          for (const [listenerKey, handler] of Object.entries(
            config.listeners!
          )) {
            const eventName = LISTENER_MAP[listenerKey];
            if (!eventName || !handler) continue;
            el.addEventListener(eventName, handler);
            removers.push(() => el.removeEventListener(eventName, handler));
          }
        });
      }

      cleanupRef.current = () => removers.forEach(fn => fn());
    }, [overrides]);

    // Inject HTML and attach listeners when processed changes
    useEffect(() => {
      const wrapper = wrapperRef.current;
      if (!wrapper || !processed) return;

      wrapper.innerHTML = processed.html;
      attachListeners();

      return () => {
        if (cleanupRef.current) {
          cleanupRef.current();
          cleanupRef.current = null;
        }
      };
    }, [processed, attachListeners]);

    if (loading) {
      return <span className="kreati-dsvg-loading" />;
    }

    if (error) {
      return <span className="kreati-dsvg-error" title={error.message} />;
    }

    if (!processed) return null;

    return (
      <>
        {processed.animCSS && <style>{processed.animCSS}</style>}
        <span
          ref={wrapperRef}
          className="kreati-dsvg-wrapper"
          style={style}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onMouseMove={onMouseMove}
        />
      </>
    );
  }
);

DynamicSvg.displayName = "DynamicSvg";
