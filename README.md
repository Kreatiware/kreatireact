# Ecosistema Kreati

> Herramientas frontend modernas para desarrolladores React

## 📦 Paquetes

### [@kreati/react](./packages/react)
Componentes React modernos y tipados con sistema de temas integrado.

```bash
npm install @kreati/react
```

### [@kreati/icons](./packages/icons)
Librería de iconos vectoriales SVG optimizados con componentes React.

```bash
npm install @kreati/icons
```

### [@kreati/flex](./packages/flex)
Sistema de utilities CSS para Flexbox y Grid con diseño responsive.

```bash
npm install @kreati/flex
```

## 🚀 Inicio Rápido

```jsx
import { Button } from '@kreati/react';
import { ArrowRight } from '@kreati/icons';
import '@kreati/flex/dist/index.css';

function App() {
  return (
    <div className="k-flex k-items-center k-gap-4">
      <Button variant="primary">
        Comenzar
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
```

## 🛠️ Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build todos los paquetes
npm run build

# Tests
npm run test

# Linting
npm run lint
```

## 📋 Roadmap

- [x] **Etapa 1**: Configuración inicial y Button component
- [ ] **Etapa 2**: Componentes de formulario
- [ ] **Etapa 3**: Sistema de temas avanzado
- [ ] **Etapa 4**: Distribución npm
- [ ] **Etapa 5**: Productos premium

## 📄 Licencia

MIT © Brian - Kreatiware