export default function Spinner({ size = 'md', text }) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-6 h-6 border-2', lg: 'w-10 h-10 border-2' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8">
      <div className={`${sizes[size]} border-devil-border border-t-devil-red rounded-full animate-spin`} />
      {text && <p className="text-devil-muted text-sm">{text}</p>}
    </div>
  );
}
