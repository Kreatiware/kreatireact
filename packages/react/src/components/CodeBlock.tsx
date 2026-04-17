import React, { forwardRef, useState, useCallback } from 'react';
import './CodeBlock.css';
import { useKreatiLocale } from '../locale';
import { COPY_PATH, CHECK_PATH } from './iconPaths';

export type CodeLanguage = 'javascript' | 'typescript' | 'css' | 'html' | 'json' | 'bash' | 'plain';

export interface CodeBlockProps {
  /** Code string to display */
  code: string;
  /** Language for syntax highlighting. Default: 'plain' */
  language?: CodeLanguage;
  /** Title shown in the header (e.g. filename) */
  title?: string;
  /** Show line numbers. Default: true */
  showLineNumbers?: boolean;
  /** Show copy button. Default: true */
  showCopy?: boolean;
  /** Enable word wrap. Default: false */
  wordWrap?: boolean;
  /** Max height with scroll. Undefined = no limit. */
  maxHeight?: string;
  /** Highlight specific line numbers (1-based) */
  highlightLines?: number[];
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/* ─── Token types ──────────────────────────────────────────────────── */
type TokenType = 'keyword' | 'string' | 'number' | 'comment' | 'tag' | 'attr' | 'attr-value' | 'property' | 'selector' | 'function' | 'operator' | 'punctuation' | 'plain';

interface Token {
  type: TokenType;
  value: string;
}

/* ─── Tokenizers ───────────────────────────────────────────────────── */
const JS_KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|yield|super|static|get|set|null|undefined|true|false)\b/;
const TS_KEYWORDS = /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|new|this|class|extends|import|export|from|default|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|yield|super|static|get|set|null|undefined|true|false|type|interface|enum|implements|declare|as|is|keyof|readonly|abstract|namespace|module|never|unknown|any|string|number|boolean|symbol|bigint)\b/;
const CSS_KEYWORDS = /\b(important|inherit|initial|unset|none|auto|normal)\b/;
const BASH_KEYWORDS = /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|in|select|until|echo|exit|export|source|alias|cd|ls|grep|sed|awk|cat|rm|cp|mv|mkdir|chmod|chown|sudo|apt|npm|npx|node|git|docker)\b/;

const tokenizeJS = (code: string, keywords: RegExp): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    // Line comments
    if (code[i] === '/' && code[i + 1] === '/') {
      const end = code.indexOf('\n', i);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end);
      tokens.push({ type: 'comment', value: slice });
      i += slice.length;
      continue;
    }
    // Block comments
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ type: 'comment', value: slice });
      i += slice.length;
      continue;
    }
    // Strings
    if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
      const q = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== q) { if (code[j] === '\\') j++; j++; }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Numbers
    if (/\d/.test(code[i]) && (i === 0 || /[\s,;:=+\-*/([\]{}<>!&|^~?]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[\d.xXa-fA-FeEn_]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Words (keywords, functions, plain)
    if (/[a-zA-Z_$]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_$]/.test(code[j])) j++;
      const word = code.slice(i, j);
      if (keywords.test(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (j < code.length && code[j] === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }
    // Operators
    if (/[=+\-*/<>!&|^~?%]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[=+\-*/<>!&|^~?%]/.test(code[j])) j++;
      tokens.push({ type: 'operator', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Punctuation
    if (/[{}()[\];:.,@#]/.test(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      continue;
    }
    // Whitespace / other
    let j = i;
    while (j < code.length && !/[a-zA-Z0-9_$"'`/=+\-*<>!&|^~?%{}()[\];:.,@#]/.test(code[j])) j++;
    tokens.push({ type: 'plain', value: code.slice(i, j || i + 1) });
    i = j || i + 1;
  }
  return tokens;
};

const tokenizeCSS = (code: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    // Comments
    if (code[i] === '/' && code[i + 1] === '*') {
      const end = code.indexOf('*/', i + 2);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 2);
      tokens.push({ type: 'comment', value: slice });
      i += slice.length;
      continue;
    }
    // Strings
    if (code[i] === '"' || code[i] === "'") {
      const q = code[i];
      let j = i + 1;
      while (j < code.length && code[j] !== q) { if (code[j] === '\\') j++; j++; }
      tokens.push({ type: 'string', value: code.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    // Numbers with units
    if (/\d/.test(code[i])) {
      let j = i;
      while (j < code.length && /[\d.%a-zA-Z]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Properties (word before colon) / selectors / keywords
    if (/[a-zA-Z_-]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++;
      const word = code.slice(i, j);
      // Look ahead for colon = property
      let k = j;
      while (k < code.length && code[k] === ' ') k++;
      if (code[k] === ':' && code[k + 1] !== ':') {
        tokens.push({ type: 'property', value: word });
      } else if (CSS_KEYWORDS.test(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else {
        tokens.push({ type: 'selector', value: word });
      }
      i = j;
      continue;
    }
    // Punctuation
    if (/[{}();:,.]/.test(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      continue;
    }
    let j = i;
    while (j < code.length && !/[a-zA-Z0-9_"'`/{};:,.()\-]/.test(code[j])) j++;
    tokens.push({ type: 'plain', value: code.slice(i, j || i + 1) });
    i = j || i + 1;
  }
  return tokens;
};

const tokenizeHTML = (code: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    // Comments
    if (code.slice(i, i + 4) === '<!--') {
      const end = code.indexOf('-->', i + 4);
      const slice = end === -1 ? code.slice(i) : code.slice(i, end + 3);
      tokens.push({ type: 'comment', value: slice });
      i += slice.length;
      continue;
    }
    // Tags
    if (code[i] === '<') {
      // Closing or opening tag name
      let j = i + 1;
      if (code[j] === '/') j++;
      const nameStart = j;
      while (j < code.length && /[a-zA-Z0-9-]/.test(code[j])) j++;
      if (j > nameStart) {
        tokens.push({ type: 'punctuation', value: code.slice(i, nameStart) });
        tokens.push({ type: 'tag', value: code.slice(nameStart, j) });
        // Attributes
        while (j < code.length && code[j] !== '>') {
          if (/[a-zA-Z_-]/.test(code[j])) {
            const as = j;
            while (j < code.length && /[a-zA-Z0-9_-]/.test(code[j])) j++;
            tokens.push({ type: 'attr', value: code.slice(as, j) });
            continue;
          }
          if (code[j] === '=') {
            tokens.push({ type: 'operator', value: '=' });
            j++;
            continue;
          }
          if (code[j] === '"' || code[j] === "'") {
            const q = code[j];
            let k = j + 1;
            while (k < code.length && code[k] !== q) k++;
            tokens.push({ type: 'attr-value', value: code.slice(j, k + 1) });
            j = k + 1;
            continue;
          }
          tokens.push({ type: 'plain', value: code[j] });
          j++;
        }
        if (code[j] === '>') {
          if (code[j - 1] === '/') {
            tokens.push({ type: 'punctuation', value: '/>' });
          } else {
            tokens.push({ type: 'punctuation', value: '>' });
          }
          j++;
        }
        i = j;
        continue;
      }
    }
    // Text content
    let j = i;
    while (j < code.length && code[j] !== '<') j++;
    if (j > i) {
      tokens.push({ type: 'plain', value: code.slice(i, j) });
      i = j;
    } else {
      tokens.push({ type: 'plain', value: code[i] });
      i++;
    }
  }
  return tokens;
};

const tokenizeJSON = (code: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  while (i < code.length) {
    // Strings (keys and values)
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') { if (code[j] === '\\') j++; j++; }
      const str = code.slice(i, j + 1);
      // Look ahead: if followed by colon, it's a property key
      let k = j + 1;
      while (k < code.length && code[k] === ' ') k++;
      tokens.push({ type: code[k] === ':' ? 'property' : 'string', value: str });
      i = j + 1;
      continue;
    }
    // Numbers
    if (/[-\d]/.test(code[i])) {
      let j = i;
      if (code[j] === '-') j++;
      while (j < code.length && /[\d.eE+\-]/.test(code[j])) j++;
      tokens.push({ type: 'number', value: code.slice(i, j) });
      i = j;
      continue;
    }
    // Keywords (true, false, null)
    if (/[tfn]/.test(code[i])) {
      const rest = code.slice(i);
      const m = rest.match(/^(true|false|null)\b/);
      if (m) {
        tokens.push({ type: 'keyword', value: m[1] });
        i += m[1].length;
        continue;
      }
    }
    // Punctuation
    if (/[{}[\]:,]/.test(code[i])) {
      tokens.push({ type: 'punctuation', value: code[i] });
      i++;
      continue;
    }
    tokens.push({ type: 'plain', value: code[i] });
    i++;
  }
  return tokens;
};

const tokenize = (code: string, language: CodeLanguage): Token[] => {
  switch (language) {
    case 'javascript': return tokenizeJS(code, JS_KEYWORDS);
    case 'typescript': return tokenizeJS(code, TS_KEYWORDS);
    case 'css': return tokenizeCSS(code);
    case 'html': return tokenizeHTML(code);
    case 'json': return tokenizeJSON(code);
    case 'bash': return tokenizeJS(code, BASH_KEYWORDS);
    default: return [{ type: 'plain', value: code }];
  }
};

const iconSvg = (path: string) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d={path} />
  </svg>
);

/**
 * CodeBlock component for displaying syntax-highlighted code.
 * Supports JavaScript, TypeScript, CSS, HTML, JSON, and Bash
 * with a built-in tokenizer (zero dependencies).
 *
 * @example
 * ```tsx
 * <CodeBlock
 *   code={`const x = 42;`}
 *   language="typescript"
 *   title="example.ts"
 * />
 * ```
 */
export const CodeBlock = forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language = 'plain',
      title,
      showLineNumbers = true,
      showCopy = true,
      wordWrap = false,
      maxHeight,
      highlightLines,
      className,
      style,
    },
    ref,
  ) => {
    const locale = useKreatiLocale();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }, [code]);

    const tokens = tokenize(code, language);
    const lines = code.split('\n');
    const highlightSet = highlightLines ? new Set(highlightLines) : null;

    // Build token spans grouped by line
    const renderTokens = () => {
      let lineIndex = 0;
      let currentLine: React.ReactNode[] = [];
      const result: React.ReactNode[] = [];

      const pushLine = () => {
        const ln = lineIndex + 1;
        const highlighted = highlightSet?.has(ln);
        result.push(
          <div key={ln} className={`k-code__line ${highlighted ? 'k-code__line--highlighted' : ''}`}>
            {showLineNumbers && <span className="k-code__line-number">{ln}</span>}
            <span className="k-code__line-content">{currentLine.length > 0 ? currentLine : ' '}</span>
          </div>,
        );
        currentLine = [];
        lineIndex++;
      };

      let tokenKey = 0;
      for (const token of tokens) {
        const parts = token.value.split('\n');
        for (let p = 0; p < parts.length; p++) {
          if (p > 0) pushLine();
          if (parts[p]) {
            currentLine.push(
              token.type === 'plain'
                ? <span key={tokenKey++}>{parts[p]}</span>
                : <span key={tokenKey++} className={`k-code__token--${token.type}`}>{parts[p]}</span>,
            );
          }
        }
      }
      pushLine(); // last line

      return result;
    };

    const showHeader = title || showCopy;

    return (
      <div
        ref={ref}
        className={`k-code ${className || ''}`}
        style={style}
        role="region"
        aria-label={title || (locale?.common?.code || 'Code')}
      >
        {showHeader && (
          <div className="k-code__header">
            {title && <span className="k-code__title">{title}</span>}
            {!title && <span />}
            {showCopy && (
              <button
                type="button"
                className={`k-code__copy ${copied ? 'k-code__copy--copied' : ''}`}
                onClick={handleCopy}
                aria-label={copied ? (locale?.common?.copied || 'Copied') : (locale?.common?.copy || 'Copy')}
              >
                {iconSvg(copied ? CHECK_PATH : COPY_PATH)}
                <span className="k-code__copy-text">{copied ? (locale?.common?.copied || 'Copied') : (locale?.common?.copy || 'Copy')}</span>
              </button>
            )}
          </div>
        )}
        <pre
          className={`k-code__pre ${wordWrap ? 'k-code__pre--wrap' : ''}`}
          style={maxHeight ? { maxHeight, overflow: 'auto' } : undefined}
          tabIndex={0}
        >
          <code className="k-code__content">{renderTokens()}</code>
        </pre>
      </div>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';
