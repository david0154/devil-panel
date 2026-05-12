import clsx from 'clsx';

export default function StatCard({ label, value, icon: Icon, color = 'red', change, suffix = '' }) {
  const colors = {
    red: 'text-devil-red bg-devil-red/10 border-devil-red/20',
    green: 'text-green-400 bg-green-900/20 border-green-800/30',
    blue: 'text-blue-400 bg-blue-900/20 border-blue-800/30',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-800/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-800/30',
    cyan: 'text-cyan-400 bg-cyan-900/20 border-cyan-800/30',
  };
  return (
    <div className="dp-card hover:border-devil-red/30 group">
      <div className="flex items-start justify-between">
        <div>
          <div className="dp-stat-label">{label}</div>
          <div className="dp-stat-value mt-1">
            {value}<span className="text-devil-muted text-lg ml-1">{suffix}</span>
          </div>
          {change !== undefined && (
            <div className={clsx('text-xs mt-1', change >= 0 ? 'text-green-400' : 'text-red-400')}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% vs last hour
            </div>
          )}
        </div>
        {Icon && (
          <div className={clsx('p-3 rounded-xl border', colors[color])}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
