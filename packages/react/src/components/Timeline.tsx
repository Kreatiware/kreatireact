import React, { forwardRef, useRef, useImperativeHandle } from "react";
import "./Timeline.css";

export interface TimelineEvent {
  /** Unique key */
  key: string;
  /** Content to render */
  content: React.ReactNode;
  /** Opposite side content */
  opposite?: React.ReactNode;
  /** Custom marker icon — replaces the default dot */
  marker?: React.ReactNode;
  /** Color override for the default marker dot */
  color?: string;
  /** Per-item className */
  className?: string;
  /** Per-item style */
  style?: React.CSSProperties;
}

export interface TimelineProps {
  /** Array of timeline events */
  events: TimelineEvent[];
  /** Alternate content sides — markers stay centered */
  alternate?: boolean;
  /** Custom render for each event content */
  contentTemplate?: (event: TimelineEvent, index: number) => React.ReactNode;
  /** Custom render for each marker */
  markerTemplate?: (event: TimelineEvent, index: number) => React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

const base = "k-timeline";

/**
 * Timeline component for displaying chronological events.
 *
 * @description A vertical timeline with a continuous connector line.
 * Each item is a grid row with a connector column (line + marker) and
 * content. Alternate mode adds a third column and swaps content sides
 * per event. Supports custom markers, color overrides, and templates.
 *
 * @example
 * ```tsx
 * <Timeline events={[
 *   { key: '1', content: <p>Event 1</p> },
 *   { key: '2', content: <p>Event 2</p>, opposite: <span>Date</span> },
 * ]} alternate />
 * ```
 */
export const Timeline = forwardRef<HTMLDivElement, TimelineProps>(
  (
    {
      events,
      alternate = false,
      contentTemplate,
      markerTemplate,
      className = "",
      style,
    },
    ref
  ) => {
    const elRef = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => elRef.current as HTMLDivElement);

    const cls = [base, alternate && `${base}--alternate`, className]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={elRef} className={cls} style={style} role="list">
        {events.map((event, i) => {
          const marker = markerTemplate
            ? markerTemplate(event, i)
            : event.marker;
          const hasCustom = !!marker;
          const content = contentTemplate
            ? contentTemplate(event, i)
            : event.content;
          const isFirst = i === 0;
          const isLast = i === events.length - 1;
          const isOdd = i % 2 === 0;

          const connectorCls = [
            `${base}__connector`,
            isFirst && `${base}__connector--first`,
            isLast && `${base}__connector--last`,
          ]
            .filter(Boolean)
            .join(" ");

          const markerEl = (
            <span
              className={`${base}__marker${hasCustom ? ` ${base}__marker--custom` : ""}`}
              style={
                !hasCustom && event.color
                  ? { background: event.color }
                  : undefined
              }
            >
              {hasCustom && marker}
            </span>
          );

          if (alternate) {
            return (
              <div
                key={event.key}
                className={`${base}__item ${event.className || ""}`}
                style={event.style}
                role="listitem"
              >
                <div className={`${base}__side ${base}__side--a`}>
                  {isOdd ? content : event.opposite}
                </div>
                <div className={connectorCls}>{markerEl}</div>
                <div className={`${base}__side ${base}__side--b`}>
                  {isOdd ? event.opposite : content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={event.key}
              className={`${base}__item ${event.className || ""}`}
              style={event.style}
              role="listitem"
            >
              <div className={connectorCls}>{markerEl}</div>
              <div className={`${base}__content`}>{content}</div>
            </div>
          );
        })}
      </div>
    );
  }
);

Timeline.displayName = "Timeline";
