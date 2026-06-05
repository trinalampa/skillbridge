import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "system");
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = event => setSystemTheme(event.matches ? "dark" : "light");

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [theme, resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
