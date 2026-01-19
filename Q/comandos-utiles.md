# Comandos Útiles - Ecosistema Kreati

## 🚀 Desarrollo

### Build y Testing
```bash
# Build todos los paquetes
npm run build

# Build paquete específico
npm run build --workspace=packages/react
npm run build --workspace=packages/icons
npm run build --workspace=packages/flex

# Tests
npm run test --if-present

# Linting
npm run lint
```

### Storybook
```bash
# Iniciar Storybook
npm run storybook

# Build Storybook
npm run build-storybook
```

## 📦 Versionado y Publicación

### Changesets
```bash
# Crear changeset
npx changeset

# Actualizar versiones
npx changeset version

# Publicar
npx changeset publish
```

### Publicación Manual
```bash
# Publicar a GitHub Packages
npm publish --workspace=packages/react
npm publish --workspace=packages/icons
npm publish --workspace=packages/flex
```

## 🔗 Desarrollo Local

### npm link (Para testing en otros proyectos)
```bash
# En kreatireact/
npm link --workspace=packages/react --workspace=packages/icons --workspace=packages/flex

# En proyecto de prueba/
npm link @kreatiware/react @kreatiware/icons @kreatiware/flex
```

### Proyecto Web de Prueba
```bash
# Ubicación
cd C:\Users\Brian\Desktop\Kreatiware\Proyectos\kreatiware-main\web

# Iniciar
npm run dev
```

## 🔧 Git y CI/CD

### Conventional Commits
```bash
# Nuevas características
git commit -m "feat: add Input component with validation"

# Correcciones
git commit -m "fix: resolve NavigationBar hover states"

# Breaking changes
git commit -m "feat!: change MenuItem interface structure

BREAKING CHANGE: leftLinks/rightLinks replaced with leftItems/rightItems"
```

### CI/CD Status
- GitHub Actions se ejecuta en cada push
- Verifica: linting, tests, build
- Falla si algún paso no pasa

## 📁 Estructura de Archivos

### Crear Nuevo Componente
```bash
# 1. Crear archivos
packages/react/src/components/NewComponent.tsx
packages/react/src/components/NewComponent.css

# 2. Agregar a index
packages/react/src/index.ts

# 3. Crear story
apps/storybook/src/stories/NewComponent.stories.tsx
```

### Agregar Nuevo Icono
```bash
# 1. SVG
packages/icons/svg/new-icon.svg

# 2. Componente React
packages/icons/src/icons.tsx

# 3. Export
packages/icons/src/index.ts
```

## 🎨 Variables CSS Disponibles

### Colores
```css
--kreati-primary-500: #0f78a5;
--kreati-secondary-100: #fff7d7;
--kreati-background: #deeff7;
--kreati-white: #ffffff;
--kreati-gray-700: #374151;
```

### Espaciado
```css
--kreati-space-2: 8px;
--kreati-space-4: 16px;
--kreati-space-6: 24px;
```

### Tipografía
```css
--kreati-font-family: 'Helvetica', sans-serif;
--kreati-font-size-base: 16px;
--kreati-font-weight-bold: 700;
```

## 🔍 Debugging

### Problemas Comunes
```bash
# Error de dependencias
npm install

# Error de build
npm run clean
npm run build

# Error de tipos TypeScript
# Revisar imports y exports en index.ts

# Error de Storybook
# Verificar que componentes locales estén actualizados
```

### Logs Útiles
```bash
# Ver qué paquetes están linkeados
npm list --depth=0

# Ver configuración npm
npm config list

# Ver versiones
npm list @kreatiware/react @kreatiware/icons @kreatiware/flex
```