import React, { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ToastContainer } from '../../../../packages/react/src/components/Toast';
import type { ToastContainerRef } from '../../../../packages/react/src/components/Toast';
import { Button } from '../../../../packages/react/src/components/Button';
import { Dialog } from '../../../../packages/react/src/components/Dialog';

const meta = {
  title: 'Components/Toast',
  component: ToastContainer,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Overlay notification toasts with severity colors, icons, progress bar, auto-dismiss, slide animations, and 6 screen positions. Use imperative ref API to show/remove/clear.' } } },
  tags: ['autodocs'],
} satisfies Meta<typeof ToastContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllSeverities: Story = {
  name: 'All Severities',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['primary', 'secondary', 'success', 'info', 'warning', 'help', 'danger'] as const).map((s) => (
            <Button key={s} size="sm" severity={s === 'primary' || s === 'secondary' || s === 'success' || s === 'info' || s === 'warning' || s === 'help' || s === 'danger' ? s : 'primary'} onClick={() => ref.current?.show({ severity: s, summary: `${s.charAt(0).toUpperCase() + s.slice(1)} Toast`, detail: `This is a ${s} notification.`, icon: true, sticky: false, life: 4000 })}>{s}</Button>
          ))}
        </div>
      </div>
    );
  },
};

export const Positions: Story = {
  name: 'All Positions',
  render: () => {
    const tr = useRef<ToastContainerRef>(null);
    const tl = useRef<ToastContainerRef>(null);
    const tc = useRef<ToastContainerRef>(null);
    const br = useRef<ToastContainerRef>(null);
    const bl = useRef<ToastContainerRef>(null);
    const bc = useRef<ToastContainerRef>(null);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={tr} position="top-right" />
        <ToastContainer ref={tl} position="top-left" />
        <ToastContainer ref={tc} position="top-center" />
        <ToastContainer ref={br} position="bottom-right" />
        <ToastContainer ref={bl} position="bottom-left" />
        <ToastContainer ref={bc} position="bottom-center" />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="sm" onClick={() => tr.current?.show({ severity: 'info', summary: 'Top Right', detail: 'Slides from right', icon: true, sticky: false })}>Top Right</Button>
          <Button size="sm" onClick={() => tl.current?.show({ severity: 'success', summary: 'Top Left', detail: 'Slides from left', icon: true, sticky: false })}>Top Left</Button>
          <Button size="sm" onClick={() => tc.current?.show({ severity: 'warning', summary: 'Top Center', detail: 'Slides from top', icon: true, sticky: false })}>Top Center</Button>
          <Button size="sm" onClick={() => br.current?.show({ severity: 'danger', summary: 'Bottom Right', detail: 'Slides from right', icon: true, sticky: false })}>Bottom Right</Button>
          <Button size="sm" onClick={() => bl.current?.show({ severity: 'help', summary: 'Bottom Left', detail: 'Slides from left', icon: true, sticky: false })}>Bottom Left</Button>
          <Button size="sm" onClick={() => bc.current?.show({ severity: 'primary', summary: 'Bottom Center', detail: 'Slides from top', icon: true, sticky: false })}>Bottom Center</Button>
        </div>
      </div>
    );
  },
};

export const StickyVsAutoDismiss: Story = {
  name: 'Sticky vs Auto-Dismiss',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" severity="info" onClick={() => ref.current?.show({ severity: 'info', summary: 'Sticky', detail: 'This stays until you close it.', icon: true, sticky: true })}>Sticky</Button>
          <Button size="sm" severity="success" onClick={() => ref.current?.show({ severity: 'success', summary: 'Auto-dismiss (3s)', detail: 'Watch the progress bar.', icon: true, sticky: false, life: 3000, showProgress: true })}>3s + Progress</Button>
          <Button size="sm" severity="warning" onClick={() => ref.current?.show({ severity: 'warning', summary: 'Auto-dismiss (6s)', detail: 'Longer duration, no progress bar.', icon: true, sticky: false, life: 6000 })}>6s No Progress</Button>
        </div>
      </div>
    );
  },
};

export const CustomTemplate: Story = {
  name: 'Custom Content Template',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <Button size="sm" severity="primary" onClick={() => ref.current?.show({
          severity: 'primary',
          sticky: true,
          contentTemplate: ({ onClose }) => (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{'\u{1F389}'}</span>
                <div>
                  <div style={{ fontWeight: 600 }}>New version available!</div>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>v2.4.0 includes performance improvements.</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button size="xs" severity="secondary" buttonType="text" onClick={onClose}>Later</Button>
                <Button size="xs" severity="primary" onClick={onClose}>Update now</Button>
              </div>
            </div>
          ),
        })}>Show Custom Toast</Button>
      </div>
    );
  },
};

export const CustomIcon: Story = {
  name: 'Custom Icon',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <Button size="sm" onClick={() => ref.current?.show({ severity: 'success', summary: 'Deployed!', detail: 'Production build is live.', icon: <span style={{ fontSize: 20 }}>{'\u{1F680}'}</span>, sticky: false, life: 4000 })}>Custom Icon</Button>
      </div>
    );
  },
};

export const OverDialog: Story = {
  name: 'Toast over Dialog',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <Button onClick={() => setOpen(true)}>Open Dialog</Button>
        <Dialog visible={open} onHide={() => setOpen(false)} header="Dialog with Toast" style={{ width: 400 }}>
          <p style={{ marginBottom: 12 }}>Toasts appear above this dialog.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" severity="success" onClick={() => ref.current?.show({ severity: 'success', summary: 'From Dialog', detail: 'This toast was triggered inside a dialog.', icon: true, sticky: false })}>Success Toast</Button>
            <Button size="sm" severity="danger" onClick={() => ref.current?.show({ severity: 'danger', summary: 'Error', detail: 'Something went wrong.', icon: true, sticky: false })}>Error Toast</Button>
          </div>
        </Dialog>
      </div>
    );
  },
};

export const NestedDialogsWithToasts: Story = {
  name: 'Nested Dialogs + Toasts',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    const [d1, setD1] = useState(false);
    const [d2, setD2] = useState(false);
    const [d3, setD3] = useState(false);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <Button onClick={() => setD1(true)}>Open Dialog 1</Button>
        <Dialog visible={d1} onHide={() => setD1(false)} header="Dialog Level 1" style={{ width: 450 }}>
          <p style={{ marginBottom: 12 }}>First level dialog. Toasts render above all dialogs.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="sm" severity="info" onClick={() => ref.current?.show({ severity: 'info', summary: 'Level 1', detail: 'Toast from dialog 1', icon: true, sticky: false })}>Toast from L1</Button>
            <Button size="sm" onClick={() => setD2(true)}>Open Dialog 2</Button>
          </div>
          <Dialog visible={d2} onHide={() => setD2(false)} header="Dialog Level 2" style={{ width: 380 }}>
            <p style={{ marginBottom: 12 }}>Second level dialog.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="sm" severity="warning" onClick={() => ref.current?.show({ severity: 'warning', summary: 'Level 2', detail: 'Toast from dialog 2', icon: true, sticky: false })}>Toast from L2</Button>
              <Button size="sm" onClick={() => setD3(true)}>Open Dialog 3</Button>
            </div>
            <Dialog visible={d3} onHide={() => setD3(false)} header="Dialog Level 3" style={{ width: 320 }}>
              <p style={{ marginBottom: 12 }}>Third level. Toasts still on top.</p>
              <Button size="sm" severity="danger" onClick={() => ref.current?.show({ severity: 'danger', summary: 'Level 3', detail: 'Toast from the deepest dialog', icon: true, sticky: false, showProgress: true, life: 5000 })}>Toast from L3</Button>
            </Dialog>
          </Dialog>
        </Dialog>
      </div>
    );
  },
};

export const StackMultiple: Story = {
  name: 'Stack Multiple (scroll test)',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    let i = 0;
    const severities = ['success', 'info', 'warning', 'danger', 'help', 'primary'] as const;
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="sm" severity="info" onClick={() => {
            ref.current?.show({ severity: severities[i % severities.length], summary: `Toast #${++i}`, detail: 'Stacked notification. Keep clicking to fill the screen.', icon: true, sticky: true });
          }}>Add Sticky Toast</Button>
          <Button size="sm" severity="warning" onClick={() => {
            for (let j = 0; j < 10; j++) {
              ref.current?.show({ severity: severities[(i + j) % severities.length], summary: `Batch #${++i}`, detail: 'Batch generated toast.', icon: true, sticky: true });
            }
          }}>Add 10 at once</Button>
          <Button size="sm" severity="secondary" buttonType="outlined" onClick={() => ref.current?.clear()}>Clear All</Button>
        </div>
      </div>
    );
  },
};

export const NoCloseButton: Story = {
  name: 'No Close Button',
  render: () => {
    const ref = useRef<ToastContainerRef>(null);
    return (
      <div style={{ padding: 24 }}>
        <ToastContainer ref={ref} position="top-right" />
        <Button size="sm" onClick={() => ref.current?.show({ severity: 'info', summary: 'Info', detail: 'This toast has no close button. It auto-dismisses.', icon: true, closable: false, sticky: false, life: 4000 })}>No Close</Button>
      </div>
    );
  },
};
