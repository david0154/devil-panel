import Modal from './Modal';
import { RiAlertLine } from 'react-icons/ri';

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete', danger = true }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title || 'Confirm Action'}
      size="sm"
      footer={
        <>
          <button className="dp-btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className={danger ? 'dp-btn-danger dp-btn' : 'dp-btn-primary dp-btn'}
            onClick={() => { onConfirm(); onClose(); }}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-900/20 rounded-lg border border-red-800/30 flex-shrink-0">
          <RiAlertLine size={20} className="text-red-400" />
        </div>
        <p className="text-devil-muted text-sm leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
