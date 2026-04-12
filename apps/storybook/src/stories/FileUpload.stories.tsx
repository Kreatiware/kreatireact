import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FileUpload } from '../../../../packages/react/src/components/FileUpload';

const meta = {
  title: 'Components/FileUpload',
  component: FileUpload,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic single file upload. */
export const Default: Story = { args: { label: 'Upload file', style: { width: 400 } } };

/** Multiple images with size limit. */
export const MultipleWithLimits: Story = {
  args: {
    label: 'Images',
    accept: 'image/*',
    multiple: true,
    maxFileSize: 5242880,
    maxFiles: 3,
    helperText: 'Max 3 files, 5MB each',
    required: true,
    style: { width: 400 },
  },
};

/** Validation states: error and success. */
export const ValidationStates: Story = {
  args: {} as any,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <FileUpload label="Required file" error="Please upload at least one file" required style={{ width: 400 }} />
      <FileUpload label="Uploaded" success helperText="File accepted" style={{ width: 400 }} />
    </div>
  ),
};

/** Disabled state. */
export const Disabled: Story = { args: { label: 'Upload', disabled: true, style: { width: 400 } } };

/** Custom dropzone and file item templates. */
export const CustomTemplates: Story = {
  args: {} as any,
  render: () => (
    <FileUpload
      label="Profile photo"
      accept="image/*"
      maxFileSize={2097152}
      dropzoneTemplate={({ isDragging }) => (
        <div style={{ padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{isDragging ? '!' : '+'}</div>
          <div style={{ fontWeight: 600 }}>{isDragging ? 'Drop it here' : 'Upload your photo'}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>JPG, PNG or GIF, max 2MB</div>
        </div>
      )}
      fileTemplate={(file, onRemove) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f0f9ff', borderRadius: 6, fontSize: 13 }}>
          <span style={{ flex: 1, fontWeight: 500 }}>{file.name}</span>
          <span style={{ color: '#6b7280', fontSize: 11 }}>{(file.size / 1024).toFixed(0)} KB</span>
          <button onClick={onRemove} type="button" style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 600 }} aria-label={`Remove ${file.name}`}>Remove</button>
        </div>
      )}
      style={{ width: 400 }}
    />
  ),
};

/** Full width mode. */
export const FullWidth: Story = {
  args: { label: 'Attachments', multiple: true, fullWidth: true, helperText: 'Drag files here or click to browse' },
};
