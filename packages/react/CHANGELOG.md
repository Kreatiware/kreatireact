# @kreatiware/react

## 1.0.0

### Minor Changes

- 2744920: Add mobile responsive support: NavigationBar hamburger menu with glass drawer, HeroSection responsive layouts for split and split-full modes

### Patch Changes

- 2744920: add times and hamburguer icons, add mobile support
- Updated dependencies [2744920]
- Updated dependencies [2744920]
  - @kreatiware/icons@0.4.0

## 0.7.0

### Minor Changes

- 712c3f4: feat: add dynamicsvg, fix on colores hero section

## 0.6.2

### Patch Changes

- a9145da: fix: hero section, add background colors and glass color

## 0.6.1

### Patch Changes

- fix

## 0.6.0

### Minor Changes

- feat: add button, chip, badge, herosection full split

## 0.5.0

### Minor Changes

- be25053: add badge and herosection

### Patch Changes

- Updated dependencies [be25053]
  - @kreatiware/icons@0.3.1

## 0.4.0

### Minor Changes

- Add Badge component with 6 variants (primary, secondary, success, warning, error, outline), 3 sizes and icon support
- Add HeroSection component with:
  - Layout modes: single (centered) and split (content + media)
  - Background options: solid, gradient, image with overlay
  - Glassmorphism effect on content container
  - Responsive design with mobile collapse
  - Size variants: sm, md, lg, fullscreen
  - Alignment: left, center, right
- Add Storybook stories for Badge and HeroSection

## 0.3.0

### Minor Changes

- Add chevron
- Add MenuItem interface and enhance NavigationBar
  - Implement universal MenuItem interface for reusable navigation
  - Add NavigationBar component with MenuItem support
  - Include icons, submenus, router integration, and state management
  - Add comprehensive JSDoc documentation
  - Update all packages to 0.2.0

## 0.2.0

### Minor Changes

- Add universal MenuItem interface for navigation components
- Enhance NavigationBar with MenuItem support including:
  - Icon support for navigation items
  - Submenu indicators and nested items
  - Custom onClick handlers
  - Router integration (Next.js, React Router)
  - Active/disabled states
  - Custom targets and data attributes
- Add comprehensive JSDoc documentation
- Add navigation types for reusable menu structures

### Breaking Changes

- NavigationBar now uses `leftItems`/`rightItems` instead of `leftLinks`/`rightLinks`
- NavigationBar props structure changed to support MenuItem interface

## 0.1.0

### Minor Changes

- Initial release with Button component
- CSS variables system with custom color palette
- TypeScript support with complete type definitions
