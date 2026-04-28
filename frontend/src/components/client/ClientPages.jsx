import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { clientAPI } from '../../services/api';
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
  const { currentUser, setClientPage, setSelectedExpert, setBookStep } = useApp();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('');
  const [modalExpert, setModalExpert] = useState(null);
  const [expertsList, setExpertsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientAPI.getExperts().then(data => {
      // Map backend data to frontend model
      const mapped = (data || []).map(e => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        init: e.first_name ? e.first_name[0] : 'E',
        title: e.title || 'Expert MinuteExpert',
        domain: e.categories?.[0]?.slug || 'tech',
        tags: e.categories?.map(c => c.name) || [],
        bio: e.bio || 'Aucune biographie.',
        rate: parseFloat(e.hourly_rate) || 0.85,
        rating: parseFloat(e.avg_rating) || 0,
        reviews: e.review_count || 0,
        status: 'online',
        color: '#e0f2fe',
        tc: '#0284c7'
      }));
      setExpertsList(mapped);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => expertsList.filter(e => {
    const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = !cat || e.domain === cat;
    return matchSearch && matchCat;
  }), [search, cat, expertsList]);

  const handleBook = (expert) => {
    setSelectedExpert(expert);
    setBookStep(0);
    setClientPage('client-book');
  };

  return (
    <div>
      <div className="page-eyebrow">Bonjour {currentUser.first_name || 'Client'} 👋</div>
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
        {loading ? <div style={{ padding: 20 }}>Chargement des experts...</div> : filtered.length === 0 ? <div style={{ padding: 20, color: 'var(--muted)' }}>Aucun expert trouvé.</div> : filtered.map(e => <ExpertCard key={e.id} expert={e} onOpen={setModalExpert} onBook={handleBook} />)}
      </div>
      {modalExpert && <ExpertModal expert={modalExpert} onClose={() => setModalExpert(null)} onBook={handleBook} />}
    </div>
  );
}

// ─── CLIENT BROWSE ───
export function ClientBrowse() {
  const { setClientPage, setSelectedExpert, setBookStep } = useApp();
  const [modalExpert, setModalExpert] = useState(null);
  const [expertsList, setExpertsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientAPI.getExperts().then(data => {
      const mapped = (data || []).map(e => ({
        id: e.id,
        name: `${e.first_name} ${e.last_name}`,
        init: e.first_name ? e.first_name[0] : 'E',
        title: e.title || 'Expert MinuteExpert',
        domain: e.categories?.[0]?.slug || 'tech',
        tags: e.categories?.map(c => c.name) || [],
        bio: e.bio || 'Aucune biographie.',
        rate: parseFloat(e.hourly_rate) || 0.85,
        rating: parseFloat(e.avg_rating) || 0,
        reviews: e.review_count || 0,
        status: 'online',
        color: '#e0f2fe',
        tc: '#0284c7'
      }));
      setExpertsList(mapped);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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
        {loading ? <div>Chargement...</div> : expertsList.map(e => <ExpertCard key={e.id} expert={e} onOpen={setModalExpert} onBook={handleBook} />)}
      </div>
      {modalExpert && <ExpertModal expert={modalExpert} onClose={() => setModalExpert(null)} onBook={handleBook} />}
    </div>
  );
}

// ─── CLIENT SETTINGS ───
export function ClientSettings() {
  const { currentUser, showToast } = useApp();
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clientAPI.getMe().then(data => {
      setProfile({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || ''
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await clientAPI.updateMe({ first_name: profile.first_name, last_name: profile.last_name });
      // update email if needed (might require custom logic on backend)
      showToast('Profil mis à jour ✓', 'Vos informations ont été sauvegardées.');
    } catch (err) {
      showToast('Erreur', err.message);
    }
  };

  if (loading) return <div>Chargement du profil...</div>;

  return (
    <div>
      <div className="page-eyebrow">Compte</div>
      <div className="page-title">Paramètres</div>
      <div className="card" style={{ maxWidth: 520 }}>
        <div className="card-header"><div className="card-title">Profil</div></div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Prénom</label><input className="form-input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} /></div>
            <div className="form-group"><label className="form-label">Nom</label><input className="form-input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} /></div>
          </div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-input" disabled value={profile.email} /></div>
          <button className="btn btn-primary" onClick={handleSave}>Sauvegarder</button>
        </div>
      </div>
    </div>
  );
}
