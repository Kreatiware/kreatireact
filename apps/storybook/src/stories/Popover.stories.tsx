import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Popover } from '../../../../packages/react/src/components/Popover';
import { Button } from '../../../../packages/react/src/components/Button';
import { KreatiProvider } from '../../../../packages/react/src/locale';
import { es } from '../../../../packages/react/src/locale/es';

const meta = {
  title: 'Components/Popover',
  component: Popover,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Floating panel anchored to a trigger element. Supports portal rendering, auto-flip positioning, click outside and Escape to close, controlled/uncontrolled modes. Used internally by DatePicker, TimePicker, etc.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

const PanelContent = ({ text = 'Popover content' }: { text?: string }) => (
  <div style={{ padding: 16, fontSize: 14, color: '#374151', minWidth: 200 }}>
    <p style={{ margin: 0, fontWeight: 600, marginBottom: 8 }}>Panel Title</p>
    <p style={{ margin: 0, color: '#6b7280' }}>{text}</p>
  </div>
);

export const Default: Story = {
  render: () => (
    <Popover content={<PanelContent />} position="bottom">
      <Button label="Click me" />
    </Popover>
  ),
};

export const Positions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, padding: 100 }}>
      {(['bottom', 'top', 'left', 'right'] as const).map((pos) => (
        <Popover key={pos} content={<PanelContent text={`Position: ${pos}`} />} position={pos}>
          <Button label={pos} size="sm" buttonType="outlined" />
        </Popover>
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  name: 'Controlled mode',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <Popover content={<PanelContent text="Controlled popover" />} open={open} onOpenChange={setOpen}>
            <Button label={open ? 'Close' : 'Open'} />
          </Popover>
          <span style={{ fontSize: 12, color: '#6b7280', fontFamily: 'monospace' }}>
            open: {String(open)}
          </span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const PortalComparison: Story = {
  name: 'Portal vs no portal',
  render: () => (
    <div style={{ overflow: 'hidden', border: '1px dashed #d1d5db', padding: 24, borderRadius: 8, maxHeight: 120 }}>
      <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px' }}>Container has overflow: hidden + maxHeight</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Popover content={<PanelContent text="With portal (default) — not clipped" />} portal={true}>
          <Button label="Portal" size="sm" />
        </Popover>
        <Popover content={<PanelContent text="No portal — gets clipped" />} portal={false}>
          <Button label="No portal" size="sm" buttonType="outlined" />
        </Popover>
      </div>
    </div>
  ),
};

export const RichContent: Story = {
  name: 'Rich content',
  render: () => (
    <Popover
      content={
        <div style={{ padding: 16, width: 280 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#deeff7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0f78a5' }}>K</div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>Kreatiware</p>
              <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>Frontend ecosystem</p>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: '#374151', lineHeight: 1.5 }}>
            Modern React components with TypeScript, ARIA accessibility, and custom theming.
          </p>
        </div>
      }
    >
      <Button label="User card" />
    </Popover>
  ),
};

export const Offset: Story = {
  name: 'Custom offset',
  render: () => (
    <div style={{ display: 'flex', gap: 24 }}>
      <Popover content={<PanelContent text="offset: 4 (default)" />} offset={4}>
        <Button label="4px" size="sm" buttonType="outlined" />
      </Popover>
      <Popover content={<PanelContent text="offset: 12" />} offset={12}>
        <Button label="12px" size="sm" buttonType="outlined" />
      </Popover>
      <Popover content={<PanelContent text="offset: 24" />} offset={24}>
        <Button label="24px" size="sm" buttonType="outlined" />
      </Popover>
    </div>
  ),
};

export const ConfirmVariant: Story = {
  name: 'Confirm variant',
  render: () => {
    const Demo = () => {
      const [result, setResult] = useState('');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <Popover
            variant="confirm"
            message="Are you sure you want to delete this?"
            icon={<svg width={20} height={20} viewBox="0 0 24 24" fill="#f59e0b"><circle cx={12} cy={12} r={10} opacity={0.15} /><text x={12} y={17} textAnchor="middle" fontSize={14} fill="#f59e0b" fontWeight="bold">?</text></svg>}
            onAccept={() => setResult('Accepted')}
            onReject={() => setResult('Rejected')}
          >
            <Button label="Delete" severity="danger" size="sm" />
          </Popover>
          {result && <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{result}</span>}
        </div>
      );
    };
    return <Demo />;
  },
};

export const ConfirmSpanish: Story = {
  name: 'Confirm — Spanish locale',
  render: () => {
    const Demo = () => {
      const [result, setResult] = useState('');
      return (
        <KreatiProvider locale={es}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
            <Popover
              variant="confirm"
              message="Esta seguro de eliminar este elemento?"
              onAccept={() => setResult('Aceptado')}
              onReject={() => setResult('Cancelado')}
            >
              <Button label="Eliminar" severity="danger" size="sm" />
            </Popover>
            {result && <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{result}</span>}
          </div>
        </KreatiProvider>
      );
    };
    return <Demo />;
  },
};

export const ConfirmCustomLabels: Story = {
  name: 'Confirm — Custom labels',
  render: () => (
    <Popover
      variant="confirm"
      message="Save changes before closing?"
      acceptLabel="Save"
      rejectLabel="Discard"
      acceptSeverity="success"
      rejectSeverity="danger"
      onAccept={() => {}}
      onReject={() => {}}
    >
      <Button label="Close editor" size="sm" buttonType="outlined" />
    </Popover>
  ),
};
