import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Panel } from '../../../../packages/react/src/components/Panel';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Panel',
  component: Panel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A content container with optional collapsible header, body, and footer. Supports toggleable mode with animated collapse, controlled/uncontrolled state, and custom header templates.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic panel with header and body. */
export const Default: Story = {
  args: {
    header: 'Panel Title',
    children: <p style={{ margin: 0 }}>This is the panel body content.</p>,
    style: { width: 400 },
  },
};

/** Toggleable panel — click the header to collapse/expand. */
export const Toggleable: Story = {
  args: {
    header: 'Collapsible Section',
    toggleable: true,
    children: <p style={{ margin: 0 }}>Click the header to toggle this content.</p>,
    style: { width: 400 },
  },
};

/** Starts collapsed. */
export const DefaultCollapsed: Story = {
  args: {
    header: 'Initially Collapsed',
    toggleable: true,
    defaultCollapsed: true,
    children: <p style={{ margin: 0 }}>This content was hidden by default.</p>,
    style: { width: 400 },
  },
};

/** Controlled collapsed state. */
export const Controlled: Story = {
  render: () => {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Button label={collapsed ? 'Expand' : 'Collapse'} size="sm" onClick={() => setCollapsed(!collapsed)} />
        <Panel header="Controlled Panel" toggleable collapsed={collapsed} onToggle={setCollapsed}>
          <p style={{ margin: 0 }}>State controlled externally via button.</p>
        </Panel>
      </div>
    );
  },
};

/** Panel with footer. */
export const WithFooter: Story = {
  args: {
    header: 'Form Section',
    toggleable: true,
    children: <p style={{ margin: 0 }}>Fill in the details below.</p>,
    footer: (
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Button label="Cancel" buttonType="text" size="sm" />
        <Button label="Save" size="sm" />
      </div>
    ),
    style: { width: 400 },
  },
};

/** Custom header template with full control. */
export const CustomHeaderTemplate: Story = {
  render: () => (
    <Panel
      toggleable
      headerTemplate={(collapsed, toggle) => (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, cursor: 'pointer', background: 'var(--kreati-primary-50, #e0f2fe)' }}
          onClick={toggle}
        >
          <span style={{ fontWeight: 700, color: 'var(--kreati-primary-500)' }}>Custom Header</span>
          <Button label={collapsed ? 'Show' : 'Hide'} size="sm" buttonType="outlined" onClick={(e) => { e.stopPropagation(); toggle(); }} />
        </div>
      )}
      style={{ width: 400 }}
    >
      <p style={{ margin: 0 }}>Body with a fully custom header template.</p>
    </Panel>
  ),
};

/** Panel without header — just body content. */
export const NoHeader: Story = {
  args: {
    children: <p style={{ margin: 0 }}>A panel with no header, just bordered content.</p>,
    style: { width: 400 },
  },
};

/** Multiple toggleable panels stacked. */
export const Stacked: Story = {
  render: () => (
    <div style={{ width: 400, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Panel header="Section 1" toggleable>
        <p style={{ margin: 0 }}>First section content.</p>
      </Panel>
      <Panel header="Section 2" toggleable defaultCollapsed>
        <p style={{ margin: 0 }}>Second section content.</p>
      </Panel>
      <Panel header="Section 3" toggleable defaultCollapsed>
        <p style={{ margin: 0 }}>Third section content.</p>
      </Panel>
    </div>
  ),
};
