import type { FilterMatchMode } from "./types";

/**
 * Resolves a nested field value from an object using dot notation.
 * e.g. getFieldValue(row, 'address.city') => row.address.city
 */
export const getFieldValue = (obj: object, field: string): unknown => {
  return field.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object")
      return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
};

/** Check if a value matches a filter */
export const matchFilter = (
  value: unknown,
  filterValue: unknown,
  matchMode: FilterMatchMode
): boolean => {
  if (filterValue === null || filterValue === undefined || filterValue === "")
    return true;
  if (value === null || value === undefined) return false;

  const str = String(value).toLowerCase();
  const filter = String(filterValue).toLowerCase();

  switch (matchMode) {
    case "contains":
      return str.includes(filter);
    case "startsWith":
      return str.startsWith(filter);
    case "endsWith":
      return str.endsWith(filter);
    case "equals":
      return str === filter;
    case "notEquals":
      return str !== filter;
    case "gt":
      return Number(value) > Number(filterValue);
    case "gte":
      return Number(value) >= Number(filterValue);
    case "lt":
      return Number(value) < Number(filterValue);
    case "lte":
      return Number(value) <= Number(filterValue);
    default:
      return true;
  }
};

/** Generate CSV string from data */
export const generateCSV = <T extends object>(
  data: T[],
  columns: { field: string; header?: string }[]
): string => {
  const visibleCols = columns.filter(c => c.field && !c.field.startsWith("__"));
  const headers = visibleCols
    .map(c => `"${(c.header || c.field).replace(/"/g, '""')}"`)
    .join(",");
  const rows = data.map(row =>
    visibleCols
      .map(c => {
        const val = getFieldValue(row, c.field);
        const str = val === null || val === undefined ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headers, ...rows].join("\n");
};

/** Download a string as a file */
export const downloadFile = (
  content: string,
  filename: string,
  mimeType: string
): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
