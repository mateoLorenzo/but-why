const colors = {
  base: {
    black: "#0B0F14", // negro profundo, no puro
    white: "#FFFFFF",
  },

  neutral: {
    700: "#141A1F",
    600: "#2A3239",
    500: "#5C6670",
    400: "#9AA3AB",
    300: "#C7CDD2",
    200: "#E1E5E8",
    100: "#F0F2F4",
    50: "#F8F9FA",
  },

  primary: {
    700: "#0E2A3A", // azul glaciar oscuro
    600: "#164A66",
    500: "#2E7CA3", // primary principal
    400: "#6FAFCC",
    300: "#A9D1E3",
    200: "#D7ECF4",
    100: "#EEF7FB",
    50: "#F7FCFF",
  },

  auxiliary: {
    700: "#0F1A21",
    600: "#1B2A33",
    500: "#2F4350",
    400: "#506875",
    300: "#7E949F",
    200: "#B9C6CD",
    100: "#E3E9EC",
    50: "#F2F5F7",
  },

  danger: {
    900: "#5A0E12",
    800: "#8C1D23",
    700: "#C7363A",
    600: "#E25A5D",
    500: "#EB7A7C",
    400: "#F2A5A7",
    300: "#F7CDCE",
    200: "#FBE6E7",
    100: "#FDF2F2",
    50: "#FFFBFB",
  },

  warning: {
    900: "#6B4A00",
    800: "#9E6E00",
    700: "#C98E0B",
    600: "#E6AA2A",
    500: "#F2C15A",
    400: "#F6D58E",
    300: "#F9E5B8",
    200: "#FCF3E0",
    100: "#FEF9EF",
    50: "#FFFDFA",
  },

  success: {
    900: "#043A2A",
    800: "#0A5A40",
    700: "#1B7F5E",
    600: "#3FA287",
    500: "#66BFA8",
    400: "#95D6C5",
    300: "#C2E8DD",
    200: "#E6F6F1",
    100: "#F2FBF8",
    50: "#FBFEFD",
  },

  info: {
    900: "#0E2A44",
    800: "#163F66",
    700: "#255D99",
    600: "#3B82F6", // mantiene familiaridad iOS
    500: "#6EA8FF",
    400: "#A7C9FF",
    300: "#C9DDFF",
    200: "#E6F0FF",
    100: "#F2F7FF",
    50: "#F8FBFF",
  },
} as const;

export default colors;
