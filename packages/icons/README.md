# @kreatiware/icons

Librería de iconos vectoriales SVG optimizados con componentes React.

## 📦 Instalación

```bash
npm install @kreatiware/icons
```

## 🚀 Uso

### Importación Básica

```tsx
import { ChevronDown, Check, ArrowRight } from '@kreatiware/icons';

function App() {
  return (
    <div>
      <ChevronDown size={24} color="#0f78a5" />
      <Check size={16} color="green" />
      <ArrowRight size={20} />
    </div>
  );
}
```

### Con KreatiIcon Wrapper

El componente `KreatiIcon` permite controlar el tamaño de uno o múltiples iconos desde un contenedor:

```tsx
import { KreatiIcon, ChevronDown } from '@kreatiware/icons';

// Icono individual con tamaño controlado
<KreatiIcon size={16}>
  <ChevronDown />
</KreatiIcon>

// Múltiples iconos en el mismo contenedor
<KreatiIcon size={24}>
  <ChevronUp />
  <ChevronDown />
</KreatiIcon>
```

## 📋 Iconos Disponibles

### Chevrons
- `ChevronRight` - Chevron apuntando a la derecha
- `ChevronLeft` - Chevron apuntando a la izquierda
- `ChevronUp` - Chevron apuntando arriba
- `ChevronDown` - Chevron apuntando abajo

### Arrows
- `ArrowRight` - Flecha apuntando a la derecha

### UI
- `Check` - Marca de verificación

## 🎨 Props

### IconProps (Todos los iconos)

```tsx
interface IconProps {
  size?: number;        // Tamaño en píxeles (default: 24)
  color?: string;       // Color del icono (default: 'currentColor')
  className?: string;   // Clases CSS adicionales
}
```

### KreatiIconProps

```tsx
interface KreatiIconProps {
  size?: number;        // Tamaño en píxeles (default: 24)
  className?: string;   // Clases CSS adicionales
  children: React.ReactNode;  // Componentes de iconos
}
```

## 💡 Ejemplos

### Icono con color personalizado

```tsx
<ChevronDown size={20} color="#0f78a5" />
```

### Icono que hereda color del texto

```tsx
<div style={{ color: 'red' }}>
  <Check size={16} /> {/* Será rojo */}
</div>
```

### Icono con clase CSS

```tsx
<ArrowRight size={24} className="my-icon" />
```

### Grupo de iconos

```tsx
<div className="icon-group">
  <KreatiIcon size={20}>
    <ChevronUp />
  </KreatiIcon>
  <KreatiIcon size={20}>
    <ChevronDown />
  </KreatiIcon>
</div>
```

## 🎯 Características

- ✅ **TypeScript**: Totalmente tipado
- ✅ **Tree-shakeable**: Solo importa lo que usas
- ✅ **Ligero**: ~100 bytes por icono
- ✅ **Personalizable**: Color y tamaño configurables
- ✅ **Accesible**: Usa `currentColor` por defecto
- ✅ **Optimizado**: SVG minificados

## 📄 Licencia

MIT © Brian - Kreatiware
