# Phase 1 & 2: Theme Foundation and UI Primitives

This document provides detailed specifications for the first two phases of the React Native/Expo habit tracking app redesign. Phase 1 establishes the foundational theme system, while Phase 2 introduces reusable UI primitive components.

---

## Phase 1: Theme Foundation

### 1.1 Color System Update

**File:** `src/theme/colors.ts`

**Current State:** Teal "Glacier" theme with primary color #4ECDC4

**New Color Palette:**

```typescript
const colors = {
  // Core backgrounds
  background: {
    primary: '#0D0D0F',    // Deep black - main app background
    secondary: '#1A1A1D',  // Dark gray - cards, elevated surfaces
    elevated: '#242428',   // Slightly lighter - modals, dropdowns
    tertiary: '#2A2A2E',   // For nested elevated elements
  },

  // Accent colors
  accent: {
    primary: '#3B82F6',      // Electric blue - primary actions, selected states
    primaryLight: '#60A5FA', // Hover/focus states
    primaryDark: '#2563EB',  // Pressed states
    primaryMuted: 'rgba(59, 130, 246, 0.15)', // Backgrounds with accent tint
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF',    // Main content, headings
    secondary: '#9CA3AF',  // Descriptions, labels
    tertiary: '#6B7280',   // Placeholder, disabled text
    disabled: '#4B5563',   // Fully disabled
    inverse: '#0D0D0F',    // Text on light backgrounds
  },

  // Semantic colors
  success: {
    50: '#ECFDF5',
    500: '#10B981',
    600: '#059669',
  },
  warning: {
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  danger: {
    50: '#FEF2F2',
    500: '#EF4444',
    600: '#DC2626',
  },

  // Borders and dividers
  border: {
    default: '#27272A',    // Standard borders
    subtle: '#1F1F23',     // Subtle dividers
    focus: '#3B82F6',      // Focus rings
  },

  // Habit accent colors (for individual habit customization)
  habitColors: [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#8B5CF6', // Violet
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#EC4899', // Pink
    '#84CC16', // Lime
  ],

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.6)',
} as const;

export type ColorToken = typeof colors;
export default colors;
```

---

### 1.2 Animation Tokens Extension

**File:** `src/theme/tokens.ts`

**Add to existing tokens:**

```typescript
export const reanimatedConfig = {
  // Spring configurations
  spring: {
    gentle: { damping: 20, stiffness: 150, mass: 1 },
    bouncy: { damping: 10, stiffness: 200, mass: 0.8 },
    stiff: { damping: 25, stiffness: 300, mass: 1 },
    completion: { damping: 12, stiffness: 200, mass: 0.8 },
    navigation: { damping: 15, stiffness: 150, mass: 1 },
  },

  // Timing configurations
  timing: {
    fast: { duration: 150 },
    normal: { duration: 200 },
    slow: { duration: 300 },
    emphasize: { duration: 400 },
  },

  // Stagger delays for list animations
  stagger: {
    card: 50,      // ms between each card animation
    particle: 20,  // ms between each particle
    day: 30,       // ms between each day item
  },

  // Easing curves (for withTiming)
  easing: {
    standard: 'Easing.bezier(0.25, 0.1, 0.25, 1)',
    accelerate: 'Easing.bezier(0.4, 0, 1, 1)',
    decelerate: 'Easing.bezier(0, 0, 0.2, 1)',
  },
} as const;
```

---

### 1.3 Theme Migration Checklist

- [ ] Update `colors.ts` with new palette
- [ ] Add `reanimatedConfig` to `tokens.ts`
- [ ] Update `src/theme/index.ts` to export new tokens
- [ ] Test existing components render correctly with new colors
- [ ] Search for any hardcoded color values in components

---

## Phase 2: UI Primitives

### 2.1 Card Component

**File:** `src/components/common/Card.tsx`

**Purpose:** Base card component with dark theme styling, subtle borders, and optional press handling.

**Interface:**

```typescript
interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}
```

**Styling Specifications:**

| Variant   | Background    | Border Width | Border Color | Shadow                                                                 |
|-----------|---------------|--------------|--------------|------------------------------------------------------------------------|
| elevated  | `#1A1A1D`     | 1            | `#27272A`    | shadowColor `#000`, shadowOpacity 0.3, shadowRadius 8, shadowOffset { height: 2 } |
| outlined  | transparent   | 1            | `#27272A`    | None                                                                   |
| filled    | `#1A1A1D`     | 0            | None         | None                                                                   |

**Common Styling (all variants):**
- `borderRadius`: 12
- `padding`: 16

**Press State:**
- `scale`: 0.98
- `opacity`: 0.9

**Implementation Notes:**
- Use `Pressable` for touch handling
- Apply subtle scale animation on press using Animated API or Reanimated
- Support haptic feedback on press (optional prop)

---

### 2.2 IconButton Component

**File:** `src/components/common/IconButton.tsx`

**Purpose:** Reusable icon button for header actions (settings gear, add button).

**Interface:**

```typescript
interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'default' | 'primary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  backgroundColor?: string;
  disabled?: boolean;
  accessibilityLabel: string;
  testID?: string;
}
```

**Size Specifications:**

| Size | Icon Size | Touch Target | Padding |
|------|-----------|--------------|---------|
| sm   | 18        | 32x32        | 7       |
| md   | 22        | 40x40        | 9       |
| lg   | 26        | 48x48        | 11      |

**Variant Styling:**

| Variant | Background Color | Icon Color |
|---------|------------------|------------|
| default | `#1A1A1D`        | `#FFFFFF`  |
| primary | `#3B82F6`        | `#FFFFFF`  |
| ghost   | transparent      | `#9CA3AF`  |

**Implementation Notes:**
- Use `Ionicons` from `@expo/vector-icons`
- Apply scale animation (0.9) on press
- Include haptic feedback (`impactLight`)
- Ensure minimum 44x44 touch target for accessibility

---

### 2.3 Barrel Exports

**File:** `src/components/common/index.ts`

```typescript
export { Card } from './Card';
export { IconButton } from './IconButton';
export type { CardProps } from './Card';
export type { IconButtonProps } from './IconButton';
```

**File:** `src/components/header/index.ts`

```typescript
export { AppHeader } from './AppHeader';
export { DayNavigator } from './DayNavigator';
export { DayItem } from './DayItem';
```

---

### 2.4 Component Directory Structure

After Phase 2 completion:

```
src/components/
├── common/
│   ├── Card.tsx
│   ├── IconButton.tsx
│   └── index.ts
├── header/
│   └── index.ts (empty, prepared for Phase 4)
└── habits/
    ├── HabitCard.tsx (existing)
    ├── DayIndicator.tsx (existing)
    └── index.ts (create barrel export)
```

---

### 2.5 Testing Requirements

- [ ] Card renders correctly in all three variants
- [ ] Card onPress handler fires correctly
- [ ] Card disabled state prevents interaction
- [ ] IconButton renders all three sizes correctly
- [ ] IconButton variants apply correct colors
- [ ] IconButton accessibility label is announced
- [ ] Both components respect dark theme colors

---

## Acceptance Criteria

### Phase 1 Complete When:

1. New color palette is implemented in `colors.ts`
2. Animation tokens added to `tokens.ts`
3. All existing screens render without color-related errors
4. No hardcoded colors remain in component files

### Phase 2 Complete When:

1. Card component implemented with all variants
2. IconButton component implemented with all sizes/variants
3. Barrel exports created for common components
4. Basic unit tests passing
5. Components verified in isolation (consider Storybook or test screen)
