import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { SpeedDial } from '../../../../packages/react/src/components/SpeedDial';
import type { SpeedDialItem } from '../../../../packages/react/src/components/SpeedDial';

const meta = {
  title: 'Components/SpeedDial',
  component: SpeedDial,
  parameters: { layout: 'centered', docs: { description: { component: 'Floating action button that expands into multiple action buttons. Supports linear (up/down/left/right) and quarter-circle layouts.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ padding: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Story /></div>],
} satisfies Meta<typeof SpeedDial>;

export default meta;
type Story = StoryObj<typeof meta>;

const starIcon = <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2l3.09,6.26L22,9.27l-5,4.87,1.18,6.88L12,17.77,5.82,21.02,7,14.14,2,9.27l6.91-1.01Z"/></svg>;
const editIcon = <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M3,17.25V21h3.75L17.81,9.94l-3.75-3.75ZM20.71,7.04a1,1,0,0,0,0-1.41L18.37,3.29a1,1,0,0,0-1.41,0L15.13,5.12l3.75,3.75Z"/></svg>;
const shareIcon = <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M18,16.08a2.91,2.91,0,0,0-1.96.77L8.91,12.7A3.25,3.25,0,0,0,9,12a3.25,3.25,0,0,0-.09-.7l7.05-4.11A2.93,2.93,0,1,0,15,5a3.25,3.25,0,0,0,.09.7L8.04,9.81A3,3,0,1,0,8.04,14.19l7.12,4.16a2.82,2.82,0,0,0-.08.65A2.92,2.92,0,1,0,18,16.08Z"/></svg>;
const trashIcon = <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M6,19a2,2,0,0,0,2,2h8a2,2,0,0,0,2-2V7H6ZM19,4H15.5l-1-1h-5l-1,1H5V6H19Z"/></svg>;

const sampleItems: SpeedDialItem[] = [
  { key: 'star', icon: starIcon, label: 'Favorite', command: () => console.log('star') },
  { key: 'edit', icon: editIcon, label: 'Edit', command: () => console.log('edit') },
  { key: 'share', icon: shareIcon, label: 'Share', command: () => console.log('share') },
  { key: 'trash', icon: trashIcon, label: 'Delete', severity: 'danger', command: () => console.log('trash') },
];

export const Up: Story = {
  name: 'Direction Up',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} direction="up" />,
};

export const Down: Story = {
  name: 'Direction Down',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} direction="down" />,
};

export const Left: Story = {
  name: 'Direction Left',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} direction="left" />,
};

export const Right: Story = {
  name: 'Direction Right',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} direction="right" />,
};

export const QuarterUpRight: Story = {
  name: 'Quarter Circle — Up Right',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} layout="quarter-up-right" radius={90} />,
};

export const QuarterDownLeft: Story = {
  name: 'Quarter Circle — Down Left',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} layout="quarter-down-left" radius={90} />,
};

export const WithMask: Story = {
  name: 'With Mask Overlay',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} direction="up" mask />,
};

export const HoverTrigger: Story = {
  name: 'Hover Trigger',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} direction="up" triggerOn="hover" />,
};

export const CustomSeverity: Story = {
  name: 'Custom Severity & Outlined',
  args: {} as any,
  render: () => (
    <SpeedDial
      items={sampleItems}
      direction="up"
      severity="success"
      buttonType="outlined"
    />
  ),
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {} as any,
  render: () => <SpeedDial items={sampleItems} direction="up" disabled />,
};

export const NestedSubDial: Story = {
  name: 'Nested Sub-Dial (3 levels)',
  args: {} as any,
  render: () => {
    const nestedItems: SpeedDialItem[] = [
      { key: 'star', icon: starIcon, label: 'Favorite' },
      {
        key: 'share-group',
        icon: shareIcon,
        label: 'Share...',
        direction: 'right',
        severity: 'info',
        items: [
          { key: 'email', icon: editIcon, label: 'Email' },
          {
            key: 'social',
            icon: starIcon,
            label: 'Social...',
            direction: 'up',
            severity: 'success',
            items: [
              { key: 'twitter', icon: shareIcon, label: 'Twitter' },
              { key: 'linkedin', icon: starIcon, label: 'LinkedIn' },
              { key: 'facebook', icon: editIcon, label: 'Facebook' },
            ],
          },
          { key: 'link', icon: starIcon, label: 'Copy Link' },
        ],
      },
      { key: 'edit', icon: editIcon, label: 'Edit' },
      { key: 'trash', icon: trashIcon, label: 'Delete', severity: 'danger' },
    ];
    return (
      <div>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, textAlign: 'center' }}>
          Level 1 opens up. Click "Share..." to open level 2 to the right.
          Click "Social..." to open level 3 upward.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SpeedDial items={nestedItems} direction="up" />
        </div>
      </div>
    );
  },
};
