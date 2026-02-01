# Phase 4: Core Component Specifications

## Overview

This phase implements the main UI components for the redesigned home screen: the header with day navigation and the refactored habit cards.

---

## 4.1 AppHeader Component

**File:** `src/components/header/AppHeader.tsx`

### Purpose

Flexible header container that provides consistent structure across the app with slots for left action, center content, and right action.

### Interface

```typescript
interface AppHeaderProps {
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  centerContent?: React.ReactNode;
  title?: string;                    // Alternative to centerContent
  showBorder?: boolean;
  style?: StyleProp<ViewStyle>;
}
```

### Layout Specifications

```
┌────────────────────────────────────────────────────────────┐
│ [SafeAreaView - top padding]                               │
├────────────────────────────────────────────────────────────┤
│ [Left]      [Center Content / Title]          [Right]      │
│  40px               flexible                    40px       │
├────────────────────────────────────────────────────────────┤
│ height: 56px (content area)                                │
│ paddingHorizontal: 16px                                    │
│ backgroundColor: #0D0D0F                                   │
│ borderBottomWidth: 1 (if showBorder)                       │
│ borderBottomColor: #27272A                                 │
└────────────────────────────────────────────────────────────┘
```

### Implementation

```typescript
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../ui/Text';
import colors from '../../theme/colors';

export function AppHeader({
  leftAction,
  rightAction,
  centerContent,
  title,
  showBorder = false,
  style
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top },
      showBorder && styles.withBorder,
      style
    ]}>
      <View style={styles.content}>
        <View style={styles.leftSlot}>
          {leftAction}
        </View>

        <View style={styles.centerSlot}>
          {centerContent || (title && (
            <AppText style={styles.title}>{title}</AppText>
          ))}
        </View>

        <View style={styles.rightSlot}>
          {rightAction}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftSlot: {
    width: 40,
    alignItems: 'flex-start',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
  },
  rightSlot: {
    width: 40,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  withBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
});
```

---

## 4.2 DayNavigator Component

**File:** `src/components/header/DayNavigator.tsx`

### Purpose

Horizontal scrollable day selector showing a week of days (L, M, X, J, V, S, D) with the current day highlighted and the selected day indicated.

### Interface

```typescript
interface DayNavigatorProps {
  selectedDate: string;              // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  accentColor?: string;              // Override default accent
}

// Internal type
interface DayData {
  date: string;                      // YYYY-MM-DD
  dayLabel: string;                  // L, M, X, J, V, S, D
  dayNumber: number;                 // 1-31
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
}
```

### Visual Specifications

```
┌─────────────────────────────────────────────────────────────┐
│     [L]    [M]    [X]    [J]    [V]    [S]    [D]          │
│     27     28     29     30     31      1      2           │
│                         ^^^^                                │
│                       (today)                               │
│                    accent bg + white text                   │
│                                                             │
│ Item dimensions:                                            │
│   - Width: 44px                                            │
│   - Height: 56px                                           │
│   - Gap between items: 8px                                 │
│   - Day label: 13px, secondary color                       │
│   - Day number: 16px, primary color (or white if selected) │
│                                                             │
│ Selected/Today state:                                       │
│   - backgroundColor: #3B82F6                               │
│   - borderRadius: 12                                       │
│   - dayLabel: white                                        │
│   - dayNumber: white, fontWeight: 600                      │
│                                                             │
│ Future state:                                               │
│   - opacity: 0.35                                          │
└─────────────────────────────────────────────────────────────┘
```

### Day Labels (Spanish)

```typescript
const DAY_LABELS_ES = ['D', 'L', 'M', 'X', 'J', 'V', 'S']; // Index 0 = Sunday

function getDayLabel(date: Date): string {
  return DAY_LABELS_ES[date.getDay()];
}
```

### Scroll Behavior

- Use `ScrollView` with `horizontal={true}`
- `showsHorizontalScrollIndicator={false}`
- `contentContainerStyle` with padding to center content
- `snapToInterval={44 + 8}` (item width + gap)
- `decelerationRate="fast"`

### Implementation Notes

1. Generate 7 days centered on today (3 past + today + 3 future)
2. Or generate 14 days (1 week past + 1 week future) for more context
3. Current day should be scrolled to center on mount
4. Use `useRef` to access ScrollView and call `scrollTo` on mount

---

## 4.3 DayItem Component

**File:** `src/components/header/DayItem.tsx`

### Purpose

Individual day button within the DayNavigator with press animation and visual state indicators.

### Interface

```typescript
interface DayItemProps {
  dayLabel: string;                  // L, M, X, etc.
  dayNumber: number;                 // 1-31
  isToday: boolean;
  isSelected: boolean;
  isFuture: boolean;
  onPress: () => void;
}
```

### Implementation

```typescript
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AppText } from '../../ui/Text';
import colors from '../../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function DayItem({
  dayLabel,
  dayNumber,
  isToday,
  isSelected,
  isFuture,
  onPress
}: DayItemProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const isHighlighted = isToday || isSelected;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        isHighlighted && styles.highlighted,
        isFuture && styles.future,
        animatedStyle,
      ]}
    >
      <AppText style={[
        styles.dayLabel,
        isHighlighted && styles.highlightedText,
      ]}>
        {dayLabel}
      </AppText>
      <AppText style={[
        styles.dayNumber,
        isHighlighted && styles.highlightedText,
      ]}>
        {dayNumber}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  highlighted: {
    backgroundColor: colors.accent.primary,
  },
  future: {
    opacity: 0.35,
  },
  dayLabel: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  dayNumber: {
    fontSize: 16,
    color: colors.text.primary,
  },
  highlightedText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
```

---

## 4.4 CircularCheckbox Component

**File:** `src/components/habits/CircularCheckbox.tsx`

### Purpose

Animated circular checkbox for marking habits complete/incomplete with premium animation effects.

### Interface

```typescript
interface CircularCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  accentColor?: string;              // Habit color override
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}
```

### Size Specifications

| Size | Outer Diameter | Border Width | Check Icon Size |
|------|----------------|--------------|-----------------|
| sm   | 24             | 2            | 14              |
| md   | 32             | 2.5          | 18              |
| lg   | 40             | 3            | 22              |

### Visual States

```
┌─────────────────────────────────────────────────────────────┐
│ Unchecked:                                                  │
│   - backgroundColor: transparent                            │
│   - borderColor: #27272A                                    │
│   - borderWidth: 2.5 (for md)                              │
│                                                             │
│ Checked:                                                    │
│   - backgroundColor: #3B82F6 (or habit accent color)       │
│   - borderColor: same as background                         │
│   - checkmark icon: white, centered                        │
│                                                             │
│ Disabled:                                                   │
│   - opacity: 0.35                                          │
│   - shows lock icon instead of checkmark                   │
└─────────────────────────────────────────────────────────────┘
```

### Animation Sequence (on check)

1. **Scale bounce** (0-150ms): scale 1 -> 1.15 -> 1
2. **Fill animation** (0-200ms): backgroundColor fades in
3. **Check appear** (100-250ms): checkmark scales from 0.3 -> 1.1 -> 1
4. **Haptic feedback**: `Haptics.notificationAsync(Success)`

See PHASE_5_ANIMATIONS_SPECS.md for detailed animation implementation.

---

## 4.5 StreakBadge Component

**File:** `src/components/habits/StreakBadge.tsx`

### Purpose

Displays the current streak count for a habit with optional fire emoji indicator.

### Interface

```typescript
interface StreakBadgeProps {
  count: number;
  accentColor?: string;
  variant?: 'inline' | 'badge';
  size?: 'sm' | 'md';
}
```

### Visual Specifications

**Inline variant:**
```
🔥 7 days
   ^^
   - Fire emoji + count + "days"
   - fontSize: 13
   - color: secondary text
```

**Badge variant:**
```
┌──────────┐
│ 🔥 7     │
└──────────┘
   - Pill shape background
   - backgroundColor: rgba(accent, 0.15)
   - paddingHorizontal: 8
   - paddingVertical: 4
   - borderRadius: 12
```

### Size Specifications

| Size | Font Size | Icon Size | Padding (badge) |
|------|-----------|-----------|-----------------|
| sm   | 12        | 12        | 6h, 3v          |
| md   | 13        | 14        | 8h, 4v          |

---

## 4.6 Refactored HabitCard Component

**File:** `src/components/habits/HabitCard.tsx`

### Purpose

Displays a single habit for the selected day with completion checkbox and streak information.

### New Interface

```typescript
interface HabitCardProps {
  habit: HabitForDay;                // From useHabits.getHabitsForDate()
  onToggleCompletion: () => void;
  onPress?: () => void;              // For edit/details
  disabled?: boolean;                // For future days
}
```

### New Layout

```
┌──────────────────────────────────────────────────────────────┐
│  ┌────┐                                                      │
│  │ ☐  │   Habit Name                           🔥 7 days    │
│  │    │                                                      │
│  └────┘                                                      │
│   ^^^                                                        │
│ CircularCheckbox                                             │
│                                                              │
│ Card styling:                                                │
│   - backgroundColor: #1A1A1D                                 │
│   - borderRadius: 16                                         │
│   - padding: 16                                              │
│   - marginHorizontal: 16                                     │
│   - marginBottom: 12                                         │
│   - borderWidth: 1                                           │
│   - borderColor: #27272A                                     │
│                                                              │
│ Layout:                                                      │
│   - flexDirection: row                                       │
│   - alignItems: center                                       │
│   - gap: 16                                                  │
│                                                              │
│ Habit name:                                                  │
│   - flex: 1                                                  │
│   - fontSize: 16                                             │
│   - color: #FFFFFF                                           │
│                                                              │
│ Disabled state (future):                                     │
│   - opacity: 0.35                                            │
│   - CircularCheckbox shows lock icon                         │
│   - Cannot toggle                                            │
└──────────────────────────────────────────────────────────────┘
```

### Migration from Current Design

**Current:** Shows 7-day row with DayIndicator components inside each card

**New:** Simple horizontal layout with single checkbox for selected date

**Remove from HabitCard:**
- Week row rendering
- DayIndicator mapping
- Complex status calculations per day

**Keep in HabitCard:**
- Card container styling (update colors)
- Basic habit info display
- Press handling for edit

### Implementation Example

```typescript
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue
} from 'react-native-reanimated';
import { CircularCheckbox } from './CircularCheckbox';
import { StreakBadge } from './StreakBadge';
import { AppText } from '../../ui/Text';
import colors from '../../theme/colors';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function HabitCard({
  habit,
  onToggleCompletion,
  onPress,
  disabled = false
}: HabitCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      <CircularCheckbox
        checked={habit.isCompleted}
        onToggle={onToggleCompletion}
        accentColor={habit.accentColor}
        disabled={disabled}
        size="md"
      />

      <View style={styles.content}>
        <AppText style={styles.habitName}>
          {habit.name}
        </AppText>
      </View>

      {habit.currentStreak > 0 && (
        <StreakBadge
          count={habit.currentStreak}
          variant="inline"
          size="md"
        />
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  content: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    color: colors.text.primary,
  },
  disabled: {
    opacity: 0.35,
  },
});
```

---

## 4.7 Home Screen Integration

**File:** `src/screens/Home.tsx`

### Purpose

Main screen that integrates the AppHeader with DayNavigator and displays the list of habits for the selected day.

### Updated Structure

```typescript
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useMemo, useCallback } from 'react';

import { AppHeader } from '../components/header/AppHeader';
import { DayNavigator } from '../components/header/DayNavigator';
import { HabitCard } from '../components/habits/HabitCard';
import { IconButton } from '../components/ui/IconButton';
import { EmptyState } from '../components/habits/EmptyState';
import { useDayNavigation } from '../contexts/DayNavigationContext';
import { useHabits } from '../hooks/useHabits';
import colors from '../theme/colors';

export function Home() {
  const { selectedDate, setSelectedDate, isFutureDay } = useDayNavigation();
  const { getHabitsForDate, toggleCompletion, isLoading } = useHabits();
  const router = useRouter();

  const habitsForSelectedDay = useMemo(() => {
    return getHabitsForDate(selectedDate);
  }, [selectedDate, getHabitsForDate]);

  const handleToggle = useCallback((habitId: string) => {
    if (isFutureDay) return; // Prevent toggle on future days
    toggleCompletion(habitId, selectedDate);
  }, [selectedDate, isFutureDay, toggleCompletion]);

  return (
    <View style={styles.container}>
      <AppHeader
        leftAction={
          <IconButton
            icon="settings-outline"
            onPress={() => router.push('/settings')}
            accessibilityLabel="Settings"
          />
        }
        centerContent={
          <DayNavigator
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        }
        rightAction={
          <IconButton
            icon="add"
            onPress={() => router.push('/create-habit')}
            accessibilityLabel="Create habit"
            variant="primary"
          />
        }
      />

      <FlashList
        data={habitsForSelectedDay}
        keyExtractor={(item) => item.id}
        estimatedItemSize={80}
        renderItem={({ item }) => (
          <HabitCard
            habit={item}
            onToggleCompletion={() => handleToggle(item.id)}
            disabled={isFutureDay}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyState selectedDate={selectedDate} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
});
```

### Key Integration Points

1. **DayNavigationContext**: Provides `selectedDate`, `setSelectedDate`, and `isFutureDay`
2. **useHabits hook**: Provides `getHabitsForDate()` and `toggleCompletion()`
3. **FlashList**: Renders HabitCard components for the selected date
4. **EmptyState**: Shown when no habits exist for the selected date

---

## 4.8 Implementation Checklist

### Header Components

- [ ] Create `src/components/header/` directory
- [ ] Create `AppHeader.tsx` with slot-based layout
- [ ] Create `DayNavigator.tsx` with horizontal scroll
- [ ] Create `DayItem.tsx` with press animation
- [ ] Create barrel export `header/index.ts`
- [ ] Test header integration in Home screen

### Habit Components

- [ ] Create `CircularCheckbox.tsx` with size variants
- [ ] Create `StreakBadge.tsx` with inline/badge variants
- [ ] Refactor `HabitCard.tsx` to new horizontal layout
- [ ] Remove 7-day row from HabitCard
- [ ] Update `habits/index.ts` barrel export

### Home Screen

- [ ] Import and integrate `DayNavigationContext`
- [ ] Replace current header with `AppHeader`
- [ ] Update FlashList to use `habitsForSelectedDay`
- [ ] Add disabled state handling for future days
- [ ] Create `EmptyState` component for no habits

### Testing

- [ ] Verify AppHeader renders correctly with all slot combinations
- [ ] Test DayNavigator scroll and selection behavior
- [ ] Confirm DayItem animations are smooth
- [ ] Test CircularCheckbox toggle animation
- [ ] Verify HabitCard layout matches spec
- [ ] Test future day disabled state
- [ ] Verify streak badge displays correctly

---

## Acceptance Criteria

Phase 4 is complete when:

1. AppHeader renders with settings icon (left), day navigator (center), add icon (right)
2. DayNavigator shows 7+ days with today highlighted
3. Tapping a day updates selectedDate and re-filters habits
4. HabitCard displays with new horizontal layout
5. CircularCheckbox toggles with haptic feedback
6. StreakBadge shows correct streak count
7. Future days show locked state with 35% opacity
8. Past days are editable
9. All components use new dark theme colors
10. No regressions in existing functionality

---

## Dependencies

### External Packages

- `react-native-reanimated` - For animations
- `expo-haptics` - For haptic feedback
- `react-native-safe-area-context` - For safe area insets
- `@shopify/flash-list` - For optimized list rendering
- `expo-router` - For navigation

### Internal Dependencies

- `src/theme/colors.ts` - Color tokens
- `src/contexts/DayNavigationContext.tsx` - Day selection state (Phase 3)
- `src/hooks/useHabits.ts` - Habit data and mutations
- `src/components/ui/Text.tsx` - AppText component
- `src/components/ui/IconButton.tsx` - Icon button component

---

## File Structure

After Phase 4 implementation:

```
src/
├── components/
│   ├── header/
│   │   ├── index.ts
│   │   ├── AppHeader.tsx
│   │   ├── DayNavigator.tsx
│   │   └── DayItem.tsx
│   ├── habits/
│   │   ├── index.ts
│   │   ├── HabitCard.tsx        (refactored)
│   │   ├── CircularCheckbox.tsx (new)
│   │   ├── StreakBadge.tsx      (new)
│   │   ├── DayIndicator.tsx     (deprecated/remove)
│   │   └── EmptyState.tsx       (new)
│   └── ui/
│       ├── Text.tsx
│       └── IconButton.tsx
├── contexts/
│   └── DayNavigationContext.tsx
├── screens/
│   └── Home.tsx                 (updated)
└── theme/
    └── colors.ts
```

---

## Next Phase

After completing Phase 4, proceed to **Phase 5: Animation Specifications** for detailed animation implementation guidelines including:

- Checkbox animation sequences
- Card press feedback
- Day selection transitions
- Loading and empty states
- Gesture-based interactions
