// ═══════════════════════════════════════════════════════════════
//  AdminApplications — Dashboard candidatures experts
//  Fichier : src/components/admin/AdminApplications.jsx
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

function token() {
  return localStorage.getItem('access');
}

// ─── Badge statut ────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  { cls: 'badge-pending',  label: '⏳ En attente' },
    approved: { cls: 'badge-approved', label: '✅ Approuvé'   },
    rejected: { cls: 'badge-rejected', label: '❌ Refusé'     },
  };
  const s = map[status] || map.pending;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

// ─── Initiales avatar ────────────────────────────────────────
function Avatar({ firstName, lastName }) {
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  const colors = [
    ['#ffeaea','#c0392b'], ['#e8f0ff','#1a4a9e'],
    ['#e8fff4','#0e6e42'], ['#f0e8ff','#5a0e8a'],
    ['#ffe8f0','#8a0e3a'],
  ];
  const idx = (initials.charCodeAt(0) || 0) % colors.length;
  const [bg, fg] = colors[idx];
  return (
    <div style={{
      width: 48, height: 48, borderRadius: 12, flexShrink: 0,
      background: bg, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--syne)', fontWeight: 700, fontSize: 16,
    }}>
      {initials}
    </div>
  );
}

// ─── Carte candidature ───────────────────────────────────────
function AppCard({ app, onExamine }) {
  return (
    <div className="card" style={{
      borderLeft: app.status === 'pending'
        ? '4px solid var(--amber)'
        : app.status === 'approved'
        ? '4px solid var(--green)'
        : '4px solid var(--red)',
    }}>
      <div className="card-body" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

          {/* Avatar */}
          <Avatar firstName={app.first_name} lastName={app.last_name} />

          {/* Infos principales */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'var(--syne)', fontSize: 16, fontWeight: 700 }}>
                {app.first_name} {app.last_name}
              </div>
              <StatusBadge status={app.status} />
            </div>

            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
              {app.user_email && app.user_email !== '—' && (
                <span>📧 {app.user_email}</span>
              )}
              {app.category_name && (
                <span>📂 {app.category_name}</span>
              )}
            </div>

            {/* Langues */}
            {app.languages && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(() => {
                  try {
                    const langs = typeof app.languages === 'string'
                      ? JSON.parse(app.languages)
                      : app.languages;
                    return langs.map(l => (
                      <span key={l} className="ec-tag" style={{ fontSize: 11 }}>
                        🌐 {l.toUpperCase()}
                      </span>
                    ));
                  } catch {
                    return <span className="ec-tag">{app.languages}</span>;
                  }
                })()}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
            {app.cv_url && app.cv_url !== 'https://placeholder.cv' && (
              <a
                href={app.cv_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 12 }}
              >
                📄 Voir CV
              </a>
            )}
            {app.status === 'pending' && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onExamine(app)}
              >
                Examiner →
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Modal d'examen ──────────────────────────────────────────
function ExamineModal({ app, onClose, onDecide, loading }) {
  const [comment, setComment] = useState('');

  if (!app) return null;

  return (
    <div
      className="modal-bg open"
      onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}
    >
      <div className="modal" style={{ maxWidth: 500 }}>
        <button className="modal-close" onClick={onClose} disabled={loading}>✕</button>

        {/* En-tête */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <Avatar firstName={app.first_name} lastName={app.last_name} />
          <div>
            <div className="modal-title" style={{ marginBottom: 2 }}>
              {app.first_name} {app.last_name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              {app.category_name} {app.user_email && app.user_email !== '—' ? `· ${app.user_email}` : ''}
            </div>
          </div>
        </div>

        {/* Détails */}
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          {app.user_email && app.user_email !== '—' && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--muted)', width: 80, flexShrink: 0 }}>Email</span>
              <strong>{app.user_email}</strong>
            </div>
          )}
          {app.category_name && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--muted)', width: 80, flexShrink: 0 }}>Domaine</span>
              <strong>{app.category_name}</strong>
            </div>
          )}
          {app.languages && (
            <div style={{ display: 'flex', gap: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--muted)', width: 80, flexShrink: 0 }}>Langues</span>
              <strong>
                {(() => {
                  try {
                    const l = typeof app.languages === 'string' ? JSON.parse(app.languages) : app.languages;
                    return l.join(', ').toUpperCase();
                  } catch { return app.languages; }
                })()}
              </strong>
            </div>
          )}
          {app.cv_url && app.cv_url !== 'https://placeholder.cv' && (
            <div style={{ display: 'flex', gap: 10, marginTop: 10, fontSize: 14 }}>
              <span style={{ color: 'var(--muted)', width: 80, flexShrink: 0 }}>CV</span>
              <a href={app.cv_url} target="_blank" rel="noreferrer" style={{ color: 'var(--blue)' }}>
                📄 Télécharger / Voir
              </a>
            </div>
          )}
        </div>

        {/* Info email automatique */}
        <div style={{
          background: 'var(--green-dim)', border: '1px solid var(--green-mid)',
          borderRadius: 10, padding: '10px 14px', fontSize: 13,
          color: 'var(--green)', marginBottom: 16,
        }}>
          ✅ Si vous <strong>approuvez</strong>, Django génère automatiquement un mot de passe
          aléatoire et envoie un email à l'expert avec ses identifiants de connexion.
        </div>

        {/* Commentaire optionnel */}
        <div className="form-group">
          <label className="form-label">Commentaire interne (optionnel)</label>
          <textarea
            className="form-input"
            rows="2"
            placeholder="Raison du refus, notes pour l'équipe…"
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Boutons */}
        <div className="modal-footer">
          <button
            className="btn btn-ghost"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </button>
          <button
            className="btn btn-red"
            onClick={() => onDecide(app.id, 'rejected', comment)}
            disabled={loading}
          >
            {loading ? '…' : '✗ Refuser'}
          </button>
          <button
            className="btn btn-green"
            onClick={() => onDecide(app.id, 'approved', comment)}
            disabled={loading}
          >
            {loading ? 'Traitement…' : '✓ Approuver'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Stats rapides ───────────────────────────────────────────
function QuickStats({ apps }) {
  const pending  = apps.filter(a => a.status === 'pending').length;
  const approved = apps.filter(a => a.status === 'approved').length;
  const rejected = apps.filter(a => a.status === 'rejected').length;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
      <div className="stat c-amber">
        <div className="stat-label">En attente</div>
        <div className="stat-val amber">{pending}</div>
        <div className="stat-sub">à examiner</div>
      </div>
      <div className="stat c-green">
        <div className="stat-label">Approuvées</div>
        <div className="stat-val green">{approved}</div>
        <div className="stat-sub">experts créés</div>
      </div>
      <div className="stat c-orange">
        <div className="stat-label">Refusées</div>
        <div className="stat-val orange">{rejected}</div>
        <div className="stat-sub">candidatures</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function AdminApplications() {

  const [apps,         setApps]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [filter,       setFilter]       = useState('all');
  const [search,       setSearch]       = useState('');
  const [examineApp,   setExamineApp]   = useState(null);   // app en cours d'examen
  const [deciding,     setDeciding]     = useState(false);
  const [successMsg,   setSuccessMsg]   = useState('');

  // ── Chargement ──────────────────────────────────────────────
  const loadApps = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/admin/expert-requests/`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.status === 403) throw new Error('Accès refusé. Êtes-vous connecté en tant qu\'admin ?');
      if (!res.ok) throw new Error(`Erreur serveur ${res.status}`);
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadApps(); }, [loadApps]);

  // ── Décision ────────────────────────────────────────────────
  const handleDecide = async (id, decision, comment) => {
    setDeciding(true);
    try {
      const res = await fetch(`${API}/admin/expert-requests/${id}/decision/`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ decision, comment }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.detail || `Erreur ${res.status}`);
      }

      // Mise à jour locale
      setApps(prev => prev.map(a => a.id === id ? { ...a, status: decision } : a));
      setExamineApp(null);
      setSuccessMsg(
        decision === 'approved'
          ? '✅ Expert approuvé ! Un email avec ses identifiants a été envoyé automatiquement.'
          : '❌ Candidature refusée. Le candidat a été notifié.'
      );
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeciding(false);
    }
  };

  // ── Filtrage + recherche ─────────────────────────────────────
  const filtered = apps
    .filter(a => filter === 'all' || a.status === filter)
    .filter(a => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        `${a.first_name} ${a.last_name}`.toLowerCase().includes(q) ||
        (a.user_email || '').toLowerCase().includes(q) ||
        (a.category_name || '').toLowerCase().includes(q)
      );
    });

  const counts = {
    all:      apps.length,
    pending:  apps.filter(a => a.status === 'pending').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  // ── Rendu ────────────────────────────────────────────────────
  return (
    <div>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div>
          <div className="page-eyebrow">Modération</div>
          <div className="page-title">Candidatures Experts</div>
          <div className="page-sub">Examinez et validez les demandes d'inscription des experts.</div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={loadApps}
          disabled={loading}
          style={{ gap: 6 }}
        >
          {loading ? '⏳' : '↻'} Actualiser
        </button>
      </div>

      {/* Stats */}
      {!loading && !error && <QuickStats apps={apps} />}

      {/* Message succès */}
      {successMsg && (
        <div style={{
          background: successMsg.startsWith('✅') ? 'var(--green-dim)' : 'var(--red-dim)',
          border: `1px solid ${successMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)'}`,
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          fontSize: 14, color: successMsg.startsWith('✅') ? 'var(--green)' : 'var(--red)',
          fontWeight: 500,
        }}>
          {successMsg}
        </div>
      )}

      {/* Message erreur */}
      {error && (
        <div style={{
          background: 'var(--red-dim)', border: '1px solid var(--red)',
          borderRadius: 12, padding: '14px 18px', marginBottom: 20,
          fontSize: 14, color: 'var(--red)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>⚠ {error}</span>
          <button className="btn btn-ghost btn-sm" onClick={loadApps}>Réessayer</button>
        </div>
      )}

      {/* Filtres + recherche */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="form-input"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="🔍 Rechercher par nom, email, domaine…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            ['all',      'Toutes'],
            ['pending',  '⏳ En attente'],
            ['approved', '✅ Approuvées'],
            ['rejected', '❌ Refusées'],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`btn btn-sm ${filter === key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(key)}
            >
              {label}
              <span style={{
                marginLeft: 6,
                background: filter === key ? 'rgba(255,255,255,.25)' : 'var(--bg)',
                borderRadius: 20, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>
                {counts[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* État chargement */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
          <div style={{ fontFamily: 'var(--syne)', fontSize: 16, fontWeight: 600 }}>
            Chargement des candidatures…
          </div>
        </div>
      )}

      {/* Liste vide */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 14 }}>📭</div>
          <div style={{ fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
            {search
              ? 'Aucun résultat pour cette recherche'
              : filter === 'pending'
              ? 'Aucune candidature en attente'
              : 'Aucune candidature'}
          </div>
          <div style={{ fontSize: 14 }}>
            {search ? 'Essayez un autre terme.' : 'Les nouvelles candidatures apparaîtront ici.'}
          </div>
        </div>
      )}

      {/* Liste des candidatures */}
      {!loading && !error && filtered.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Section "En attente" en premier si filtre = all */}
          {filter === 'all' && counts.pending > 0 && (
            <>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: '.15em',
                textTransform: 'uppercase', color: 'var(--amber)',
                display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
              }}>
                <div style={{ flex: 1, height: 1, background: 'var(--amber-dim)' }} />
                À examiner ({counts.pending})
                <div style={{ flex: 1, height: 1, background: 'var(--amber-dim)' }} />
              </div>
              {filtered
                .filter(a => a.status === 'pending')
                .map(app => (
                  <AppCard key={app.id} app={app} onExamine={setExamineApp} />
                ))}
              {(counts.approved > 0 || counts.rejected > 0) && (
                <div style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: '.15em',
                  textTransform: 'uppercase', color: 'var(--muted)',
                  display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
                }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                  Traitées
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>
              )}
              {filtered
                .filter(a => a.status !== 'pending')
                .map(app => (
                  <AppCard key={app.id} app={app} onExamine={setExamineApp} />
                ))}
            </>
          )}

          {/* Si filtre spécifique */}
          {filter !== 'all' && filtered.map(app => (
            <AppCard key={app.id} app={app} onExamine={setExamineApp} />
          ))}
        </div>
      )}

      {/* Modal d'examen */}
      <ExamineModal
        app={examineApp}
        onClose={() => !deciding && setExamineApp(null)}
        onDecide={handleDecide}
        loading={deciding}
      />
    </div>
  );
}
