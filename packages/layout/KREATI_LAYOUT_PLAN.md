# @kreatiware/layout — Plan de Desarrollo

## Vision
Sistema completo de CSS utilities para layout, spacing, sizing y estilos visuales. Complementa a `@kreatiware/react` proporcionando clases CSS que el usuario aplica directamente en JSX para controlar estructura y presentacion sin escribir CSS custom.

## Principios
- **Solo CSS** — Sin JavaScript, sin dependencias runtime
- **Variables Kreati** — Todos los valores usan `--kreati-*`, nunca hardcoded
- **Prefijo `k-`** — Todas las clases usan prefijo `k-` para evitar colisiones
- **Responsive** — Todas las utilities tienen variantes `k-sm:`, `k-md:`, `k-lg:`
- **Tree-shakeable** — PostCSS build, el usuario puede importar solo lo que necesita a futuro
- **Consistente** — Misma escala de spacing/sizing que los componentes React

## Breakpoints
| Prefijo | Min-width | Uso tipico |
|---------|-----------|------------|
| (base)  | 0px       | Mobile first |
| `sm:`   | 640px     | Telefono landscape |
| `md:`   | 768px     | Tablet |
| `lg:`   | 1024px    | Desktop |
| `xl:`   | 1280px    | Desktop grande |

## Escala de Spacing
Usa las variables `--kreati-space-*` del sistema de diseno:
| Token | Variable | Valor default |
|-------|----------|---------------|
| 1     | `--kreati-space-1` | 4px |
| 2     | `--kreati-space-2` | 8px |
| 3     | `--kreati-space-3` | 12px |
| 4     | `--kreati-space-4` | 16px |
| 5     | `--kreati-space-5` | 20px |
| 6     | `--kreati-space-6` | 24px |
| 8     | `--kreati-space-8` | 32px |
| 10    | — | 40px |
| 12    | — | 48px |
| 16    | — | 64px |

---

## Estado Actual (v0.4)

### Existente
- [x] Flex container, direction, wrap, justify, align, self, grow/shrink
- [x] Grid columns (1,2,3,4,6,12), spans (1,2,3,4,6,full)
- [x] Gap (1-8) — hardcoded, pendiente migrar a variables
- [x] Typography (sizes, weights, style, decoration, transform, tracking, alignment)
- [x] Whitespace/overflow (truncate, break-words, nowrap)
- [x] Responsive parcial (sm, md, lg — solo algunas clases)

### Problemas a corregir
- Gap usa valores hardcoded en vez de `--kreati-space-*`
- Grid incompleto (faltan cols 5,7,8,9,10,11 y spans correspondientes)
- Responsive incompleto — solo unas pocas clases por breakpoint
- Comentario header dice "KreatiFlex"

---

## FASE 1: Fundacion y Correcciones

Corregir lo existente y establecer la base completa.

### 1.1 Correcciones
- [ ] Migrar gap de hardcoded a `var(--kreati-space-*)`
- [ ] Renombrar header comment a "KreatiLayout"
- [ ] Agregar variables de spacing faltantes en `variables.css` si no existen (10, 12, 16)

### 1.2 Container
```css
.k-container     /* width: 100%, max-width responsive, mx auto, px */
.k-container-sm  /* max-width: 640px */
.k-container-md  /* max-width: 768px */
.k-container-lg  /* max-width: 1024px */
.k-container-xl  /* max-width: 1280px */
```

### 1.3 Grid completo
```css
/* Columns: 1-12 */
.k-grid-cols-{1-12}

/* Spans: 1-12 + full */
.k-col-span-{1-12}
.k-col-span-full

/* Row spans */
.k-row-span-{1-6}
.k-row-span-full

/* Grid start/end */
.k-col-start-{1-13}
.k-col-end-{1-13}

/* Grid auto flow */
.k-grid-flow-row
.k-grid-flow-col
.k-grid-flow-dense

/* Grid auto columns/rows */
.k-auto-cols-auto
.k-auto-cols-fr
.k-auto-cols-min
.k-auto-cols-max
.k-auto-rows-auto
.k-auto-rows-fr
.k-auto-rows-min
.k-auto-rows-max
```

### 1.4 Responsive completo
Todas las utilities de Flex, Grid, Gap y Typography deben tener variantes:
```css
.k-sm\:{utility}
.k-md\:{utility}
.k-lg\:{utility}
.k-xl\:{utility}
```

### Entregables Fase 1
- Grid completo (12 columnas, spans, flow, auto)
- Container responsive
- Gap con variables
- Responsive en todas las utilities existentes

---

## FASE 2: Spacing

Margin y padding en todas las direcciones.

### 2.1 Padding
```css
.k-p-{0-16}     /* all sides */
.k-px-{0-16}    /* horizontal (left + right) */
.k-py-{0-16}    /* vertical (top + bottom) */
.k-pt-{0-16}    /* top */
.k-pr-{0-16}    /* right */
.k-pb-{0-16}    /* bottom */
.k-pl-{0-16}    /* left */
```

### 2.2 Margin
```css
.k-m-{0-16}     /* all sides */
.k-m-auto       /* auto */
.k-mx-{0-16}    /* horizontal */
.k-mx-auto      /* horizontal auto (centering) */
.k-my-{0-16}    /* vertical */
.k-my-auto      /* vertical auto */
.k-mt-{0-16}    /* top */
.k-mr-{0-16}    /* right */
.k-mb-{0-16}    /* bottom */
.k-ml-{0-16}    /* left */
.k-ml-auto      /* push right */
.k-mr-auto      /* push left */
```

### 2.3 Negative margin
```css
.k--m-{1-16}    /* negative all */
.k--mt-{1-16}   /* negative top */
.k--mr-{1-16}   /* etc. */
.k--mb-{1-16}
.k--ml-{1-16}
```

### 2.4 Space between (gap alternative for flex children)
```css
.k-space-x-{1-8}  /* horizontal spacing between children */
.k-space-y-{1-8}  /* vertical spacing between children */
```

### Entregables Fase 2
- Padding completo con responsive
- Margin completo con responsive
- Negative margins
- Space between

---

## FASE 3: Display, Position & Sizing

### 3.1 Display
```css
.k-block
.k-inline-block
.k-inline
.k-hidden         /* display: none */
.k-visible        /* visibility: visible */
.k-invisible      /* visibility: hidden */
```

### 3.2 Position
```css
.k-relative
.k-absolute
.k-fixed
.k-sticky
.k-static

/* Inset */
.k-inset-0       /* top/right/bottom/left: 0 */
.k-inset-x-0     /* left: 0; right: 0 */
.k-inset-y-0     /* top: 0; bottom: 0 */
.k-top-0
.k-right-0
.k-bottom-0
.k-left-0
```

### 3.3 Width
```css
.k-w-full        /* 100% */
.k-w-screen      /* 100vw */
.k-w-auto
.k-w-min         /* min-content */
.k-w-max         /* max-content */
.k-w-fit         /* fit-content */
.k-w-1\/2        /* 50% */
.k-w-1\/3        /* 33.333% */
.k-w-2\/3        /* 66.666% */
.k-w-1\/4        /* 25% */
.k-w-3\/4        /* 75% */
.k-w-1\/5        /* 20% */
.k-w-2\/5        /* 40% */
.k-w-3\/5        /* 60% */
.k-w-4\/5        /* 80% */

/* Max width */
.k-max-w-none
.k-max-w-xs      /* 320px */
.k-max-w-sm      /* 384px */
.k-max-w-md      /* 448px */
.k-max-w-lg      /* 512px */
.k-max-w-xl      /* 576px */
.k-max-w-2xl     /* 672px */
.k-max-w-3xl     /* 768px */
.k-max-w-4xl     /* 896px */
.k-max-w-5xl     /* 1024px */
.k-max-w-6xl     /* 1152px */
.k-max-w-7xl     /* 1280px */
.k-max-w-full    /* 100% */
.k-max-w-screen  /* 100vw */

/* Min width */
.k-min-w-0
.k-min-w-full
.k-min-w-min
.k-min-w-max
.k-min-w-fit
```

### 3.4 Height
```css
.k-h-full        /* 100% */
.k-h-screen      /* 100vh */
.k-h-auto
.k-h-min
.k-h-max
.k-h-fit
.k-min-h-0
.k-min-h-full
.k-min-h-screen
.k-max-h-full
.k-max-h-screen
```

### 3.5 Overflow
```css
.k-overflow-auto
.k-overflow-hidden
.k-overflow-visible
.k-overflow-scroll
.k-overflow-x-auto
.k-overflow-x-hidden
.k-overflow-y-auto
.k-overflow-y-hidden
```

### 3.6 Aspect Ratio
```css
.k-aspect-auto
.k-aspect-square   /* 1/1 */
.k-aspect-video    /* 16/9 */
.k-aspect-4\/3     /* 4/3 */
```

### 3.7 Object Fit (for images/video)
```css
.k-object-contain
.k-object-cover
.k-object-fill
.k-object-none
.k-object-scale-down
.k-object-center
.k-object-top
.k-object-bottom
```

### Entregables Fase 3
- Display, visibility, position con responsive
- Width/height completo con fracciones
- Max/min width y height
- Overflow, aspect ratio, object fit

---

## FASE 4: Visual Utilities

### 4.1 Border Radius
```css
.k-rounded-none   /* 0 */
.k-rounded-sm     /* var(--kreati-radius-sm) */
.k-rounded-md     /* var(--kreati-radius-md) */
.k-rounded-lg     /* var(--kreati-radius-lg) */
.k-rounded-xl     /* var(--kreati-radius-xl) */
.k-rounded-full   /* 9999px */

/* Per side */
.k-rounded-t-{size}
.k-rounded-r-{size}
.k-rounded-b-{size}
.k-rounded-l-{size}
```

### 4.2 Shadow
```css
.k-shadow-none
.k-shadow-sm     /* var(--kreati-shadow-sm) */
.k-shadow-md     /* var(--kreati-shadow-md) */
.k-shadow-lg     /* var(--kreati-shadow-lg) */
.k-shadow-xl     /* var(--kreati-shadow-xl) */
```

### 4.3 Opacity
```css
.k-opacity-0
.k-opacity-25
.k-opacity-50
.k-opacity-75
.k-opacity-100
```

### 4.4 Z-Index
```css
.k-z-0
.k-z-10
.k-z-20
.k-z-30
.k-z-40
.k-z-50
.k-z-auto
```

### 4.5 Cursor
```css
.k-cursor-auto
.k-cursor-default
.k-cursor-pointer
.k-cursor-wait
.k-cursor-text
.k-cursor-move
.k-cursor-not-allowed
.k-cursor-grab
.k-cursor-grabbing
```

### 4.6 Pointer Events
```css
.k-pointer-events-none
.k-pointer-events-auto
```

### 4.7 User Select
```css
.k-select-none
.k-select-text
.k-select-all
.k-select-auto
```

### 4.8 Colors (text & background)
Usando variables del sistema de diseno:
```css
/* Text colors */
.k-text-primary     /* var(--kreati-primary-500) */
.k-text-secondary   /* var(--kreati-gray-500) */
.k-text-success     /* var(--kreati-severity-success) */
.k-text-warning     /* var(--kreati-severity-warning) */
.k-text-danger      /* var(--kreati-severity-danger) */
.k-text-info        /* var(--kreati-severity-info) */
.k-text-white       /* var(--kreati-white) */
.k-text-gray-{100-900}

/* Background colors */
.k-bg-primary
.k-bg-secondary
.k-bg-success
.k-bg-warning
.k-bg-danger
.k-bg-info
.k-bg-white
.k-bg-transparent
.k-bg-gray-{50-900}
```

### 4.9 Border
```css
.k-border
.k-border-0
.k-border-t
.k-border-r
.k-border-b
.k-border-l
.k-border-primary
.k-border-gray-{200-400}
```

### Entregables Fase 4
- Border radius, shadow, opacity con variables Kreati
- Z-index, cursor, pointer events, user select
- Colores de texto y fondo alineados al sistema de diseno
- Borders

---

## FASE 5: Layout Patterns Avanzados

### 5.1 Auto-fit / Auto-fill Grids
```css
/* Grid que auto-ajusta columnas al espacio disponible */
.k-grid-auto-fit-xs   /* minmax(150px, 1fr) */
.k-grid-auto-fit-sm   /* minmax(200px, 1fr) */
.k-grid-auto-fit-md   /* minmax(250px, 1fr) */
.k-grid-auto-fit-lg   /* minmax(300px, 1fr) */

.k-grid-auto-fill-xs
.k-grid-auto-fill-sm
.k-grid-auto-fill-md
.k-grid-auto-fill-lg
```

### 5.2 CSS Columns (Masonry basico)
```css
.k-columns-1
.k-columns-2
.k-columns-3
.k-columns-4
.k-column-gap-{1-8}
.k-break-inside-avoid  /* evita que un item se corte entre columnas */
```

### 5.3 Layout shortcuts
```css
/* Center content (flex center both axes) */
.k-center

/* Stack vertical with gap */
.k-stack-{1-8}

/* Cluster horizontal with gap and wrap */
.k-cluster-{1-8}

/* Sidebar layout (sidebar + main content) */
.k-with-sidebar
.k-with-sidebar > :first-child  /* sidebar */
.k-with-sidebar > :last-child   /* main */

/* Sticky footer */
.k-sticky-footer
```

### Entregables Fase 5
- Auto-fit/fill grids para layouts adaptativos
- CSS columns para masonry sin JS
- Layout shortcuts para patrones comunes

---

## Estructura de Archivos (futuro)

```
packages/layout/src/
  index.css          <- importa todo
  base/
    container.css
    display.css
    position.css
  flex/
    flex.css
  grid/
    grid.css
    auto-fit.css
    columns.css
  spacing/
    margin.css
    padding.css
    gap.css
    space.css
  sizing/
    width.css
    height.css
    aspect.css
  typography/
    font.css
    text.css
    tracking.css
  visual/
    border.css
    radius.css
    shadow.css
    opacity.css
    colors.css
  interactivity/
    cursor.css
    pointer.css
    select.css
    overflow.css
  patterns/
    center.css
    stack.css
    sidebar.css
    sticky-footer.css
```

---

## Componentes que NO van en layout (van en @kreatiware/react)

Estos requieren JavaScript/estado/eventos:
- **Splitter** — Paneles redimensionables con drag
- **Masonry avanzado** — Si necesita JS para calculo de posiciones
- **Container queries** — Si necesita ResizeObserver
- **VirtualScroll** — Ya existe dentro de DataTable, podria extraerse

---

## Compatibilidad

- Funciona standalone (sin @kreatiware/react)
- Funciona junto con @kreatiware/react (mismas variables CSS)
- Las variables de spacing/radius/shadow son las mismas que usan los componentes
- El usuario controla layout con @kreatiware/layout, los componentes se adaptan

---

## Licencia

MIT — Brian — Kreatiware
