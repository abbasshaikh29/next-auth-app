# Theme System Guide

This guide explains how the theme system works in your application and where to find and modify theme-related styles.

## Theme Variables

The main theme variables are defined in:
`src/styles/theme-variables.css`

This file contains all the CSS variables for both light and dark themes. When you want to change colors, this is the primary file to edit.

### Light Theme Variables (whiteHalloween)

```css
[data-theme="whiteHalloween"] {
  /* Background colors */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fc;
  --bg-tertiary: #f1f5f9;
  
  /* Text colors */
  --text-primary: #1e1b4b;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  
  /* Border colors */
  --border-color: rgba(107, 33, 168, 0.1);
  --border-hover: rgba(255, 117, 24, 0.3);
  
  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(107, 33, 168, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(107, 33, 168, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(107, 33, 168, 0.1);
  
  /* Component specific */
  --card-bg: #ffffff;
  --card-border: rgba(107, 33, 168, 0.1);
  --input-bg: #ffffff;
  --input-border: rgba(107, 33, 168, 0.2);
  --button-hover-overlay: rgba(255, 255, 255, 0.2);
  --dropdown-bg: #ffffff;
  --modal-bg: #ffffff;
  --tooltip-bg: #1e1b4b;
  --tooltip-text: #ffffff;
}
```

### Dark Theme Variables (halloween)

```css
[data-theme="halloween"] {
  /* Background colors */
  --bg-primary: #1e1b4b;
  --bg-secondary: #18163a;
  --bg-tertiary: #14122e;
  
  /* Text colors */
  --text-primary: #ffffff;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  
  /* Border colors */
  --border-color: rgba(255, 117, 24, 0.2);
  --border-hover: rgba(255, 117, 24, 0.5);
  
  /* Shadow */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
  
  /* Component specific */
  --card-bg: #18163a;
  --card-border: rgba(255, 117, 24, 0.2);
  --input-bg: #14122e;
  --input-border: rgba(255, 117, 24, 0.3);
  --button-hover-overlay: rgba(0, 0, 0, 0.2);
  --dropdown-bg: #18163a;
  --modal-bg: #18163a;
  --tooltip-bg: #ff7518;
  --tooltip-text: #1e1b4b;
}
```

## Component Styles

Component-specific theme styles are defined in:
`src/styles/halloween-theme.css`

This file contains styles for various components (cards, buttons, inputs, etc.) and uses the theme variables defined above.

## How to Apply Theme to Components

There are two ways to apply theme variables to your components:

### 1. Using CSS Classes with Variables

```css
.my-component {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

### 2. Using Inline Styles in React Components

```jsx
<div style={{ 
  backgroundColor: 'var(--bg-primary)', 
  color: 'var(--text-primary)' 
}}>
  Content goes here
</div>
```

## Theme Switching Logic

The theme switching logic is implemented in:
`src/components/ThemeSwitcher.tsx`

This component handles:
- Reading the current theme from localStorage
- Toggling between light and dark themes
- Applying the theme to the document

## Important Files for Theme System

1. **Theme Variables**: `src/styles/theme-variables.css`
2. **Component Styles**: `src/styles/halloween-theme.css`
3. **Theme Switcher**: `src/components/ThemeSwitcher.tsx`
4. **Layout Files**:
   - `src/app/layout.tsx` (imports theme files)
   - `src/app/client-layout.tsx` (applies theme on client-side)

## Tailwind Configuration

The Tailwind configuration for themes is in:
`tailwind.config.ts`

This file defines the DaisyUI themes used in the application.

## How to Modify Themes

1. To change colors for the light theme, modify the variables under `[data-theme="whiteHalloween"]` in `theme-variables.css`
2. To change colors for the dark theme, modify the variables under `[data-theme="halloween"]` in `theme-variables.css`
3. For component-specific styling, modify the relevant sections in `halloween-theme.css`

## Example: Changing Background Colors

If you want to change the background color of the light theme:

1. Open `src/styles/theme-variables.css`
2. Find the `[data-theme="whiteHalloween"]` section
3. Change the value of `--bg-primary` to your desired color (e.g., `#f8f9fc`)

Similarly, for the dark theme, change the value under the `[data-theme="halloween"]` section.
