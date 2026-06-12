import type { IPalette } from "../typings/motion-tabs";

import { Colors } from "@/constants/theme";

function palette<T extends "dark" | "light">(scheme: T): IPalette & { primary: string } {
  if (scheme === "dark") {
    return {
      foreground: Colors.dark.text,
      muted: Colors.dark.text,
      surface: Colors.dark.backgroundElement,
      border: Colors.dark.border,
      input: "rgba(255,255,255,0.06)",
      hover: "rgba(255,255,255,0.06)",
      accent: Colors.dark.backgroundSelected,
      primary: Colors.dark.primary,
    };
  }

  return {
    foreground: "#0a0a0a",
    muted: "#71717a",
    surface: "rgba(245,245,247,0.94)",
    border: "rgba(0,0,0,0.06)",
    input: "rgba(0,0,0,0.04)",
    hover: "rgba(0,0,0,0.04)",
    accent: "rgba(0,0,0,0.06)",
  };
}

export { palette };

