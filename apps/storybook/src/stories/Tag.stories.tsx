import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from '../../../../packages/react/src/components/Tag';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}><Story /></div>],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSeverities: Story = {
  name: 'All Severities',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {(['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] as const).map((s) => (
        <Tag key={s} severity={s}>{s}</Tag>
      ))}
    </div>
  ),
};

export const Removable: Story = {
  name: 'Removable',
  args: {} as any,
  render: () => {
    const [tags, setTags] = useState(['React', 'Vue', 'Angular', 'Svelte']);
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {tags.map((t) => (
          <Tag key={t} severity="primary" removable onRemove={() => setTags((p) => p.filter((x) => x !== t))}>{t}</Tag>
        ))}
      </div>
    );
  },
};

export const WithIcon: Story = {
  name: 'With Icon',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tag severity="success" icon={<span>{'\u2713'}</span>}>Approved</Tag>
      <Tag severity="danger" icon={<span>{'\u2717'}</span>}>Rejected</Tag>
      <Tag severity="warning" icon={<span>{'\u26A0'}</span>}>Pending</Tag>
    </div>
  ),
};

export const NotRounded: Story = {
  name: 'Rounded (pill)',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 8 }}>
      <Tag severity="info" rounded>v2.4.0</Tag>
      <Tag severity="success" rounded>Stable</Tag>
    </div>
  ),
};

export const ContentTemplate: Story = {
  name: 'Content Template',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      <Tag
        severity="primary"
        contentTemplate={() => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
            Online
          </span>
        )}
      >online</Tag>
      <Tag
        severity="danger"
        contentTemplate={({ onRemove }) => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {'\u{1F525}'} Critical
            <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'currentColor', cursor: 'pointer', padding: 0, fontSize: 10 }}>{'\u2715'}</button>
          </span>
        )}
        removable
        onRemove={() => alert('Removed!')}
      >critical</Tag>
      <Tag
        severity="success"
        contentTemplate={() => (
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 12 }}>{'\u2713'}</span>
            <span>Verified <strong>Pro</strong></span>
          </span>
        )}
      >verified</Tag>
    </div>
  ),
};
