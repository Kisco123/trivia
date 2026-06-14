// Fuente única de verdad de la paleta "editorial vivo".
export const colors = {
  bg: "#0a0e1a",
  bgElevated: "#0f1320",
  violet: "#7c5cff",
  violetLight: "#b794ff",
  orange: "#ff8a4c",
  magenta: "#ff3d8b",
  success: "#4ade80",
  successDeep: "#22d3a4",
  danger: "#ef4444",
  textPrimary: "#ffffff",
  textSecondary: "#cdd6e0",
  textMuted: "#94a3b8",
} as const;

export type ColorToken = keyof typeof colors;
