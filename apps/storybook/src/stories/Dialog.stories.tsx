import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { Button } from '../../../../packages/react/src/components/Button';
import { Input } from '../../../../packages/react/src/components/Input';
import { Tooltip } from '../../../../packages/react/src/components/Tooltip';
import { Select } from '../../../../packages/react/src/components/Select';
import { MultiSelect } from '../../../../packages/react/src/components/MultiSelect';
import { Calendar } from '../../../../packages/react/src/components/Calendar';
import { Popover } from '../../../../packages/react/src/components/Popover';
import { KreatiProvider } from '../../../../packages/react/src/locale';
import { es } from '../../../../packages/react/src/locale/es';

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  parameters: { layout: 'centered', docs: { description: { component: 'Modal dialog with dialog/confirm variants, customizable header/body/footer, positions, maximizable, responsive, focus trap, and full ARIA support.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ padding: 24 }}><Story /></div>],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

const countries = [
  { label: 'Argentina', value: 'ar' },
  { label: 'Chile', value: 'cl' },
  { label: 'Colombia', value: 'co' },
  { label: 'Mexico', value: 'mx' },
  { label: 'Peru', value: 'pe' },
];

const tags = [
  { label: 'Frontend', value: 'frontend' },
  { label: 'Backend', value: 'backend' },
  { label: 'Design', value: 'design' },
  { label: 'DevOps', value: 'devops' },
];

export const Basic: Story = {
  name: 'Basic dialog',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Dialog" onClick={() => setOpen(true)} />
          <Dialog visible={open} onHide={() => setOpen(false)} header="Settings">
            <p>This is a basic dialog with a header and body content.</p>
          </Dialog>
        </>
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
          <Button label="Open" onClick={() => setOpen(true)} />
          <Dialog visible={open} onHide={() => setOpen(false)} header="Edit Profile"
            footer={<><Button label="Cancel" buttonType="text" severity="secondary" size="sm" onClick={() => setOpen(false)} /><Button label="Save" size="sm" onClick={() => setOpen(false)} /></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Name" size="md" fullWidth />
              <Input label="Email" type="email" size="md" fullWidth />
            </div>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};

export const Confirm: Story = {
  name: 'Confirm variant',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      const [result, setResult] = useState('');
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Button label="Delete Item" severity="danger" onClick={() => setOpen(true)} />
          <Dialog variant="confirm" visible={open} onHide={() => setOpen(false)}
            message="Are you sure you want to delete this item? This action cannot be undone."
            acceptSeverity="danger" acceptLabel="Delete" size="sm"
            onAccept={() => setResult('Deleted')} onReject={() => setResult('Cancelled')} />
          {result && <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{result}</span>}
        </div>
      );
    };
    return <Demo />;
  },
};

export const AllOverlaysInDialog: Story = {
  name: 'All overlays inside Dialog',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Form Dialog" onClick={() => setOpen(true)} />
          <Dialog visible={open} onHide={() => setOpen(false)} header="All Overlay Components" size="md"
            footer={<><Button label="Cancel" buttonType="text" severity="secondary" size="sm" onClick={() => setOpen(false)} /><Button label="Save" size="sm" onClick={() => setOpen(false)} /></>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input label="Name" size="md" fullWidth />
              <Select label="Country" options={countries} filterable fullWidth />
              <MultiSelect label="Skills" options={tags} filterable fullWidth />
              <Calendar label="Start Date" size="md" fullWidth showButtonBar />
              <div style={{ display: 'flex', gap: 8 }}>
                <Popover variant="confirm" message="Save before closing?" onAccept={() => {}} onReject={() => {}}>
                  <Button label="Confirm Popover" severity="warning" size="sm" />
                </Popover>
                <Popover content={<div style={{ padding: 12 }}>Regular popover content</div>}>
                  <Button label="Regular Popover" size="sm" buttonType="text" />
                </Popover>
              </div>
            </div>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};

export const NestedDialogsWithOverlays: Story = {
  name: 'Nested dialogs (3 levels + overlays)',
  render: () => {
    const Demo = () => {
      const [d1, setD1] = useState(false);
      const [d2, setD2] = useState(false);
      const [d3, setD3] = useState(false);
      return (
        <>
          <Button label="Open Level 1" onClick={() => setD1(true)} />
          <Dialog visible={d1} onHide={() => setD1(false)} header="Level 1" size="lg">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p>First dialog. Select and Popover should render above this overlay.</p>
              <Select label="Country (L1)" options={countries} filterable fullWidth />
              <div style={{ display: 'flex', gap: 8 }}>
                <Button label="Open Level 2" severity="info" size="sm" onClick={() => setD2(true)} />
                <Popover variant="confirm" message="Action in Level 1?" onAccept={() => {}}>
                  <Button label="Confirm (L1)" severity="warning" size="sm" />
                </Popover>
              </div>
            </div>
            <Dialog visible={d2} onHide={() => setD2(false)} header="Level 2" size="md">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p>Second dialog. Its overlays should be above Level 1.</p>
                <MultiSelect label="Tags (L2)" options={tags} filterable fullWidth />
                <Calendar label="Date (L2)" size="md" fullWidth showButtonBar />
                <Button label="Open Level 3" severity="help" size="sm" onClick={() => setD3(true)} />
              </div>
              <Dialog variant="confirm" visible={d3} onHide={() => setD3(false)}
                message="This is Level 3. Everything should stack correctly." size="sm"
                onAccept={() => setD3(false)} />
            </Dialog>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};

export const Sizes: Story = {
  name: 'All sizes',
  render: () => {
    const Demo = () => {
      const [s, setS] = useState<string | null>(null);
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((sz) => (
            <React.Fragment key={sz}>
              <Button label={sz.toUpperCase()} size="sm" onClick={() => setS(sz)} />
              <Dialog visible={s === sz} onHide={() => setS(null)} header={`Size ${sz.toUpperCase()}`} size={sz}>
                <p>Dialog at size {sz}.</p>
              </Dialog>
            </React.Fragment>
          ))}
        </div>
      );
    };
    return <Demo />;
  },
};

export const Positions: Story = {
  name: 'Positions',
  render: () => {
    const Demo = () => {
      const [pos, setPos] = useState<string | null>(null);
      const positions = ['center', 'top', 'bottom', 'left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;
      return (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {positions.map((p) => (
            <React.Fragment key={p}>
              <Button label={p} size="sm" buttonType="text" onClick={() => setPos(p)} />
              <Dialog visible={pos === p} onHide={() => setPos(null)} header={p} position={p} size="xs">
                <p>Positioned at {p}.</p>
              </Dialog>
            </React.Fragment>
          ))}
        </div>
      );
    };
    return <Demo />;
  },
};

export const Maximizable: Story = {
  name: 'Maximizable',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Maximizable" onClick={() => setOpen(true)} />
          <Dialog visible={open} onHide={() => setOpen(false)} header="Maximizable Dialog" maximizable>
            <p>Click the maximize button in the header to expand.</p>
          </Dialog>
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
          <Dialog visible={open} onHide={() => setOpen(false)} variant="confirm"
            header="Custom Header" message="Custom templates override the default layout." onAccept={() => {}}
            headerTemplate={({ title, close }) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span style={{ fontWeight: 700, color: '#0f78a5' }}>{title}</span>
                <Button label="X" buttonType="text" severity="danger" slim size="sm" onClick={close} />
              </div>
            )}
            footerTemplate={({ accept, reject }) => (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', width: '100%' }}>
                <Button label="Nope" buttonType="text" severity="secondary" size="sm" onClick={reject} />
                <Button label="Yep!" size="sm" onClick={accept} />
              </div>
            )}
          />
        </>
      );
    };
    return <Demo />;
  },
};

export const SpanishConfirm: Story = {
  name: 'Locale \u2014 Spanish confirm',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <KreatiProvider locale={es}>
          <Button label="Abrir" onClick={() => setOpen(true)} />
          <Dialog variant="confirm" visible={open} onHide={() => setOpen(false)}
            message="Esta seguro de continuar con esta accion?" size="sm" onAccept={() => {}} />
        </KreatiProvider>
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
          <Dialog visible={open} onHide={() => setOpen(false)} closable={false} closeOnOverlay size="sm">
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Welcome!</p>
              <p style={{ color: '#6b7280', marginBottom: 16 }}>Click outside to close.</p>
              <Button label="Got it" size="sm" onClick={() => setOpen(false)} />
            </div>
          </Dialog>
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
          <p style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>You can still interact with this text.</p>
          <Dialog visible={open} onHide={() => setOpen(false)} header="Non-Modal" modal={false} size="xs" position="top-right" blockScroll={false}>
            <p>No overlay. Page is still interactive.</p>
          </Dialog>
        </div>
      );
    };
    return <Demo />;
  },
};

export const TooltipsInsideDialogs: Story = {
  name: 'Tooltips inside nested dialogs',
  render: () => {
    const Demo = () => {
      const [d1, setD1] = useState(false);
      const [d2, setD2] = useState(false);
      return (
        <>
          <Button label="Open Level 1" onClick={() => setD1(true)} />
          <Dialog visible={d1} onHide={() => setD1(false)} header="Level 1 — Tooltips" size="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p>Tooltips should render above this dialog overlay.</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Tooltip content="Top tooltip in L1" position="top">
                  <Button label="Top" size="sm" />
                </Tooltip>
                <Tooltip content="Bottom tooltip in L1" position="bottom">
                  <Button label="Bottom" size="sm" />
                </Tooltip>
                <Tooltip content="Follows cursor in L1" mouseTrack>
                  <Button label="Mouse track" size="sm" buttonType="outlined" />
                </Tooltip>
              </div>
              <Button label="Open Level 2" severity="info" size="sm" onClick={() => setD2(true)} />
            </div>
            <Dialog visible={d2} onHide={() => setD2(false)} header="Level 2 — Tooltips" size="sm">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p>These tooltips should render above Level 2.</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Tooltip content="L2 tooltip" position="top">
                    <Button label="Hover me" size="sm" />
                  </Tooltip>
                  <Tooltip content="Auto-hides in 2s" position="bottom" autoHide={2000}>
                    <Button label="Auto-hide" size="sm" severity="warning" />
                  </Tooltip>
                </div>
              </div>
            </Dialog>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};

export const FullOverlayStack: Story = {
  name: 'Full overlay stack (Dialog + Select + Tooltip)',
  render: () => {
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Button label="Open Dialog" onClick={() => setOpen(true)} />
          <Dialog visible={open} onHide={() => setOpen(false)} header="All Overlays + Tooltips" size="md"
            footer={
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Tooltip content="Discard changes" position="top">
                  <Button label="Cancel" buttonType="text" severity="secondary" size="sm" onClick={() => setOpen(false)} />
                </Tooltip>
                <Tooltip content="Save and close" position="top">
                  <Button label="Save" size="sm" onClick={() => setOpen(false)} />
                </Tooltip>
              </div>
            }>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Tooltip content="Enter your full name" position="right">
                <Input label="Name" size="md" fullWidth />
              </Tooltip>
              <Select label="Country" options={countries} filterable fullWidth />
              <div style={{ display: 'flex', gap: 8 }}>
                <Tooltip content="Opens a nested confirm" position="top">
                  <Popover variant="confirm" message="Proceed?" onAccept={() => {}}>
                    <Button label="Confirm Popover" severity="warning" size="sm" />
                  </Popover>
                </Tooltip>
              </div>
            </div>
          </Dialog>
        </>
      );
    };
    return <Demo />;
  },
};
