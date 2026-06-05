// Wraps login / register pages with the split-panel auth design.
export default function AuthLayout({ panel, children }) {
  return (
    <div className="auth-page">
      <div className="auth-panel">{panel}</div>
      <div className="auth-form-wrap">{children}</div>
    </div>
  );
}
