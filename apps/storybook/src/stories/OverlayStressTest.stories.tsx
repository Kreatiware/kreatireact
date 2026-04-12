import React, { useState, useRef, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { Drawer } from '../../../../packages/react/src/components/Drawer';
import { Button } from '../../../../packages/react/src/components/Button';
import { Select } from '../../../../packages/react/src/components/Select';
import { MultiSelect } from '../../../../packages/react/src/components/MultiSelect';
import { AutoComplete } from '../../../../packages/react/src/components/AutoComplete';
import type { AutoCompleteItem } from '../../../../packages/react/src/components/AutoComplete';
import { TreeSelect } from '../../../../packages/react/src/components/TreeSelect';
import type { TreeNode } from '../../../../packages/react/src/components/Tree';
import { Popover } from '../../../../packages/react/src/components/Popover';
import { Tooltip } from '../../../../packages/react/src/components/Tooltip';
import { ToastContainer } from '../../../../packages/react/src/components/Toast';
import type { ToastContainerRef } from '../../../../packages/react/src/components/Toast';

const selectOptions = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
];

const multiOptions = [
  { value: 'ts', label: 'TypeScript' },
  { value: 'js', label: 'JavaScript' },
  { value: 'py', label: 'Python' },
  { value: 'rs', label: 'Rust' },
  { value: 'go', label: 'Go' },
];

const acItems: AutoCompleteItem[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'us', label: 'United States' },
];

const treeNodes: TreeNode[] = [
  { key: 'electronics', label: 'Electronics', children: [
    { key: 'phones', label: 'Phones' },
    { key: 'laptops', label: 'Laptops' },
  ]},
  { key: 'clothing', label: 'Clothing', children: [
    { key: 'men', label: 'Men' },
    { key: 'women', label: 'Women' },
  ]},
  { key: 'books', label: 'Books' },
];

const meta = {
  title: 'Tests/Overlay Stress Test',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Stress test for ALL overlay components nested inside 3+ levels of Dialogs. Verifies z-index stacking via LayerContext. Every overlay (Select, MultiSelect, AutoComplete, TreeSelect, Popover, Tooltip, Toast, Drawer) must render above its parent Dialog.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

/**
 * Full overlay stress test — 3 nested Dialogs, each containing:
 * Select, MultiSelect, AutoComplete (single + multiple), TreeSelect,
 * Popover, Tooltip. Plus Toast and Drawer triggered from the deepest level.
 */
export const NestedDialogsAllOverlays: Story = {
  render: () => {
    const [d1, setD1] = useState(false);
    const [d2, setD2] = useState(false);
    const [d3, setD3] = useState(false);
    const [drawer, setDrawer] = useState(false);
    const toast = useRef<ToastContainerRef>(null);

    const [acSuggestions, setAcSuggestions] = useState<AutoCompleteItem[]>([]);
    const searchAc = useCallback((q: string) => {
      setAcSuggestions(acItems.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())));
    }, []);

    const OverlaySet = ({ level }: { level: number }) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Select options={selectOptions} label={`Select L${level}`} placeholder="Pick one..." fullWidth />
        <MultiSelect options={multiOptions} label={`MultiSelect L${level}`} placeholder="Pick many..." fullWidth />
        <AutoComplete label={`AutoComplete L${level}`} suggestions={acSuggestions} onSearch={searchAc} placeholder="Type to search..." fullWidth />
        <AutoComplete label={`AC Multiple L${level}`} suggestions={acSuggestions} onSearch={searchAc} multiple placeholder="Add items..." fullWidth />
        <TreeSelect nodes={treeNodes} label={`TreeSelect L${level}`} placeholder="Select category..." fullWidth />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Popover content={<div style={{ padding: 8 }}>Popover content at level {level}</div>}>
            <Button size="sm" buttonType="outlined">Popover L{level}</Button>
          </Popover>
          <Popover variant="confirm" message={`Confirm action at level ${level}?`} onAccept={() => {}} onReject={() => {}}>
            <Button size="sm" buttonType="outlined" severity="warning">Confirm L{level}</Button>
          </Popover>
          <Tooltip content={`Tooltip at level ${level}`}>
            <Button size="sm" buttonType="outlined">Hover for Tooltip</Button>
          </Tooltip>
        </div>
      </div>
    );

    return (
      <div>
        <ToastContainer ref={toast} position="top-right" />
        <Button onClick={() => setD1(true)}>Open Dialog Level 1</Button>

        <Dialog visible={d1} onHide={() => setD1(false)} header="Level 1 — Dialog" style={{ width: 520 }}>
          <OverlaySet level={1} />
          <Button onClick={() => setD2(true)} style={{ marginTop: 12 }} severity="info">Open Level 2</Button>

          <Dialog visible={d2} onHide={() => setD2(false)} header="Level 2 — Nested Dialog" style={{ width: 480 }}>
            <OverlaySet level={2} />
            <Button onClick={() => setD3(true)} style={{ marginTop: 12 }} severity="warning">Open Level 3</Button>

            <Dialog visible={d3} onHide={() => setD3(false)} header="Level 3 — Deep Nested" style={{ width: 440 }}>
              <OverlaySet level={3} />
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Button
                  severity="success"
                  size="sm"
                  onClick={() => toast.current?.show({ severity: 'success', summary: 'Toast from L3', detail: 'This toast should appear above all dialogs.', life: 4000 })}
                >
                  Show Toast
                </Button>
                <Button severity="help" size="sm" onClick={() => setDrawer(true)}>Open Drawer</Button>
              </div>
              <Drawer visible={drawer} onHide={() => setDrawer(false)} header="Drawer from Level 3" position="right" size="sm">
                <p>This Drawer was opened from inside 3 nested Dialogs.</p>
                <Select options={selectOptions} label="Select inside Drawer" placeholder="Pick..." fullWidth />
                <AutoComplete label="AC inside Drawer" suggestions={acSuggestions} onSearch={searchAc} placeholder="Type..." fullWidth style={{ marginTop: 12 }} />
              </Drawer>
            </Dialog>
          </Dialog>
        </Dialog>
      </div>
    );
  },
};
