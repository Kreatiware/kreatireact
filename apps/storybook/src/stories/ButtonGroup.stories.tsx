import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ButtonGroup } from '../../../../packages/react/src/components/ButtonGroup';
import { Button } from '../../../../packages/react/src/components/Button';
import { ToggleButton } from '../../../../packages/react/src/components/ToggleButton';

const meta = {
  title: 'Components/ButtonGroup',
  component: ButtonGroup,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic horizontal group of Buttons. */
export const Default: Story = {
  args: {} as any,
  render: () => (
    <ButtonGroup>
      <Button>Left</Button>
      <Button>Center</Button>
      <Button>Right</Button>
    </ButtonGroup>
  ),
};

/** Outlined buttons grouped. */
export const Outlined: Story = {
  args: {} as any,
  render: () => (
    <ButtonGroup>
      <Button buttonType="outlined">Cut</Button>
      <Button buttonType="outlined">Copy</Button>
      <Button buttonType="outlined">Paste</Button>
    </ButtonGroup>
  ),
};

/** Different severities in a group. */
export const MixedSeverities: Story = {
  args: {} as any,
  render: () => (
    <ButtonGroup>
      <Button severity="success">Approve</Button>
      <Button severity="warning">Review</Button>
      <Button severity="danger">Reject</Button>
    </ButtonGroup>
  ),
};

/** Vertical orientation. */
export const Vertical: Story = {
  args: {} as any,
  render: () => (
    <ButtonGroup orientation="vertical">
      <Button buttonType="outlined">Top</Button>
      <Button buttonType="outlined">Middle</Button>
      <Button buttonType="outlined">Bottom</Button>
    </ButtonGroup>
  ),
};

/** Group size override — all children inherit the group size. */
export const Sizes: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'start' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <ButtonGroup key={s} size={s}>
          <Button buttonType="outlined">{s.toUpperCase()}</Button>
          <Button buttonType="outlined">A</Button>
          <Button buttonType="outlined">B</Button>
        </ButtonGroup>
      ))}
    </div>
  ),
};

/** ToggleButtons in a group — exclusive selection (radio-like). */
export const ToggleExclusive: Story = {
  args: {} as any,
  render: () => {
    const [active, setActive] = useState('left');
    return (
      <ButtonGroup>
        {['Left', 'Center', 'Right'].map((val) => (
          <ToggleButton key={val} value={val} active={active === val} onClick={() => setActive(val)} label={val} />
        ))}
      </ButtonGroup>
    );
  },
};

/** ToggleButtons — multiple selection. */
export const ToggleMultiple: Story = {
  args: {} as any,
  render: () => {
    const [selected, setSelected] = useState<Set<string>>(new Set(['bold']));
    const toggle = (val: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        next.has(val) ? next.delete(val) : next.add(val);
        return next;
      });
    };
    return (
      <ButtonGroup>
        <ToggleButton value="bold" active={selected.has('bold')} onClick={() => toggle('bold')} label="B" />
        <ToggleButton value="italic" active={selected.has('italic')} onClick={() => toggle('italic')} label="I" />
        <ToggleButton value="underline" active={selected.has('underline')} onClick={() => toggle('underline')} label="U" />
      </ButtonGroup>
    );
  },
};

/** Mixed: regular Buttons and ToggleButtons in the same group. */
export const Mixed: Story = {
  args: {} as any,
  render: () => {
    const [bold, setBold] = useState(false);
    return (
      <ButtonGroup>
        <Button buttonType="outlined" disabled>Save</Button>
        <Button buttonType="outlined">Undo</Button>
        <ToggleButton value="bold" active={bold} onClick={() => setBold(!bold)} label="B" />
      </ButtonGroup>
    );
  },
};

/** Disabled group. */
export const Disabled: Story = {
  args: {} as any,
  render: () => (
    <ButtonGroup disabled>
      <Button>A</Button>
      <Button>B</Button>
      <Button>C</Button>
    </ButtonGroup>
  ),
};
