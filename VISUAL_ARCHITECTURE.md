# Visual Architecture - New Layout System

## Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Root Layout (app/layout.tsx)                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  Navigation Provider                                    │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │                                                 │   │   │
│  │  │  MainLayout (components/layout/MainLayout.tsx) │   │   │
│  │  │  ┌─────────────────────────────────────────┐   │   │   │
│  │  │  │                                         │   │   │   │
│  │  │  │  ┌───────────────────────────────────┐ │   │   │   │
│  │  │  │  │                                   │ │   │   │   │
│  │  │  │  │  CentralizedHeader               │ │   │   │   │
│  │  │  │  │  (Logo, Nav, User Profile)       │ │   │   │   │
│  │  │  │  │                                   │ │   │   │   │
│  │  │  │  └───────────────────────────────────┘ │   │   │   │
│  │  │  │                                         │   │   │   │
│  │  │  │  ┌─────────┬─────────────────────────┐ │   │   │   │
│  │  │  │  │         │                         │ │   │   │   │
│  │  │  │  │ Sidebar │  Main Content Area      │ │   │   │   │
│  │  │  │  │ (Dash   │                         │ │   │   │   │
│  │  │  │  │  only)  │  {children}             │ │   │   │   │
│  │  │  │  │         │                         │ │   │   │   │
│  │  │  │  │         │                         │ │   │   │   │
│  │  │  │  └─────────┴─────────────────────────┘ │   │   │   │
│  │  │  │                                         │   │   │   │
│  │  │  │  ┌───────────────────────────────────┐ │   │   │   │
│  │  │  │  │                                   │ │   │   │   │
│  │  │  │  │  Footer (except auth pages)      │ │   │   │   │
│  │  │  │  │                                   │ │   │   │   │
│  │  │  │  └───────────────────────────────────┘ │   │   │   │
│  │  │  │                                         │   │   │   │
│  │  │  └─────────────────────────────────────────┘   │   │   │
│  │  │                                                 │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  Toaster (notifications)                               │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
app/
├── layout.tsx
│   └── NavigationProvider
│       └── MainLayout
│           ├── CentralizedHeader
│           ├── Conditional: Sidebar (dashboard only)
│           ├── Main Content ({children})
│           └── Conditional: Footer (not on auth pages)
│
└── dashboard/
    ├── page.tsx (existing - still works)
    ├── page-new.tsx (new structure - ready to use)
    └── tabs/
        ├── CommunicationTab.tsx ✅
        ├── ProfileTab.tsx
        ├── KeySecurityTab.tsx
        ├── BookingTab.tsx
        ├── InvoicesTab.tsx
        ├── AdminUsersTab.tsx
        ├── AdminSittersTab.tsx
        ├── AdminBookingsTab.tsx
        ├── AdminPetsTab.tsx
        ├── AdminAddressChangesTab.tsx
        ├── SitterClientsTab.tsx
        └── SitterSchedulingTab.tsx
```

## Desktop Layout (> 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  Logo            Navigation Links              Profile Dropdown  │ Header (80px)
├───────────┬─────────────────────────────────────────────────────┤
│           │                                                     │
│ Dashboard │                                                     │
│           │                                                     │
│ Communic. │                                                     │
│           │                                                     │
│ Users     │         Main Content Area                           │
│           │         (Dashboard Content)                         │
│ Sitters   │                                                     │
│           │                                                     │
│ Bookings  │                                                     │
│           │                                                     │
│ Pets      │                                                     │
│           │                                                     │
│ Address   │                                                     │
│           │                                                     │
│ ─────────│                                                     │
│ Settings  │                                                     │
│           │                                                     │
├───────────┴─────────────────────────────────────────────────────┤
│  Services  │  Company  │  Support  │  Social Media             │ Footer (64px)
└─────────────────────────────────────────────────────────────────┘
    Sidebar
    (256px)
```

## Tablet Layout (768px - 1024px)

```
┌─────────────────────────────────────────────────────────────────┐
│  Logo        Nav Links (fewer)         Profile    Menu          │ Header (64px)
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│ Dashboard│                                                      │
│ Comm.    │                                                      │
│ Users    │         Main Content Area                            │
│ Sitters  │         (Responsive Layout)                          │
│ ...      │                                                      │
│          │                                                      │
│ Settings │                                                      │
│          │                                                      │
├──────────┴──────────────────────────────────────────────────────┤
│  Services  │  Company  │  Support                              │ Footer
└─────────────────────────────────────────────────────────────────┘
  Sidebar
  (collapsed)
```

## Mobile Layout (< 768px)

```
┌─────────────────────────────────────────┐
│  ☰   Logo              Profile    ┃    │ Header (64px)
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         Main Content Area               │
│         (Stacked Layout)                │
│                                         │
│         Everything stacks               │
│         vertically                      │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  Services                               │
│  Company                                │ Footer (Stacked)
│  Support                                │
└─────────────────────────────────────────┘

When ☰ clicked:
┌─────────────────────────────────────────┐
│ ← Back                                  │
├─────────────────────────────────────────┤
│ 🏠 Dashboard                            │
│ 💬 Communication                        │
│ 👥 Users                                │ Drawer Sidebar
│ 👤 Sitters                              │ (Full width)
│ 📅 Bookings                             │
│ 🐾 Pets                                 │
│ 📍 Address Changes                      │
│ ⚙️ Settings                             │
└─────────────────────────────────────────┘
```

## Sidebar States

### Expanded (256px)
```
┌─────────────────────┐
│  Menu          ◄    │
├─────────────────────┤
│ 🏠 Dashboard        │
│ 💬 Communication    │
│ 👥 Users            │
│ 👤 Sitters          │
│ 📅 Bookings         │
│ 🐾 Pets             │
│ 📍 Address Changes  │
│                     │
│                     │
├─────────────────────┤
│ ⚙️ Settings         │
└─────────────────────┘
```

### Collapsed (64px)
```
┌─────┐
│  ►  │
├─────┤
│ 🏠  │
│ 💬  │
│ 👥  │
│ 👤  │
│ 📅  │
│ 🐾  │
│ 📍  │
│     │
│     │
├─────┤
│ ⚙️  │
└─────┘
```

## Navigation Flow

```
User Opens App
    ↓
┌──────────────────────┐
│   Landing Page       │ ← No sidebar, has footer
└──────────────────────┘
    ↓
┌──────────────────────┐
│   Login Page         │ ← No sidebar, no footer
└──────────────────────┘
    ↓
┌──────────────────────┐
│   Dashboard          │ ← HAS SIDEBAR, has footer
│   (tab=communication)│
└──────────────────────┘
    ↓
User clicks "Users" in sidebar
    ↓
┌──────────────────────┐
│   Dashboard          │ ← Same page, different content
│   (tab=users)        │
└──────────────────────┘
```

## Component Rendering Logic

```typescript
MainLayout Component
│
├─ Always Render
│  └─ CentralizedHeader
│
├─ Conditional Sidebar
│  ├─ IF pathname.startsWith('/dashboard')
│  │  AND NOT in noSidebarPages
│  │  └─ <Sidebar userRole={role} />
│  └─ ELSE null
│
├─ Always Render
│  └─ Main Content Area
│     └─ {children}
│
└─ Conditional Footer
   ├─ IF NOT in noFooterPages
   │  └─ <Footer />
   └─ ELSE null
```

## Responsive Behavior

```
Desktop (≥1024px)
├─ Header: Full height (80px)
├─ Sidebar: Visible, collapsible
├─ Content: Adjusted for sidebar
└─ Footer: Full layout

Tablet (768px - 1023px)
├─ Header: Reduced height (64px)
├─ Sidebar: Auto-collapsed option
├─ Content: Responsive grids (2 cols)
└─ Footer: Adjusted layout

Mobile (<768px)
├─ Header: Compact (64px)
├─ Sidebar: Drawer overlay
├─ Content: Single column, stacked
└─ Footer: Stacked vertically
```

## Role-Based Sidebar Content

```
┌─────────────────────────────────────────────────────────────┐
│                       Sidebar Navigation                    │
├─────────────────────────────────────────────────────────────┤
│  All Roles:                                                 │
│  • Dashboard                                                │
│  • Communication                                            │
├─────────────────────────────────────────────────────────────┤
│  Admin Only:                                                │
│  • Users                                                    │
│  • Sitters                                                  │
│  • Bookings                                                 │
│  • Pets                                                     │
│  • Address Changes                                          │
├─────────────────────────────────────────────────────────────┤
│  Sitter Only:                                               │
│  • My Clients                                               │
│  • Scheduling                                               │
│  • My Profile                                               │
├─────────────────────────────────────────────────────────────┤
│  Client Only:                                               │
│  • My Profile                                               │
│  • Key Security                                             │
│  • Book Now                                                 │
│  • Invoices                                                 │
└─────────────────────────────────────────────────────────────┘
```

## Design Token Usage

```typescript
// Spacing
spacing.md (16px)    → Standard padding
spacing.lg (24px)    → Section spacing
spacing.xl (32px)    → Large gaps

// Typography
text-responsive-3xl  → Page titles
text-responsive-xl   → Section headers
text-responsive-base → Body text
text-responsive-sm   → Small text

// Colors
primary              → Buttons, links, active states
secondary            → Secondary actions
accent               → Highlights, badges
muted-foreground     → Secondary text

// Shadows
shadow-sm            → Subtle elevation
shadow-md            → Cards, buttons
shadow-lg            → Modals, popovers

// Transitions
transition-fast      → 150ms (hover states)
transition-base      → 200ms (most interactions)
transition-slow      → 300ms (layout changes)
```

## Animation Flow

```
Page Load
  ↓
fadeIn (600ms)
  ↓
Component Mounts
  ↓
slideUp (600ms)
  ↓
Stagger Children
  ↓
fadeInUp with delay
  (0.1s, 0.2s, 0.3s...)
```

## Accessibility Tree

```
<html>
  <body>
    <header role="banner">
      <nav role="navigation" aria-label="Main">
        <!-- Header navigation -->
      </nav>
    </header>
    
    <aside role="complementary" aria-label="Sidebar">
      <nav role="navigation" aria-label="Dashboard">
        <!-- Sidebar navigation -->
      </nav>
    </aside>
    
    <main role="main" aria-label="Main content">
      <!-- Page content -->
    </main>
    
    <footer role="contentinfo">
      <!-- Footer content -->
    </footer>
  </body>
</html>
```

## Summary

This visual architecture shows how the new layout system is structured, providing:

✅ Clear component hierarchy
✅ Responsive behavior at all breakpoints
✅ Role-based navigation
✅ Conditional rendering logic
✅ Accessibility structure
✅ Design token usage
✅ Animation flows

The system is modular, maintainable, and provides excellent user experience across all devices and user roles.
