export default function StatCard({ label, value, color }) {
  return (
    <div className={`stat-card${color ? " " + color : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  );
}
