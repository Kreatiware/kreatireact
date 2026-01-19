# Ejemplos de Código - Ecosistema Kreati

## 🧩 MenuItem Interface

### Estructura Básica
```tsx
interface MenuItem {
  id?: string;                    // Identificador único
  label: string;                  // Texto a mostrar
  href?: string;                  // URL de navegación
  icon?: React.ReactNode;         // Icono opcional
  items?: MenuItem[];             // Submenús anidados
  onClick?: (item) => void;       // Handler personalizado
  active?: boolean;               // Estado activo
  disabled?: boolean;             // Estado deshabilitado
  target?: string;                // Target del link
  className?: string;             // Clases CSS adicionales
  data?: Record<string, any>;     // Atributos personalizados
}
```

### Ejemplos de Uso
```tsx
// Item básico con link
const basicItem: MenuItem = {
  label: 'About',
  href: '/about'
};

// Item con icono
const iconItem: MenuItem = {
  label: 'Projects',
  href: '/projects',
  icon: <ArrowRight size={16} />
};

// Item con onClick handler
const clickItem: MenuItem = {
  label: 'Contact',
  onClick: (item) => openContactModal(),
  icon: <Check size={16} />
};

// Item con submenú
const submenuItem: MenuItem = {
  label: 'Products',
  icon: <ArrowRight size={16} />,
  items: [
    { label: 'Laptops', href: '/products/laptops' },
    { label: 'Phones', href: '/products/phones' },
    { label: 'Tablets', href: '/products/tablets' }
  ]
};

// Item con estados
const stateItem: MenuItem = {
  label: 'Dashboard',
  href: '/dashboard',
  active: true,
  icon: <Check size={16} />
};

// Item deshabilitado
const disabledItem: MenuItem = {
  label: 'Coming Soon',
  disabled: true,
  icon: <ArrowRight size={16} />
};
```

## 🧭 NavigationBar Examples

### Configuración Básica
```tsx
<NavigationBar
  logo="KREATIWARE"
  leftItems={[
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' }
  ]}
  rightItems={[
    { label: 'Contact', href: '/contact' }
  ]}
  transparent={true}
/>
```

### Con Router Integration
```tsx
import { useRouter } from 'next/router';

const router = useRouter();

<NavigationBar
  logo="BRAND"
  leftItems={menuItems}
  rightItems={menuItems}
  router={router}
  useRouter={true}
  transparent={false}
/>
```

### Configuración Avanzada
```tsx
const leftMenuItems: MenuItem[] = [
  {
    id: 'products',
    label: 'Products',
    icon: <ArrowRight size={14} />,
    items: [
      { label: 'Web Apps', href: '/products/web' },
      { label: 'Mobile Apps', href: '/products/mobile' }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    onClick: (item) => console.log('Services:', item),
    icon: <Check size={14} />
  }
];

const rightMenuItems: MenuItem[] = [
  {
    id: 'docs',
    label: 'Docs',
    href: '/docs',
    target: '_blank'
  },
  {
    id: 'login',
    label: 'Login',
    onClick: (item) => openLoginModal(),
    active: isLoggedIn,
    className: 'login-button'
  }
];

<NavigationBar
  logo={<img src="/logo.png" alt="Brand" />}
  leftItems={leftMenuItems}
  rightItems={rightMenuItems}
  transparent={true}
  className="custom-navbar"
/>
```

## 🎨 Button Examples

### Variantes Básicas
```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
```

### Con Iconos
```tsx
<Button variant="primary">
  Get Started
  <ArrowRight size={16} />
</Button>

<Button variant="outline">
  <Check size={16} />
  Completed
</Button>
```

### Tamaños y Estados
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

<Button disabled>Disabled</Button>
<Button onClick={() => alert('Clicked!')}>
  Click me
</Button>
```

## 🎨 CSS Utilities (KreatiFlex)

### Flexbox
```jsx
<div className="k-flex k-items-center k-justify-between k-gap-4">
  <span>Left content</span>
  <span>Right content</span>
</div>

<div className="k-flex k-flex-col k-items-center k-gap-2">
  <h1>Title</h1>
  <p>Description</p>
</div>
```

### Grid
```jsx
<div className="k-grid k-grid-cols-3 k-gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<div className="k-grid k-grid-cols-12">
  <div className="k-col-span-6">Half width</div>
  <div className="k-col-span-6">Half width</div>
</div>
```

### Responsive
```jsx
<div className="k-flex k-flex-col k-md:flex-row k-gap-4">
  <div>Stacked on mobile, side by side on desktop</div>
  <div>Second item</div>
</div>
```

## 🎨 CSS Variables Usage

### En Componentes
```css
.custom-component {
  background-color: var(--kreati-primary-500);
  color: var(--kreati-white);
  padding: var(--kreati-space-4);
  border-radius: var(--kreati-radius-md);
  font-family: var(--kreati-font-family);
}
```

### En Inline Styles
```jsx
<div style={{
  backgroundColor: 'var(--kreati-background)',
  color: 'var(--kreati-primary-500)',
  padding: 'var(--kreati-space-6)',
  fontSize: 'var(--kreati-font-size-lg)'
}}>
  Content with Kreati variables
</div>
```

## 📦 Import Examples

### Componentes
```tsx
import { Button, NavigationBar } from '@kreatiware/react';
import type { MenuItem, NavigationBarProps } from '@kreatiware/react';
```

### Iconos
```tsx
import { ArrowRight, Check } from '@kreatiware/icons';
import type { IconProps } from '@kreatiware/icons';
```

### CSS Utilities
```tsx
import '@kreatiware/flex/dist/index.css';
```

### Todo Junto
```tsx
import { Button, NavigationBar, MenuItem } from '@kreatiware/react';
import { ArrowRight, Check } from '@kreatiware/icons';
import '@kreatiware/flex/dist/index.css';

function App() {
  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: <Check size={14} />
    }
  ];

  return (
    <div className="k-flex k-flex-col k-min-h-screen">
      <NavigationBar
        logo="BRAND"
        leftItems={menuItems}
        transparent={true}
      />
      
      <main className="k-flex-1 k-flex k-items-center k-justify-center">
        <Button variant="primary">
          Get Started
          <ArrowRight size={16} />
        </Button>
      </main>
    </div>
  );
}
```