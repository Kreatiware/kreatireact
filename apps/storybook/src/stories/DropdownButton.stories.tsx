import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DropdownButton } from '../../../../packages/react/src/components/DropdownButton';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

const meta = {
  title: 'Components/DropdownButton',
  component: DropdownButton,
  parameters: { layout: 'centered', docs: { description: { component: 'Split button with a primary action and a dropdown menu. Supports nested submenus, icons, separators, and all Button variants.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ padding: 40 }}><Story /></div>],
} satisfies Meta<typeof DropdownButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicItems: MenuItem[] = [
  { key: 'draft', label: 'Save as Draft' },
  { key: 'template', label: 'Save as Template' },
  { key: 'sep', separator: true },
  { key: 'publish', label: 'Save & Publish' },
];

export const Basic: Story = {
  name: 'Basic',
  args: {} as any,
  render: () => (
    <DropdownButton
      label="Save"
      items={basicItems}
      onClick={() => console.log('save')}
      onItemSelect={(key) => console.log(key)}
    />
  ),
};

export const Severities: Story = {
  name: 'Severities',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <DropdownButton label="Primary" items={basicItems} severity="primary" />
      <DropdownButton label="Success" items={basicItems} severity="success" />
      <DropdownButton label="Warning" items={basicItems} severity="warning" />
      <DropdownButton label="Danger" items={basicItems} severity="danger" />
      <DropdownButton label="Info" items={basicItems} severity="info" />
      <DropdownButton label="Secondary" items={basicItems} severity="secondary" />
    </div>
  ),
};

export const Outlined: Story = {
  name: 'Outlined',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 12 }}>
      <DropdownButton label="Save" items={basicItems} buttonType="outlined" />
      <DropdownButton label="Export" items={basicItems} buttonType="outlined" severity="success" />
    </div>
  ),
};

export const WithSubmenus: Story = {
  name: 'With Submenus',
  args: {} as any,
  render: () => {
    const nestedItems: MenuItem[] = [
      { key: 'pdf', label: 'Export as PDF' },
      {
        key: 'image',
        label: 'Export as Image',
        items: [
          { key: 'png', label: 'PNG' },
          { key: 'jpg', label: 'JPG' },
          { key: 'svg', label: 'SVG' },
        ],
      },
      { key: 'sep', separator: true },
      { key: 'csv', label: 'Export as CSV' },
    ];
    return (
      <DropdownButton
        label="Export"
        items={nestedItems}
        severity="info"
        onItemSelect={(key) => console.log(key)}
      />
    );
  },
};

export const Sizes: Story = {
  name: 'Sizes',
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <DropdownButton label="XS" items={basicItems} size="xs" />
      <DropdownButton label="SM" items={basicItems} size="sm" />
      <DropdownButton label="MD" items={basicItems} size="md" />
      <DropdownButton label="LG" items={basicItems} size="lg" />
      <DropdownButton label="XL" items={basicItems} size="xl" />
    </div>
  ),
};

export const DisabledState: Story = {
  name: 'Disabled',
  args: {} as any,
  render: () => <DropdownButton label="Save" items={basicItems} disabled />,
};

export const Rounded: Story = {
  name: 'Rounded',
  args: {} as any,
  render: () => <DropdownButton label="Actions" items={basicItems} rounded severity="success" />,
};

export const WithIcons: Story = {
  name: 'With Icons',
  args: {} as any,
  render: () => {
    const saveIcon = <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M17,3H5A2,2,0,0,0,3,5V19a2,2,0,0,0,2,2H19a2,2,0,0,0,2-2V7ZM12,19a3,3,0,1,1,3-3A3,3,0,0,1,12,19ZM15,9H5V5H15Z"/></svg>;
    const draftIcon = <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M3,17.25V21H6.75L17.81,9.94,14.06,6.19ZM20.71,7.04a1,1,0,0,0,0-1.41L18.37,3.29a1,1,0,0,0-1.41,0L15.13,5.12l3.75,3.75Z"/></svg>;
    const publishIcon = <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M5,4V6H19V4ZM5,14H9V20H15V14H19L12,7Z"/></svg>;
    const templateIcon = <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M14,2H6A2,2,0,0,0,4,4V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V8ZM16,18H8V16H16ZM16,14H8V12H16ZM13,9V3.5L18.5,9Z"/></svg>;

    const iconItems: MenuItem[] = [
      { key: 'draft', label: 'Save as Draft', icon: draftIcon },
      { key: 'template', label: 'Save as Template', icon: templateIcon },
      { key: 'sep', separator: true },
      { key: 'publish', label: 'Save & Publish', icon: publishIcon },
    ];

    return (
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <DropdownButton
          label="Save"
          iconLeft={saveIcon}
          items={iconItems}
          onClick={() => console.log('save')}
          onItemSelect={(key) => console.log(key)}
        />
        <DropdownButton
          label="Save"
          iconLeft={saveIcon}
          items={iconItems}
          buttonType="outlined"
          severity="success"
        />
        <DropdownButton
          label="Save"
          iconLeft={saveIcon}
          items={iconItems}
          buttonType="text"
          severity="info"
        />
      </div>
    );
  },
};
