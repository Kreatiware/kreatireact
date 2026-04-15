# Ecosistema Kreati — Plan de Desarrollo

## Vision del Proyecto
Ecosistema completo de herramientas frontend open source con monetizacion via agente IA especializado:

### Productos del Ecosistema (Open Source)
- **@kreatiware/react**: Componentes React modernos y tipados
- **@kreatiware/icons**: Libreria de iconos vectoriales SVG
- **@kreatiware/layout**: Sistema de utilities CSS (Flex, Grid, Spacing, Tipografia)

### Monetizacion
- **Agente IA Kreati**: Chatbot especializado con base de conocimiento profunda del ecosistema. Suscripcion mensual. Ayuda a construir interfaces, crear componentes, personalizar/forkear la libreria para empresas (white-label), generar codigo con componentes Kreati.
- **Temas premium**: Temas visuales avanzados (Creative, Minimal, Enterprise, etc.) de pago.
- **Proyecto academico**: El agente se desarrollara como tesis doctoral en IA aplicada.

---

## COMPLETADO — Fundacion del Ecosistema

### Infraestructura
- [x] Monorepo con npm workspaces (3 paquetes + storybook)
- [x] Vite + TypeScript (strict) para build de librerias
- [x] PostCSS para paquete layout
- [x] ESLint + Prettier configurados
- [x] Storybook con addon de accesibilidad (a11y)
- [x] Changesets para versionado semantico
- [x] GitHub Actions (CI/CD)
- [x] Publicacion en GitHub Packages

### Sistema de Diseno
- [x] Variables CSS completas (colores, tipografia 8-step, spacing, shadows, z-index)
- [x] Font family: Raleway, Roboto, Helvetica, sans-serif
- [x] Font weights: light -> extrabold (6 niveles)
- [x] Letter spacing: tighter -> widest (6 niveles)
- [x] Component tokens (Button, Badge, Chip, Hero, Navbar)
- [x] Overlay/alpha variables para transparencias
- [x] Layout tokens (max-widths, breakpoints)

### Componentes (55)
- [x] Foundation: Button, NavigationBar, HeroSection, Badge, Chip, DynamicSvg
- [x] Forms (18): Input, InputMask, InputGroup, Textarea, Select, MultiSelect, AutoComplete, Checkbox, CheckboxGroup, Radio, RadioGroup, Switch, Slider, Calendar, ColorPicker, FileUpload, Rating, Dial
- [x] Feedback & Overlay (10): Dialog, Drawer, Tooltip, Popover, Toast, Message, MessageList, Spinner, ProgressBar, Skeleton
- [x] Layout & Data (19): Card, Panel, Accordion, Tabs, TabMenu, Divider, Breadcrumb, Pagination, Avatar, Tag, Timeline, Tree, TreeSelect, Stepper, ScrollBar, ScrollArea, Image, List, DataTable
- [x] Navigation (6): NavigationBar, MenuBar, ContextMenu, DockMenu, SideMenu, TabMenu
- [x] Buttons (6): Button, ButtonGroup, DropdownButton, SpeedDial, ToggleButton, ToggleButtonGroup

### Iconos (54)
- [x] 6 designer + 48 ai (pending review)
- [x] IconResolver por nombre + KreatiIcon wrapper

### CSS Utilities (@kreatiware/layout)
- [x] Flexbox completo (direction, wrap, justify, align, grow/shrink)
- [x] Grid (columns, span)
- [x] Gap (1-8)
- [x] Responsive breakpoints (sm, md, lg)
- [x] Tipografia (sizes, weights, style, decoration, transform, tracking, alignment)
- [x] Whitespace/overflow (truncate, break-words)

### Calidad
- [x] forwardRef en todos los componentes
- [x] JSDoc en todos los componentes y funciones exportadas
- [x] ARIA/WCAG 2.1 AA en todos los componentes interactivos
- [x] prefers-reduced-motion global en reset.css
- [x] Navegacion por teclado
- [x] Zero hardcoded CSS values — todo con variables Kreati
- [x] Zero external dependencies
- [x] Locale system (en/es)

---

## ETAPA 4: Temas & Dark Mode (COMPLETADA)

### Implementado
- [x] **ThemeProvider** — KreatiProvider extendido con prop `theme` y `darkTheme`
- [x] **useKreatiTheme** — Hook para leer y cambiar tema programaticamente
- [x] **Auto dark mode** — Detecta `prefers-color-scheme` con `theme="auto"`
- [x] **8 temas**: Light (default), Dark, Midnight, Abyss, Soft, Arctic, High Contrast, Kreati
- [x] **Kreati brand theme** — Añil (#3949ab) primary + golden accent (#dab000)
- [x] **Import selectivo** — Cada tema es un CSS independiente
- [x] **Stories** — Preview de todos los temas, switcher interactivo, guia de uso

---

## ETAPA 5: Distribucion & Lanzamiento v1.0

Preparar el ecosistema para uso publico.

### Tasks
- [x] Renombrar @kreatiware/flex a **@kreatiware/layout** (completado)
- [ ] Migrar de GitHub Packages a **npm publico**
- [ ] README profesionales por paquete
- [ ] Ejemplos de integracion (Next.js, Vite)
- [ ] CHANGELOG completo
- [ ] Release **v1.0.0** de los 3 paquetes

### Entregables
- 3 paquetes en npm publico
- Documentacion en Storybook (temporal hasta sitio propio)

---

## ETAPA 6: Sitio de Documentacion

Sitio propio construido con Vite + componentes Kreati.

### Features
- [ ] Vite como build tool / SSG
- [ ] UI construida 100% con componentes Kreati (NavigationBar, SideMenu, Tabs, etc.)
- [ ] Paginas de documentacion por componente (props, ejemplos, playground)
- [ ] Guias de inicio rapido, theming, accesibilidad
- [ ] Search integrado
- [ ] Responsive
- [ ] Showcase: el sitio mismo demuestra la libreria

### Entregables
- Sitio de documentacion desplegado
- Reemplaza Storybook como documentacion publica

---

## ETAPA 7: Agente IA & Monetizacion

### Agente IA Kreati
- [ ] Base de conocimiento profunda del ecosistema (arquitectura, patrones, variables, componentes)
- [ ] Capacidades: generar codigo con componentes Kreati, crear componentes custom, personalizar temas
- [ ] White-label: guiar fork completo (renombrar prefijos, variables, branding)
- [ ] Integracion como chatbot en sitio de docs
- [ ] Sistema de suscripcion (free tier limitado + planes de pago)

### Temas Premium
- [ ] Temas avanzados de pago: Creative, Minimal, Enterprise
- [ ] Distribucion via sitio propio

### Proyecto Academico
- [ ] Desarrollo del agente como tesis doctoral en IA aplicada
- [ ] Investigacion en IA especializada para generacion de UI

### Modelo de Precios
- **Agente Free**: Consultas limitadas/dia
- **Agente Pro ($X/mes)**: Uso ilimitado, white-label assistance, generacion avanzada
- **Temas Premium ($9-19)**: Temas individuales
- **Enterprise ($X/mes)**: Agente + temas + soporte dedicado

---

## Preparacion para White-Label / Forkeo

Para que el agente IA pueda asistir en personalizacion de la libreria:

### Estado actual (ya cumple)
- Variables CSS como unica fuente de verdad (--kreati-*)
- Prefijos consistentes: `kreati-` para CSS vars, `k-` para utility classes
- Arquitectura modular (cada componente independiente)
- TypeScript strict con interfaces exportadas
- Zero dependencies

### Pendiente (evaluar en Etapa 7)
- Documentar mapa completo de prefijos y donde aparecen
- Evaluar si se necesita prefijo configurable o si find-replace guiado es suficiente
- Guia de fork para el agente

---

## Inventario Actual

### @kreatiware/react
55 componentes exportados, todos con forwardRef, JSDoc, ARIA, className/style support.

### @kreatiware/icons
54 iconos (6 designer, 48 ai) + KreatiIcon wrapper + Icon resolver.

### @kreatiware/layout (actualmente flex)
- Flex: 20+ utilities
- Grid: 12 columns + span
- Gap: 7 sizes
- Typography: sizes, weights, styles, decoration, transform, tracking, alignment
- Responsive: sm (640px), md (768px), lg (1024px)

---

## Metricas de Exito

### Tecnicas
- Bundle size < 100kb total (core)
- 100% TypeScript strict
- WCAG 2.1 AA compliance
- Zero external runtime dependencies

### Negocio
- 1000+ descargas mensuales (6 meses post-v1.0)
- Agente IA funcional como MVP de tesis
- Primeras suscripciones al agente (12 meses post-lanzamiento)

---

## Licencia

MIT — Brian — Kreatiware
