# Modern Theme System Guide

This guide explains how the comprehensive theme system works in your application and where to find and modify theme-related styles.

## Overview

The application now features a modern, comprehensive theme system with:
- **Light and Dark themes** with professional color palettes
- **System preference detection** that automatically follows the user's OS theme
- **Theme persistence** that remembers user preferences
- **Smooth transitions** between themes
- **Accessibility compliance** with proper contrast ratios
- **Modern design principles** with clean, professional styling

## Theme Variables

The main theme variables are defined in:
`src/styles/theme-variables.css`

This file contains all the CSS variables for both light and dark themes. When you want to change colors, this is the primary file to edit.

### Light Theme Variables

```css
[data-theme="light"] {
  /* Background colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-accent: #e2e8f0;

  /* Text colors */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --text-muted: #94a3b8;

  /* Border colors */
  --border-color: #e2e8f0;
  --border-hover: #cbd5e1;
  --border-focus: var(--brand-primary);

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  /* Component specific */
  --card-bg: #ffffff;
  --card-border: #e2e8f0;
  --input-bg: #ffffff;
  --input-border: #d1d5db;
  --button-hover-overlay: rgba(0, 0, 0, 0.05);
  --dropdown-bg: #ffffff;
  --modal-bg: #ffffff;
  --tooltip-bg: #1f2937;
  --tooltip-text: #ffffff;
}
```

### Dark Theme Variables

```css
[data-theme="dark"] {
  /* Background colors */
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-accent: #475569;

  /* Text colors */
  --text-primary: #f8fafc;
  --text-secondary: #e2e8f0;
  --text-tertiary: #cbd5e1;
  --text-muted: #94a3b8;

  /* Border colors */
  --border-color: #334155;
  --border-hover: #475569;
  --border-focus: var(--brand-primary);

  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);

  /* Component specific */
  --card-bg: #1e293b;
  --card-border: #334155;
  --input-bg: #1e293b;
  --input-border: #475569;
  --button-hover-overlay: rgba(255, 255, 255, 0.1);
  --dropdown-bg: #1e293b;
  --modal-bg: #1e293b;
  --tooltip-bg: #374151;
  --tooltip-text: #f9fafb;
}
```

## Theme Features

### System Preference Detection
The theme system automatically detects and follows the user's operating system theme preference. Users can also manually override this setting.

### Theme Options
- **Light**: Clean, professional light theme
- **Dark**: Modern dark theme with proper contrast
- **System**: Automatically follows OS preference

### Smooth Transitions
All theme changes include smooth CSS transitions for a polished user experience.

## How to Apply Theme to Components

There are several ways to apply theme variables to your components:

### 1. Using CSS Classes with Variables

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: var(--theme-transition);
}
```

### 2. Using Inline Styles in React Components

```jsx
<div style={{
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-color)'
}}>
  Content goes here
</div>
```

### 3. Using Tailwind with DaisyUI Classes

```jsx
<div className="bg-base-100 text-base-content border border-base-300">
  Content with DaisyUI theme classes
</div>
```

## Theme Switching Logic

The enhanced theme switching logic is implemented in:
`src/components/ThemeSwitcher.tsx`

This component handles:
- Reading theme preference from localStorage
- System theme detection and monitoring
- Smooth theme transitions
- Theme persistence across sessions
- Real-time theme change events

## Important Files for Theme System

1. **Theme Variables**: `src/styles/theme-variables.css` - Core theme CSS variables
2. **Theme Switcher**: `src/components/ThemeSwitcher.tsx` - Theme switching component
3. **Layout Files**:
   - `src/app/layout.tsx` (imports theme files and sets defaults)
   - `src/app/client-layout.tsx` (handles client-side theme application)
4. **Configuration**: `tailwind.config.ts` (DaisyUI theme configuration)

## Tailwind Configuration

The Tailwind configuration for themes is in:
`tailwind.config.ts`

This file defines the DaisyUI themes with custom color palettes that match our CSS variables.

## How to Modify Themes

1. **For light theme colors**: Modify variables under `[data-theme="light"]` in `theme-variables.css`
2. **For dark theme colors**: Modify variables under `[data-theme="dark"]` in `theme-variables.css`
3. **For DaisyUI integration**: Update the theme objects in `tailwind.config.ts`
4. **For brand colors**: Modify the brand color variables in the `:root` section

## Example: Changing Brand Colors

To change the primary brand color:

1. Open `src/styles/theme-variables.css`
2. Find the `:root` section
3. Change `--brand-primary: #3b82f6;` to your desired color
4. Update the corresponding values in `tailwind.config.ts` if needed

## Accessibility

The theme system follows WCAG guidelines:
- **Contrast ratios** meet AA standards
- **Focus indicators** are clearly visible in both themes
- **Color combinations** are tested for accessibility
- **System preferences** are respected for reduced motion and color schemes

## Migration from Halloween Theme

The system automatically migrates users from the old Halloween theme:
- `"whiteHalloween"` → `"light"`
- `"halloween"` → `"dark"`
- `"skoolTheme"` → `"light"`

Legacy theme preferences are automatically converted on first load.
