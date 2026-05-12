export default function Badge({ children, color = 'gray' }) {
  const classes = {
    green: 'dp-badge-green', red: 'dp-badge-red', yellow: 'dp-badge-yellow',
    blue: 'dp-badge-blue', purple: 'dp-badge-purple', gray: 'dp-badge-gray',
  };
  return <span className={classes[color] || 'dp-badge-gray'}>{children}</span>;
}
