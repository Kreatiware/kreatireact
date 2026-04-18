import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { TextEditor } from '../../../../packages/react/src/components/TextEditor';

const meta = {
  title: 'Components/TextEditor',
  component: TextEditor,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
} satisfies Meta<typeof TextEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [html, setHtml] = useState('');
    return (
      <div style={{ maxWidth: 640 }}>
        <TextEditor value={html} onChange={setHtml} placeholder="Write something..." />
        {html && html !== '<p><br></p>' && (
          <details style={{ marginTop: 'var(--kreati-space-4)', fontSize: 'var(--kreati-font-size-xs)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--kreati-gray-500)' }}>HTML output</summary>
            <pre style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 'var(--kreati-space-2)' }}>{html}</pre>
          </details>
        )}
      </div>
    );
  },
};

export const WithContent: Story = {
  name: 'With initial content',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor
        defaultValue="<h2>Welcome</h2><p>This is a <strong>rich text editor</strong> with <em>formatting</em> support.</p><ul><li>Bold, italic, underline</li><li>Headings (H1-H3)</li><li>Lists and blockquotes</li></ul><blockquote>Built from scratch with zero dependencies.</blockquote><p>Try selecting text and clicking the toolbar buttons.</p>"
        placeholder="Write something..."
      />
    </div>
  ),
};

export const Resizable: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor placeholder="Drag the bottom-right corner to resize..." resizable minHeight="8rem" />
    </div>
  ),
};

export const CharCount: Story = {
  name: 'Character count',
  render: () => {
    const [html, setHtml] = useState('');
    return (
      <div style={{ maxWidth: 640 }}>
        <TextEditor value={html} onChange={setHtml} placeholder="Max 200 characters..." showCharCount maxChars={200} />
      </div>
    );
  },
};

export const CustomToolbar: Story = {
  name: 'Custom toolbar',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor
        toolbar={['bold', 'italic', 'underline', '|', 'link', 'code']}
        placeholder="Simple formatting only..."
      />
    </div>
  ),
};

export const WithHeadingsAndFontSize: Story = {
  name: 'With headings',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor
        toolbar={[
          'heading', '|',
          'bold', 'italic', 'underline', 'strikethrough', '|',
          'fontSize', '|',
          'ul', 'ol', '|',
          'link', 'code', 'blockquote', '|',
          'undo', 'redo',
        ]}
        placeholder="Full toolbar with heading selector..."
      />
    </div>
  ),
};

export const AllToolbarOptions: Story = {
  name: 'All toolbar options',
  render: () => {
    const [html, setHtml] = useState('');
    return (
      <div style={{ maxWidth: 720 }}>
        <TextEditor
          toolbar={[
            'heading', 'fontFamily', 'fontSize', '|',
            'bold', 'italic', 'underline', 'strikethrough', '|',
            'textColor', 'bgColor', '|',
            'ul', 'ol', '|',
            'link', 'code', 'blockquote', '|',
            'undo', 'redo',
          ]}
          value={html}
          onChange={setHtml}
          placeholder="Every toolbar option enabled..."
          resizable
          showCharCount
        />
        <pre style={{ background: 'var(--kreati-gray-100)', padding: 'var(--kreati-space-2)', borderRadius: 'var(--kreati-radius-sm)', whiteSpace: 'pre-wrap', wordBreak: 'break-all', marginTop: 'var(--kreati-space-3)', fontSize: 'var(--kreati-font-size-xxs)', color: 'var(--kreati-gray-600)', maxHeight: '10rem', overflow: 'auto' }}>
          {html || '<empty>'}
        </pre>
      </div>
    );
  },
};

export const NoTooltips: Story = {
  name: 'Without tooltips',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor placeholder="Tooltips disabled..." showTooltips={false} />
    </div>
  ),
};

export const ErrorState: Story = {
  name: 'Error state',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor placeholder="Required field..." error />
    </div>
  ),
};

export const ReadOnly: Story = {
  name: 'Read only',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor
        defaultValue="<h3>Read-only content</h3><p>This editor is in <strong>read-only</strong> mode. The toolbar is hidden and the content cannot be edited.</p>"
        readOnly
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor
        defaultValue="<p>This editor is <strong>disabled</strong>.</p>"
        disabled
      />
    </div>
  ),
};

export const WithLabel: Story = {
  name: 'With label',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor label="Description" placeholder="Write a description..." />
    </div>
  ),
};

export const WithHelperText: Story = {
  name: 'With helper text',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor label="Bio" helperText="Tell us about yourself" placeholder="Write your bio..." />
    </div>
  ),
};

export const WithError: Story = {
  name: 'With error',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor label="Content" error="This field is required" placeholder="Required field..." required />
    </div>
  ),
};

export const WithSuccess: Story = {
  name: 'With success',
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <TextEditor label="Notes" success helperText="Saved successfully" defaultValue="<p>Some content here.</p>" />
    </div>
  ),
};

export const FullWidth: Story = {
  name: 'Full width',
  render: () => (
    <TextEditor label="Full width editor" fullWidth placeholder="Takes the full container width..." helperText="This editor uses fullWidth prop" />
  ),
};

export const FormExample: Story = {
  name: 'Form integration',
  render: () => (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 'var(--kreati-space-4)' }}>
      <TextEditor label="Title" required placeholder="Article title..." helperText="Keep it concise" />
      <TextEditor label="Body" required placeholder="Write your article..." minHeight="12rem" resizable showCharCount maxChars={5000} />
      <TextEditor label="Notes" placeholder="Optional notes..." helperText="Internal use only" helperSeverity="warning" />
    </div>
  ),
};
