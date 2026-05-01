import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Button,
  Input,
  Textarea,
  Select,
  MultiSelect,
  AutoComplete,
  InputMask,
  Calendar,
  ColorPicker,
  Rating,
  Slider,
  Checkbox,
  Radio,
  Switch,
  SegmentedControl,
  ToggleButton,
  ToggleButtonGroup,
  DropdownButton,
  ButtonGroup,
  Pagination,
  Tag,
  Badge,
  Chip,
} from "@kreatiware/react";

const meta = {
  title: "Foundation/Size Comparison",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj;

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const Cell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <td style={{ padding: "var(--kreati-space-2) var(--kreati-space-3)", verticalAlign: "middle", whiteSpace: "nowrap" }}>
    <div style={{ display: "flex", alignItems: "center", minHeight: "2.5rem" }}>
      {children}
    </div>
  </td>
);

const Header: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th style={{
    padding: "var(--kreati-space-2) var(--kreati-space-3)",
    textAlign: "left",
    fontSize: "var(--kreati-font-size-xs)",
    fontWeight: "var(--kreati-font-weight-semibold)" as unknown as number,
    color: "var(--kreati-text-secondary)",
    borderBottom: "2px solid var(--kreati-gray-200)",
    position: "sticky",
    top: 0,
    background: "var(--kreati-surface)",
    zIndex: 1,
  }}>
    {children}
  </th>
);

const SizeLabel: React.FC<{ size: string }> = ({ size }) => (
  <td style={{
    padding: "var(--kreati-space-2) var(--kreati-space-3)",
    fontWeight: "var(--kreati-font-weight-semibold)" as unknown as number,
    fontSize: "var(--kreati-font-size-sm)",
    color: "var(--kreati-text-primary)",
    position: "sticky",
    left: 0,
    background: "var(--kreati-surface)",
    zIndex: 1,
    borderRight: "2px solid var(--kreati-gray-200)",
  }}>
    {size}
  </td>
);

export const AllSizes: Story = {
  render: () => (
    <div style={{ padding: "var(--kreati-space-4)", overflow: "auto", maxHeight: "100vh" }}>
      <h2 style={{ fontFamily: "var(--kreati-font-family-display)", marginBottom: "var(--kreati-space-4)", color: "var(--kreati-text-primary)" }}>
        Component Size Grid
      </h2>
      <div style={{ overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <Header>Size</Header>
              <Header>Button</Header>
              <Header>Button Compact</Header>
              <Header>Button Outlined</Header>
              <Header>Input</Header>
              <Header>Select</Header>
              <Header>MultiSelect</Header>
              <Header>AutoComplete</Header>
              <Header>InputMask</Header>
              <Header>Calendar</Header>
              <Header>Textarea</Header>
              <Header>SegmentedControl</Header>
              <Header>SC Slim</Header>
              <Header>DropdownButton</Header>
              <Header>ButtonGroup</Header>
              <Header>ToggleButton</Header>
              <Header>ToggleButtonGroup</Header>
              <Header>Pagination</Header>
              <Header>Checkbox</Header>
              <Header>Radio</Header>
              <Header>Switch</Header>
              <Header>Tag</Header>
              <Header>Chip</Header>
            </tr>
          </thead>
          <tbody>
            {SIZES.map(s => (
              <tr key={s} style={{ borderBottom: "1px solid var(--kreati-gray-100)" }}>
                <SizeLabel size={s} />
                <Cell><Button label="Click" size={s} /></Cell>
                <Cell><Button label="Click" size={s} compact /></Cell>
                <Cell><Button label="Click" size={s} buttonType="outlined" /></Cell>
                <Cell><Input placeholder="Type..." size={s} /></Cell>
                <Cell><Select options={[{ value: "a", label: "Option" }]} placeholder="Pick" size={s} /></Cell>
                <Cell><MultiSelect options={[{ value: "a", label: "Tag" }]} placeholder="Pick" size={s} /></Cell>
                <Cell><AutoComplete suggestions={[{ value: "a", label: "Item" }]} placeholder="Search" size={s} /></Cell>
                <Cell><InputMask mask="999-999" placeholder="___-___" size={s} /></Cell>
                <Cell><Calendar placeholder="Date" size={s} /></Cell>
                <Cell><Textarea placeholder="Text" rows={1} size={s} /></Cell>
                <Cell>
                  <SegmentedControl
                    options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
                    defaultValue="a" size={s}
                  />
                </Cell>
                <Cell>
                  <SegmentedControl
                    options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]}
                    defaultValue="a" size={s} slim
                  />
                </Cell>
                <Cell><DropdownButton label="Export" items={[{ key: "csv", label: "CSV" }]} size={s} /></Cell>
                <Cell>
                  <ButtonGroup>
                    <Button label="L" size={s} />
                    <Button label="R" size={s} />
                  </ButtonGroup>
                </Cell>
                <Cell><ToggleButton label="Pin" size={s} /></Cell>
                <Cell>
                  <ToggleButtonGroup
                    options={[{ value: "a", label: "X" }, { value: "b", label: "Y" }]}
                    defaultValue="a" size={s}
                  />
                </Cell>
                <Cell><Pagination totalItems={50} itemsPerPage={10} size={s} /></Cell>
                <Cell><Checkbox label="Ok" size={s} /></Cell>
                <Cell><Radio label="Yes" name={`r-${s}`} value="y" size={s} /></Cell>
                <Cell><Switch label="" size={s} /></Cell>
                <Cell><Tag size={s}>Tag</Tag></Cell>
                <Cell><Chip size={s}>Chip</Chip></Cell>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
};
