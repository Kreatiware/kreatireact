# Ecosistema Kreati

> Herramientas frontend modernas para desarrolladores React — zero dependencies

## Paquetes

### [@kreatiware/react](./packages/react)
55+ componentes React tipados con ARIA/WCAG 2.1 AA, sistema de locale, y 8 temas.

```bash
npm install @kreatiware/react
```

### [@kreatiware/icons](./packages/icons)
54 iconos vectoriales SVG con componentes React y resolver por nombre.

```bash
npm install @kreatiware/icons
```

### [@kreatiware/layout](./packages/layout)
Sistema de utilities CSS para Flexbox, Grid, Spacing y tipografia responsive.

```bash
npm install @kreatiware/layout
```

## Inicio Rapido

```tsx
import { Button, Input, DataTable, KreatiProvider } from '@kreatiware/react';
import { ArrowRight } from '@kreatiware/icons';
import '@kreatiware/react/dist/style.css';
import '@kreatiware/react/themes/dark.css'; // optional: import themes you need
import '@kreatiware/layout/dist/index.css';

function App() {
  return (
    <KreatiProvider locale={es} theme="auto">
      <DataTable
        value={data}
        columns={columns}
        paginator
        rows={10}
        toolbar={['search', 'export', 'print']}
        selectionMode="checkbox"
        stripedRows
      />
    </KreatiProvider>
  );
}
```

## Componentes

### Formularios
Input, InputMask, InputGroup, Textarea, Select, MultiSelect, AutoComplete, Checkbox, CheckboxGroup, Radio, RadioGroup, Switch, Slider, Calendar, ColorPicker, FileUpload, Rating, Dial

### Feedback & Overlay
Dialog, Drawer, Tooltip, Popover, Toast, Message, MessageList, Spinner, ProgressBar, Skeleton

### Layout & Data
Card, Panel, Accordion, Tabs, TabMenu, Divider, Breadcrumb, Pagination, Avatar, Tag, Timeline, Tree, TreeSelect, Stepper, ScrollBar, ScrollArea, Image, List, DataTable

### Navegacion
NavigationBar, MenuBar, ContextMenu, DockMenu, SideMenu, TabMenu

### Botones
Button, ButtonGroup, DropdownButton, SpeedDial, ToggleButton, ToggleButtonGroup

### Base
Badge, Chip, HeroSection, DynamicSvg, FieldWrapper

## DataTable

Componente completo de tabla de datos con:
- Columnas dinamicas con templates personalizables
- Sort single/multiple, filtros globales y por columna
- Seleccion (click, checkbox), filas deshabilitables
- Edicion inline (celda y fila) con editores custom
- Drag & drop para reordenar filas y columnas
- Frozen columns, column groups, row grouping
- Row expansion y tree mode
- Virtual scroll (10,000+ filas)
- Resize de columnas, filas y celdas
- Toolbar preset (search, export, print, copy)
- Paginator customizable, column visibility
- CSV export, print, copy to clipboard
- ScrollBar de Kreati customizable
- ARIA completo y navegacion por teclado

## Iconos (54)

Chevrons, Arrows, Check, Times, Search, Plus, Minus, Filter, Sort, Eye, EyeOff, Mail, Lock, Phone, Clock, Calendar, User, Star, Heart, Bell, Home, Settings, Grid, List, Image, Folder, File, Upload, Download, Share, Copy, Print, Pencil, Trash, Refresh, ExternalLink, y mas.

## Temas

8 temas incluidos. Importa solo los que necesites:

| Tema | Tipo | Import |
|------|------|--------|
| Light | Default | (built-in) |
| Dark | Dark | `@kreatiware/react/themes/dark.css` |
| Midnight | Dark | `@kreatiware/react/themes/midnight.css` |
| Abyss | Dark (OLED) | `@kreatiware/react/themes/abyss.css` |
| Soft | Light (warm) | `@kreatiware/react/themes/soft.css` |
| Arctic | Light (cool) | `@kreatiware/react/themes/arctic.css` |
| High Contrast | Accessibility | `@kreatiware/react/themes/high-contrast.css` |
| Kreati | Brand | `@kreatiware/react/themes/kreati.css` |

```tsx
// Auto dark mode (follows system preference)
<KreatiProvider theme="auto">

// Manual theme
<KreatiProvider theme="midnight">

// Toggle programmatically
const { resolvedTheme, setTheme } = useKreatiTheme();
```

## Desarrollo

```bash
npm install          # Instalar dependencias
npm run dev          # Desarrollo
npm run build        # Build todos los paquetes
npm run storybook    # Storybook
npm run lint         # Linting
```

## Roadmap

- [x] **Fundacion**: Infraestructura, sistema de diseno, componentes base
- [x] **Etapa 1**: Formularios (18 componentes)
- [x] **Etapa 2**: Feedback & Overlay (10 componentes)
- [x] **Etapa 3**: Layout & Data Display (19 componentes + DataTable)
- [ ] **Etapa 4**: Temas & Dark Mode (ThemeProvider, dark mode, tema Corporate)
- [ ] **Etapa 5**: Distribucion npm publico & v1.0
- [ ] **Etapa 6**: Premium & Monetizacion

## Licencia

MIT - Brian - Kreatiware
