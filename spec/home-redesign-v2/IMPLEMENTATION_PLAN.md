# But Why - Home Screen Redesign v2 Implementation Plan

## 1. Executive Summary

### Project Goal
Complete UX/UI redesign of the "But Why" habit tracking app's home screen, introducing a modern day-based navigation paradigm that enhances user engagement and provides a premium visual experience.

### Key Deliverables
- **New Header with Day Navigator**: Horizontal scrollable day selector showing Spanish day labels (L, M, X, J, V, S, D) with date numbers, allowing users to view and edit habits for any day
- **Redesigned Habit Cards**: Simplified horizontal layout featuring circular checkboxes, habit names with icons, and prominent streak badges
- **Dark Premium Theme**: Complete color system overhaul with deep blacks (#0D0D0F), elevated card surfaces (#1A1A1D), and vibrant blue accent (#3B82F6)
- **Completion Animations**: Satisfying micro-interactions using react-native-reanimated including checkmark animations, particle effects, and haptic feedback

### Timeline
This implementation is structured into **5 sequential phases**, designed to minimize risk and allow for iterative testing:

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 1 | 1-2 days | Theme Foundation |
| Phase 2 | 2-3 days | UI Primitives |
| Phase 3 | 1-2 days | State Management |
| Phase 4 | 3-4 days | Core Components |
| Phase 5 | 2-3 days | Integration & Polish |

**Total Estimated Duration**: 9-14 days

---

## 2. Current Technical Architecture

### Component Structure
The app currently uses a straightforward component hierarchy:

```
src/
├── components/
│   └── habits/
│       ├── HabitCard.tsx      # Card with 7-day inline row
│       └── DayIndicator.tsx   # Individual day circle in habit card
├── screens/
│   ├── Home.tsx               # Main screen with FlashList
│   ├── CreateHabit.tsx        # Habit creation/editing
│   └── Settings.tsx           # App settings
├── hooks/
│   └── useHabits.ts           # Habit data management
├── types/
│   └── habit.ts               # TypeScript interfaces
├── theme/
│   ├── colors.ts              # "Glacier" teal color system
│   ├── fonts.ts               # Typography definitions
│   └── tokens.ts              # Spacing, shadows, animation tokens
└── storage/
    └── habits.ts              # AsyncStorage persistence
```

### Current Theme System
- **Primary Color**: Teal "Glacier" theme (`#4ECDC4`)
- **Background**: True black (`#000000`) and deep black (`#0A0A0C`)
- **Surfaces**: Blue-gray neutrals (900: `#0F1113` to 50: `#F2F2F7`)
- **Cards**: `colors.neutral[900]` with `colors.auxiliary[700]` border

### Data Layer
- **Storage**: AsyncStorage with two keys:
  - `@but_why/habits` - Array of Habit objects
  - `@but_why/completions` - Record of `habitId -> { date -> boolean }`
- **State Management**: Local state in `useHabits` hook
- **Date Handling**: Custom utilities in `src/utils/dates.ts`

### Current HabitCard Design
Each card displays:
- Colored accent bar (3px left border)
- Icon container with habit icon
- Habit name
- 7-day row (3 past + today + 3 future) with DayIndicator components
- Streak badge (when streak > 0)

### Navigation
- **Router**: expo-router with stack navigator
- **Routes**: `/` (Home), `/create-habit`, `/settings`

---

## 3. Target Architecture Overview

### New Design System

#### Color Palette
```typescript
// New dark premium colors
background: {
  primary: "#0D0D0F",    // Main background
  secondary: "#1A1A1D",  // Card surfaces
  tertiary: "#242428",   // Elevated elements
}

accent: {
  primary: "#3B82F6",    // Main action color (blue)
  success: "#22C55E",    // Completion states
  warning: "#F59E0B",    // Streak indicators
}

text: {
  primary: "#FFFFFF",
  secondary: "#A1A1AA",
  tertiary: "#71717A",
}
```

#### Animation System
Leveraging react-native-reanimated v4.1.1 with predefined presets:
- `spring.gentle` - UI transitions (damping: 15, stiffness: 150)
- `spring.bouncy` - Completion celebrations (damping: 10, stiffness: 180)
- `timing.fast` - 150ms micro-interactions
- `timing.normal` - 250ms standard transitions

### New Component Hierarchy

```
src/
├── components/
│   ├── header/
│   │   ├── AppHeader.tsx        # NEW: Main header container
│   │   ├── DayNavigator.tsx     # NEW: Horizontal day scroller
│   │   ├── DayItem.tsx          # NEW: Individual day in navigator
│   │   └── index.ts
│   ├── habits/
│   │   ├── HabitCard.tsx        # MODIFIED: Simplified horizontal layout
│   │   ├── CircularCheckbox.tsx # NEW: Animated checkbox
│   │   ├── StreakBadge.tsx      # NEW: Extracted streak component
│   │   └── DayIndicator.tsx     # MODIFIED: Add animations
│   └── common/
│       ├── Card.tsx             # NEW: Base card primitive
│       ├── IconButton.tsx       # NEW: Reusable icon button
│       └── index.ts
├── contexts/
│   └── DayNavigationContext.tsx # NEW: Selected day state
├── hooks/
│   ├── useHabits.ts             # MODIFIED: Date filtering
│   └── animations/
│       └── useCompletionAnimation.ts  # NEW: Reusable animation hook
└── utils/
    ├── habitFilters.ts          # NEW: Date-based filtering
    └── streakCalculator.ts      # NEW: Extracted streak logic
```

### Day Navigation Flow
1. User sees horizontal day navigator in header (past 7 days + today + next 7 days)
2. Today is centered and highlighted on load
3. Tapping a day updates `selectedDate` in `DayNavigationContext`
4. HabitCard list filters to show habits scheduled for selected day
5. Completion toggles affect the selected date (not always today)
6. Past days remain editable for retroactive logging

---

## 4. Phase Overview Table

| Phase | Name | Description | Key Deliverables | Est. Duration |
|-------|------|-------------|------------------|---------------|
| **1** | Theme Foundation | Update the color system to new dark premium palette. Add animation token presets for Reanimated. | Updated `colors.ts` with new palette, animation presets in `tokens.ts`, semantic color mappings | 1-2 days |
| **2** | UI Primitives | Create reusable base components that follow the new design system. | `Card.tsx`, `IconButton.tsx`, component index files, storybook-ready primitives | 2-3 days |
| **3** | State Management | Implement day navigation state and enhance habit filtering. | `DayNavigationContext.tsx`, date-filtered `useHabits`, streak calculation utilities | 1-2 days |
| **4** | Core Components | Build the header system and redesigned habit cards. | `AppHeader.tsx`, `DayNavigator.tsx`, `DayItem.tsx`, `CircularCheckbox.tsx`, refactored `HabitCard.tsx` | 3-4 days |
| **5** | Integration & Polish | Connect all components, add animations, comprehensive testing. | Full screen integration, completion animations, haptic feedback, edge case handling | 2-3 days |

---

## 5. Dependencies

### Existing Packages (No Updates Required)
All required functionality is available with currently installed packages:

| Package | Version | Usage |
|---------|---------|-------|
| `react-native-reanimated` | 4.1.1 | All animations, gesture-driven interactions |
| `react-native-gesture-handler` | 2.28.0 | Touch handling, swipe gestures |
| `expo-haptics` | Installed | Tactile feedback on completions |
| `@shopify/flash-list` | Installed | Performant habit list rendering |
| `expo-router` | Installed | Navigation (unchanged) |

### No New Dependencies Required
- **Particle effects**: Custom implementation with Reanimated (no Skia)
- **State management**: React Context (no Redux/Zustand)
- **Date handling**: Existing utilities + minor extensions

---

## 6. File Change Summary

### New Files to Create

#### Header Components
| File | Purpose |
|------|---------|
| `src/components/header/AppHeader.tsx` | Main header container with title, settings button, and DayNavigator |
| `src/components/header/DayNavigator.tsx` | Horizontal ScrollView with day items, handles scroll-to-today |
| `src/components/header/DayItem.tsx` | Individual day button with label, date number, selection state |
| `src/components/header/index.ts` | Barrel export file |

#### Habit Components
| File | Purpose |
|------|---------|
| `src/components/habits/CircularCheckbox.tsx` | Animated circular checkbox with fill animation and checkmark |
| `src/components/habits/StreakBadge.tsx` | Flame icon with streak count, entrance animation |

#### Common Components
| File | Purpose |
|------|---------|
| `src/components/common/Card.tsx` | Base card primitive with variants (elevated, outlined, flat) |
| `src/components/common/IconButton.tsx` | Pressable icon with consistent sizing and feedback |
| `src/components/common/index.ts` | Barrel export file |

#### State & Hooks
| File | Purpose |
|------|---------|
| `src/contexts/DayNavigationContext.tsx` | Context provider for selectedDate, navigation functions |
| `src/hooks/animations/useCompletionAnimation.ts` | Shared animation values and triggers for habit completion |

#### Utilities
| File | Purpose |
|------|---------|
| `src/utils/habitFilters.ts` | Functions to filter habits by selected date and frequency |
| `src/utils/streakCalculator.ts` | Extracted and optimized streak calculation with caching |

---

### Modified Files

#### Theme Files
| File | Changes |
|------|---------|
| `src/theme/colors.ts` | New dark premium color palette, semantic color tokens, backwards-compatible aliases |
| `src/theme/tokens.ts` | Reanimated spring/timing presets, updated shadow values for dark theme |

#### Component Files
| File | Changes |
|------|---------|
| `src/components/habits/HabitCard.tsx` | Complete redesign: horizontal layout, circular checkbox, simplified UI, remove inline week row |
| `src/components/habits/DayIndicator.tsx` | Add Reanimated animations for state changes, scale feedback |

#### Screen Files
| File | Changes |
|------|---------|
| `src/screens/Home.tsx` | Replace header with AppHeader, wrap in DayNavigationContext, update styles |
| `src/screens/Settings.tsx` | Update to new color theme |
| `src/screens/CreateHabit.tsx` | Update to new color theme |

#### Hook Files
| File | Changes |
|------|---------|
| `src/hooks/useHabits.ts` | Add date parameter for filtering, optimize streak calculation, add caching |

#### Type Files
| File | Changes |
|------|---------|
| `src/types/habit.ts` | Add `HabitForDate` interface, animation state types, streak cache types |

---

## 7. Cross-References

This implementation plan is supported by detailed specification documents:

| Document | Contents |
|----------|----------|
| `PHASE_1_2_SPECS.md` | Detailed color values, typography updates, Card and IconButton component APIs, styling specifications |
| `PHASE_3_STATE_SPECS.md` | DayNavigationContext implementation, useHabits modifications, date utilities, caching strategy |
| `PHASE_4_COMPONENTS_SPECS.md` | Complete component specifications for AppHeader, DayNavigator, DayItem, CircularCheckbox, HabitCard redesign |
| `PHASE_5_ANIMATIONS_SPECS.md` | Animation timing curves, completion celebration sequence, particle effect implementation, haptic feedback mapping |

---

## 8. Key Technical Decisions

### Decision 1: No New Dependencies
**Rationale**: The existing react-native-reanimated v4.1.1 and react-native-gesture-handler v2.28.0 stack provides all necessary animation and gesture capabilities. Adding Skia for particle effects would increase bundle size by ~2MB with minimal benefit.

**Implementation**: Custom particle effects using Reanimated's `useAnimatedStyle` with mapped particle positions.

---

### Decision 2: Keep Current AsyncStorage Schema
**Rationale**: The existing `@but_why/habits` and `@but_why/completions` storage keys work well. Migration would add complexity without clear benefit.

**Enhancement**: Add an in-memory caching layer for streak calculations to avoid repeated computation.

```typescript
// Streak cache structure (in-memory only)
streakCache: Map<habitId, { value: number, computedAt: Date }>
```

---

### Decision 3: Props Drilling Over Global State
**Rationale**: For an app of this size, props drilling through 2-3 levels is acceptable and maintains simplicity. Redux or Zustand would add unnecessary boilerplate.

**Exceptions**:
- `DayNavigationContext` for selected date (needed across header and list)
- Theme context if dark/light mode toggle is added later

---

### Decision 4: Custom Particle Effects
**Rationale**: Skip Skia to avoid 2MB bundle increase. Reanimated can achieve satisfying particle effects with 8-12 animated circles.

**Implementation Approach**:
```typescript
// Spawn 8 particles at checkbox center
// Each particle: random angle, random distance (30-60px)
// Fade out over 400ms while moving outward
// Colors: accent primary + success green
```

---

### Decision 5: Retroactive Completion Editing
**Rationale**: Users should be able to mark habits complete for past days they forgot to log. This is a common user request in habit tracking apps.

**Implementation**:
- Past days in DayNavigator are selectable (not grayed out)
- Selecting a past day shows habits for that day
- Toggling completion updates the past date in storage
- Visual indicator shows when viewing past vs. today

---

### Decision 6: Spanish Day Labels by Default
**Rationale**: Initial target audience is Spanish-speaking. Day labels use Spanish abbreviations.

**Day Label Mapping**:
| Day | Spanish | Label |
|-----|---------|-------|
| Monday | Lunes | L |
| Tuesday | Martes | M |
| Wednesday | Miercoles | X |
| Thursday | Jueves | J |
| Friday | Viernes | V |
| Saturday | Sabado | S |
| Sunday | Domingo | D |

**Future**: Localization support can be added via i18n, keeping labels configurable.

---

## 9. Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Animation performance on low-end devices | Medium | High | Use `useAnimatedStyle` with worklets, limit particle count, test on Android mid-range |
| FlashList re-render issues with context | Low | Medium | Memoize list items, use `extraData` prop correctly |
| Date timezone edge cases | Medium | Medium | All date comparisons use YYYY-MM-DD strings, avoid Date object comparisons |
| Backwards compatibility during rollout | Low | High | Keep old components available during transition, feature flag if needed |

---

## 10. Success Metrics

### Performance Targets
- [ ] List scroll at 60fps on iPhone 12 and equivalent Android
- [ ] Completion animation under 16ms per frame
- [ ] App cold start time unchanged (< 2s)

### UX Targets
- [ ] Day navigation intuitive without tutorial
- [ ] Completion feedback feels satisfying (haptics + visual)
- [ ] Past day editing discoverable

### Code Quality Targets
- [ ] All new components have TypeScript interfaces
- [ ] Animation hooks are reusable
- [ ] No increase in bundle size > 50KB

---

## Appendix: Quick Reference

### Color Migration Cheat Sheet
```typescript
// Old -> New mappings
colors.base.black        -> colors.background.primary
colors.neutral[900]      -> colors.background.secondary
colors.primary[500]      -> colors.accent.primary
colors.neutral[400]      -> colors.text.secondary
```

### Animation Presets Quick Reference
```typescript
import { withSpring, withTiming } from 'react-native-reanimated';

// Gentle spring for UI
withSpring(value, { damping: 15, stiffness: 150 })

// Bouncy spring for celebrations
withSpring(value, { damping: 10, stiffness: 180 })

// Fast timing
withTiming(value, { duration: 150 })

// Normal timing
withTiming(value, { duration: 250 })
```

### File Creation Order
1. `src/theme/colors.ts` (update)
2. `src/theme/tokens.ts` (update)
3. `src/components/common/Card.tsx`
4. `src/components/common/IconButton.tsx`
5. `src/contexts/DayNavigationContext.tsx`
6. `src/utils/habitFilters.ts`
7. `src/components/header/DayItem.tsx`
8. `src/components/header/DayNavigator.tsx`
9. `src/components/header/AppHeader.tsx`
10. `src/components/habits/CircularCheckbox.tsx`
11. `src/components/habits/HabitCard.tsx` (refactor)
12. `src/screens/Home.tsx` (integrate)

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: Implementation Team*
