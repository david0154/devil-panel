import clsx from 'clsx';

export default function ProgressBar({ value, max = 100, color = 'red', label, showValue = true }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const colors = {
    red: 'bg-devil-red',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
  };
  const getColor = (p) => {
    if (color !== 'auto') return colors[color];
    if (p < 60) return 'bg-green-500';
    if (p < 85) return 'bg-yellow-500';
    return 'bg-devil-red';
  };
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-devil-muted mb-1.5">
          {label && <span>{label}</span>}
          {showValue && <span className="font-medium text-devil-text">{pct}%</span>}
        </div>
      )}
      <div className="dp-progress">
        <div
          className={clsx('dp-progress-bar', getColor(pct))}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
