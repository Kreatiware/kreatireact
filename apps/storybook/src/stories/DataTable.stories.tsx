import React, { useState, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from '../../../../packages/react/src/components/DataTable';
import type { DataTableRef, DataTableColumn, DataTableCellEditEvent } from '../../../../packages/react/src/components/DataTable';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { Button } from '../../../../packages/react/src/components/Button';
import { Input } from '../../../../packages/react/src/components/Input';
import { Chip } from '../../../../packages/react/src/components/Chip';
import { Checkbox } from '../../../../packages/react/src/components/Checkbox';
import { Select } from '../../../../packages/react/src/components/Select';
import { ContextMenu } from '../../../../packages/react/src/components/ContextMenu';
import type { MenuItem } from '../../../../packages/react/src/types/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  status: string;
  country: string;
}

const sampleData: User[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  age: 20 + (i % 40),
  role: ['Admin', 'Editor', 'Viewer', 'Moderator'][i % 4],
  status: ['Active', 'Inactive', 'Pending'][i % 3],
  country: ['Chile', 'Argentina', 'Colombia', 'Mexico', 'Peru'][i % 5],
}));

const meta: Meta = {
  title: 'Data/DataTable',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Full-featured data table with dynamic columns, pagination, multi-sort, column/global filters, row selection (click/checkbox), inline cell and row editing, column and row reordering via drag & drop, frozen columns, column groups, row grouping, row expansion, tree mode, virtual scroll, action columns with presets (edit/delete/view/copy), CSV export, print, copy to clipboard, column visibility toggle, resizable columns/rows/cells, custom ScrollBar, and full ARIA/keyboard support. All templates are customizable.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'id', header: 'ID', sortable: true, width: 60 },
      { field: 'name', header: 'Name', sortable: true, filterable: true },
      { field: 'email', header: 'Email', sortable: true },
      { field: 'age', header: 'Age', sortable: true, align: 'right', width: 80 },
      { field: 'role', header: 'Role', sortable: true, filterable: true },
    ];

    return (
      <DataTable
        value={sampleData as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        paginator
        rows={10}
        hoverRows
        toolbar={['search', 'export', 'print', 'copy']}
      />
    );
  },
};

export const WithSelection: Story = {
  render: () => {
    const [selection, setSelection] = useState<Record<string, unknown>[]>([]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
      { field: 'status', header: 'Status', bodyTemplate: (row: User) => (
        <Chip variant={row.status === 'Active' ? 'success' : row.status === 'Inactive' ? 'error' : 'warning'} size="sm">{row.status}</Chip>
      )},
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 15) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        selectionMode="checkbox"
        selection={selection}
        onSelectionChange={setSelection}
        dataKey="id"
      />
    );
  },
};

export const MultiSort: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'age', header: 'Age', sortable: true, align: 'right' },
      { field: 'role', header: 'Role', sortable: true },
      { field: 'country', header: 'Country', sortable: true },
    ];

    return (
      <DataTable
        value={sampleData as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        sortMode="multiple"
        paginator
        rows={10}
      />
    );
  },
};

export const WithActions: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
      {
        field: '__actions',
        header: 'Actions',
        align: 'center',
        width: 120,
        actionsPreset: ['edit', 'delete'],
        onEdit: (row: User) => alert(`Edit: ${row.name}`),
        onDelete: (row: User) => alert(`Delete: ${row.name}`),
      },
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 10) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
      />
    );
  },
};

export const InlineEdit: Story = {
  render: () => {
    const [data, setData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 10) as unknown as Record<string, unknown>[]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', editable: true },
      { field: 'email', header: 'Email', editable: true },
      { field: 'age', header: 'Age', editable: true, align: 'right' },
      { field: 'role', header: 'Role' },
    ];

    return (
      <DataTable
        value={data}
        columns={columns as unknown as DataTableColumn[]}
        editMode="cell"
        onCellEditComplete={({ rowIndex, field, newValue }: DataTableCellEditEvent) => {
          const newData = [...data];
          newData[rowIndex][field] = newValue;
          setData(newData);
        }}
        dataKey="id"
      />
    );
  },
};

export const Toolbar: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
      { field: 'country', header: 'Country' },
    ];

    return (
      <DataTable
        value={sampleData as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        paginator
        rows={10}
        toolbar={['search', 'export', 'print', 'copy']}
      />
    );
  },
};

export const WithPaginatorOptions: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role', filterable: true },
      { field: 'country', header: 'Country', filterable: true },
    ];

    return (
      <DataTable
        value={sampleData as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        paginator
        rows={5}
        rowsPerPageOptions={[5, 10, 25, 50]}
        showColumnLines
      />
    );
  },
};

export const Scrollable: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'id', header: 'ID', frozen: 'left', width: 60 },
      { field: 'name', header: 'Name', minWidth: '200px' },
      { field: 'email', header: 'Email', minWidth: '250px' },
      { field: 'age', header: 'Age', minWidth: '100px' },
      { field: 'role', header: 'Role', minWidth: '150px' },
      { field: 'status', header: 'Status', minWidth: '150px' },
      { field: 'country', header: 'Country', minWidth: '150px' },
      { field: '__actions', header: '', frozen: 'right', width: 80, actionsPreset: ['edit'], onEdit: (row: User) => alert(row.name) },
    ];

    return (
      <DataTable
        value={sampleData as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        scrollable
        scrollHeight="300px"
        stickyHeader
        style={{ maxWidth: 700 }}
      />
    );
  },
};

export const ReorderableRows: Story = {
  render: () => {
    const [data, setData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 8) as unknown as Record<string, unknown>[]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
    ];

    return (
      <DataTable
        value={data}
        columns={columns as unknown as DataTableColumn[]}
        reorderableRows
        onRowReorder={setData}
        dataKey="id"
      />
    );
  },
};

export const ReorderableColumns: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'id', header: 'ID', width: 50, reorderable: false },
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'age', header: 'Age', align: 'right' },
      { field: 'role', header: 'Role' },
      { field: 'country', header: 'Country' },
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 10) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        reorderableColumns
        dataKey="id"
        hoverRows
      />
    );
  },
};

export const InsideDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [selection, setSelection] = useState<Record<string, unknown>[]>([]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true, filterable: true },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
      { field: 'status', header: 'Status', bodyTemplate: (row: User) => (
        <Chip variant={row.status === 'Active' ? 'success' : row.status === 'Inactive' ? 'error' : 'warning'} size="sm">{row.status}</Chip>
      )},
      { field: '__actions', header: '', width: 100, align: 'center', actionsPreset: ['edit', 'delete'], onEdit: (row: User) => alert(`Edit: ${row.name}`), onDelete: (row: User) => alert(`Delete: ${row.name}`) },
    ];

    return (
      <div>
        <Button label="Open Table Dialog" onClick={() => setOpen(true)} />
        <Dialog visible={open} onHide={() => setOpen(false)} header="User Management" size="xl" maximizable>
          <DataTable
            value={sampleData.slice(0, 20) as unknown as Record<string, unknown>[]}
            columns={columns as unknown as DataTableColumn[]}
            selectionMode="checkbox"
            selection={selection}
            onSelectionChange={setSelection}
            dataKey="id"
            paginator
            rows={5}
            rowsPerPageOptions={[5, 10, 20]}
            scrollable
            scrollHeight="300px"
          />
        </Dialog>
      </div>
    );
  },
};

export const WithContextMenu: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
      { field: 'status', header: 'Status' },
      { field: 'country', header: 'Country' },
    ];

    const menuItems: MenuItem[] = [
      { key: 'view', label: 'View Details', icon: 'search' },
      { key: 'edit', label: 'Edit User', icon: 'pencil' },
      { key: 'sep', separator: true },
      { key: 'delete', label: 'Delete', icon: 'trash' },
    ];

    return (
      <ContextMenu items={menuItems} onItemSelect={(key) => alert(`Action: ${key}`)}>
        <DataTable
          value={sampleData.slice(0, 15) as unknown as Record<string, unknown>[]}
          columns={columns as unknown as DataTableColumn[]}
          hoverRows
          selectionMode="single"
          dataKey="id"
        />
      </ContextMenu>
    );
  },
};

export const FullCustomization: Story = {
  render: () => {
    const [filter, setFilter] = useState('');
    const tableRef = useRef<DataTableRef>(null);

    const columns: DataTableColumn<User>[] = [
      {
        field: 'id', header: '#', width: 50, align: 'center', sortable: true,
        bodyTemplate: (row: User) => <span style={{ fontWeight: 700, color: 'var(--kreati-severity-primary)' }}>{row.id}</span>,
      },
      {
        field: 'name', header: 'Full Name', sortable: true, filterable: true,
        bodyTemplate: (row: User) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${row.id * 37 % 360}, 60%, 70%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 600, fontSize: 12 }}>
              {row.name.split(' ').map(w => w[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{row.name}</div>
              <div style={{ fontSize: 11, color: 'var(--kreati-gray-400)' }}>{row.email}</div>
            </div>
          </div>
        ),
      },
      {
        field: 'age', header: 'Age', sortable: true, align: 'center', width: 70,
        bodyTemplate: (row: User) => (
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 28, height: 22, borderRadius: 12, fontSize: 11, fontWeight: 600, background: row.age > 40 ? 'var(--kreati-severity-danger-light)' : row.age > 30 ? 'var(--kreati-severity-warning-light)' : 'var(--kreati-severity-success-light)', color: row.age > 40 ? 'var(--kreati-severity-danger)' : row.age > 30 ? 'var(--kreati-severity-warning)' : 'var(--kreati-severity-success)' }}>{row.age}</span>
        ),
      },
      {
        field: 'role', header: 'Role', sortable: true, filterable: true,
        filterTemplate: (_col, value, onChange) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {['Admin', 'Editor', 'Viewer', 'Moderator'].map(role => (
              <Checkbox key={role} label={role} size="sm" checked={value === role} onChange={() => onChange(value === role ? '' : role)} />
            ))}
          </div>
        ),
        bodyTemplate: (row: User) => (
          <Chip variant={row.role === 'Admin' ? 'error' : row.role === 'Editor' ? 'primary' : 'secondary'} size="sm">{row.role}</Chip>
        ),
      },
      {
        field: 'status', header: 'Status', sortable: true,
        bodyTemplate: (row: User) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: row.status === 'Active' ? 'var(--kreati-severity-success)' : row.status === 'Inactive' ? 'var(--kreati-severity-danger)' : 'var(--kreati-severity-warning)' }} />
            <span style={{ fontSize: 12 }}>{row.status}</span>
          </div>
        ),
      },
      { field: 'country', header: 'Country' },
      { field: '__actions', header: '', width: 100, align: 'center', actionsPreset: ['edit', 'delete'], onEdit: (row: User) => alert(`Edit ${row.name}`), onDelete: (row: User) => alert(`Delete ${row.name}`) },
    ];

    return (
      <DataTable
        ref={tableRef}
        value={sampleData as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        paginator
        rows={8}
        rowsPerPageOptions={[5, 8, 15, 25]}
        sortMode="multiple"
        hoverRows
        showColumnLines
        scrollable
        scrollHeight="400px"
        scrollBarProps={{ color: 'var(--kreati-severity-success)', size: 'lg', variant: 'visible', thumbRadius: '8px', arrows: true }}
        stickyHeader
        globalFilter={filter}
        globalFilterFields={['name', 'email', 'role', 'country', 'status']}
        dataKey="id"
        exportFilename="users-full-export"
        headerTemplate={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search..." size="sm" variant="floating" label="Search" style={{ maxWidth: 220 }} />
            <Button label="Export" size="xs" buttonType="outlined" severity="secondary" onClick={() => tableRef.current?.exportCSV()} />
            <Button label="Reset" size="xs" buttonType="text" severity="secondary" onClick={() => { setFilter(''); tableRef.current?.resetFilters(); }} />
          </div>
        }
        footerTemplate={<div style={{ fontSize: 12, color: 'var(--kreati-gray-500)', textAlign: 'center' }}>{sampleData.length} total records — Custom scrollbar with primary color</div>}
        paginatorTemplate={({ page, totalPages, totalRecords, rows, onPageChange }) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', width: '100%' }}>
            <Select
              options={[5, 8, 15, 25].map(n => ({ value: n, label: `${n} rows` }))}
              value={rows}
              onChange={(val) => onPageChange(1)}
              size="xs"
              style={{ maxWidth: 90 }}
            />
            <Button label="Prev" size="xs" buttonType="text" severity="primary" disabled={page === 1} onClick={() => onPageChange(page - 1)} />
            <Chip variant="primary" size="sm">{`${page} / ${totalPages}`}</Chip>
            <Button label="Next" size="xs" buttonType="text" severity="primary" disabled={page === totalPages} onClick={() => onPageChange(page + 1)} />
            <span style={{ fontSize: 11, color: 'var(--kreati-gray-400)' }}>{totalRecords} items</span>
          </div>
        )}
      />
    );
  },
};

export const LazyLoading: Story = {
  render: () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 10) as unknown as Record<string, unknown>[]);
    const [page, setPage] = useState(1);

    const columns: DataTableColumn<User>[] = [
      { field: 'id', header: 'ID', width: 60 },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
      { field: 'country', header: 'Country' },
    ];

    const handlePageChange = (newPage: number) => {
      setLoading(true);
      setPage(newPage);
      setTimeout(() => {
        const start = (newPage - 1) * 10;
        setData(sampleData.slice(start, start + 10) as unknown as Record<string, unknown>[]);
        setLoading(false);
      }, 800);
    };

    return (
      <DataTable
        value={data}
        columns={columns as unknown as DataTableColumn[]}
        lazy
        loading={loading}
        paginator
        rows={10}
        totalRecords={50}
        page={page}
        onPageChange={handlePageChange}
        dataKey="id"
      />
    );
  },
};

export const ColumnGroups: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', columnGroup: 'Personal' },
      { field: 'age', header: 'Age', columnGroup: 'Personal', align: 'right' },
      { field: 'email', header: 'Email', columnGroup: 'Contact' },
      { field: 'country', header: 'Country', columnGroup: 'Contact' },
      { field: 'role', header: 'Role', columnGroup: 'Work' },
      { field: 'status', header: 'Status', columnGroup: 'Work' },
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 10) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        showColumnLines
      />
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [smData, setSmData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 3) as unknown as Record<string, unknown>[]);
    const [mdData, setMdData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 3) as unknown as Record<string, unknown>[]);
    const [lgData, setLgData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 3) as unknown as Record<string, unknown>[]);
    const [slimData, setSlimData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 3) as unknown as Record<string, unknown>[]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', editable: true },
      { field: 'email', header: 'Email', editable: true },
      { field: 'role', header: 'Role' },
    ];
    const onEdit = (setData: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>) =>
      ({ rowIndex, field, newValue }: DataTableCellEditEvent) => {
        setData(d => { const n = [...d]; n[rowIndex][field] = newValue; return n; });
      };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <p style={{ marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Small</p>
          <DataTable value={smData} columns={columns as unknown as DataTableColumn[]} size="sm" editMode="cell" onCellEditComplete={onEdit(setSmData)} dataKey="id" />
        </div>
        <div>
          <p style={{ marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Medium (default)</p>
          <DataTable value={mdData} columns={columns as unknown as DataTableColumn[]} size="md" editMode="cell" onCellEditComplete={onEdit(setMdData)} dataKey="id" />
        </div>
        <div>
          <p style={{ marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Large</p>
          <DataTable value={lgData} columns={columns as unknown as DataTableColumn[]} size="lg" editMode="cell" onCellEditComplete={onEdit(setLgData)} dataKey="id" />
        </div>
        <div>
          <p style={{ marginBottom: 4, fontSize: 12, fontWeight: 600 }}>Medium + Slim</p>
          <DataTable value={slimData} columns={columns as unknown as DataTableColumn[]} size="md" slim editMode="cell" onCellEditComplete={onEdit(setSlimData)} dataKey="id" />
        </div>
      </div>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'role', header: 'Role' },
    ];

    return <DataTable value={[]} columns={columns as unknown as DataTableColumn[]} loading />;
  },
};

export const DisabledRows: Story = {
  render: () => {
    const [selection, setSelection] = useState<Record<string, unknown>[]>([]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'status', header: 'Status' },
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 12) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        selectionMode="checkbox"
        selection={selection}
        onSelectionChange={setSelection}
        disabledRows={(row) => (row as unknown as User).status === 'Inactive'}
        dataKey="id"
      />
    );
  },
};

export const ColumnFooters: Story = {
  render: () => {
    const data = sampleData.slice(0, 15);
    const avgAge = Math.round(data.reduce((sum, u) => sum + u.age, 0) / data.length);

    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', footer: `Total: ${data.length}` },
      { field: 'email', header: 'Email' },
      { field: 'age', header: 'Age', align: 'right', sortable: true, footerTemplate: () => <span style={{ fontWeight: 600, color: 'var(--kreati-severity-primary)' }}>Avg: {avgAge}</span> },
      { field: 'role', header: 'Role' },
    ];

    return (
      <DataTable
        value={data as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        showColumnLines
      />
    );
  },
};

export const StickyHeaderScroll: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'id', header: 'ID', width: 60 },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'age', header: 'Age', align: 'right' },
      { field: 'role', header: 'Role' },
      { field: 'status', header: 'Status' },
      { field: 'country', header: 'Country' },
    ];

    return (
      <DataTable
        value={sampleData as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        scrollable
        scrollHeight="300px"
        stickyHeader
        dataKey="id"
      />
    );
  },
};

export const FrozenColumnsScroll: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'id', header: 'ID', frozen: 'left', width: 50, align: 'center' },
      { field: 'name', header: 'Name', minWidth: '180px', sortable: true },
      { field: 'email', header: 'Email', minWidth: '220px' },
      { field: 'age', header: 'Age', minWidth: '80px', align: 'right' },
      { field: 'role', header: 'Role', minWidth: '130px' },
      { field: 'status', header: 'Status', minWidth: '130px' },
      { field: 'country', header: 'Country', minWidth: '130px' },
      { field: '__actions', header: '', frozen: 'right', width: 80, align: 'center', actionsPreset: ['edit'], onEdit: (row: User) => alert(row.name) },
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 30) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        scrollable
        scrollHeight="350px"
        stickyHeader
        hoverRows
        dataKey="id"
        style={{ maxWidth: 600 }}
      />
    );
  },
};

export const RowEdit: Story = {
  render: () => {
    const [data, setData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 8) as unknown as Record<string, unknown>[]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', editable: true },
      { field: 'email', header: 'Email', editable: true },
      { field: 'age', header: 'Age', editable: true, align: 'right', width: 80 },
      {
        field: 'role',
        header: 'Role',
        editable: true,
        editorTemplate: (_row, _col, _idx, onSave) => (
          <Select
            options={['Admin', 'Editor', 'Viewer', 'Moderator'].map(r => ({ value: r, label: r }))}
            value={(_row as User).role}
            onChange={(val) => onSave(val)}
            size="xs"
            fullWidth
          />
        ),
      },
      {
        field: '__actions',
        header: '',
        width: 80,
        align: 'center',
        actionsPreset: ['edit', 'delete'],
        onDelete: (row: User) => setData(d => d.filter(r => r.id !== row.id)),
      },
    ];

    return (
      <DataTable
        value={data}
        columns={columns as unknown as DataTableColumn[]}
        editMode="row"
        onRowEditComplete={({ rowIndex, newValue }) => {
          const newData = [...data];
          const values = newValue as Record<string, unknown>;
          Object.keys(values).forEach(k => { newData[rowIndex][k] = values[k]; });
          setData(newData);
        }}
        dataKey="id"
      />
    );
  },
};

export const RowExpansion: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<(string | number)[]>([]);
    const [data, setData] = useState<Record<string, unknown>[]>(sampleData.slice(0, 10) as unknown as Record<string, unknown>[]);
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true, editable: true },
      { field: 'email', header: 'Email', editable: true },
      { field: 'role', header: 'Role' },
      { field: 'status', header: 'Status' },
      { field: '__actions', header: '', width: 80, align: 'center', actionsPreset: ['edit', 'delete'], onDelete: (row: User) => setData(d => d.filter(r => r.id !== row.id)) },
    ];

    return (
      <DataTable
        value={data}
        columns={columns as unknown as DataTableColumn[]}
        rowExpansionTemplate={(row) => (
          <div style={{ padding: '8px 0' }}>
            <p style={{ margin: 0, fontSize: 13 }}>Details for <strong>{(row as unknown as User).name}</strong></p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--kreati-gray-500)' }}>
              Age: {(row as unknown as User).age} | Country: {(row as unknown as User).country}
            </p>
          </div>
        )}
        expandedRows={expanded}
        onExpandedRowsChange={setExpanded}
        editMode="row"
        onRowEditComplete={({ rowIndex, newValue }) => {
          const newData = [...data];
          const values = newValue as Record<string, unknown>;
          Object.keys(values).forEach(k => { newData[rowIndex][k] = values[k]; });
          setData(newData);
        }}
        dataKey="id"
        hoverRows
      />
    );
  },
};

export const TreeMode: Story = {
  render: () => {
    const [expanded, setExpanded] = useState<(string | number)[]>([1, 3]);
    const [data, setData] = useState([
      { id: 1, name: 'Engineering', role: 'Department', status: 'Active', children: [
        { id: 11, name: 'Frontend', role: 'Team', status: 'Active', children: [
          { id: 111, name: 'User 1', role: 'Developer', status: 'Active' },
          { id: 112, name: 'User 2', role: 'Developer', status: 'Active' },
        ]},
        { id: 12, name: 'Backend', role: 'Team', status: 'Active', children: [
          { id: 121, name: 'User 3', role: 'Developer', status: 'Inactive' },
        ]},
      ]},
      { id: 2, name: 'Design', role: 'Department', status: 'Active', children: [
        { id: 21, name: 'User 4', role: 'Designer', status: 'Active' },
      ]},
      { id: 3, name: 'Marketing', role: 'Department', status: 'Pending', children: [
        { id: 31, name: 'User 5', role: 'Manager', status: 'Active' },
        { id: 32, name: 'User 6', role: 'Analyst', status: 'Pending' },
      ]},
    ]);

    const columns: DataTableColumn<Record<string, unknown>>[] = [
      { field: 'name', header: 'Name', editable: true },
      { field: 'role', header: 'Role' },
      { field: 'status', header: 'Status', bodyTemplate: (row) => (
        <Chip variant={(row as { status: string }).status === 'Active' ? 'success' : (row as { status: string }).status === 'Inactive' ? 'error' : 'warning'} size="sm">
          {(row as { status: string }).status}
        </Chip>
      )},
    ];

    return (
      <DataTable
        value={data as unknown as Record<string, unknown>[]}
        columns={columns}
        childrenField="children"
        expandedRows={expanded}
        onExpandedRowsChange={setExpanded}
        editMode="cell"
        onCellEditComplete={({ row, field, newValue }) => {
          (row as Record<string, unknown>)[field] = newValue;
          setData([...data]);
        }}
        dataKey="id"
        hoverRows
      />
    );
  },
};

export const VirtualScroll: Story = {
  render: () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      age: 20 + (i % 40),
      role: ['Admin', 'Editor', 'Viewer', 'Moderator'][i % 4],
    }));

    const columns: DataTableColumn<Record<string, unknown>>[] = [
      { field: 'id', header: 'ID', width: 60 },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'age', header: 'Age', align: 'right' },
      { field: 'role', header: 'Role' },
    ];

    return (
      <div>
        <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--kreati-gray-500)' }}>10,000 rows — only visible rows are rendered</p>
        <DataTable
          value={largeData as unknown as Record<string, unknown>[]}
          columns={columns}
          virtualScroll
          virtualScrollItemHeight={40}
          scrollable
          scrollHeight="400px"
          stickyHeader
          dataKey="id"
          hoverRows
        />
      </div>
    );
  },
};

export const Resizable: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', width: '200px', resizable: true },
      { field: 'email', header: 'Email', width: '250px', resizable: true },
      { field: 'age', header: 'Age', width: '80px', align: 'right', resizable: false },
      { field: 'role', header: 'Role', width: '150px', resizable: true },
      { field: 'country', header: 'Country', width: '150px', resizable: true },
    ];

    return (
      <div>
        <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--kreati-gray-500)' }}>
          Drag column borders to resize width. Drag row bottom borders to resize height. Age column is locked. Table wrapper is also resizable.
        </p>
        <DataTable
          value={sampleData.slice(0, 8) as unknown as Record<string, unknown>[]}
          columns={columns as unknown as DataTableColumn[]}
          resizable
          resizableRows
          hoverRows
          dataKey="id"
        />
      </div>
    );
  },
};

export const ResizableCellLevel: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', width: '180px', resizable: true },
      { field: 'email', header: 'Email', width: '220px', resizable: true },
      { field: 'age', header: 'Age', width: '80px', resizable: true, align: 'right' },
      { field: 'role', header: 'Role', width: '140px', resizable: true },
    ];

    return (
      <div>
        <p style={{ marginBottom: 8, fontSize: 12, color: 'var(--kreati-gray-500)' }}>
          Drag column header borders to resize width. Drag row bottom-left border to resize height. Both affect the cell at their intersection.
        </p>
        <DataTable
          value={sampleData.slice(0, 6) as unknown as Record<string, unknown>[]}
          columns={columns as unknown as DataTableColumn[]}
          resizable
          resizableRows
          hoverRows
          dataKey="id"
        />
      </div>
    );
  },
};

export const RowGrouping: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'age', header: 'Age', align: 'right' },
      { field: 'status', header: 'Status' },
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 20) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        groupByField="role"
        groupHeaderTemplate={(val, rows) => (
          <span>{String(val)} <Chip variant="primary" size="sm">{`${rows.length}`}</Chip></span>
        )}
        dataKey="id"
        hoverRows
      />
    );
  },
};

export const ColumnVisibility: Story = {
  render: () => {
    const [cols, setCols] = useState<DataTableColumn<User>[]>([
      { field: 'id', header: 'ID', width: 50, visible: false },
      { field: 'name', header: 'Name', sortable: true },
      { field: 'email', header: 'Email' },
      { field: 'age', header: 'Age', align: 'right', visible: false },
      { field: 'role', header: 'Role' },
      { field: 'status', header: 'Status' },
      { field: 'country', header: 'Country' },
    ]);

    const toggle = (field: string) => setCols(c => c.map(col => col.field === field ? { ...col, visible: col.visible === false ? undefined : false } : col));

    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {cols.map(col => (
            <Checkbox key={col.field} label={col.header} size="sm" checked={col.visible !== false} onChange={() => toggle(col.field)} />
          ))}
        </div>
        <DataTable
          value={sampleData.slice(0, 10) as unknown as Record<string, unknown>[]}
          columns={cols as unknown as DataTableColumn[]}
          dataKey="id"
          hoverRows
        />
      </div>
    );
  },
};

export const MultipleFrozenColumns: Story = {
  render: () => {
    const columns: DataTableColumn<User>[] = [
      { field: 'id', header: 'ID', frozen: 'left', width: 50, align: 'center' },
      { field: 'name', header: 'Name', frozen: 'left', width: '160px', sortable: true },
      { field: 'email', header: 'Email', minWidth: '220px' },
      { field: 'age', header: 'Age', minWidth: '80px', align: 'right' },
      { field: 'role', header: 'Role', minWidth: '130px' },
      { field: 'status', header: 'Status', minWidth: '130px' },
      { field: 'country', header: 'Country', frozen: 'right', width: '120px' },
      { field: '__actions', header: '', frozen: 'right', width: 70, align: 'center', actionsPreset: ['edit'], onEdit: (row: User) => alert(row.name) },
    ];

    return (
      <DataTable
        value={sampleData.slice(0, 20) as unknown as Record<string, unknown>[]}
        columns={columns as unknown as DataTableColumn[]}
        scrollable
        scrollHeight="350px"
        stickyHeader
        hoverRows
        dataKey="id"
        style={{ maxWidth: 600 }}
      />
    );
  },
};
