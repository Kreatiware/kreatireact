import React, { useState, useCallback } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AutoComplete } from '../../../../packages/react/src/components/AutoComplete';
import type { AutoCompleteItem } from '../../../../packages/react/src/components/AutoComplete';
import { Dialog } from '../../../../packages/react/src/components/Dialog';
import { Button } from '../../../../packages/react/src/components/Button';

const allCountries: AutoCompleteItem[] = [
  { value: 'ar', label: 'Argentina' },
  { value: 'br', label: 'Brazil' },
  { value: 'ca', label: 'Canada' },
  { value: 'cl', label: 'Chile' },
  { value: 'co', label: 'Colombia' },
  { value: 'de', label: 'Germany' },
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France' },
  { value: 'it', label: 'Italy' },
  { value: 'jp', label: 'Japan' },
  { value: 'mx', label: 'Mexico' },
  { value: 'pe', label: 'Peru' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
  { value: 'uy', label: 'Uruguay' },
];

const useLocalSearch = () => {
  const [items, setItems] = useState<AutoCompleteItem[]>([]);
  const handleSearch = useCallback((query: string) => {
    setItems(allCountries.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())));
  }, []);
  return { items, handleSearch };
};

const meta = {
  title: 'Components/AutoComplete',
  component: AutoComplete,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic single-value autocomplete with local filtering. */
export const Default: Story = {
  args: {} as any,
  render: () => {
    const { items, handleSearch } = useLocalSearch();
    return (
      <AutoComplete
        label="Country"
        suggestions={items}
        onSearch={handleSearch}
        placeholder="Type to search..."
        style={{ width: 300 }}
      />
    );
  },
};

/** Simulated async search with loading spinner and debounce. */
export const AsyncSearch: Story = {
  args: {} as any,
  render: () => {
    const [items, setItems] = useState<AutoCompleteItem[]>([]);
    const [loading, setLoading] = useState(false);
    const handleSearch = useCallback((query: string) => {
      setLoading(true);
      setTimeout(() => {
        setItems(allCountries.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())));
        setLoading(false);
      }, 800);
    }, []);
    return (
      <AutoComplete
        label="Country (async)"
        suggestions={items}
        onSearch={handleSearch}
        loading={loading}
        delay={500}
        style={{ width: 300 }}
      />
    );
  },
};

/** Shows all suggestions on focus without typing. */
export const ShowOnFocus: Story = {
  args: {} as any,
  render: () => {
    const [items, setItems] = useState<AutoCompleteItem[]>(allCountries);
    const handleSearch = useCallback((query: string) => {
      setItems(allCountries.filter((c) => c.label.toLowerCase().includes(query.toLowerCase())));
    }, []);
    return (
      <AutoComplete
        label="Country"
        suggestions={items}
        onSearch={handleSearch}
        showOnFocus
        minLength={0}
        style={{ width: 300 }}
      />
    );
  },
};

/** Clears value on blur if no exact match is found. */
export const ForceSelection: Story = {
  args: {} as any,
  render: () => {
    const { items, handleSearch } = useLocalSearch();
    return (
      <AutoComplete
        label="Country (force)"
        suggestions={items}
        onSearch={handleSearch}
        forceSelection
        helperText="Value clears on blur if no match"
        style={{ width: 300 }}
      />
    );
  },
};

/** Custom render for each suggestion item. */
export const CustomItemTemplate: Story = {
  args: {} as any,
  render: () => {
    const { items, handleSearch } = useLocalSearch();
    return (
      <AutoComplete
        label="Country"
        suggestions={items}
        onSearch={handleSearch}
        itemTemplate={(item, { focused }) => (
          <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontWeight: 600, fontSize: 11, opacity: 0.5, width: 20 }}>
              {item.value.toUpperCase()}
            </span>
            <span style={{ fontWeight: focused ? 600 : 400 }}>{item.label}</span>
          </span>
        )}
        style={{ width: 300 }}
      />
    );
  },
};

/** Sizes, validation states, and helper severities. */
export const SizesAndStates: Story = {
  args: {} as any,
  render: () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const helpers: Array<{ severity: 'info' | 'warning' | 'success' | 'danger'; text: string }> = [
      { severity: 'info', text: 'Informational helper' },
      { severity: 'warning', text: 'Check your input' },
      { severity: 'success', text: 'Looks good!' },
      { severity: 'danger', text: 'Something is wrong' },
    ];
    return (
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>Sizes</strong>
          {sizes.map((s) => {
            const Sized = () => {
              const { items, handleSearch } = useLocalSearch();
              return <AutoComplete label={s.toUpperCase()} size={s} suggestions={items} onSearch={handleSearch} style={{ width: 280 }} />;
            };
            return <Sized key={s} />;
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>States</strong>
          {(() => {
            const Row = () => {
              const { items, handleSearch } = useLocalSearch();
              return (
                <>
                  <AutoComplete label="Error (floating)" suggestions={items} onSearch={handleSearch} error="Invalid country" required style={{ width: 280 }} />
                  <AutoComplete label="Error (stacked)" variant="stacked" suggestions={items} onSearch={handleSearch} error="Required" helperText="For shipping" required style={{ width: 280 }} />
                  <AutoComplete label="Success" suggestions={items} onSearch={handleSearch} success defaultValue="Argentina" style={{ width: 280 }} />
                  <AutoComplete label="Disabled" suggestions={[]} disabled defaultValue="Argentina" style={{ width: 280 }} />
                  <AutoComplete label="Read only" suggestions={[]} readOnly defaultValue="Argentina" style={{ width: 280 }} />
                </>
              );
            };
            return <Row />;
          })()}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <strong>Helper severities</strong>
          {helpers.map((h) => {
            const H = () => {
              const { items, handleSearch } = useLocalSearch();
              return <AutoComplete label={h.severity} suggestions={items} onSearch={handleSearch} helperText={h.text} helperSeverity={h.severity} success={h.severity === 'success'} style={{ width: 280 }} />;
            };
            return <H key={h.severity} />;
          })}
        </div>
      </div>
    );
  },
};

/** Multiple selection with chips (default display). */
export const MultipleChips: Story = {
  args: {} as any,
  render: () => {
    const { items, handleSearch } = useLocalSearch();
    const [value, setValue] = useState<AutoCompleteItem[]>([
      { value: 'ar', label: 'Argentina' },
      { value: 'br', label: 'Brazil' },
    ]);
    return (
      <AutoComplete
        label="Countries"
        multiple
        suggestions={items}
        value={value}
        onChange={(v) => setValue(v as AutoCompleteItem[])}
        onSearch={handleSearch}
        placeholder="Add countries..."
        style={{ width: 400 }}
      />
    );
  },
};

/** Multiple selection with tags instead of chips. */
export const MultipleTags: Story = {
  args: {} as any,
  render: () => {
    const { items, handleSearch } = useLocalSearch();
    const [value, setValue] = useState<AutoCompleteItem[]>([
      { value: 'us', label: 'United States' },
    ]);
    return (
      <AutoComplete
        label="Countries"
        multiple
        selectionDisplay="tag"
        suggestions={items}
        value={value}
        onChange={(v) => setValue(v as AutoCompleteItem[])}
        onSearch={handleSearch}
        placeholder="Add countries..."
        style={{ width: 400 }}
      />
    );
  },
};

/** Multiple with max items limit and custom selected item template. */
export const MultipleAdvanced: Story = {
  args: {} as any,
  render: () => {
    const { items, handleSearch } = useLocalSearch();
    const [value, setValue] = useState<AutoCompleteItem[]>([
      { value: 'fr', label: 'France' },
    ]);
    return (
      <AutoComplete
        label="Top 3 countries"
        multiple
        maxItems={3}
        suggestions={items}
        value={value}
        onChange={(v) => setValue(v as AutoCompleteItem[])}
        onSearch={handleSearch}
        helperText="Select up to 3 countries"
        selectedItemTemplate={(item, onRemove) => (
          <span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 12,
              background: '#e0f2fe', color: '#0369a1', fontSize: 12,
            }}
          >
            {item.value.toUpperCase()} — {item.label}
            <button
              type="button"
              onClick={onRemove}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
              aria-label={`Remove ${item.label}`}
            >
              x
            </button>
          </span>
        )}
        style={{ width: 400 }}
      />
    );
  },
};

/** Multiple with error state. */
export const MultipleValidation: Story = {
  args: {} as any,
  render: () => {
    const { items, handleSearch } = useLocalSearch();
    const [value, setValue] = useState<AutoCompleteItem[]>([]);
    return (
      <AutoComplete
        label="Countries"
        variant="stacked"
        multiple
        suggestions={items}
        value={value}
        onChange={(v) => setValue(v as AutoCompleteItem[])}
        onSearch={handleSearch}
        error="At least one country is required"
        required
        style={{ width: 400 }}
      />
    );
  },
};

/** AutoComplete inside nested dialogs — tests overlay z-index stacking. */
export const OverlayNesting: Story = {
  args: {} as any,
  render: () => {
    const [d1, setD1] = useState(false);
    const [d2, setD2] = useState(false);
    const { items, handleSearch } = useLocalSearch();
    return (
      <div>
        <Button onClick={() => setD1(true)}>Open Dialog</Button>
        <Dialog visible={d1} onHide={() => setD1(false)} header="Level 1" style={{ width: 500 }}>
          <AutoComplete label="AutoComplete L1" suggestions={items} onSearch={handleSearch} fullWidth />
          <Button onClick={() => setD2(true)} style={{ marginTop: 16 }}>Open Level 2</Button>
          <Dialog visible={d2} onHide={() => setD2(false)} header="Level 2" style={{ width: 400 }}>
            <AutoComplete label="AutoComplete L2" suggestions={items} onSearch={handleSearch} fullWidth />
          </Dialog>
        </Dialog>
      </div>
    );
  },
};
