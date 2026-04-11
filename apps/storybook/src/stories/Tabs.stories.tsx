import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabPanel } from '../../../../packages/react/src/components/Tabs';
import { Button } from '../../../../packages/react/src/components/Button';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Combines TabMenu navigation with TabPanel content areas. Tab items are generated automatically from TabPanel children. Supports controlled and uncontrolled modes.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic tabs with three panels. */
export const Default: Story = {
  render: () => (
    <Tabs defaultActiveKey="home" style={{ width: 500 }}>
      <TabPanel tabKey="home" header="Home">
        <p style={{ margin: 0 }}>Welcome to the home panel.</p>
      </TabPanel>
      <TabPanel tabKey="profile" header="Profile">
        <p style={{ margin: 0 }}>Your profile information goes here.</p>
      </TabPanel>
      <TabPanel tabKey="settings" header="Settings">
        <p style={{ margin: 0 }}>Application settings and preferences.</p>
      </TabPanel>
    </Tabs>
  ),
};

/** Tabs with icons. */
export const WithIcons: Story = {
  render: () => (
    <Tabs defaultActiveKey="search" style={{ width: 500 }}>
      <TabPanel tabKey="search" header="Search" icon="search">
        <p style={{ margin: 0 }}>Search results panel.</p>
      </TabPanel>
      <TabPanel tabKey="calendar" header="Calendar" icon="calendar">
        <p style={{ margin: 0 }}>Calendar view panel.</p>
      </TabPanel>
    </Tabs>
  ),
};

/** A disabled tab cannot be selected. */
export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultActiveKey="active" style={{ width: 500 }}>
      <TabPanel tabKey="active" header="Active">
        <p style={{ margin: 0 }}>This tab works normally.</p>
      </TabPanel>
      <TabPanel tabKey="disabled" header="Disabled" disabled>
        <p style={{ margin: 0 }}>Unreachable content.</p>
      </TabPanel>
      <TabPanel tabKey="other" header="Other">
        <p style={{ margin: 0 }}>Another active tab.</p>
      </TabPanel>
    </Tabs>
  ),
};

/** Controlled mode — state managed externally. */
export const Controlled: Story = {
  render: () => {
    const [active, setActive] = useState('first');
    return (
      <div style={{ width: 500, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button label="Go to First" size="sm" onClick={() => setActive('first')} />
          <Button label="Go to Third" size="sm" buttonType="outlined" onClick={() => setActive('third')} />
        </div>
        <Tabs activeKey={active} onTabChange={setActive}>
          <TabPanel tabKey="first" header="First">
            <p style={{ margin: 0 }}>First panel content.</p>
          </TabPanel>
          <TabPanel tabKey="second" header="Second">
            <p style={{ margin: 0 }}>Second panel content.</p>
          </TabPanel>
          <TabPanel tabKey="third" header="Third">
            <p style={{ margin: 0 }}>Third panel content.</p>
          </TabPanel>
        </Tabs>
      </div>
    );
  },
};

/** Rich content inside panels. */
export const RichContent: Story = {
  render: () => (
    <Tabs defaultActiveKey="overview" style={{ width: 500 }}>
      <TabPanel tabKey="overview" header="Overview">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h3 style={{ margin: 0 }}>Project Overview</h3>
          <p style={{ margin: 0 }}>This panel contains structured content with headings and actions.</p>
          <Button label="View Details" size="sm" />
        </div>
      </TabPanel>
      <TabPanel tabKey="activity" header="Activity">
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Task completed — 2 hours ago</li>
          <li>Comment added — 5 hours ago</li>
          <li>File uploaded — yesterday</li>
        </ul>
      </TabPanel>
    </Tabs>
  ),
};
