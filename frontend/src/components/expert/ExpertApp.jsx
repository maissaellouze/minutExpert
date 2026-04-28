import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sessionAPI } from '../../services/api';
import { ExpertDash, ExpertAvailability, ExpertSessions, ExpertProfile } from './ExpertPages';

export default function ExpertApp() {
  const { expertPage, setExpertPage, navigate, logout, showToast } = useApp();
  const [available, setAvailable] = useState(true);

  // ─── Global pending sessions notification (always running) ───────────
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingSessions, setPendingSessions] = useState([]);
  const [accepting, setAccepting] = useState(null);
  const prevPendingIds = useRef(new Set());
  const pollingRef = useRef(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const data = await sessionAPI.getPending();
        const list = data || [];
        setPendingSessions(list);
        setPendingCount(list.length);

        // Toast for NEW sessions only
        list.forEach(p => {
          if (!prevPendingIds.current.has(p.id)) {
            showToast(`📞 Demande de session !`, `${p.client_name} · ${p.duration_requested || 10} min`);
          }
        });
        prevPendingIds.current = new Set(list.map(p => p.id));
      } catch (e) {
        // Silently ignore auth/network errors
      }
    };

    fetchPending(); // immediate first fetch
    pollingRef.current = setInterval(fetchPending, 5000);
    return () => clearInterval(pollingRef.current);
  }, []);

  const handleAccept = async (bookingId, clientName) => {
    setAccepting(bookingId);
    try {
      const result = await sessionAPI.accept(bookingId);
      showToast('Session acceptée !', `Connexion avec ${clientName} en cours...`);
      setPendingSessions(prev => prev.filter(p => p.id !== bookingId));
      setPendingCount(prev => Math.max(0, prev - 1));
      if (typeof window !== 'undefined') {
        window.__expertSessionData = { bookingId, meetingLink: result.meeting_link, clientName };
      }
      navigate('expert-session');
    } catch (err) {
      showToast('Erreur', err.message || "Impossible d'accepter la session.");
    }
    setAccepting(null);
  };

  const handleReject = async (bookingId, clientName, reason) => {
    if (!reason) reason = "Indisponible pour le moment";

    try {
      await sessionAPI.reject(bookingId, reason);
      showToast('Session refusée', `Vous avez refusé la demande de ${clientName}.`);
      setPendingSessions(prev => prev.filter(p => p.id !== bookingId));
      setPendingCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      showToast('Erreur', err.message || "Impossible de refuser la session.");
    }
  };

  const toggleAvail = () => {
    const next = !available;
    setAvailable(next);
    showToast(next ? '🟢 Vous êtes disponible' : '🔴 Vous êtes hors ligne', next ? 'Les clients peuvent vous réserver.' : 'Vous ne recevrez plus de demandes.');
  };

  const renderPage = () => {
    switch (expertPage) {
      case 'exp-dash':     return <ExpertDash pendingSessions={pendingSessions} accepting={accepting} onAccept={handleAccept} onReject={handleReject} />;
      case 'exp-avail':    return <ExpertAvailability />;
      case 'exp-sessions': return <ExpertSessions />;
      case 'exp-profile':  return <ExpertProfile />;
      default:             return <ExpertDash pendingSessions={pendingSessions} accepting={accepting} onAccept={handleAccept} onReject={handleReject} />;
    }
  };

  const navItems = [
    { id: 'exp-dash',     icon: '📊', label: 'Dashboard' },
    { id: 'exp-avail',    icon: '🗓',  label: 'Disponibilités' },
    { id: 'exp-sessions', icon: '📋', label: 'Sessions' },
    { id: 'exp-profile',  icon: '👤', label: 'Mon profil' },
  ];

  return (
    <div>
      <nav className="app-nav">
        <div className="app-logo"><div className="pulse" />Minute<span>Expert</span></div>
        <div className="app-nav-right">
          {/* Pending notification bell */}
          {pendingCount > 0 && (
            <div style={{ position: 'relative', marginRight: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--orange)', borderColor: 'var(--orange)', position: 'relative' }}
                onClick={() => setExpertPage('exp-dash')}>
                📞 Demande en attente
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  background: 'var(--orange)', color: '#fff',
                  width: 18, height: 18, borderRadius: '50%',
                  fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>{pendingCount}</span>
              </button>
            </div>
          )}

          {/* Toggle availability */}
          <label className="toggle-wrap" style={{ gap: 8, cursor: 'pointer' }}>
            <input type="checkbox" checked={available} onChange={toggleAvail} style={{ display: 'none' }} />
            <div
              onClick={toggleAvail}
              style={{
                width: 38, height: 22, borderRadius: 11, position: 'relative', transition: '.2s',
                background: available ? 'var(--green)' : 'var(--border)', cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute', top: 3,
                left: available ? 19 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: '.2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)'
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: available ? 'var(--green)' : 'var(--muted)' }}>
              {available ? '🟢 Disponible' : '🔴 Hors ligne'}
            </span>
          </label>
          <div className="app-avatar" style={{ background: '#d5e8d4', color: '#1a9e6e' }} onClick={logout}>
            {useApp().currentUser.first_name?.[0] || 'E'}
          </div>
        </div>
      </nav>

      <div className="app-shell">
        <div className="sidebar">
          <div className="sidebar-section">Expert</div>
          {navItems.map(item => (
            <div key={item.id} className={`sidebar-item${expertPage === item.id ? ' active' : ''}`}
              onClick={() => setExpertPage(item.id)}>
              <span className="si-icon">{item.icon}</span>
              {item.label}
              {item.id === 'exp-dash' && pendingCount > 0 && (
                <span style={{ marginLeft: 'auto', background: 'var(--orange)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>
                  {pendingCount}
                </span>
              )}
            </div>
          ))}
          <div className="sidebar-section">Compte</div>
          <div className="sidebar-item" onClick={logout}>
            <span className="si-icon">🚪</span>Déconnexion
          </div>
        </div>

        <div className="app-main">
          <div className="app-page active">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}
