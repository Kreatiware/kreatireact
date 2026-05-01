import React, { useState, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  KreatiProvider,
  Button,
  ButtonGroup,
  DropdownButton,
  ToggleButton,
  ToggleButtonGroup,
  Input,
  InputMask,
  InputGroup,
  Textarea,
  Select,
  MultiSelect,
  AutoComplete,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  Calendar,
  Rating,
  ColorPicker,
  Dial,
  FileUpload,
  Tag,
  Badge,
  Chip,
  Avatar,
  AvatarGroup,
  ProgressBar,
  Spinner,
  Message,
  Skeleton,
  EmptyState,
  Card,
  Panel,
  Tabs,
  TabPanel,
  Accordion,
  AccordionTab,
  Stepper,
  StepperPanel,
  Divider,
  Pagination,
  Timeline,
  Tree,
  TreeSelect,
  List,
  Image,
  Carousel,
  DataTable,
  Breadcrumb,
  TabMenu,
  MenuBar,
  Tooltip,
  Popover,
  Drawer,
  ToastContainer,
  Dialog,
  CodeBlock,
  TextEditor,
  SegmentedControl,
  Kanban,
  Gantt,
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
  SankeyChart,
} from "@kreatiware/react";
import type { ToastContainerRef, KanbanCard, KanbanColumn, KanbanTag, KanbanAssignee, KreatiTheme, GanttTask } from "@kreatiware/react";
import { Check, Search, Bell, Settings, Home, User } from "@kreatiware/icons";

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
    const [drawerOpen, setDrawerOpen] = useState(false);
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
    const ganttTasks: GanttTask[] = [
      { id: "g1", title: "Planning", start: "2026-05-01", end: "2026-05-12", type: "summary" },
      { id: "g2", title: "Requirements", start: "2026-05-01", end: "2026-05-05", progress: 100, parentId: "g1", severity: "success" },
      { id: "g3", title: "Design", start: "2026-05-06", end: "2026-05-12", progress: 60, parentId: "g1", dependencies: ["g2"] },
      { id: "g4", title: "Development", start: "2026-05-13", end: "2026-05-25", progress: 20, dependencies: [{ taskId: "g3", type: "FS" }], severity: "accent" },
      { id: "g5", title: "Launch", start: "2026-05-25", end: "2026-05-25", type: "milestone", dependencies: ["g4"], severity: "danger" },
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

          <Section title="Buttons (Extended)">
            <ButtonGroup>
              <Button label="Left" severity="primary" size="sm" />
              <Button label="Center" severity="primary" size="sm" />
              <Button label="Right" severity="primary" size="sm" />
            </ButtonGroup>
            <DropdownButton label="Export" severity="accent" size="sm" items={[{ key: "csv", label: "CSV" }, { key: "pdf", label: "PDF" }, { key: "json", label: "JSON" }]} />
            <ToggleButtonGroup options={[{ value: "list", label: "List" }, { value: "grid", label: "Grid" }]} defaultValue="list" size="sm" />
            <ToggleButton label="Pin" size="sm" />
          </Section>

          <Section title="Navigation">
            <div style={{ width: "100%" }}>
              <Breadcrumb items={[{ key: "home", label: "Home", icon: <Home size={14} /> }, { key: "proj", label: "Projects" }, { key: "kreati", label: "Kreati" }]} />
            </div>
            <div style={{ width: "100%" }}>
              <TabMenu items={[{ key: "overview", label: "Overview" }, { key: "analytics", label: "Analytics" }, { key: "settings", label: "Settings" }]} />
            </div>
            <div style={{ width: "100%" }}>
              <MenuBar items={[{ key: "file", label: "File", items: [{ key: "new", label: "New" }, { key: "open", label: "Open" }, { key: "save", label: "Save" }] }, { key: "edit", label: "Edit", items: [{ key: "undo", label: "Undo" }, { key: "redo", label: "Redo" }] }, { key: "view", label: "View" }]} />
            </div>
          </Section>

          <Section title="Form Inputs">
            <Input label="Text input" placeholder="Type here..." size="sm" />
            <Input label="With icon" iconLeft={<Search size={16} />} size="sm" />
            <Input label="Password" type="password" size="sm" />
            <Textarea label="Textarea" rows={2} size="sm" />
            <Select label="Select" options={[{ value: "a", label: "Option A" }, { value: "b", label: "Option B" }, { value: "c", label: "Option C" }]} size="sm" />
            <MultiSelect label="Multi" options={[{ value: "x", label: "Tag X" }, { value: "y", label: "Tag Y" }]} chipDisplay size="sm" />
            <AutoComplete suggestions={[{ value: "react", label: "React" }, { value: "angular", label: "Angular" }, { value: "vue", label: "Vue" }]} placeholder="Framework..." size="sm" />
            <InputMask mask="(999) 999-9999" placeholder="(___) ___-____" label="Phone" size="sm" />
            <InputGroup suffix={<Button label="Go" severity="primary" size="sm" />}>
              <Input placeholder="Search..." size="sm" fullWidth />
            </InputGroup>
            <ColorPicker />
            <FileUpload accept="image/*" label="Upload" />
          </Section>

          <Section title="Controls (Extended)">
            <CheckboxGroup options={[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }, { value: "c", label: "Gamma" }]} defaultValue={["a"]} selectAll />
            <RadioGroup name="showcase-rg" options={[{ value: "x", label: "Option X" }, { value: "y", label: "Option Y" }]} defaultValue="x" />
            <div style={{ width: "10rem" }}>
              <Dial value={65} />
            </div>
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

          <Section title="Tags, Badges & Chips">
            {(["primary", "secondary", "success", "info", "warning", "help", "danger", "accent"] as const).map((s) => (
              <Tag key={s} severity={s} rounded>{s}</Tag>
            ))}
            <Chip removable>Removable</Chip>
            <Chip variant="success" icon={<Check size={12} />}>Done</Chip>
            <Badge value={3} severity="danger">
              <Bell size={24} />
            </Badge>
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
            <div style={{ width: "100%", display: "flex", gap: "var(--kreati-space-3)" }}>
              <Skeleton shape="circle" width="3rem" height="3rem" />
              <div style={{ flex: 1 }}>
                <Skeleton shape="text" lines={3} />
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <EmptyState icon={<Search size={32} />} title="No results" description="Try a different search term" size="sm" />
            </div>
          </Section>

          <Section title="Overlays">
            <Tooltip content="Hello from Kreati!"><Button label="Hover me (Tooltip)" severity="secondary" size="sm" /></Tooltip>
            <Popover content={<div style={{ padding: "var(--kreati-space-2)" }}>Popover content</div>}><Button label="Click me (Popover)" severity="info" size="sm" /></Popover>
            <Button label="Open Drawer" severity="help" size="sm" onClick={() => setDrawerOpen(true)} />
            <Drawer visible={drawerOpen} onHide={() => setDrawerOpen(false)} header="Kreati Drawer" size="sm">
              <p style={{ color: "var(--kreati-text-body)" }}>Drawer content with theme colors.</p>
            </Drawer>
          </Section>

          <Section title="Cards & Layout">
            <Card title="Kreati Card" subtitle="With accent theme" variant="elevated" style={{ width: "16rem" }}>
              <p style={{ fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-body)" }}>Card content with Kreati theme styling.</p>
            </Card>
            <Panel header="Collapsible Panel" toggleable style={{ width: "20rem" }}>
              <p style={{ fontSize: "var(--kreati-font-size-sm)", color: "var(--kreati-text-body)" }}>Panel content here.</p>
            </Panel>
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
            <div style={{ width: "100%" }}>
              <Stepper activeStep="step2">
                <StepperPanel stepKey="step1" header="Account" />
                <StepperPanel stepKey="step2" header="Profile" />
                <StepperPanel stepKey="step3" header="Confirm" />
              </Stepper>
            </div>
            <Pagination totalItems={120} itemsPerPage={10} defaultPage={3} size="sm" />
            <SegmentedControl options={[{ value: "day", label: "Day" }, { value: "week", label: "Week" }, { value: "month", label: "Month" }]} defaultValue="week" size="sm" />
          </Section>

          <Section title="Data Display">
            <div style={{ width: "100%" }}>
              <Timeline events={[{ key: "1", content: "Project started" }, { key: "2", content: "Design phase" }, { key: "3", content: "Development" }]} />
            </div>
            <div style={{ width: "16rem" }}>
              <Tree nodes={[{ key: "1", label: "src", children: [{ key: "1-1", label: "components" }, { key: "1-2", label: "utils" }] }, { key: "2", label: "public" }]} />
            </div>
            <TreeSelect nodes={[{ key: "1", label: "Frontend", children: [{ key: "1-1", label: "React" }, { key: "1-2", label: "Vue" }] }, { key: "2", label: "Backend" }]} placeholder="Select tech..." size="sm" />
            <div style={{ width: "16rem" }}>
              <List items={[{ key: "dash", label: "Dashboard", icon: <Home size={16} /> }, { key: "users", label: "Users", icon: <User size={16} /> }, { key: "settings", label: "Settings", icon: <Settings size={16} /> }]} />
            </div>
            <Image src="https://picsum.photos/200/120" alt="Sample" width="12rem" preview />
            <div style={{ width: "20rem" }}>
              <Carousel items={[{ content: <div style={{ padding: "var(--kreati-space-4)", textAlign: "center", background: "var(--kreati-surface-hover)" }}>Slide 1</div> }, { content: <div style={{ padding: "var(--kreati-space-4)", textAlign: "center", background: "var(--kreati-surface-hover)" }}>Slide 2</div> }, { content: <div style={{ padding: "var(--kreati-space-4)", textAlign: "center", background: "var(--kreati-surface-hover)" }}>Slide 3</div> }]} />
            </div>
          </Section>

          <Section title="Rich Content">
            <div style={{ width: "100%" }}>
              <CodeBlock code={`const greeting = "Hello, Kreati!";\nconsole.log(greeting);`} language="typescript" title="example.ts" />
            </div>
            <div style={{ width: "100%" }}>
              <TextEditor value="<p>Rich text editor with <strong>bold</strong> and <em>italic</em> support.</p>" />
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

          <Section title="DataTable">
            <div style={{ width: "100%" }}>
              <DataTable
                value={[
                  { id: 1, name: "Kreati React", status: "Active", version: "0.9.0" },
                  { id: 2, name: "Kreati Icons", status: "Active", version: "0.8.0" },
                  { id: 3, name: "Kreati Layout", status: "Stable", version: "1.0.0" },
                ]}
                columns={[
                  { field: "name", header: "Package", sortable: true },
                  { field: "status", header: "Status" },
                  { field: "version", header: "Version" },
                ]}
                size="sm"
                stripedRows
              />
            </div>
          </Section>

          <Divider />

          <Section title="Gantt Chart">
            <div style={{ width: "100%" }}>
              <Gantt
                tasks={ganttTasks}
                rowHeight={36}
              />
            </div>
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
              <div style={{ gridColumn: "1 / -1" }}><h4 style={{ marginBottom: "var(--kreati-space-2)", color: "var(--kreati-text-secondary)" }}>Sankey</h4><SankeyChart nodes={[{ id: "a", name: "Source A" }, { id: "b", name: "Source B" }, { id: "c", name: "Process" }, { id: "d", name: "Output" }]} links={[{ source: "a", target: "c", value: 30 }, { source: "b", target: "c", value: 20 }, { source: "c", target: "d", value: 50 }]} height={200} /></div>
            </div>
          </Section>
        </div>
      </KreatiProvider>
    );
  },
};
