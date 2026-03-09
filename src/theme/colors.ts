const colors = {
  base: {
    black: "#0A0A0F",
    white: "#FFFFFF",
  },
  neutral: {
    900: "#0A0A0F",
    800: "#141418",
    700: "#1A1A22",
    600: "#252530",
    500: "#6B7080",
    400: "#9095A0",
    300: "#B8BCC8",
    200: "#D8DCE4",
    100: "#ECEEF2",
    50: "#F6F7F9",
  },
  primary: {
    700: "#1E40AF",
    600: "#2563EB",
    500: "#3B82F6",
    400: "#60A5FA",
    300: "#93C5FD",
    200: "#BFDBFE",
    100: "#DBEAFE",
    50: "#EFF6FF",
  },
  auxiliary: {
    700: "#1A1A22",
    600: "#252530",
    500: "#9095A0",
  },
  info: {
    600: "#3B82F6",
  },
  background: {
    primary: "#0A0A0F",
    secondary: "#141418",
    elevated: "#1A1A22",
    tertiary: "#1E1E28",
  },
  accent: {
    primary: "#3B82F6",
    primaryLight: "#60A5FA",
    primaryDark: "#2563EB",
    primaryMuted: "rgba(59, 130, 246, 0.15)",
  },
  text: {
    primary: "#FFFFFF",
    secondary: "#9095A0",
    tertiary: "#6B7080",
    disabled: "#4A4A58",
    inverse: "#0A0A0F",
  },
  success: {
    50: "#ECFDF5",
    500: "#22C55E",
    600: "#16A34A",
  },
  warning: {
    50: "#FFFBEB",
    500: "#F59E0B",
    600: "#D97706",
  },
  danger: {
    900: "#7F1D1D",
    700: "#B91C1C",
    600: "#DC2626",
    500: "#EF4444",
    200: "rgba(239, 68, 68, 0.2)",
    100: "rgba(239, 68, 68, 0.1)",
    50: "#FEF2F2",
  },
  border: {
    default: "#252530",
    subtle: "#1A1A22",
    focus: "#3B82F6",
  },
  habitColors: [
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#06B6D4",
    "#EC4899",
    "#84CC16",
  ],
  overlay: "rgba(0, 0, 0, 0.7)",
} as const;

export type ColorToken = typeof colors;
export default colors;
