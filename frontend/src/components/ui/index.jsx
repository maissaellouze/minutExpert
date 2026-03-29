import { useApp } from '../../context/AppContext';

// ─── TOAST ───
export function Toast() {
  const { toast } = useApp();
  return (
    <div className={`toast${toast.show ? ' show' : ''}`}>
      <span className="toast-title">{toast.title}</span>
      {toast.body && <span className="toast-body">{toast.body}</span>}
    </div>
  );
}

// ─── MODAL ───
export function Modal({ id, title, sub, footer, children, onClose, maxWidth }) {
  return (
    <div className="modal-bg open" onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className="modal" style={maxWidth ? { maxWidth } : {}}>
        <button className="modal-close" onClick={onClose}>✕</button>
        {title && <div className="modal-title">{title}</div>}
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

// ─── BADGE ───
export function Badge({ type = 'pending', children }) {
  return <span className={`badge badge-${type}`}>{children}</span>;
}

// ─── STAT CARD ───
export function StatCard({ color, label, value, valueColor, sub }) {
  return (
    <div className={`stat c-${color}`}>
      <div className="stat-label">{label}</div>
      <div className={`stat-val ${valueColor || color}`}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

// ─── CARD ───
export function Card({ title, action, children, style }) {
  return (
    <div className="card" style={style}>
      {title && (
        <div className="card-header">
          <div className="card-title">{title}</div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── EXPERT CARD ───
export function ExpertCard({ expert, onBook, onOpen }) {
  return (
    <div className="expert-card" onClick={() => onOpen?.(expert)}>
      <div className="ec-top">
        <div className="ec-avatar" style={{ background: expert.color, color: expert.tc }}>{expert.init}</div>
        <div className="ec-name">{expert.name}</div>
        <div className="ec-title">{expert.title}</div>
        <div className="ec-tags">
          {expert.tags.slice(0, 3).map(t => <span key={t} className="ec-tag">{t}</span>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 10 }}>
          <span style={{ color: 'var(--amber)' }}>{'★'.repeat(Math.round(expert.rating))}</span>
          <span><strong>{expert.rating}</strong> ({expert.reviews})</span>
          <span className={`badge ${expert.status === 'online' ? 'badge-online' : 'badge-busy'}`} style={{ marginLeft: 'auto', fontSize: 10 }}>
            {expert.status === 'online' ? '🟢 En ligne' : '🟡 Occupé'}
          </span>
        </div>
      </div>
      <div className="ec-bottom">
        <div>
          <div className="ec-rate">€{expert.rate.toFixed(2)}</div>
          <div className="ec-rate-unit">/min</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); onBook?.(expert); }}>Réserver →</button>
      </div>
    </div>
  );
}
