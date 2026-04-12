import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionTab } from '../../../../packages/react/src/components/Accordion';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A set of collapsible panels where one or multiple can be open at a time. Uses Panel internally with connected borders. Supports controlled and uncontrolled modes.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single mode — only one tab open at a time. */
export const Default: Story = {
  args: {} as any,
  render: () => (
    <Accordion defaultActiveKeys={['a']} style={{ width: 450 }}>
      <AccordionTab tabKey="a" header="Section 1">
        <p style={{ margin: 0 }}>Content for the first section.</p>
      </AccordionTab>
      <AccordionTab tabKey="b" header="Section 2">
        <p style={{ margin: 0 }}>Content for the second section.</p>
      </AccordionTab>
      <AccordionTab tabKey="c" header="Section 3">
        <p style={{ margin: 0 }}>Content for the third section.</p>
      </AccordionTab>
    </Accordion>
  ),
};

/** Multiple tabs can be open simultaneously. */
export const Multiple: Story = {
  args: {} as any,
  render: () => (
    <Accordion multiple defaultActiveKeys={['a', 'c']} style={{ width: 450 }}>
      <AccordionTab tabKey="a" header="First">
        <p style={{ margin: 0 }}>This tab starts open.</p>
      </AccordionTab>
      <AccordionTab tabKey="b" header="Second">
        <p style={{ margin: 0 }}>This tab starts closed.</p>
      </AccordionTab>
      <AccordionTab tabKey="c" header="Third">
        <p style={{ margin: 0 }}>This tab also starts open.</p>
      </AccordionTab>
    </Accordion>
  ),
};

/** Controlled mode — state managed externally. */
export const Controlled: Story = {
  args: {} as any,
  render: () => {
    const [keys, setKeys] = useState<string[]>(['a']);
    return (
      <div style={{ width: 450, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button label="Open All" size="sm" onClick={() => setKeys(['a', 'b', 'c'])} />
          <Button label="Close All" size="sm" buttonType="outlined" onClick={() => setKeys([])} />
        </div>
        <Accordion multiple activeKeys={keys} onToggle={setKeys}>
          <AccordionTab tabKey="a" header="Section A">
            <p style={{ margin: 0 }}>Controlled content A.</p>
          </AccordionTab>
          <AccordionTab tabKey="b" header="Section B">
            <p style={{ margin: 0 }}>Controlled content B.</p>
          </AccordionTab>
          <AccordionTab tabKey="c" header="Section C">
            <p style={{ margin: 0 }}>Controlled content C.</p>
          </AccordionTab>
        </Accordion>
      </div>
    );
  },
};

/** A disabled tab cannot be toggled. */
export const DisabledTab: Story = {
  args: {} as any,
  render: () => (
    <Accordion defaultActiveKeys={['a']} style={{ width: 450 }}>
      <AccordionTab tabKey="a" header="Enabled">
        <p style={{ margin: 0 }}>This tab works normally.</p>
      </AccordionTab>
      <AccordionTab tabKey="b" header="Disabled Tab" disabled>
        <p style={{ margin: 0 }}>This content is not reachable.</p>
      </AccordionTab>
      <AccordionTab tabKey="c" header="Also Enabled">
        <p style={{ margin: 0 }}>This tab works too.</p>
      </AccordionTab>
    </Accordion>
  ),
};

/** Custom header template on a tab. */
export const CustomHeader: Story = {
  args: {} as any,
  render: () => (
    <Accordion defaultActiveKeys={['a']} style={{ width: 450 }}>
      <AccordionTab
        tabKey="a"
        headerTemplate={(collapsed, toggle) => (
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, cursor: 'pointer', background: 'var(--kreati-primary-50)' }}
            onClick={toggle}
          >
            <span style={{ fontWeight: 700, color: 'var(--kreati-primary-500)' }}>Custom Header</span>
            <Button label={collapsed ? 'Expand' : 'Collapse'} size="sm" buttonType="outlined" onClick={(e) => { e.stopPropagation(); toggle(); }} />
          </div>
        )}
      >
        <p style={{ margin: 0 }}>Content with a fully custom header.</p>
      </AccordionTab>
      <AccordionTab tabKey="b" header="Standard Header">
        <p style={{ margin: 0 }}>Regular tab for comparison.</p>
      </AccordionTab>
    </Accordion>
  ),
};
