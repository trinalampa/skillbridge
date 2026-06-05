import { useTheme } from "../services/ThemeContext.jsx";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <label className="theme-toggle">
      <span style={{ fontSize: ".8rem" }}>Theme</span>
      <select value={theme} onChange={e => setTheme(e.target.value)} aria-label="Color theme">
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </label>
  );
}
