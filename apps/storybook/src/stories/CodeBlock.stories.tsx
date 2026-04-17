import type { Meta, StoryObj } from '@storybook/react';
import { CodeBlock } from '../../../../packages/react/src/components/CodeBlock';

const meta = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const tsCode = `import React, { useState } from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// Primary button component
const Button = ({ label, onClick, disabled = false }: ButtonProps) => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setCount(count + 1);
    onClick();
  };

  return (
    <button disabled={disabled} onClick={handleClick}>
      {label} ({count})
    </button>
  );
};

export default Button;`;

const cssCode = `.k-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--kreati-space-2);
  border: 2px solid transparent;
  border-radius: var(--kreati-radius-sm);
  font-family: var(--kreati-font-family);
  font-weight: var(--kreati-font-weight-medium);
  cursor: pointer;
  transition: var(--kreati-transition);
}

/* Filled variant */
.k-button--filled {
  background: var(--kreati-severity-primary);
  color: var(--kreati-white);
}

.k-button--filled:hover {
  background: var(--kreati-primary-600);
}`;

const htmlCode = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kreati App</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <div id="root"></div>
  <!-- Main application entry -->
  <script type="module" src="/main.tsx"></script>
</body>
</html>`;

const jsonCode = `{
  "name": "@kreatiware/react",
  "version": "0.13.0",
  "private": false,
  "description": "Kreati React component library",
  "main": "dist/index.umd.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  },
  "keywords": ["react", "components", "ui", "kreati"],
  "license": "MIT"
}`;

const jsCode = `function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate first 10 numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}

console.log("Fibonacci:", results);
// Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`;

export const TypeScript: Story = {
  render: () => <CodeBlock code={tsCode} language="typescript" title="Button.tsx" />,
};

export const JavaScript: Story = {
  render: () => <CodeBlock code={jsCode} language="javascript" title="fibonacci.js" />,
};

export const CSS: Story = {
  render: () => <CodeBlock code={cssCode} language="css" title="Button.css" />,
};

export const HTML: Story = {
  render: () => <CodeBlock code={htmlCode} language="html" title="index.html" />,
};

export const JSON_: Story = {
  name: 'JSON',
  render: () => <CodeBlock code={jsonCode} language="json" title="package.json" />,
};

export const NoLineNumbers: Story = {
  name: 'No line numbers',
  render: () => <CodeBlock code={`const x = 42;\nconst y = "hello";`} language="typescript" showLineNumbers={false} />,
};

export const WordWrap: Story = {
  name: 'Word wrap',
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <CodeBlock
        code={`const longString = "This is a very long string that should wrap when the container is narrow instead of scrolling horizontally";`}
        language="typescript"
        title="wrap-example.ts"
        wordWrap
      />
    </div>
  ),
};

export const MaxHeight: Story = {
  name: 'Max height (scrollable)',
  render: () => <CodeBlock code={tsCode} language="typescript" title="Button.tsx" maxHeight="12rem" />,
};

export const HighlightLines: Story = {
  name: 'Highlight lines',
  render: () => <CodeBlock code={tsCode} language="typescript" title="Button.tsx" highlightLines={[8, 9, 10, 11]} />,
};

export const NoHeader: Story = {
  name: 'No header',
  render: () => <CodeBlock code={`npm install @kreatiware/react`} language="bash" showCopy={false} />,
};

export const AllLanguages: Story = {
  name: 'All languages',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <CodeBlock code={`const greeting: string = "Hello";`} language="typescript" title="TypeScript" />
      <CodeBlock code={`const x = 42;`} language="javascript" title="JavaScript" />
      <CodeBlock code={`.btn { color: var(--kreati-primary-500); }`} language="css" title="CSS" />
      <CodeBlock code={`<div class="app"><h1>Hello</h1></div>`} language="html" title="HTML" />
      <CodeBlock code={`{ "key": "value", "count": 42, "active": true }`} language="json" title="JSON" />
      <CodeBlock code={`npm install @kreatiware/react`} language="bash" title="Bash" />
    </div>
  ),
};
