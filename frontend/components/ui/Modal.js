import { RiCloseLine } from 'react-icons/ri';

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-6xl' };
  return (
    <div className="dp-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`dp-modal ${sizes[size]} w-full`}>
        <div className="dp-modal-header">
          <h3 className="text-devil-text font-semibold text-base">{title}</h3>
          <button onClick={onClose} className="text-devil-muted hover:text-devil-text p-1 rounded hover:bg-devil-surface2 transition-colors">
            <RiCloseLine size={20} />
          </button>
        </div>
        <div className="dp-modal-body">{children}</div>
        {footer && <div className="dp-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
