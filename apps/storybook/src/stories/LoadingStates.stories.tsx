import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../../../packages/react/src/components/Button';
import { Input } from '../../../../packages/react/src/components/Input';
import { Select } from '../../../../packages/react/src/components/Select';
import { MultiSelect } from '../../../../packages/react/src/components/MultiSelect';
import { FileUpload } from '../../../../packages/react/src/components/FileUpload';
import { Dialog } from '../../../../packages/react/src/components/Dialog';

const meta = {
  title: 'Patterns/Loading States',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Loading states across components. Each component supports a `loading` prop that shows a spinner and disables interaction.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const ButtonLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
      <Button label="Save" severity="primary" loading />
      <Button label="Delete" severity="danger" loading />
      <Button label="Submit" severity="success" buttonType="outlined" loading />
      <Button label="Send" severity="info" buttonType="text" loading />
      <Button label="Normal" severity="primary" />
    </div>
  ),
};

export const ButtonLoadingSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button label="XS" size="xs" loading />
      <Button label="SM" size="sm" loading />
      <Button label="MD" size="md" loading />
      <Button label="LG" size="lg" loading />
      <Button label="XL" size="xl" loading />
    </div>
  ),
};

export const ButtonToggleLoading: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    const handleClick = () => {
      setLoading(true);
      setTimeout(() => setLoading(false), 2000);
    };
    return (
      <Button
        label={loading ? 'Saving...' : 'Save'}
        severity="primary"
        loading={loading}
        onClick={handleClick}
      />
    );
  },
};

export const InputLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
      <Input label="Username" placeholder="Check availability..." loading />
      <Input label="Normal" placeholder="Not loading" />
    </div>
  ),
};

export const SelectLoading: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
      <Select
        label="Country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'mx', label: 'Mexico' },
        ]}
        loading
        placeholder="Loading options..."
      />
      <Select
        label="Normal"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'mx', label: 'Mexico' },
        ]}
        placeholder="Select a country"
      />
    </div>
  ),
};

export const MultiSelectLoading: Story = {
  render: () => (
    <div style={{ width: 300 }}>
      <MultiSelect
        label="Tags"
        options={[
          { value: 'react', label: 'React' },
          { value: 'vue', label: 'Vue' },
        ]}
        loading
        placeholder="Loading tags..."
      />
    </div>
  ),
};

export const FileUploadLoading: Story = {
  render: () => (
    <div style={{ width: 400 }}>
      <FileUpload label="Documents" loading />
    </div>
  ),
};

export const DialogLoading: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const handleSave = () => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setVisible(false);
      }, 2500);
    };
    return (
      <>
        <Button label="Open Dialog" onClick={() => setVisible(true)} />
        <Dialog
          visible={visible}
          onHide={() => setVisible(false)}
          header="Edit Profile"
          loading={loading}
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button label="Cancel" buttonType="text" severity="secondary" onClick={() => setVisible(false)} />
              <Button label="Save" severity="primary" onClick={handleSave} />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Name" defaultValue="John Doe" />
            <Input label="Email" defaultValue="john@example.com" />
          </div>
        </Dialog>
      </>
    );
  },
};

export const DialogConfirmLoading: Story = {
  render: () => {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    return (
      <>
        <Button label="Delete Item" severity="danger" onClick={() => setVisible(true)} />
        <Dialog
          variant="confirm"
          visible={visible}
          onHide={() => { if (!loading) setVisible(false); }}
          message="Are you sure you want to delete this item? This action cannot be undone."
          acceptSeverity="danger"
          acceptLabel="Delete"
          onAccept={() => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setVisible(false);
            }, 2000);
          }}
          onReject={() => setVisible(false)}
          loading={loading}
        />
      </>
    );
  },
};
