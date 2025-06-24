# Color Palette Guide

This document outlines the new color system implemented in the fire management platform.

## Color Hierarchy

### Primary Color - #F47B20

**Usage:** Main CTAs, primary buttons, active links, and key highlights
**Chakra UI Reference:** `brand.primary` or `brand.orange` (legacy)
**CSS Variable:** `var(--primary-color)`

### Secondary Color - #4CAF50

**Usage:** Secondary actions, badges, icon fills, and hover states on buttons
**Chakra UI Reference:** `brand.secondary` or `brand.green` (legacy)
**CSS Variable:** `var(--secondary-color)`

### Accent Color - #2F4858

**Usage:** Headings, navigation text, link underlines, and focus rings
**Chakra UI Reference:** `brand.accent` or `brand.darkBlue` (legacy)
**CSS Variable:** `var(--accent-color)`

### Background Color - #FDF9F3

**Usage:** Default page and section background color
**Chakra UI Reference:** `brand.background` or `brand.bgGray` (legacy)
**CSS Variable:** `var(--background-color)`

### Card Background - #FAFAF9

**Usage:** Cards, panels, modals, and form fields—any enclosed containers
**Chakra UI Reference:** `brand.cardBg`
**CSS Variable:** `var(--card-bg-color)`

### Muted/Detail Color - #8D6E63

**Usage:** Borders, dividers, placeholder text, disabled states, and subtle icons
**Chakra UI Reference:** `brand.muted`
**CSS Variable:** `var(--muted-color)`

## Migration Guide

### From Legacy Colors:

- `brand.orange` → `brand.primary` (or continue using `brand.orange`)
- `brand.green` → `brand.secondary` (or continue using `brand.green`)
- `brand.darkBlue` → `brand.accent` (or continue using `brand.darkBlue`)
- `brand.bgGray` → `brand.background` (or continue using `brand.bgGray`)
- `brand.lightText` → `brand.accent` (for better contrast)

### Utility Classes Available:

- Background: `.bg-primary`, `.bg-secondary`, `.bg-accent`, `.bg-background`, `.bg-card`, `.bg-muted`
- Text: `.text-primary`, `.text-secondary`, `.text-accent`, `.text-muted`
- Border: `.border-primary`, `.border-secondary`, `.border-accent`, `.border-muted`

## Best Practices

1. **Use semantic names** (`brand.primary`) instead of descriptive names (`brand.orange`) for new components
2. **Maintain consistency** in color usage across similar UI elements
3. **Consider accessibility** - ensure sufficient contrast ratios
4. **Test hover and focus states** with the new color palette

## Component Updates

The theme has been updated to automatically apply the new colors to:

- Buttons (primary, secondary, outline variants)
- Headings (using accent color)
- Links (accent color with primary hover)
- Cards (card background with muted borders)
- Form inputs (card background with muted borders and accent focus)
- Global scrollbars (primary color)

Legacy color references will continue to work but should be gradually migrated to the new semantic naming.
