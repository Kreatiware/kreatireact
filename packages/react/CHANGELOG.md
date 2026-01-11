# @kreatiware/react

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