import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Drawer } from '../../../../packages/react/src/components/Drawer';
import { Button } from '../../../../packages/react/src/components/Button';
import { Input } from '../../../../packages/react/src/components/Input';
import { Select } from '../../../../packages/react/src/components/Select';
import { Calendar } from '../../../../packages/react/src/components/Calendar';
import { Tooltip } from '../../../../packages/react/src/components/Tooltip';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { KreatiProvider } from '../../../../packages/react/src/locale';
import { es } from '../../../../packages/react/src/locale/es';

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Slide-in panel from screen edges with header/footer templates, overlay, focus trap, and full ARIA support. Works with LayerContext for correct z-index stacking.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ padding: 24 }}><Story /></div>],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Chile', value: 'cl' },
  { label: 'Colombia', value: 'co' },
  { label: 'Mexico', value: 'mx' },
];

export const Basic: Story = {
  name: 'Basic (left)',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Drawer" onClick={() => setOpen(true)} />
          <Drawer visible={open} onHide={() => setOpen(false)} header="Settings">
            <p>Drawer content goes here. No footer, just children rendered directly.</p>
          </Drawer>
        </>
      );
    };
    return <Demo />;
  },
};

export const Positions: Story = {
  name: 'All positions',
  render: () => {
    const Demo = () => {
      const [pos, setPos] = useState<string | null>(null);
      const positions = ['left', 'right', 'top', 'bottom'] as const;
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {positions.map((p) => (
            <React.Fragment key={p}>
              <Button label={p} size="sm" onClick={() => setPos(p)} />
              <Drawer visible={pos === p} onHide={() => setPos(null)} header={`From ${p}`} position={p}>
                <p>Sliding in from the {p} edge.</p>
              </Drawer>
            </React.Fragment>
          ))}
        </div>
      );
    };
    return <Demo />;
  },
};

export const Sizes: Story = {
  name: 'Sizes (right)',
  render: () => {
    const Demo = () => {
      const [s, setS] = useState<string | null>(null);
      const sizes = ['xs', 'sm', 'md', 'lg', 'xl', 'full'] as const;
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sizes.map((sz) => (
            <React.Fragment key={sz}>
              <Button label={sz.toUpperCase()} size="sm" onClick={() => setS(sz)} />
              <Drawer visible={s === sz} onHide={() => setS(null)} header={`Size ${sz}`} position="right" size={sz}>
                <p>Drawer at size {sz}.</p>
              </Drawer>
            </React.Fragment>
          ))}
        </div>
      );
    };
    return <Demo />;
  },
};

export const WithFooter: Story = {
  name: 'With footer',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Form Drawer" onClick={() => setOpen(true)} />
          <Drawer visible={open} onHide={() => setOpen(false)} header="Edit Profile" position="right" size="md"
            footer={
              <>
                <Button label="Cancel" buttonType="text" severity="secondary" size="sm" onClick={() => setOpen(false)} />
                <Button label="Save" size="sm" onClick={() => setOpen(false)} />
              </>
            }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Name" size="md" fullWidth />
              <Input label="Email" type="email" size="md" fullWidth />
              <Select label="Country" options={countries} filterable fullWidth />
            </div>
          </Drawer>
        </>
      );
    };
    return <Demo />;
  },
};

export const WithOverlays: Story = {
  name: 'Overlays inside drawer',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Drawer" onClick={() => setOpen(true)} />
          <Drawer visible={open} onHide={() => setOpen(false)} header="Form with Overlays" position="right" size="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Select label="Country" options={countries} filterable fullWidth />
              <Calendar label="Date" size="md" fullWidth showButtonBar />
              <Tooltip content="This is a tooltip inside a drawer" position="right">
                <Button label="Hover for tooltip" size="sm" />
              </Tooltip>
            </div>
          </Drawer>
        </>
      );
    };
    return <Demo />;
  },
};

export const CustomTemplates: Story = {
  name: 'Custom templates',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Custom" onClick={() => setOpen(true)} />
          <Drawer visible={open} onHide={() => setOpen(false)} position="right"
            headerTemplate={({ title, close }) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontWeight: 700, color: '#0f78a5' }}>Custom Header</span>
                <Button label="X" buttonType="text" severity="danger" slim size="sm" onClick={close} />
              </div>
            )}
            footerTemplate={({ close }) => (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }}>
                <Button label="Done" size="sm" onClick={close} />
              </div>
            )}>
            <p>Both header and footer are custom templates.</p>
          </Drawer>
        </>
      );
    };
    return <Demo />;
  },
};

export const NoHeaderNoFooter: Story = {
  name: 'No header, no footer',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Minimal" onClick={() => setOpen(true)} />
          <Drawer visible={open} onHide={() => setOpen(false)} closable={false}>
            <div style={{ textAlign: 'center', padding: 24 }}>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Quick peek</p>
              <p style={{ color: '#6b7280', marginBottom: 16 }}>Click overlay to close.</p>
              <Button label="Close" size="sm" onClick={() => setOpen(false)} />
            </div>
          </Drawer>
        </>
      );
    };
    return <Demo />;
  },
};

export const NonModal: Story = {
  name: 'Non-modal (no overlay)',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <Button label="Open Non-Modal" onClick={() => setOpen(true)} />
          <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>Page is still interactive behind the drawer.</p>
          <Drawer visible={open} onHide={() => setOpen(false)} header="Non-Modal" modal={false} position="right" size="sm">
            <p>No overlay. You can interact with the page.</p>
          </Drawer>
        </div>
      );
    };
    return <Demo />;
  },
};

export const DrawerInsideDialog: Story = {
  name: 'Drawer inside Dialog',
  render: () => {
    const Demo = () => {
      const [dialog, setDialog] = useState(false);
      const [drawer, setDrawer] = useState(false);
      return (
        <>
          <Button label="Open Dialog" onClick={() => setDialog(true)} />
          <Dialog visible={dialog} onHide={() => setDialog(false)} header="Main Dialog" size="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p>Open a drawer from inside a dialog — z-index stacks correctly.</p>
              <Button label="Open Drawer" severity="info" size="sm" onClick={() => setDrawer(true)} />
            </div>
            <Drawer visible={drawer} onHide={() => setDrawer(false)} header="Nested Drawer" position="right" size="sm">
              <p>This drawer renders above the dialog.</p>
              <Select label="Country" options={countries} filterable fullWidth />
            </Drawer>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};

export const SpanishLocale: Story = {
  name: 'Locale — Spanish',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <KreatiProvider locale={es}>
          <Button label="Abrir" onClick={() => setOpen(true)} />
          <Drawer visible={open} onHide={() => setOpen(false)} header="Configuracion">
            <p>El boton de cerrar usa el locale en espanol.</p>
          </Drawer>
        </KreatiProvider>
      );
    };
    return <Demo />;
  },
};
