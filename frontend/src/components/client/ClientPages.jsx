import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { experts } from '../../data/mockData';
import { ExpertCard } from '../ui';

// ─── EXPERT DETAIL MODAL ───
function ExpertModal({ expert, onClose, onBook }) {
  return (
    <div className="modal-bg open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 500 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
          <div className="ec-avatar" style={{ width: 60, height: 60, fontSize: 24, flexShrink: 0, borderRadius: 14, background: expert.color, color: expert.tc }}>{expert.init}</div>
          <div>
            <div style={{ fontFamily: 'var(--syne)', fontSize: 21, fontWeight: 700 }}>{expert.name}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>{expert.title}</div>
            <div style={{ marginTop: 6 }}>
              <span className={`badge ${expert.status === 'online' ? 'badge-online' : 'badge-busy'}`}>
                {expert.status === 'online' ? '🟢 En ligne' : '🟡 En session'}
              </span>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink2)', lineHeight: 1.7, marginBottom: 12 }}>{expert.bio}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {expert.tags.map(t => <span key={t} className="ec-tag">{t}</span>)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
          <div>
            <div style={{ fontFamily: 'var(--syne)', fontSize: 28, fontWeight: 800, color: 'var(--orange)' }}>€{expert.rate.toFixed(2)}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>par minute · à la seconde</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: 'var(--muted)' }}>
            {expert.rating} ★ · {expert.reviews} avis
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Fermer</button>
          <button className="btn btn-primary" onClick={() => { onBook(expert); onClose(); }}>Réserver →</button>
        </div>
      </div>
    </div>
  );
}

// ─── CLIENT HOME ───
export function ClientHome() {
  const { setClientPage, setSelectedExpert, setBookStep } = useApp();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [modalExpert, setModalExpert] = useState(null);

  const filtered = useMemo(() => experts.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = !cat || e.domain === cat;
    return matchSearch && matchCat;
  }), [search, cat]);

  const handleBook = (expert) => {
    setSelectedExpert(expert);
    setBookStep(0);
    setClientPage('client-book');
  };

  return (
    <div>
      <div className="page-eyebrow">Bonjour Marie 👋</div>
      <div className="page-title">Quel expert cherchez-vous ?</div>
      <div className="page-sub">34 secondes en moyenne pour commencer une session.</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
        <input className="form-input" style={{ flex: 1 }} placeholder="🔍  Rechercher…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input" style={{ width: 160 }} value={cat} onChange={e => setCat(e.target.value)}>
          <option value="">Tout</option>
          <option value="medical">⚕ Médical</option>
          <option value="legal">⚖ Juridique</option>
          <option value="tech">💻 Tech</option>
          <option value="finance">📈 Finance</option>
          <option value="creative">🎨 Créatif</option>
        </select>
      </div>
      <div className="expert-grid">
        {filtered.map(e => <ExpertCard key={e.id} expert={e} onOpen={setModalExpert} onBook={handleBook} />)}
      </div>
      {modalExpert && <ExpertModal expert={modalExpert} onClose={() => setModalExpert(null)} onBook={handleBook} />}
    </div>
  );
}

// ─── CLIENT BROWSE ───
export function ClientBrowse() {
  const { setClientPage, setSelectedExpert, setBookStep } = useApp();
  const [modalExpert, setModalExpert] = useState(null);

  const handleBook = (expert) => {
    setSelectedExpert(expert);
    setBookStep(0);
    setClientPage('client-book');
  };

  return (
    <div>
      <div className="page-eyebrow">Marketplace</div>
      <div className="page-title">Tous les experts</div>
      <div className="expert-grid">
        {experts.map(e => <ExpertCard key={e.id} expert={e} onOpen={setModalExpert} onBook={handleBook} />)}
      </div>
      {modalExpert && <ExpertModal expert={modalExpert} onClose={() => setModalExpert(null)} onBook={handleBook} />}
    </div>
  );
}

// ─── CLIENT SETTINGS ───
export function ClientSettings() {
  const { showToast } = useApp();
  return (
    <div>
      <div className="page-eyebrow">Compte</div>
      <div className="page-title">Paramètres</div>
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="card-header"><div className="card-title">Profil</div></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" defaultValue="Marie" /></div>
            <div className="form-group"><label className="form-label">Nom</label><input className="form-input" defaultValue="Dupont" /></div>
          </div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="marie@exemple.com" /></div>
          <button className="btn btn-primary" onClick={() => showToast('Profil mis à jour ✓', 'Vos informations ont été sauvegardées.')}>Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
