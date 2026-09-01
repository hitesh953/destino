/**
 * Palm Reader App - Color Palette
 * India-inspired design system for spiritual & premium feel
 */

const palmPalette = {
  // Primary Colors (from Figma design system)
  mystique: "#6B4FA0",        // Mystique Purple - primary, headers, CTAs
  sacredGold: "#D4AF37",      // Sacred Gold - accents, highlights, premium
  deepSaffron: "#FF6B35",     // Deep Saffron - secondary CTAs, alerts
  midnightBlue: "#1A1F3A",    // Midnight Blue - backgrounds, text, depth
  creamWhite: "#F5F1E8",      // Cream White - card backgrounds, light elements

  // Semantic Colors
  chakraGreen: "#4CAF50",     // Success states, positive feedback
  twilightPurple: "#4A3A7F",  // Secondary purple for depth
  silverLight: "#E8E8E8",     // Borders, dividers, light accents
  cosmicBlack: "#0F0F0F",     // Dark mode primary background

  // Neutral Grays (for consistency)
  neutral100: "#FFFFFF",
  neutral200: "#F4F2F1",
  neutral300: "#D7CEC9",
  neutral400: "#B6ACA6",
  neutral500: "#978F8A",
  neutral600: "#564E4A",
  neutral700: "#3C3836",
  neutral800: "#191015",
  neutral900: "#000000",
} as const;

/**
 * Light Mode Colors
 */
export const palmColorsLight = {
  palette: palmPalette,

  // Semantic colors for light mode
  transparent: "rgba(0, 0, 0, 0)",

  // Text colors
  text: palmPalette.midnightBlue,              // Primary text
  textDim: "#999999",                          // Secondary/dimmed text
  textTertiary: "#CCCCCC",                     // Tertiary text

  // Background colors
  background: palmPalette.creamWhite,          // Screen background
  surface: palmPalette.creamWhite,             // Card/surface background
  surfaceAlt: palmPalette.twilightPurple,      // Alternative surface (dark purple)

  // Brand colors
  primary: palmPalette.mystique,               // Primary brand color
  primaryTint: palmPalette.mystique,           // Primary tint
  primaryTintInactive: "#CCCCCC",              // Inactive primary

  // Accent colors
  accent: palmPalette.sacredGold,              // Gold accent
  accentSecondary: palmPalette.deepSaffron,    // Saffron secondary

  // Structural colors
  border: palmPalette.silverLight,             // Borders
  separator: palmPalette.silverLight,          // Dividers

  // Feedback colors
  success: palmPalette.chakraGreen,            // Success state
  error: palmPalette.deepSaffron,              // Error state
  warning: palmPalette.deepSaffron,            // Warning state

  // Overlay colors
  overlay20: "rgba(106, 79, 160, 0.2)",       // 20% purple overlay
  overlay50: "rgba(106, 79, 160, 0.5)",       // 50% purple overlay
  overlayDark: "rgba(0, 0, 0, 0.5)",          // Dark overlay for modals

  // Gradient support
  gradientStart: palmPalette.midnightBlue,
  gradientEnd: palmPalette.deepSaffron,
} as const;

/**
 * Dark Mode Colors
 */
export const palmColorsDark = {
  palette: palmPalette,

  // Semantic colors for dark mode
  transparent: "rgba(0, 0, 0, 0)",

  // Text colors (inverted for dark mode)
  text: palmPalette.creamWhite,                // Primary text
  textDim: "#CCCCCC",                          // Secondary/dimmed text
  textTertiary: "#999999",                     // Tertiary text

  // Background colors
  background: palmPalette.cosmicBlack,         // Screen background (very dark)
  surface: palmPalette.midnightBlue,           // Card/surface background
  surfaceAlt: palmPalette.twilightPurple,      // Alternative surface

  // Brand colors
  primary: palmPalette.mystique,               // Primary brand color
  primaryTint: palmPalette.mystique,           // Primary tint
  primaryTintInactive: "#666666",              // Inactive primary

  // Accent colors (brighter in dark mode)
  accent: "#FFD700",                           // Brighter gold for dark mode
  accentSecondary: palmPalette.deepSaffron,    // Saffron secondary

  // Structural colors
  border: "#444444",                           // Borders (lighter in dark mode)
  separator: "#333333",                        // Dividers

  // Feedback colors
  success: palmPalette.chakraGreen,            // Success state
  error: palmPalette.deepSaffron,              // Error state
  warning: palmPalette.deepSaffron,            // Warning state

  // Overlay colors
  overlay20: "rgba(255, 255, 255, 0.1)",      // Light overlay in dark mode
  overlay50: "rgba(255, 255, 255, 0.2)",      // Light overlay in dark mode
  overlayDark: "rgba(0, 0, 0, 0.7)",          // Dark overlay for modals

  // Gradient support
  gradientStart: palmPalette.cosmicBlack,
  gradientEnd: palmPalette.twilightPurple,
} as const;

/**
 * Export default (light mode)
 */
export const palmColors = palmColorsLight;

/**
 * Type for theme colors
 */
export type PalmColors = typeof palmColorsLight;
