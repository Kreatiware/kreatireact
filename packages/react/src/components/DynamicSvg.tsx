import React, {
  useEffect,
  useState,
  useId,
  useMemo,
  useRef,
  useCallback,
  useImperativeHandle,
} from "react";
import "./DynamicSvg.css";
import { sanitizeUrl } from "./sanitizeUrl";

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
 * Active / dangerous element tags removed from any fetched SVG before it is
 * mounted. Includes scripting, external-resource, media and SMIL animation
 * elements that could execute code or load remote content.
 */
const FORBIDDEN_TAGS = new Set([
  "script",
  "foreignobject",
  "style",
  "iframe",
  "object",
  "embed",
  "audio",
  "video",
  "canvas",
  "link",
  "meta",
  "base",
  // SMIL animation elements
  "animate",
  "animatemotion",
  "animatetransform",
  "set",
  "discard",
]);

/**
 * Attributes stripped from every element: inline event handlers and
 * external-resource loaders.
 */
const FORBIDDEN_ATTR_EXACT = new Set(["src", "srcset"]);

/** Regex of dangerous tokens inside style/presentation values. */
const DANGEROUS_CSS_TOKEN =
  /(javascript:|vbscript:|expression\s*\(|@import|-moz-binding)/i;

const hasCssEscapeOrControl = (value: string): boolean =>
  value.includes("\\") ||
  Array.from(value).some(char => {
    const code = char.charCodeAt(0);
    return code < 0x20 || code === 0x7f;
  });

/**
 * Matches a conservative internal fragment reference: `#id` where id is a
 * limited character set. Used to validate `href` / `xlink:href`.
 */
const INTERNAL_HREF = /^#[A-Za-z_][\w.-]*$/;

/**
 * Matches an exact internal `url(#id)` reference (optionally quoted) used by
 * gradients / filters / masks.
 */
const INTERNAL_URL_REF = /^url\(\s*(['"]?)#[A-Za-z_][\w.-]*\1\s*\)$/i;

/**
 * Returns true when a presentation / style attribute value is safe.
 *
 * Blocks `javascript:`, `vbscript:`, `expression`, `@import`, `-moz-binding`
 * and any `url(...)` that is not an exact internal `url(#id)` reference.
 */
const isSafeStyleValue = (value: string): boolean => {
  if (hasCssEscapeOrControl(value)) return false;
  if (DANGEROUS_CSS_TOKEN.test(value)) return false;
  // Inspect every url(...) occurrence; allow only exact internal references.
  const urlMatches = value.match(/url\([^)]*\)?/gi);
  if (urlMatches) {
    for (const u of urlMatches) {
      if (!INTERNAL_URL_REF.test(u.trim())) return false;
    }
  }
  return true;
};

/**
 * Sanitizes a single element in place: removes event handlers, external
 * resource attributes, unsafe href references and dangerous style values.
 */
const sanitizeElement = (el: Element): void => {
  for (const attr of Array.from(el.attributes)) {
    const rawName = attr.name;
    const name = rawName.toLowerCase();
    const localName = name.includes(":") ? name.split(":").pop()! : name;
    const value = attr.value;

    // Inline event handlers (on*), including namespaced forms.
    if (localName.startsWith("on")) {
      el.removeAttribute(rawName);
      continue;
    }

    // External resource loaders.
    if (FORBIDDEN_ATTR_EXACT.has(localName)) {
      el.removeAttribute(rawName);
      continue;
    }

    // href / xlink:href — allow only conservative internal references.
    if (localName === "href") {
      if (!INTERNAL_HREF.test(value.trim())) {
        el.removeAttribute(rawName);
      }
      continue;
    }

    // Scan every remaining attribute for dangerous CSS/URL tokens. This also
    // catches presentation attributes such as fill, filter, mask and clip-path.
    if (!isSafeStyleValue(value)) {
      el.removeAttribute(rawName);
    }
  }
};

/**
 * Sanitizes the root `<svg>` and every descendant: removes forbidden elements
 * and cleans attributes on all remaining nodes (root included).
 */
const sanitizeSvgTree = (svg: SVGSVGElement): void => {
  // Remove forbidden elements anywhere in the tree.
  svg.querySelectorAll("*").forEach(el => {
    if (FORBIDDEN_TAGS.has(el.tagName.toLowerCase())) {
      el.remove();
    }
  });

  // Clean attributes on the root svg and all surviving descendants.
  sanitizeElement(svg);
  svg.querySelectorAll("*").forEach(el => sanitizeElement(el));
};

/**
 * Escapes a string for safe use inside a CSS attribute-selector value.
 * Prefers the native CSS.escape when available.
 */
const cssEscapeValue = (value: string): string => {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(value);
  }
  // Conservative fallback: escape anything that is not alphanumeric, dash,
  // underscore or unicode above the ASCII control range.
  return value.replace(/[^\w-]/g, ch => `\\${ch}`);
};

/**
 * Builds a safe attribute selector matching an element by id without
 * interpolating raw, unescaped user input.
 */
const idSelector = (id: string): string => `[id="${cssEscapeValue(id)}"]`;

/**
 * Builds a safe class selector without interpolating raw user input.
 */
const classSelector = (cls: string): string => `.${cssEscapeValue(cls)}`;

/**
 * Matches characters that could break out of a CSS declaration or rule.
 * Used to reject malicious override / animation values.
 */
const CSS_BREAKOUT_CHARS = /[{}<>;]/;

/**
 * Returns true when a CSS value (override or animation fragment) is safe to
 * interpolate into generated CSS. Rejects declaration/rule delimiters and
 * dangerous tokens.
 */
const isSafeCssFragment = (value: string): boolean => {
  if (CSS_BREAKOUT_CHARS.test(value)) return false;
  if (hasCssEscapeOrControl(value)) return false;
  if (DANGEROUS_CSS_TOKEN.test(value)) return false;
  // Allow only exact internal url(#id) references.
  const urlMatches = value.match(/url\([^)]*\)?/gi);
  if (urlMatches) {
    for (const u of urlMatches) {
      if (!INTERNAL_URL_REF.test(u.trim())) return false;
    }
  }
  return true;
};

const ANIMATION_PROPERTIES = new Set([
  "opacity",
  "transform",
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "visibility",
  "filter",
  "clip-path",
  "color",
]);

const isSafeKeyframeStep = (value: string): boolean =>
  value.split(",").every(part => {
    const token = part.trim().toLowerCase();
    if (token === "from" || token === "to") return true;
    if (!/^\d+(?:\.\d+)?%$/.test(token)) return false;
    const percentage = Number(token.slice(0, -1));
    return percentage >= 0 && percentage <= 100;
  });

const TIME_TOKEN = /^(?:\d+(?:\.\d+)?|\.\d+)(?:ms|s)$/i;
const DELAY_TOKEN = /^-?(?:\d+(?:\.\d+)?|\.\d+)(?:ms|s)$/i;
const EASING_TOKEN =
  /^(?:linear|ease|ease-in|ease-out|ease-in-out|step-start|step-end|cubic-bezier\(\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*,\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*,\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*,\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*\)|steps\(\s*\d+\s*(?:,\s*(?:start|end|jump-start|jump-end|jump-none|jump-both))?\s*\))$/i;
const ANIMATION_DIRECTIONS = new Set([
  "normal",
  "reverse",
  "alternate",
  "alternate-reverse",
]);

const isSafeTransition = (value: string): boolean => {
  if (!isSafeCssFragment(value)) return false;
  if (!/^[a-z0-9\s.,()%+_-]+$/i.test(value)) return false;
  if (typeof CSS !== "undefined" && typeof CSS.supports === "function") {
    return CSS.supports("transition", value);
  }
  return true;
};

const isSafeIterationCount = (value: string): boolean => {
  if (value === "infinite") return true;
  if (!/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)) return false;
  return Number.isFinite(Number(value)) && Number(value) >= 0;
};

/**
 * Apply style overrides to a single SVG element.
 *
 * Values are validated so they cannot inject unsafe CSS through the `style`
 * attribute (cursor) or presentation attributes.
 */
function applyStylesToElement(el: Element, styles: SvgElementOverride) {
  for (const [key, value] of Object.entries(styles)) {
    if (RESERVED_KEYS.has(key) || value === undefined) continue;
    const attr = STYLE_ATTR_MAP[key];
    if (!attr) continue;
    const strValue = String(value);
    if (!isSafeStyleValue(strValue)) continue;
    el.setAttribute(attr, strValue);
  }
  if (styles.className && !CSS_BREAKOUT_CHARS.test(styles.className)) {
    const existing = el.getAttribute("class") || "";
    el.setAttribute("class", `${existing} ${styles.className}`.trim());
  }
  if (styles.cursor && isSafeCssFragment(styles.cursor)) {
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
      if (!attr) continue;
      const strValue = String(value);
      if (!isSafeStyleValue(strValue)) continue;
      el.setAttribute(attr, strValue);
    }
  });
}

/**
 * Generate CSS keyframes string from animation config.
 *
 * All interpolated values (selectors, keyframe property values, timing
 * tokens) are validated so a malicious override cannot close the current
 * declaration/rule or inject additional rules. Selectors are escaped with
 * {@link cssEscapeValue}.
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
    const rawTarget = isClass ? selector.slice(1) : selector;
    if (!rawTarget || CSS_BREAKOUT_CHARS.test(rawTarget)) continue;
    const target = isClass
      ? `.${cssEscapeValue(rawTarget)}`
      : `[id="${cssEscapeValue(rawTarget)}"]`;
    const cssSelector = `.kreati-dsvg--${instanceId} ${target}`;

    if (animation.keyframes) {
      const keyframeEntries: string[] = [];
      let keyframesSafe = true;

      for (const [step, props] of Object.entries(animation.keyframes)) {
        if (!isSafeKeyframeStep(step)) {
          keyframesSafe = false;
          break;
        }
        const declarations: string[] = [];
        for (const [p, v] of Object.entries(props)) {
          if (v === undefined || v === null) continue;
          const prop = p.replace(/([A-Z])/g, "-$1").toLowerCase();
          const val = String(v);
          if (!ANIMATION_PROPERTIES.has(prop) || !isSafeCssFragment(val)) {
            keyframesSafe = false;
            break;
          }
          declarations.push(`${prop}: ${val}`);
        }
        if (!keyframesSafe) break;
        keyframeEntries.push(`  ${step} { ${declarations.join("; ")} }`);
      }

      if (keyframesSafe && keyframeEntries.length > 0) {
        const animName = `kreati-dsvg-${instanceId}-${keyframeIndex++}`;

        const duration = animation.duration ?? "1s";
        const easing = animation.easing ?? "ease";
        const iterations = String(animation.iterations ?? "infinite");
        const direction = animation.direction ?? "normal";
        const delay = animation.delay ?? "0s";

        const timingSafe =
          TIME_TOKEN.test(duration) &&
          EASING_TOKEN.test(easing) &&
          isSafeIterationCount(iterations.toLowerCase()) &&
          ANIMATION_DIRECTIONS.has(direction) &&
          DELAY_TOKEN.test(delay);

        if (timingSafe) {
          rules.push(
            `@keyframes ${animName} {\n${keyframeEntries.join("\n")}\n}`
          );
          rules.push(
            `${cssSelector} { animation: ${animName} ${duration} ${easing} ${delay} ${iterations} ${direction}; }`
          );
        }
      }
    }

    if (animation.transition && isSafeTransition(animation.transition)) {
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
export const DynamicSvg = ({
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
  ref,
}: DynamicSvgProps & { ref?: React.Ref<HTMLSpanElement> }) => {
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
    const source = sanitizeUrl(src || url);
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

  // Process SVG into a sanitized node and build animation CSS.
  const processed = useMemo(() => {
    if (!svgContent) return null;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, "image/svg+xml");

    // Reject malformed documents: DOMParser surfaces failures as a
    // <parsererror> node rather than throwing.
    if (doc.querySelector("parsererror")) return null;

    const root = doc.documentElement;
    // Only accept an SVG document whose root element is actually <svg>.
    if (
      root.localName.toLowerCase() !== "svg" ||
      root.namespaceURI !== "http://www.w3.org/2000/svg"
    )
      return null;
    const svg = root as unknown as SVGSVGElement;

    // Security: strip dangerous elements and attributes from root + descendants.
    sanitizeSvgTree(svg);

    const overriddenIds = new Set<string>();
    const overriddenClasses = new Set<string>();

    // Apply per-element style overrides (not listeners — those go in the effect).
    for (const [selector, config] of Object.entries(overrides)) {
      if (selector.startsWith(".")) {
        const cls = selector.slice(1);
        if (!cls || CSS_BREAKOUT_CHARS.test(cls)) continue;
        overriddenClasses.add(cls);
        const elements = svg.querySelectorAll(classSelector(cls));
        elements.forEach(el => applyStylesToElement(el, config));
      } else {
        if (CSS_BREAKOUT_CHARS.test(selector)) continue;
        overriddenIds.add(selector);
        const el = svg.querySelector(idSelector(selector));
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
      // Keep the sanitized SVG as a node; it is imported into the document and
      // mounted with replaceChildren (no innerHTML / outerHTML).
      node: svg,
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
      const rawTarget = isClass ? selector.slice(1) : selector;
      // Skip selectors that could break out of the query.
      if (!rawTarget || CSS_BREAKOUT_CHARS.test(rawTarget)) continue;

      const elements = isClass
        ? wrapper.querySelectorAll(classSelector(rawTarget))
        : wrapper.querySelectorAll(idSelector(rawTarget));

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

  // Mount the sanitized node and attach listeners when processed changes.
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !processed) return;

    // Import the sanitized node into the live document (deep clone) and mount
    // it without serializing to HTML.
    const imported = document.importNode(processed.node, true);
    wrapper.replaceChildren(imported);
    attachListeners();

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      wrapper.replaceChildren();
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
};
