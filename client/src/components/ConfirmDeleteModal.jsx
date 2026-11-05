export default function ConfirmDeleteModal({ title = 'Delete?', message = 'This cannot be undone.', onCancel, onConfirm, busy }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="card" style={{ maxWidth: 420, width: '92%' }}>
        <h3 style={{ marginTop: 0 }}>{title}</h3>
        <p className="muted">{message}</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Deleting…' : 'Delete'}</button>
        </div>
      </div>
    </div>
  );
}
