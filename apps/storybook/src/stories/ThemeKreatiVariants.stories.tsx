import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Foundation/Themes/Kreati Primary Variants',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

const base: React.CSSProperties = { fontFamily: 'var(--kreati-font-family)', fontSize: 'var(--kreati-font-size-sm)' };

interface Variant {
  name: string;
  primary: string;
  p50: string; p100: string; p200: string; p300: string; p400: string; p600: string; p700: string;
  description: string;
  info: string; success: string; warning: string; danger: string; help: string;
}

const variants: Variant[] = [
  { name: 'Ocean', primary: '#0f78a5', p50: '#e6f3f8', p100: '#b3dce9', p200: '#80c5da', p300: '#4daecb', p400: '#2694bf', p600: '#0d6b94', p700: '#0b5e83', description: 'Current primary. Balanced blue-teal.', info: '#2196c8', success: '#2d8a4e', warning: '#e6b800', danger: '#c93c3c', help: '#7c4dba' },
  { name: 'Cerulean', primary: '#1a8fc2', p50: '#e8f4fb', p100: '#b8def3', p200: '#88c8eb', p300: '#58b2e3', p400: '#349cd5', p600: '#177fad', p700: '#136f98', description: 'Brighter sky blue. Modern, luminous.', info: '#3aa5d4', success: '#2d8a4e', warning: '#e6b800', danger: '#c93c3c', help: '#7c4dba' },
  { name: 'Sapphire', primary: '#2563a8', p50: '#eaf1f9', p100: '#c0d6ed', p200: '#96bbe1', p300: '#6ca0d5', p400: '#4882c1', p600: '#205896', p700: '#1b4d84', description: 'Royal blue. Elegant, premium.', info: '#3b7cc8', success: '#2a8548', warning: '#dab000', danger: '#c43838', help: '#7048b0' },
  { name: 'Cobalt', primary: '#1565c0', p50: '#e8f0fb', p100: '#b8d4f3', p200: '#88b8eb', p300: '#589ce3', p400: '#3480d5', p600: '#125aab', p700: '#0f4f96', description: 'Electric blue. Energetic, bold.', info: '#2e80d0', success: '#2a8548', warning: '#e6b800', danger: '#d04040', help: '#6840b8' },
  { name: 'Petrol', primary: '#0d7e8c', p50: '#e6f4f6', p100: '#b3dfe4', p200: '#80cad2', p300: '#4db5c0', p400: '#269fae', p600: '#0b717d', p700: '#09636e', description: 'Blue-green teal. Fresh, unique.', info: '#1a90a0', success: '#2d8a4e', warning: '#e6b800', danger: '#c93c3c', help: '#8050b8' },
  { name: 'Indigo', primary: '#3f51b5', p50: '#eceef8', p100: '#c5cbe8', p200: '#9ea8d8', p300: '#7785c8', p400: '#5a6abf', p600: '#3848a2', p700: '#313f8f', description: 'Blue-violet. Creative classic.', info: '#4a6cc4', success: '#2d8a4e', warning: '#e6b800', danger: '#c93c3c', help: '#7e47c0' },
  { name: 'Blueberry', primary: '#4a55c7', p50: '#ededfa', p100: '#c8caf0', p200: '#a3a7e6', p300: '#7e84dc', p400: '#5f66d0', p600: '#424cb3', p700: '#3a439f', description: 'Arandano. Vibrante, juvenil.', info: '#5570d0', success: '#30905a', warning: '#e6b800', danger: '#d04444', help: '#8a4ec8' },
  { name: 'Anil', primary: '#3949ab', p50: '#ebedf8', p100: '#c2c8e9', p200: '#99a3da', p300: '#707ecb', p400: '#4d5dba', p600: '#334199', p700: '#2d3987', description: 'Añil clasico. Profundo, artistico.', info: '#4565b8', success: '#288045', warning: '#dab000', danger: '#c43838', help: '#7040b5' },
  { name: 'Periwinkle', primary: '#5c6bc0', p50: '#eff0f9', p100: '#cdd1ec', p200: '#abb2df', p300: '#8993d2', p400: '#6d79c8', p600: '#5260ad', p700: '#48559a', description: 'Azul lavanda. Suave, moderno.', info: '#6880cc', success: '#2d8a4e', warning: '#e6b800', danger: '#c93c3c', help: '#8855c4' },
  { name: 'Royal', primary: '#2c3e9e', p50: '#e9ebf6', p100: '#bcc2e4', p200: '#8f99d2', p300: '#6270c0', p400: '#4050ae', p600: '#27378e', p700: '#22307e', description: 'Azul real intenso. Premium, bold.', info: '#3858b0', success: '#258040', warning: '#d4a800', danger: '#c03535', help: '#6838b0' },
  { name: 'Iris', primary: '#5346b5', p50: '#efecf8', p100: '#cdc6ea', p200: '#aba0dc', p300: '#897ace', p400: '#6d5ec4', p600: '#4a3ea2', p700: '#41368f', description: 'Iris violeta-azul. Expresivo.', info: '#5a60c0', success: '#2d8a4e', warning: '#e6b800', danger: '#c93c3c', help: '#9050c8' },
  { name: 'Denim', primary: '#3560a8', p50: '#eaf0f9', p100: '#c0d4ed', p200: '#96b8e1', p300: '#6c9cd5', p400: '#4880c1', p600: '#2f5696', p700: '#294c84', description: 'Azul denim. Confiable, versatil.', info: '#4278bc', success: '#2d8a4e', warning: '#e6b800', danger: '#c93c3c', help: '#7548b5' },
  { name: 'Tangerine', primary: '#d4663a', p50: '#fdf0eb', p100: '#f8d4c5', p200: '#f2b89f', p300: '#ec9c79', p400: '#e68053', p600: '#bf5b34', p700: '#a9502e', description: 'Naranja calido. Energia, creatividad, pasion.', info: '#3a8cc2', success: '#2d8a4e', warning: '#e6b800', danger: '#c43838', help: '#8050b8' },
];

const SeverityRow = ({ v }: { v: Variant }) => (
  <div style={{ display: 'flex', gap: 'var(--kreati-space-1)', marginBottom: 'var(--kreati-space-2)' }}>
    {[
      { name: 'Primary', bg: v.primary },
      { name: 'Info', bg: v.info },
      { name: 'Success', bg: v.success },
      { name: 'Warning', bg: v.warning },
      { name: 'Danger', bg: v.danger },
      { name: 'Help', bg: v.help },
    ].map(({ name, bg }) => (
      <div key={name} style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ height: '28px', background: bg, borderRadius: 'var(--kreati-radius-sm)' }} title={`${name}: ${bg}`} />
        <div style={{ fontSize: '9px', color: '#a8a8a2', marginTop: '2px', ...base }}>{name}</div>
      </div>
    ))}
  </div>
);

const VariantCard = ({ v }: { v: Variant }) => (
  <div style={{ background: '#fdfcfa', border: '1px solid #e6e6e1', borderRadius: 'var(--kreati-radius-lg)', overflow: 'hidden' }}>
    <div style={{ background: v.primary, padding: 'var(--kreati-space-4)', color: '#fff', ...base }}>
      <div style={{ fontWeight: 'var(--kreati-font-weight-bold)' as string, fontSize: 'var(--kreati-font-size-md)' }}>{v.name}</div>
      <div style={{ fontSize: 'var(--kreati-font-size-xs)', opacity: 0.85 }}>{v.primary}</div>
    </div>
    <div style={{ padding: 'var(--kreati-space-4)' }}>
      <div style={{ ...base, color: '#6e6e68', fontSize: 'var(--kreati-font-size-xs)', marginBottom: 'var(--kreati-space-3)' }}>{v.description}</div>
      <div style={{ display: 'flex', gap: '2px', marginBottom: 'var(--kreati-space-3)' }}>
        {[v.p50, v.p100, v.p200, v.p300, v.p400, v.primary, v.p600, v.p700].map((c, i) => (
          <div key={i} style={{ flex: 1, height: '24px', background: c, borderRadius: i === 0 ? '4px 0 0 4px' : i === 7 ? '0 4px 4px 0' : '0' }} title={c} />
        ))}
      </div>
      <SeverityRow v={v} />
      <div style={{ display: 'flex', gap: 'var(--kreati-space-2)', flexWrap: 'wrap' }}>
        <button style={{ background: v.primary, color: '#fff', border: 'none', padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base, fontSize: 'var(--kreati-font-size-xs)' }}>Primary</button>
        <button style={{ background: 'transparent', color: v.primary, border: `2px solid ${v.primary}`, padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base, fontSize: 'var(--kreati-font-size-xs)' }}>Outlined</button>
        <button style={{ background: v.warning, color: '#121210', border: 'none', padding: 'var(--kreati-space-2) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base, fontSize: 'var(--kreati-font-size-xs)' }}>Accent</button>
      </div>
    </div>
  </div>
);

const FullPreview = () => {
  const [active, setActive] = useState(variants[0]);
  return (
    <div style={{ padding: 'var(--kreati-space-6)', background: '#f4f2ee', minHeight: '100vh', ...base }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--kreati-space-4)' }}>
          <div style={{ fontWeight: 'var(--kreati-font-weight-bold)' as string, fontSize: 'var(--kreati-font-size-lg)', color: '#242421' }}>
            Interactive Preview — {active.name} ({active.primary})
          </div>
          <div style={{ color: '#6e6e68', fontSize: 'var(--kreati-font-size-xs)', marginTop: 'var(--kreati-space-1)' }}>{active.description}</div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--kreati-space-2)', marginBottom: 'var(--kreati-space-4)' }}>
          {variants.map((v) => (
            <button key={v.name} onClick={() => setActive(v)} style={{ background: active.name === v.name ? v.primary : '#fdfcfa', color: active.name === v.name ? '#fff' : '#242421', border: `2px solid ${v.primary}`, padding: 'var(--kreati-space-1) var(--kreati-space-3)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base, fontSize: 'var(--kreati-font-size-xs)', fontWeight: active.name === v.name ? 'var(--kreati-font-weight-semibold)' as string : 'normal' }}>
              {v.name}
            </button>
          ))}
        </div>

        {/* Severity palette */}
        <div style={{ background: '#fdfcfa', border: '1px solid #e6e6e1', borderRadius: 'var(--kreati-radius-lg)', padding: 'var(--kreati-space-4)', marginBottom: 'var(--kreati-space-4)' }}>
          <div style={{ fontWeight: 'var(--kreati-font-weight-semibold)' as string, marginBottom: 'var(--kreati-space-3)', color: '#242421' }}>Severity Palette</div>
          <div style={{ display: 'flex', gap: 'var(--kreati-space-2)', flexWrap: 'wrap', marginBottom: 'var(--kreati-space-3)' }}>
            {[
              { name: 'Primary', bg: active.primary, text: '#fff' },
              { name: 'Info', bg: active.info, text: '#fff' },
              { name: 'Success', bg: active.success, text: '#fff' },
              { name: 'Warning', bg: active.warning, text: '#121210' },
              { name: 'Danger', bg: active.danger, text: '#fff' },
              { name: 'Help', bg: active.help, text: '#fff' },
            ].map(({ name, bg, text }) => (
              <div key={name} style={{ background: bg, color: text, padding: 'var(--kreati-space-2) var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-sm)', fontSize: 'var(--kreati-font-size-xs)', textAlign: 'center', minWidth: '80px' }}>
                {name}<br /><span style={{ opacity: 0.8, fontSize: '10px' }}>{bg}</span>
              </div>
            ))}
          </div>
          {/* Light variants */}
          <div style={{ display: 'flex', gap: 'var(--kreati-space-1)' }}>
            {[active.primary, active.info, active.success, active.warning, active.danger, active.help].map((c, i) => (
              <div key={i} style={{ flex: 1, height: '8px', background: c, borderRadius: i === 0 ? '4px 0 0 4px' : i === 5 ? '0 4px 4px 0' : '0', opacity: 0.2 }} />
            ))}
          </div>
        </div>

        {/* Page mock */}
        <div style={{ borderRadius: 'var(--kreati-radius-lg)', overflow: 'hidden', border: '1px solid #e6e6e1', boxShadow: '0 4px 12px rgba(18,18,16,0.08)' }}>
          <div style={{ background: active.primary, padding: 'var(--kreati-space-3) var(--kreati-space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#fff', fontWeight: 'var(--kreati-font-weight-bold)' as string }}>Kreatiware</div>
            <div style={{ display: 'flex', gap: 'var(--kreati-space-4)' }}>
              {['Home', 'Projects', 'About'].map((l) => <span key={l} style={{ color: 'rgba(255,255,255,0.85)', fontSize: 'var(--kreati-font-size-xs)', cursor: 'pointer' }}>{l}</span>)}
            </div>
          </div>

          <div style={{ background: active.p50, padding: 'var(--kreati-space-8) var(--kreati-space-6)', textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--kreati-font-size-xl)', fontWeight: 'var(--kreati-font-weight-bold)' as string, color: active.primary, marginBottom: 'var(--kreati-space-2)' }}>Desarrolla · Diseña · Crea</div>
            <div style={{ color: '#6e6e68', fontSize: 'var(--kreati-font-size-sm)', marginBottom: 'var(--kreati-space-4)' }}>Software, diseño y productos creativos</div>
            <div style={{ display: 'flex', gap: 'var(--kreati-space-2)', justifyContent: 'center' }}>
              <button style={{ background: active.primary, color: '#fff', border: 'none', padding: 'var(--kreati-space-2) var(--kreati-space-6)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base }}>Get Started</button>
              <button style={{ background: active.warning, color: '#121210', border: 'none', padding: 'var(--kreati-space-2) var(--kreati-space-6)', borderRadius: 'var(--kreati-radius-sm)', cursor: 'pointer', ...base }}>Explore</button>
            </div>
          </div>

          <div style={{ background: '#fdfcfa', padding: 'var(--kreati-space-6)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--kreati-space-3)', marginBottom: 'var(--kreati-space-4)' }}>
              {[
                { label: 'Projects', value: '48', color: active.primary, bg: active.p50 },
                { label: 'Revenue', value: '$12.4k', color: active.success, bg: '#e8f5ed' },
                { label: 'Alerts', value: '3', color: active.danger, bg: '#fceaea' },
              ].map(({ label, value, color, bg }) => (
                <div key={label} style={{ background: bg, padding: 'var(--kreati-space-4)', borderRadius: 'var(--kreati-radius-md)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'var(--kreati-font-size-lg)', fontWeight: 'var(--kreati-font-weight-bold)' as string, color }}>{value}</div>
                  <div style={{ fontSize: 'var(--kreati-font-size-xs)', color: '#6e6e68' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--kreati-space-3)' }}>
              {[
                { title: 'Web App', tag: 'In Progress', tagBg: active.warning, tagColor: '#121210' },
                { title: 'Brand Design', tag: 'Review', tagBg: active.info, tagColor: '#fff' },
                { title: '3D Model', tag: 'Done', tagBg: active.success, tagColor: '#fff' },
                { title: 'Editorial', tag: 'New', tagBg: active.help, tagColor: '#fff' },
              ].map(({ title, tag, tagBg, tagColor }) => (
                <div key={title} style={{ border: '1px solid #e6e6e1', borderRadius: 'var(--kreati-radius-md)', padding: 'var(--kreati-space-3)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'var(--kreati-font-weight-semibold)' as string, color: '#242421', ...base }}>{title}</span>
                    <span style={{ background: tagBg, color: tagColor, padding: '2px 8px', borderRadius: '9999px', fontSize: '10px' }}>{tag}</span>
                  </div>
                  <div style={{ marginTop: 'var(--kreati-space-2)', height: '4px', background: '#e6e6e1', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.random() * 60 + 30}%`, height: '100%', background: active.primary, borderRadius: '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: active.p700, padding: 'var(--kreati-space-3) var(--kreati-space-4)', color: 'rgba(255,255,255,0.7)', fontSize: 'var(--kreati-font-size-xs)', textAlign: 'center', ...base }}>
            Kreatiware — Desarrolla · Diseña · Crea
          </div>
        </div>
      </div>
    </div>
  );
};

export const InteractivePreview: Story = {
  name: 'Interactive Full Preview',
  render: () => <FullPreview />,
};

export const PrimaryVariants: Story = {
  name: 'Compare All Variants',
  render: () => (
    <div style={{ padding: 'var(--kreati-space-4)', background: '#f4f2ee', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'var(--kreati-space-4)', ...base }}>
          <div style={{ fontWeight: 'var(--kreati-font-weight-bold)' as string, fontSize: 'var(--kreati-font-size-lg)', color: '#242421' }}>Kreati Theme — All Variants with Severities</div>
          <div style={{ color: '#6e6e68', fontSize: 'var(--kreati-font-size-xs)', marginTop: 'var(--kreati-space-1)' }}>Each variant shows its primary scale + full severity palette (info, success, warning, danger, help).</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--kreati-space-4)' }}>
          {variants.map((v) => <VariantCard key={v.name} v={v} />)}
        </div>
      </div>
    </div>
  ),
};
