# Design System Guide

## Introduction

This guide documents the design system for the Pet Sitter Management System, providing guidelines for maintaining consistency across the application.

## Color Palette

### Primary Colors

```css
/* Deep Navy Blue - Primary Brand Color */
--primary: hsl(223, 74%, 26%)  /* #1A2A6C */

/* Medium Navy Blue - Secondary Brand Color */
--secondary: hsl(213, 85%, 22%)  /* #0F3460 */

/* Bright Sky Blue - Accent Color */
--accent: hsl(193, 100%, 47%)  /* #00AEEF */
```

### Neutral Colors

```css
/* Background Colors */
--background: hsl(214, 27%, 98%)  /* #F5F7FA */
--card: hsl(214, 27%, 96%)

/* Text Colors */
--foreground: hsl(210, 29%, 24%)  /* #2C3E50 - Primary text */
--muted-foreground: hsl(202, 12%, 55%)  /* #7F8C8D - Secondary text */
```

### Semantic Colors

```css
/* Success */
--success: hsl(142, 71%, 45%)

/* Warning */
--warning: hsl(38, 92%, 50%)

/* Destructive/Error */
--destructive: hsl(0, 84.2%, 60.2%)

/* Info */
--info: hsl(193, 100%, 47%)
```

## Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Font Scale

| Size | Class | Clamp Value | Usage |
|------|-------|-------------|-------|
| 5xl | `.text-responsive-5xl` | `clamp(3rem, 8vw, 4.5rem)` | Hero headlines |
| 4xl | `.text-responsive-4xl` | `clamp(2.25rem, 6vw, 3.5rem)` | Page titles |
| 3xl | `.text-responsive-3xl` | `clamp(1.875rem, 5vw, 2.5rem)` | Section headers |
| 2xl | `.text-responsive-2xl` | `clamp(1.5rem, 4vw, 2rem)` | Card titles |
| xl | `.text-responsive-xl` | `clamp(1.25rem, 3vw, 1.5rem)` | Subtitles |
| lg | `.text-responsive-lg` | `clamp(1.125rem, 2.5vw, 1.25rem)` | Large body |
| base | `.text-responsive-base` | `clamp(1rem, 2vw, 1.125rem)` | Body text |
| sm | `.text-responsive-sm` | `clamp(0.875rem, 1.5vw, 1rem)` | Small text |
| xs | `.text-responsive-xs` | `clamp(0.75rem, 1.2vw, 0.875rem)` | Captions |

### Font Weights
- Light: 300
- Normal: 400
- Medium: 500
- Semibold: 600
- Bold: 700

## Spacing System

### Spacing Scale
```typescript
{
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
}
```

### Responsive Spacing Utilities

| Class | Mobile | Desktop | Usage |
|-------|--------|---------|-------|
| `.spacing-xs` | `p-2` | `p-4` | Tight spacing |
| `.spacing-sm` | `p-3` | `p-6` | Small spacing |
| `.spacing-md` | `p-4` | `p-8` | Medium spacing |
| `.spacing-lg` | `p-6` | `p-12` | Large spacing |
| `.spacing-xl` | `p-8` | `p-16` | Extra large |

## Component Styles

### Cards

```tsx
// Modern Card
<div className="card-modern">
  {/* Card with subtle border, rounded corners */}
</div>

// Elevated Card
<div className="card-elevated">
  {/* Card with shadow and hover effect */}
</div>

// Glass Card
<div className="card-glass">
  {/* Card with glassmorphism effect */}
</div>
```

### Buttons

```tsx
// Primary Button
<Button className="btn-primary">
  Primary Action
</Button>

// Secondary Button
<Button className="btn-secondary">
  Secondary Action
</Button>

// Accent Button
<Button className="btn-accent">
  Accent Action
</Button>

// Outline Button
<Button className="btn-outline">
  Outline Action
</Button>

// Ghost Button
<Button className="btn-ghost">
  Ghost Action
</Button>
```

### Inputs

```tsx
// Modern Input
<input className="input-modern" placeholder="Enter text" />

// Glass Input
<input className="input-glass" placeholder="Enter text" />
```

## Layout Components

### Container
```tsx
<div className="container-modern">
  {/* Max-width container with responsive padding */}
</div>
```

### Section Padding
```tsx
<section className="section-padding">
  {/* py-12 sm:py-16 lg:py-20 xl:py-24 */}
</section>
```

### Grid Layouts
```tsx
// Mobile-first responsive grid
<div className="mobile-grid">
  {/* 1 col mobile, 2 tablet, 3 desktop, 4 xl */}
</div>

// Hero Grid
<div className="mobile-hero-grid">
  {/* 1 col mobile, 2 cols on large screens */}
</div>
```

## Shadows

### Shadow Scale

```css
/* Small shadow */
box-shadow: 0 1px 2px 0 rgba(26, 42, 108, 0.05);

/* Medium shadow */
box-shadow: 0 4px 6px -1px rgba(26, 42, 108, 0.1), 
            0 2px 4px -2px rgba(26, 42, 108, 0.1);

/* Large shadow */
box-shadow: 0 10px 15px -3px rgba(26, 42, 108, 0.1), 
            0 4px 6px -4px rgba(26, 42, 108, 0.1);

/* Extra large shadow */
box-shadow: 0 20px 25px -5px rgba(26, 42, 108, 0.1), 
            0 8px 10px -6px rgba(26, 42, 108, 0.1);

/* 2XL shadow */
box-shadow: 0 25px 50px -12px rgba(26, 42, 108, 0.25);
```

## Border Radius

```typescript
{
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',   // Fully rounded
}
```

## Transitions & Animations

### Transition Durations
```css
/* Fast - for subtle interactions */
transition: 150ms;

/* Base - for most interactions */
transition: 200ms;

/* Slow - for complex animations */
transition: 300ms;

/* Slower - for dramatic effects */
transition: 500ms;
```

### Built-in Animations

```tsx
// Fade in with upward motion
<div className="animate-fadeIn">Content</div>

// Slide up
<div className="animate-slideUp">Content</div>

// Slide in from left
<div className="animate-slideInLeft">Content</div>

// Slide in from right
<div className="animate-slideInRight">Content</div>

// Scale in
<div className="animate-scaleIn">Content</div>

// Gentle bounce
<div className="animate-float">Content</div>

// Soft pulse
<div className="animate-pulse-soft">Content</div>

// Staggered list animations
<ul className="animate-stagger">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

### Hover Effects

```tsx
// Lift on hover
<div className="hover-lift">Content</div>

// Scale on hover
<div className="hover-scale">Content</div>

// Glow on hover
<div className="hover-glow">Content</div>
```

## Breakpoints

```typescript
{
  sm: '640px',    // Small tablets
  md: '768px',    // Tablets
  lg: '1024px',   // Small desktops
  xl: '1280px',   // Desktops
  '2xl': '1536px' // Large desktops
}
```

### Usage
```tsx
// Mobile first approach
<div className="
  text-sm          // Default (mobile)
  md:text-base     // 768px and up
  lg:text-lg       // 1024px and up
">
  Responsive Text
</div>
```

## Accessibility

### Focus States
```tsx
// Standard focus ring
<button className="focus-ring">Button</button>

// Inset focus ring
<button className="focus-ring-inset">Button</button>
```

### Touch Targets
- Minimum size: 44x44px (iOS) / 48x48px (Android)
- Use `touch-manipulation` class for better mobile UX

```tsx
<button className="
  min-h-[44px] 
  min-w-[44px]
  touch-manipulation
">
  Touch Target
</button>
```

### Screen Reader Support
```tsx
// Hide visually but keep for screen readers
<span className="sr-only">Screen reader text</span>
```

## Best Practices

### Mobile-First Development
1. Start with mobile styles
2. Add breakpoints for larger screens
3. Use `clamp()` for fluid typography
4. Test on real devices

### Performance
1. Minimize animation complexity
2. Use `will-change` sparingly
3. Optimize images (WebP, lazy loading)
4. Reduce bundle size (tree-shaking)

### Consistency
1. Use design tokens from `lib/design-tokens.ts`
2. Follow established component patterns
3. Reuse existing components
4. Document new patterns

### Accessibility
1. Semantic HTML
2. ARIA labels where needed
3. Keyboard navigation support
4. Color contrast ratios (WCAG AA minimum)
5. Focus indicators
6. Alt text for images

## Component Checklist

When creating new components:

- [ ] Mobile-first responsive design
- [ ] Keyboard navigation support
- [ ] Focus states defined
- [ ] Loading states implemented
- [ ] Error states handled
- [ ] Proper ARIA labels
- [ ] Touch-friendly (44px minimum)
- [ ] Uses design tokens
- [ ] Consistent with existing patterns
- [ ] TypeScript types defined
- [ ] JSDoc comments added

## Example: Creating a New Component

```tsx
"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { designTokens } from '@/lib/design-tokens';

interface MyComponentProps {
  /** The title to display */
  title: string;
  /** Optional description */
  description?: string;
  /** Callback when clicked */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MyComponent - A reusable component following design system guidelines
 * 
 * @example
 * ```tsx
 * <MyComponent 
 *   title="Hello World" 
 *   description="This is a description"
 *   onClick={() => console.log('clicked')}
 * />
 * ```
 */
export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description,
  onClick,
  className
}) => {
  return (
    <div 
      className={cn(
        // Base styles
        "card-modern spacing-md",
        // Responsive
        "w-full md:w-auto",
        // Interactions
        "hover-lift focus-ring",
        // Custom classes
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <h3 className="text-responsive-xl font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-responsive-sm text-gray-600">
          {description}
        </p>
      )}
    </div>
  );
};
```

## Resources

### Tools
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Components](https://www.radix-ui.com/)
- [Lucide Icons](https://lucide.dev/)
- [Google Fonts (Inter)](https://fonts.google.com/specimen/Inter)

### Design References
- Material Design (spacing, elevations)
- Apple Human Interface Guidelines (touch targets)
- WCAG 2.1 AA (accessibility)

### Testing
- Chrome DevTools (responsive design mode)
- Lighthouse (performance, accessibility)
- axe DevTools (accessibility)

---

**Last Updated:** October 3, 2025
**Version:** 1.0.0
