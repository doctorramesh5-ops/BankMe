export const Colors = {
  dark: { bg:"#040810", bg2:"#080f1a", bg3:"#0d1520", border:"#142030", border2:"#1e3050", text:"#e8f0fe", muted:"#4a6080", muted2:"#7090b0", primary:"#00d4aa", primary2:"#0099ff", green:"#10b981", red:"#ef4444", gold:"#f59e0b", purple:"#8b5cf6", cyan:"#06b6d4", card:"#080f1a", tabBar:"#040810", tabBorder:"#142030", statusBar:"light-content" as const },
  light: { bg:"#f0f4f8", bg2:"#ffffff", bg3:"#e8edf3", border:"#d0dae6", border2:"#b8c8dc", text:"#0a1628", muted:"#5a7090", muted2:"#7a90a8", primary:"#0066cc", primary2:"#0044aa", green:"#059669", red:"#dc2626", gold:"#d97706", purple:"#7c3aed", cyan:"#0891b2", card:"#ffffff", tabBar:"#ffffff", tabBorder:"#d0dae6", statusBar:"dark-content" as const },
};
export type ThemeKey = keyof typeof Colors;
export type Theme = typeof Colors.dark;
