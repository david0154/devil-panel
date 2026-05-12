export default function StatCard({ icon, value, label, change, changeType = 'positive', delay = 0 }) {
  return (
    <div className="stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {change && (
        <div className={`stat-change ${changeType}`}>
          {changeType === 'positive' ? '↑' : '↓'} {change}
        </div>
      )}
    </div>
  );
}
