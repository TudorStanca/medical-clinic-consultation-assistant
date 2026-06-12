export const MS_LIGHT = {
  bg: "oklch(0.985 0.006 80)",
  surface: "oklch(0.995 0.004 80)",
  surfaceAlt: "oklch(0.97 0.007 80)",
  border: "oklch(0.91 0.008 80)",
  borderStrong: "oklch(0.85 0.010 80)",

  text: "oklch(0.22 0.012 70)",
  textMuted: "oklch(0.50 0.010 75)",
  textDim: "oklch(0.65 0.008 80)",

  accent: "oklch(0.58 0.075 175)",
  accentSoft: "oklch(0.93 0.035 175)",
  accentInk: "oklch(0.32 0.060 175)",

  warm: "oklch(0.68 0.085 55)",
  warmSoft: "oklch(0.94 0.040 55)",

  success: "oklch(0.62 0.090 155)",
  successSoft: "oklch(0.94 0.045 155)",
  warning: "oklch(0.74 0.110 75)",
  warningSoft: "oklch(0.95 0.055 75)",
  danger: "oklch(0.60 0.130 25)",
  dangerSoft: "oklch(0.94 0.045 25)",
  recording: "oklch(0.62 0.155 25)",
} as const;

export const MS_DARK = {
  bg: "oklch(0.18 0.010 80)",
  surface: "oklch(0.22 0.010 80)",
  surfaceAlt: "oklch(0.26 0.012 80)",
  border: "oklch(0.30 0.012 80)",
  borderStrong: "oklch(0.38 0.014 80)",

  text: "oklch(0.96 0.006 80)",
  textMuted: "oklch(0.72 0.010 80)",
  textDim: "oklch(0.55 0.010 80)",

  accent: "oklch(0.72 0.080 175)",
  accentSoft: "oklch(0.32 0.045 175)",
  accentInk: "oklch(0.90 0.060 175)",

  warm: "oklch(0.78 0.090 55)",
  warmSoft: "oklch(0.34 0.055 55)",

  success: "oklch(0.72 0.090 155)",
  successSoft: "oklch(0.30 0.045 155)",
  warning: "oklch(0.80 0.110 75)",
  warningSoft: "oklch(0.32 0.060 75)",
  danger: "oklch(0.72 0.130 25)",
  dangerSoft: "oklch(0.32 0.055 25)",
  recording: "oklch(0.72 0.155 25)",
} as const;

export const MS_FONTS = {
  sans: '"DM Sans", system-ui, -apple-system, sans-serif',
  serif: '"Newsreader", Georgia, serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

export const T = MS_LIGHT;
