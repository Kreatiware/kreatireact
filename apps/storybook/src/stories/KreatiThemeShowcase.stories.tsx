import React, { useState, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  KreatiProvider,
  Button,
  Input,
  Textarea,
  Select,
  MultiSelect,
  Checkbox,
  Switch,
  Radio,
  Slider,
  Calendar,
  Rating,
  Tag,
  Badge,
  Avatar,
  AvatarGroup,
  ProgressBar,
  Spinner,
  Message,
  Card,
  Tabs,
  TabPanel,
  Accordion,
  AccordionTab,
  Divider,
  ToastContainer,
  Dialog,
  Kanban,
  LineChart,
  BarChart,
  AreaChart,
  ScatterChart,
  PieChart,
  DonutChart,
  RadarChart,
  PolarAreaChart,
  GaugeChart,
  HeatmapChart,
  FunnelChart,
  TreemapChart,
} from "@kreatiware/react";
import type { ToastContainerRef, KanbanCard, KanbanColumn, KanbanTag, KanbanAssignee, KreatiTheme } from "@kreatiware/react";
import { Check, Search, Bell, Settings, Star, Heart } from "@kreatiware/icons";

const meta = {
  title: "Foundation/Kreati Theme Showcase",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ marginBottom: "2rem" }}>
    <h3 style={{ fontFamily: "var(--kreati-font-family-display)", fontSize: "var(--kreati-font-size-lg)", marginBottom: "var(--kreati-space-3)", color: "var(--kreati-text-primary)" }}>{title}</h3>
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--kreati-space-3)", alignItems: "flex-start" }}>
      {children}
    </div>
  </div>
);

export const AllComponents: Story = {
  render: () => {
    const toastRef = useRef<ToastContainerRef>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sliderVal, setSliderVal] = useState(40);
    const [ratingVal, setRatingVal] = useState(3);
    const [switchVal, setSwitchVal] = useState(true);
    const [theme, setTheme] = useState<KreatiTheme>("kreati");

    const themes: KreatiTheme[] = ["light", "dark", "midnight", "abyss", "soft", "arctic", "high-contrast", "kreati"];

    const kanbanTags: KanbanTag[] = [
      { id: "ui", label: "UI", severity: "help" },
      { id: "api", label: "API", severity: "danger" },
    ];
    const kanbanAssignees: KanbanAssignee[] = [
      { id: "a", label: "AB" },
      { id: "b", label: "CD" },
    ];
    const kanbanCols: KanbanColumn[] = [
      { id: "todo", title: "To Do", severity: "info" },
      { id: "doing", title: "Doing", severity: "warning", maxCards: 3 },
      { id: "done", title: "Done", severity: "success" },
    ];
    const kanbanCards: KanbanCard[] = [
      { id: "k1", title: "Design tokens", tagIds: ["ui"], priority: "high", assigneeIds: ["a"], checklist: [{ id: "c1", label: "Colors", checked: true }, { id: "c2", label: "Spacing", checked: false }] },
      { id: "k2", title: "REST API", tagIds: ["api"], priority: "critical", assigneeIds: ["a", "b"], dueDate: "2026-05-01" },
      { id: "k3", title: "Documentation", priority: "low" },
    ];

    return (
      <KreatiProvider theme={theme}>
        <ToastContainer ref={toastRef} position="top-right" />
        <div style={{ padding: "var(--kreati-space-6)", background: "var(--kreati-surface)", minHeight: "100vh" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--kreati-space-6)" }}>
            <h2 style={{ fontFamily: "var(--kreati-font-family-display)", fontSize: "var(--kreati-font-size-2xl)", color: "var(--kreati-text-primary)", margin: 0 }}>
              Theme Showcase
            </h2>
            <div style={{ display: "flex", gap: "var(--kreati-space-2)", flexWrap: "wrap" }}>
              {themes.map((t) => (
                <Button key={t} label={t} size="sm" severity={t === theme ? "primary" : "secondary"} buttonType={t === theme ? "filled" : "outlined"} onClick={() => setTheme(t)} />
              ))}
            </div>
          </div>

          <Section title="Buttons">
            <Button label="Primary" severity="primary" />
            <Button label="Secondary" severity="secondary" />
            <Button label="Success" severity="success" />
            <Button label="Warning" severity="warning" />
            <Button label="Danger" severity="danger" />
            <Button label="Help" severity="help" />
            <Button label="Accent" severity="accent" />
            <Button label="Outlined" severity="primary" buttonType="outlined" />
            <Button label="Text" severity="primary" buttonType="text" />
            <Button iconLeft={<Check size={16} />} ariaLabel="Check" rounded severity="primary" />
          </Section>

          <Section title="Form Inputs">
            <Input label="Text input" placeholder="Type here..." size="sm" />
            <Input label="With icon" iconLeft={<Search size={16} />} size="sm" />
            <Input label="Password" type="password" size="sm" />
            <Textarea label="Textarea" rows={2} size="sm" />
            <Select label="Select" options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }, { value: "c", label: "Option C" }]} size="sm" />
            <MultiSelect label="Multi" options={[{ value: "x", label: "Tag X" }, { value: "y", label: "Tag Y" }]} chipDisplay size="sm" />
          </Section>

          <Section title="Controls">
            <Checkbox label="Checkbox" defaultChecked />
            <Switch label="Switch" checked={switchVal} onChange={() => setSwitchVal(!switchVal)} />
            <Radio label="Radio A" name="demo" value="a" defaultChecked />
            <Radio label="Radio B" name="demo" value="b" />
            <div style={{ width: "12rem" }}>
              <Slider value={sliderVal} onChange={(v) => setSliderVal(v as number)} />
            </div>
            <Rating value={ratingVal} onChange={setRatingVal} />
            <Calendar size="sm" showButtonBar />
          </Section>

          <Section title="Tags & Badges">
            {(["primary", "secondary", "success", "info", "warning", "help", "danger", "accent"] as const).map((s) => (
              <Tag key={s} severity={s} rounded>{s}</Tag>
            ))}
            <div style={{ position: "relative", display: "inline-block" }}>
              <Bell size={24} />
              <Badge>3</Badge>
            </div>
          </Section>

          <Section title="Avatars">
            <AvatarGroup max={4} size="md">
              <Avatar label="AB" severity="primary" />
              <Avatar label="CD" severity="success" />
              <Avatar label="EF" severity="warning" />
              <Avatar label="GH" severity="danger" />
              <Avatar label="IJ" severity="accent" />
            </AvatarGroup>
          </Section>

          <Section title="Feedback">
            <div style={{ width: "100%", maxWidth: "30rem" }}>
              <ProgressBar value={65} severity="primary" showValue />
            </div>
            <div style={{ width: "100%", maxWidth: "30rem" }}>
              <ProgressBar value={90} severity="accent" showValue />
            </div>
            <Spinner size="md" />
            <div style={{ width: "100%" }}>
              <Message severity="success" icon>Operation completed successfully.</Message>
            </div>
            <div style={{ width: "100%" }}>
              <Message severity="warning" icon>Please review before continuing.</Message>
            </div>
            <Button label="Show Toast" severity="accent" onClick={() => toastRef.current?.show({ severity: "success", summary: "Kreati Theme", detail: "Toast with Kreati theme colors", life: 3000, icon: true })} />
          </Section>

          <Section title="Cards & Layout">
            <Card title="Kreati Card" subtitle="With accent theme" variant="elevated" style={{ width: "16rem" }}>
              <p style={{ fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-body)" }}>Card content with Kreati theme styling.</p>
            </Card>
            <div style={{ width: "20rem" }}>
              <Tabs>
                <TabPanel tabKey="t1" header="Tab 1"><p>First tab content</p></TabPanel>
                <TabPanel tabKey="t2" header="Tab 2"><p>Second tab content</p></TabPanel>
              </Tabs>
            </div>
            <div style={{ width: "20rem" }}>
              <Accordion>
                <AccordionTab tabKey="1" header="Section 1"><p>Accordion content</p></AccordionTab>
                <AccordionTab tabKey="2" header="Section 2"><p>More content</p></AccordionTab>
              </Accordion>
            </div>
          </Section>

          <Section title="Dialog">
            <Button label="Open Dialog" severity="primary" onClick={() => setDialogOpen(true)} />
            <Dialog visible={dialogOpen} onHide={() => setDialogOpen(false)} header="Kreati Dialog" size="sm">
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--kreati-space-3)" }}>
                <Input label="Name" size="sm" />
                <Select label="Role" options={[{ value: "dev", label: "Developer" }, { value: "design", label: "Designer" }]} size="sm" />
                <div style={{ display: "flex", gap: "var(--kreati-space-2)", justifyContent: "flex-end" }}>
                  <Button label="Cancel" buttonType="text" severity="secondary" size="sm" onClick={() => setDialogOpen(false)} />
                  <Button label="Save" severity="primary" size="sm" onClick={() => setDialogOpen(false)} />
                </div>
              </div>
            </Dialog>
          </Section>

          <Divider />

          <Section title="Kanban Board">
            <div style={{ width: "100%" }}>
              <Kanban
                defaultColumns={kanbanCols}
                defaultCards={kanbanCards}
                defaultCardOrder={{ todo: ["k1"], doing: ["k2"], done: ["k3"] }}
                availableTags={kanbanTags}
                availableAssignees={kanbanAssignees}
              />
            </div>
          </Section>

          <Divider />

          <Section title="Charts (Kreati palette: anil, terracotta, emerald, gold...)">
            <div style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--kreati-space-6)" }}>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Line</h4><LineChart series={[{ id: "s1", name: "2025", data: [{ x: 0, y: 40 }, { x: 1, y: 55 }, { x: 2, y: 45 }, { x: 3, y: 70 }, { x: 4, y: 65 }, { x: 5, y: 80 }] }, { id: "s2", name: "2024", data: [{ x: 0, y: 30 }, { x: 1, y: 40 }, { x: 2, y: 35 }, { x: 3, y: 50 }, { x: 4, y: 55 }, { x: 5, y: 60 }] }]} xAxis={{ categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] }} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Bar</h4><BarChart series={[{ id: "b1", name: "Q1", data: [{ x: 0, y: 120 }, { x: 1, y: 80 }, { x: 2, y: 95 }, { x: 3, y: 110 }] }, { id: "b2", name: "Q2", data: [{ x: 0, y: 140 }, { x: 1, y: 90 }, { x: 2, y: 105 }, { x: 3, y: 130 }] }]} xAxis={{ categories: ["North", "South", "East", "West"] }} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Area</h4><AreaChart series={[{ id: "a1", name: "Visitors", data: [{ x: 0, y: 200 }, { x: 1, y: 350 }, { x: 2, y: 300 }, { x: 3, y: 450 }, { x: 4, y: 400 }] }, { id: "a2", name: "Unique", data: [{ x: 0, y: 120 }, { x: 1, y: 200 }, { x: 2, y: 180 }, { x: 3, y: 280 }, { x: 4, y: 250 }] }]} xAxis={{ categories: ["Mon", "Tue", "Wed", "Thu", "Fri"] }} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Scatter</h4><ScatterChart series={[{ id: "sc1", name: "Group A", data: [{ x: 10, y: 30 }, { x: 25, y: 50 }, { x: 40, y: 35 }, { x: 55, y: 70 }] }, { id: "sc2", name: "Group B", data: [{ x: 15, y: 45 }, { x: 35, y: 25 }, { x: 60, y: 60 }, { x: 80, y: 40 }] }]} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Pie</h4><PieChart data={[{ id: "a", name: "Product A", value: 40 }, { id: "b", name: "Product B", value: 30 }, { id: "c", name: "Product C", value: 20 }, { id: "d", name: "Other", value: 10 }]} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Donut</h4><DonutChart data={[{ id: "e", name: "Engineering", value: 45 }, { id: "m", name: "Marketing", value: 25 }, { id: "s", name: "Sales", value: 20 }, { id: "su", name: "Support", value: 10 }]} height={200} centerLabel="$120k" /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Radar</h4><RadarChart axes={["Design", "Frontend", "Backend", "DevOps", "Testing"]} series={[{ id: "r1", name: "Team A", values: [80, 90, 70, 60, 85] }, { id: "r2", name: "Team B", values: [60, 70, 90, 80, 65] }]} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Polar Area</h4><PolarAreaChart data={[{ id: "a", name: "A", value: 40 }, { id: "b", name: "B", value: 65 }, { id: "c", name: "C", value: 30 }, { id: "d", name: "D", value: 55 }, { id: "e", name: "E", value: 45 }]} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Gauge</h4><GaugeChart value={73} min={0} max={100} zones={[{ from: 0, to: 40, severity: "danger" }, { from: 40, to: 70, severity: "warning" }, { from: 70, to: 100, severity: "success" }]} height={180} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Heatmap</h4><HeatmapChart data={[{ x: 0, y: 0, value: 5 }, { x: 0, y: 1, value: 8 }, { x: 0, y: 2, value: 3 }, { x: 1, y: 0, value: 7 }, { x: 1, y: 1, value: 9 }, { x: 1, y: 2, value: 4 }, { x: 2, y: 0, value: 6 }, { x: 2, y: 1, value: 10 }, { x: 2, y: 2, value: 2 }]} xCategories={["Mon", "Tue", "Wed"]} yCategories={["AM", "PM", "Eve"]} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Funnel</h4><FunnelChart data={[{ id: "v", name: "Visitors", value: 5000 }, { id: "l", name: "Leads", value: 3000 }, { id: "q", name: "Qualified", value: 1500 }, { id: "c", name: "Closed", value: 300 }]} height={200} /></div>
              <div><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Treemap</h4><TreemapChart data={[{ id: "src", name: "src", value: 40 }, { id: "nm", name: "node_modules", value: 80 }, { id: "dist", name: "dist", value: 25 }, { id: "pub", name: "public", value: 10 }]} height={200} /></div>
            </div>
          </Section>
        </div>
      </KreatiProvider>
    );
  },
};
