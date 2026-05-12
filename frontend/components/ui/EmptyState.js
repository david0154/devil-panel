export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-devil-surface2 rounded-2xl flex items-center justify-center mb-4 border border-devil-border">
          <Icon size={32} className="text-devil-muted" />
        </div>
      )}
      <h3 className="text-devil-text font-semibold text-base mb-2">{title}</h3>
      {description && <p className="text-devil-muted text-sm max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}
