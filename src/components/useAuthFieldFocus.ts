import { useEffect } from "react";
import { Platform } from "react-native";

const STYLE_ID = "auth-field-focus";

const CSS = `
#auth-fields input:focus,
#auth-fields input:focus-visible,
#auth-fields textarea:focus,
#auth-fields textarea:focus-visible {
  outline: none !important;
  border: 1px solid rgba(20, 34, 26, 0.12) !important;
  box-shadow: none !important;
}
`;

export function useAuthFieldFocus() {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
  }, []);
}
