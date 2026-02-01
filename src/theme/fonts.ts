/**
 * Typography System
 * Font families, sizes, line heights, and letter spacing
 */

export const fonts = {
  regular: "OpenSauceOne-Regular",
  medium: "OpenSauceOne-Medium",
  semiBold: "OpenSauceOne-SemiBold",
  italic: "OpenSauceOne-Italic",
} as const;

export const typography = {
  // Display text
  display: {
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily: fonts.semiBold,
  },

  // Page titles
  title1: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.4,
    fontFamily: fonts.semiBold,
  },

  title2: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
    fontFamily: fonts.semiBold,
  },

  title3: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: -0.2,
    fontFamily: fonts.semiBold,
  },

  // Headlines
  headline: {
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.2,
    fontFamily: fonts.semiBold,
  },

  // Body text
  body: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily: fonts.regular,
  },

  bodyMedium: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily: fonts.medium,
  },

  // Callout text
  callout: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: fonts.regular,
  },

  calloutMedium: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: fonts.medium,
  },

  // Subheadline
  subheadline: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    fontFamily: fonts.regular,
  },

  subheadlineMedium: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    fontFamily: fonts.medium,
  },

  // Footnote
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontFamily: fonts.regular,
  },

  footnoteMedium: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0,
    fontFamily: fonts.medium,
  },

  // Caption
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    fontFamily: fonts.regular,
  },

  caption1Medium: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
    fontFamily: fonts.medium,
  },

  caption2: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.1,
    fontFamily: fonts.regular,
  },

  caption2Medium: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.1,
    fontFamily: fonts.medium,
  },

  // Labels (uppercase, wider spacing)
  label: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    fontFamily: fonts.semiBold,
    textTransform: "uppercase" as const,
  },
} as const;
