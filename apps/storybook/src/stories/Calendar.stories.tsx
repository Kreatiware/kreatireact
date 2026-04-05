import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '../../../../packages/react/src/components/Calendar';
import { KreatiProvider } from '../../../../packages/react/src/locale';
import { es } from '../../../../packages/react/src/locale/es';

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: { layout: 'centered', docs: { description: { component: 'Versatile calendar for date, time, and range selection. Inline or input+popover mode. Supports multiple selection, time picker, multi-month, touch UI, and full i18n.' } } },
  tags: ['autodocs'],
  decorators: [(Story: React.FC) => <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}><Story /></div>],
  argTypes: {
    size: { control: 'select', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    variant: { control: 'select', options: ['floating', 'stacked'] },
    selectionMode: { control: 'select', options: ['single', 'multiple', 'range'] },
    view: { control: 'select', options: ['date', 'month', 'year', 'time'] },
    hourFormat: { control: 'select', options: ['12', '24'] },
    weekdayFormat: { control: 'select', options: ['narrow', 'short', 'long'] },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InlineSizes: Story = {
  name: 'Inline — All sizes',
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{s.toUpperCase()}</span>
          <Calendar inline size={s}  />
        </div>
      ))}
    </div>
  ),
};

export const InlineWithTime: Story = {
  name: 'Inline — With time (all formats)',
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>24h (h:m) short labels</span>
        <Calendar inline showTime hourFormat="24" showButtonBar size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>12h AM/PM (h:m)</span>
        <Calendar inline showTime hourFormat="12" showButtonBar size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>24h (h:m:s)</span>
        <Calendar inline showTime hourFormat="24" showSeconds showButtonBar size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>12h AM/PM (h:m:s)</span>
        <Calendar inline showTime hourFormat="12" showSeconds showButtonBar size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Full labels</span>
        <Calendar inline showTime hourFormat="12" showSeconds showButtonBar size="md" timeLabelsShort={false} />
      </div>
    </div>
  ),
};

export const InlineTimeSizes: Story = {
  name: 'Inline — Time sizes (12h + seconds)',
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <div key={s} style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{s.toUpperCase()}</span>
          <Calendar inline showTime hourFormat="12" showSeconds showButtonBar size={s} />
        </div>
      ))}
    </div>
  ),
};

export const InlineSelectionModes: Story = {
  name: 'Inline — Selection modes',
  render: () => {
    const Demo = () => {
      const [single, setSingle] = useState<Date | null>(null);
      const [multi, setMulti] = useState<Date[]>([]);
      const [range, setRange] = useState<Date[]>([]);
      return (
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Single</span>
            <Calendar inline value={single} onChange={(v) => setSingle(v as Date)} showButtonBar size="md" />
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{single ? single.toLocaleDateString() : '(none)'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Multiple</span>
            <Calendar inline selectionMode="multiple" value={multi} onChange={(v) => setMulti(v as Date[])} showButtonBar size="md" />
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{multi.length} selected</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Range</span>
            <Calendar inline selectionMode="range" value={range} onChange={(v) => setRange(v as Date[])} showButtonBar size="md" />
            <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{range.map((d) => d.toLocaleDateString()).join(' - ') || '(none)'}</span>
          </div>
        </div>
      );
    };
    return <Demo />;
  },
};

export const InlineViews: Story = {
  name: 'Inline — Month / Year / Time only',
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Month only</span>
        <Calendar inline view="month" size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Year only</span>
        <Calendar inline view="year" size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Time only (12h)</span>
        <Calendar inline view="time" hourFormat="12" size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Time only (24h)</span>
        <Calendar inline view="time" hourFormat="24" size="md" />
      </div>
    </div>
  ),
};

export const InlineOptions: Story = {
  name: 'Inline — Weekday formats, week numbers, Monday start',
  render: () => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Narrow (default)</span>
        <Calendar inline weekdayFormat="narrow" size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Short</span>
        <Calendar inline weekdayFormat="short" size="md" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Monday + week numbers</span>
        <Calendar inline firstDayOfWeek={1} showWeekNumbers size="md" />
      </div>
    </div>
  ),
};

export const InlineConstraints: Story = {
  name: 'Inline — Min/Max, disabled weekends',
  render: () => {
    const t = new Date();
    return (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Min -5 / Max +14 days</span>
          <Calendar inline minDate={new Date(t.getFullYear(), t.getMonth(), t.getDate() - 5)} maxDate={new Date(t.getFullYear(), t.getMonth(), t.getDate() + 14)} showButtonBar size="md" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Disabled weekends</span>
          <Calendar inline disabledDates={(d) => d.getDay() === 0 || d.getDay() === 6} size="md" />
        </div>
      </div>
    );
  },
};

export const MultiMonth: Story = {
  name: 'Inline — Multi-month range',
  render: () => {
    const Demo = () => {
      const [range, setRange] = useState<Date[]>([]);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Calendar inline selectionMode="range" numberOfMonths={2} value={range} onChange={(v) => setRange(v as Date[])} showButtonBar size="md" />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{range.map((d) => d.toLocaleDateString()).join(' - ') || '(none)'}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const InputSizes: Story = {
  name: 'Input — All sizes',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300, paddingTop: 12 }}>
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
        <Calendar key={s} label={`Size ${s.toUpperCase()}`} size={s} showButtonBar />
      ))}
    </div>
  ),
};

export const InputWithTime: Story = {
  name: 'Input — Date + Time',
  render: () => {
    const Demo = () => {
      const [d, setD] = useState<Date | null>(new Date());
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300, paddingTop: 12 }}>
          <Calendar label="24h" value={d} onChange={(v) => setD(v as Date)} showTime showButtonBar size="md" helperText={d ? d.toLocaleString() : '(none)'} />
          <Calendar label="12h AM/PM" showTime hourFormat="12" showButtonBar size="md" />
          <Calendar label="With seconds" showTime hourFormat="12" showSeconds showButtonBar size="md" />
        </div>
      );
    };
    return <Demo />;
  },
};

export const InputRange: Story = {
  name: 'Input — Range',
  render: () => {
    const Demo = () => {
      const [range, setRange] = useState<Date[]>([]);
      return (
        <div style={{ width: 300, paddingTop: 12 }}>
          <Calendar label="Date range" selectionMode="range" value={range} onChange={(v) => setRange(v as Date[])} showButtonBar size="md" helperText={range.map((d) => d.toLocaleDateString()).join(' - ') || '(none)'} />
        </div>
      );
    };
    return <Demo />;
  },
};

export const InputStates: Story = {
  name: 'Input — States',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300, paddingTop: 12 }}>
      <Calendar label="Default" size="md" />
      <Calendar label="Error" size="md" error="Required" required />
      <Calendar label="Success" size="md" success defaultValue={new Date()} />
      <Calendar label="Disabled" size="md" disabled defaultValue={new Date()} />
      <Calendar label="Read only" size="md" readOnly defaultValue={new Date()} />
    </div>
  ),
};

export const InputStacked: Story = {
  name: 'Input — Stacked variant',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300 }}>
      <Calendar label="Date" variant="stacked" size="md" helperText="Uses FieldWrapper" showButtonBar />
      <Calendar label="With error" variant="stacked" size="md" error="Required" required />
    </div>
  ),
};

export const InputViewsOnly: Story = {
  name: 'Input — Month / Year / Time only',
  render: () => {
    const Demo = () => {
      const [month, setMonth] = useState<Date | null>(null);
      const [year, setYear] = useState<Date | null>(null);
      const [time12, setTime12] = useState<Date | null>(null);
      const [time24, setTime24] = useState<Date | null>(null);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 300, paddingTop: 12 }}>
          <Calendar label="Month" view="month" value={month} onChange={(v) => setMonth(v as Date)} size="md" helperText={month ? `${month.toLocaleString('default', { month: 'long' })} ${month.getFullYear()}` : '(none)'} />
          <Calendar label="Year" view="year" value={year} onChange={(v) => setYear(v as Date)} size="md" helperText={year ? String(year.getFullYear()) : '(none)'} />
          <Calendar label="Time (12h)" view="time" hourFormat="12" value={time12} onChange={(v) => setTime12(v as Date)} size="md" helperText={time12 ? time12.toLocaleTimeString() : '(none)'} />
          <Calendar label="Time (24h)" view="time" hourFormat="24" showSeconds value={time24} onChange={(v) => setTime24(v as Date)} size="md" helperText={time24 ? time24.toLocaleTimeString('en-GB') : '(none)'} />
        </div>
      );
    };
    return <Demo />;
  },
};

export const SpanishLocale: Story = {
  name: 'Locale — Spanish',
  render: () => (
    <KreatiProvider locale={es}>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <Calendar inline locale="es-CL" firstDayOfWeek={1} showButtonBar size="md" />
        <div style={{ width: 280, paddingTop: 12 }}>
          <Calendar label="Fecha" locale="es-CL" firstDayOfWeek={1} showButtonBar size="md" />
        </div>
      </div>
    </KreatiProvider>
  ),
};

export const CustomDayTemplate: Story = {
  name: 'Custom day template',
  render: () => {
    const dots: Record<number, string> = { 3: '#ef4444', 7: '#ef4444', 18: '#ef4444' };
    const stars = [25, 31];
    const badges: Record<number, number> = { 10: 3, 22: 1 };
    return (
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>Dots, stars and badges</span>
          <Calendar
            inline
            size="lg"
            dayTemplate={(date, { selected, outside }) => {
              const day = date.getDate();
              const dotColor = !outside && dots[day];
              const hasStar = !outside && stars.includes(day);
              const badgeCount = !outside && badges[day];
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, position: 'relative' }}>
                  <span>{day}</span>
                  {dotColor && <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: selected ? '#fff' : dotColor }} />}
                  {hasStar && <span style={{ fontSize: 10, lineHeight: 1, color: selected ? '#fff' : '#f59e0b' }}>★</span>}
                  {badgeCount && <span style={{ position: 'absolute', top: -6, right: -8, fontSize: 9, fontWeight: 700, lineHeight: 1, backgroundColor: selected ? '#fff' : '#3b82f6', color: selected ? '#3b82f6' : '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badgeCount}</span>}
                </div>
              );
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>unstyledDays — full control</span>
          <Calendar
            inline
            size="lg"
            unstyledDays
            dayTemplate={(date, { selected, today, outside }) => {
              const day = date.getDate();
              const isSpecial = day === 14;
              const isHeart = day === 8 || day === 22;
              return (
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '100%', height: '100%', borderRadius: '50%',
                  backgroundColor: selected ? '#fef3c7' : isSpecial ? '#22c55e' : undefined,
                  color: selected ? '#d97706' : isSpecial ? '#ef4444' : today ? '#0f78a5' : outside ? '#d1d5db' : undefined,
                  fontWeight: selected || today || isSpecial ? 700 : undefined,
                  fontSize: selected || isHeart ? 18 : undefined,
                }}>
                  {selected ? '★' : isHeart ? '❤' : day}
                </span>
              );
            }}
          />
        </div>
      </div>
    );
  },
};

export const PresetsInline: Story = {
  name: 'Presets — Inline (built-in)',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Date | Date[] | null>(null);
      const display = !val ? '(none)' : Array.isArray(val) ? val.map((d) => d.toLocaleDateString()).join(' - ') : val.toLocaleDateString();
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Calendar inline selectionMode="range" presets showButtonBar size="md" value={val} onChange={setVal} />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{display}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const PresetsInput: Story = {
  name: 'Presets — Input (built-in)',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Date | Date[] | null>(null);
      const display = !val ? '(none)' : Array.isArray(val) ? val.map((d) => d.toLocaleDateString()).join(' - ') : val.toLocaleDateString();
      return (
        <div style={{ width: 340, paddingTop: 12 }}>
          <Calendar label="Date range" selectionMode="range" presets showButtonBar size="md" value={val} onChange={setVal} helperText={display} />
        </div>
      );
    };
    return <Demo />;
  },
};

export const PresetsCustom: Story = {
  name: 'Presets — Custom',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Date | Date[] | null>(null);
      const customPresets = [
        { label: 'Christmas', value: new Date(new Date().getFullYear(), 11, 25) },
        { label: 'New Year', value: new Date(new Date().getFullYear() + 1, 0, 1) },
        { label: 'Next weekend', value: () => {
          const t = new Date();
          const sat = new Date(t); sat.setDate(t.getDate() + (6 - t.getDay()));
          const sun = new Date(sat); sun.setDate(sat.getDate() + 1);
          return [sat, sun] as Date[];
        }},
      ];
      const display = !val ? '(none)' : Array.isArray(val) ? val.map((d) => d.toLocaleDateString()).join(' - ') : val.toLocaleDateString();
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Calendar inline selectionMode="range" presets={customPresets} showButtonBar size="md" value={val} onChange={setVal} />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{display}</span>
        </div>
      );
    };
    return <Demo />;
  },
};

export const CustomButtonBar: Story = {
  name: 'Custom button bar',
  render: () => {
    const Demo = () => {
      const [val, setVal] = useState<Date | null>(null);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Calendar
            inline
            size="md"
            value={val}
            onChange={(v) => setVal(v as Date)}
            showButtonBar
            buttonBarTemplate={({ selectToday, clear }) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <button onClick={selectToday} style={{ background: 'none', border: 'none', color: '#0f78a5', cursor: 'pointer', fontWeight: 600, fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>Now</button>
                <button onClick={clear} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600, fontFamily: 'Raleway, sans-serif', fontSize: 13 }}>Reset</button>
              </div>
            )}
          />
          <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>{val ? val.toLocaleDateString() : '(none)'}</span>
        </div>
      );
    };
    return <Demo />;
  },
};
