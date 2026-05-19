import React, {
  useState,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { Message } from "./Message";
import type { MessageSeverity } from "./Message";
import "./MessageList.css";

/** Data for a single message in the list */
export interface MessageListItem {
  /** Unique key — auto-generated if not provided */
  id?: string;
  /** Severity */
  severity?: MessageSeverity;
  /** Message content */
  content: React.ReactNode;
  /** Show severity icon */
  icon?: boolean | React.ReactNode;
  /** Show close button (default: true) */
  closable?: boolean;
  /** Remains visible until manually closed */
  sticky?: boolean;
  /** Auto-dismiss duration in ms */
  life?: number;
  /** Border accent position */
  borderPosition?: "left" | "top" | "right" | "bottom" | false;
  /** Additional CSS class names for this message */
  className?: string;
  /** Inline styles for this message */
  style?: React.CSSProperties;
}

export interface MessageListProps {
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export interface MessageListRef {
  /** Add one or more messages */
  show: (messages: MessageListItem | MessageListItem[]) => void;
  /** Remove a message by id */
  remove: (id: string) => void;
  /** Clear all messages */
  clear: () => void;
}

let counter = 0;
const nextId = () => `kml-${++counter}`;

/**
 * MessageList component for dynamic, stackable inline messages.
 *
 * @description A container that manages multiple Message components
 * via an imperative ref API. Messages can be added with `show()`,
 * removed individually, or cleared entirely. Each message supports
 * auto-dismiss via `life`/`sticky`, close buttons, and all Message
 * features. Entry/exit animations are handled per-message.
 *
 * @example
 * ```tsx
 * const ref = useRef<MessageListRef>(null);
 *
 * <MessageList ref={ref} />
 * <Button onClick={() => ref.current?.show({ severity: 'success', content: 'Saved!', icon: true, life: 3000, sticky: false })}>
 *   Save
 * </Button>
 * ```
 */
export const MessageList = ({
  className = "",
  style,
  ref,
}: MessageListProps & { ref?: React.Ref<MessageListRef> }) => {
  const [messages, setMessages] = useState<
    (MessageListItem & { id: string })[]
  >([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const show = useCallback((input: MessageListItem | MessageListItem[]) => {
    const items = Array.isArray(input) ? input : [input];
    const withIds = items.map(m => ({ ...m, id: m.id ?? nextId() }));
    setMessages(prev => [...prev, ...withIds]);
  }, []);

  const remove = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  useImperativeHandle(ref, () => ({ show, remove, clear }), [
    show,
    remove,
    clear,
  ]);

  const base = "k-message-list";

  if (messages.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={[base, className].filter(Boolean).join(" ")}
      style={style}
      aria-live="polite"
      aria-relevant="additions removals"
    >
      {messages.map(msg => (
        <Message
          key={msg.id}
          severity={msg.severity}
          icon={msg.icon}
          closable={msg.closable ?? true}
          sticky={msg.sticky}
          life={msg.life}
          borderPosition={msg.borderPosition}
          className={msg.className}
          style={msg.style}
          onClose={() => remove(msg.id)}
        >
          {msg.content}
        </Message>
      ))}
    </div>
  );
};
