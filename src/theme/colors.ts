/**
 * Dark Premium Color System
 * Deep blacks with electric blue accents
 * Designed for modern, premium dark mode experience
 */
const colors = {
  // Legacy color scales (for backward compatibility with existing components)
  base: {
    black: "#0D0D0F", // Deep black
    white: "#FFFFFF", // Pure white
  },

  neutral: {
    900: "#0D0D0F", // Darkest (near background.primary)
    800: "#1A1A1D", // Dark (background.secondary)
    700: "#242428", // Medium-dark (background.elevated)
    600: "#27272A", // Medium (border.default)
    500: "#6B7280", // Gray
    400: "#9CA3AF", // text.secondary
    300: "#C7CDD2", // Light gray
    200: "#E1E5E8", // Very light
    100: "#F0F2F4", // Almost white
    50: "#F8F9FA", // Nearly white
  },

  primary: {
    700: "#1E40AF", // Dark blue
    600: "#2563EB", // accent.primaryDark
    500: "#3B82F6", // accent.primary (electric blue)
    400: "#60A5FA", // accent.primaryLight
    300: "#93C5FD", // Lighter blue
    200: "#BFDBFE", // Very light blue
    100: "#DBEAFE", // Almost white blue
    50: "#EFF6FF", // Nearly white blue
  },

  auxiliary: {
    700: "#1F1F23", // Similar to border.subtle
    600: "#27272A", // Similar to border.default
    500: "#9CA3AF", // text.secondary (muted)
  },

  info: {
    600: "#3B82F6", // Alias for accent.primary
  },

  // Core backgrounds
  background: {
    primary: "#0D0D0F", // Deep black - main app background
    secondary: "#1A1A1D", // Dark gray - cards, elevated surfaces
    elevated: "#242428", // Slightly lighter - modals, dropdowns
    tertiary: "#2A2A2E", // For nested elevated elements
  },

  // Accent colors
  accent: {
    primary: "#3B82F6", // Electric blue - primary actions, selected states
    primaryLight: "#60A5FA", // Hover/focus states
    primaryDark: "#2563EB", // Pressed states
    primaryMuted: "rgba(59, 130, 246, 0.15)", // Backgrounds with accent tint
  },

  // Text hierarchy
  text: {
    primary: "#FFFFFF", // Main content, headings
    secondary: "#9CA3AF", // Descriptions, labels
    tertiary: "#6B7280", // Placeholder, disabled text
    disabled: "#4B5563", // Fully disabled
    inverse: "#0D0D0F", // Text on light backgrounds
  },

  // Semantic colors
  success: {
    50: "#ECFDF5",
    500: "#10B981",
    600: "#059669",
  },
  warning: {
    50: "#FFFBEB",
    500: "#F59E0B",
    600: "#D97706",
  },
  danger: {
    900: "#7F1D1D", // Very dark red
    700: "#B91C1C", // Dark red
    600: "#DC2626", // Darker red
    500: "#EF4444", // Main red
    50: "#FEF2F2", // Very light red
  },

  // Borders and dividers
  border: {
    default: "#27272A", // Standard borders
    subtle: "#1F1F23", // Subtle dividers
    focus: "#3B82F6", // Focus rings
  },

  // Habit accent colors (for individual habit customization)
  habitColors: [
    "#3B82F6", // Blue
    "#10B981", // Emerald
    "#F59E0B", // Amber
    "#8B5CF6", // Violet
    "#EF4444", // Red
    "#06B6D4", // Cyan
    "#EC4899", // Pink
    "#84CC16", // Lime
  ],

  // Overlay
  overlay: "rgba(0, 0, 0, 0.6)",
} as const;

export type ColorToken = typeof colors;
export default colors;
