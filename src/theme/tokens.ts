/**
 * Design Tokens
 * Core design values for consistent UI implementation
 */

import { Easing } from 'react-native-reanimated';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
} as const;

export const borderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 9999,
} as const;

export const shadows = {
  // Subtle shadows for glacier aesthetic
  sm: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  lg: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

export const animation = {
  // Durations in milliseconds
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  // Easing curves
  easing: {
    easeOut: "ease-out" as const,
    easeIn: "ease-in" as const,
    easeInOut: "ease-in-out" as const,
  },
  // Scale values for press interactions
  pressScale: {
    subtle: 0.98,
    normal: 0.96,
    strong: 0.94,
  },
} as const;

export const opacity = {
  disabled: 0.5,
  pressed: 0.7,
  overlay: 0.6,
  subtle: 0.8,
} as const;

export const touchTarget = {
  minSize: 44, // iOS HIG minimum
  hitSlop: {
    sm: 8,
    md: 12,
    lg: 16,
  },
} as const;

export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.lg,
  sectionGap: spacing.xl,
  contentMaxWidth: 600,
} as const;

/**
 * Reanimated Animation Configurations
 * Spring and timing presets for consistent animations throughout the app
 */
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
    standard: Easing.bezier(0.25, 0.1, 0.25, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
  },
} as const;
