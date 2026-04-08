# Ecosistema Kreati

> Herramientas frontend modernas para desarrolladores React

## Paquetes

### [@kreatiware/react](./packages/react)
22 componentes React modernos y tipados con sistema de temas integrado.

```bash
npm install @kreatiware/react
```

### [@kreatiware/icons](./packages/icons)
Libreria de iconos vectoriales SVG optimizados con componentes React.

```bash
npm install @kreatiware/icons
```

### [@kreatiware/flex](./packages/flex)
Sistema de utilities CSS para Flexbox y Grid con diseno responsive.

```bash
npm install @kreatiware/flex
```

## Inicio Rapido

```jsx
import { Button, Input, Calendar } from '@kreatiware/react';
import { ArrowRight } from '@kreatiware/icons';
import '@kreatiware/flex/dist/index.css';

function App() {
  return (
    <div className="k-flex k-flex-col k-gap-4">
      <Input label="Name" size="md" />
      <Calendar label="Date" showButtonBar />
      <Button variant="primary">
        Submit
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
```

## Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build todos los paquetes
npm run build

# Storybook
npm run storybook

# Tests
npm run test

# Linting
npm run lint
```

## Roadmap

- [x] **Etapa 1**: Configuracion inicial, Button, NavigationBar, Badge, Chip, Tooltip, HeroSection, DynamicSvg, ScrollBar
- [x] **Etapa 2**: Componentes de formulario (Input, InputMask, Textarea, Select, MultiSelect, Checkbox, Radio, Switch, ToggleButton, Calendar, Slider, List)
- [ ] **Etapa 3**: Sistema de temas avanzado, componentes de layout (Dialog, Tabs, Accordion, Table)
- [ ] **Etapa 4**: Distribucion npm publico
- [ ] **Etapa 5**: Productos premium

## Licencia

MIT - Brian - Kreatiware
