import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpertDash, ExpertAvailability, ExpertSessions, ExpertProfile } from './ExpertPages';

export default function ExpertApp() {
  const { expertPage, setExpertPage, navigate, logout, showToast } = useApp();
  const [available, setAvailable] = useState(true);

  const toggleAvail = () => {
    const next = !available;
    setAvailable(next);
    showToast(next ? '🟢 Vous êtes disponible' : '🔴 Vous êtes hors ligne', next ? 'Les clients peuvent vous réserver.' : 'Vous ne recevrez plus de demandes.');
  };

  const renderPage = () => {
    switch (expertPage) {
      case 'exp-dash': return <ExpertDash />;
      case 'exp-avail': return <ExpertAvailability />;
      case 'exp-sessions': return <ExpertSessions />;
      case 'exp-profile': return <ExpertProfile />;
      default: return <ExpertDash />;
    }
  };

  const navItems = [
    { id: 'exp-dash', icon: '📊', label: 'Dashboard' },
    { id: 'exp-avail', icon: '🗓', label: 'Disponibilités' },
    { id: 'exp-sessions', icon: '📋', label: 'Sessions' },
    { id: 'exp-profile', icon: '👤', label: 'Mon profil' },
  ];

  return (
    <div>
      <nav className="app-nav">
        <div className="app-logo"><div className="pulse" />Minute<span>Expert</span></div>
        <div className="app-nav-right">
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
          <div className="app-avatar" style={{ background: '#d5e8d4', color: '#1a9e6e' }} onClick={logout}>E</div>
        </div>
      </nav>

      <div className="app-shell">
        <div className="sidebar">
          <div className="sidebar-section">Expert</div>
          {navItems.map(item => (
            <div key={item.id} className={`sidebar-item${expertPage === item.id ? ' active' : ''}`}
              onClick={() => setExpertPage(item.id)}>
              <span className="si-icon">{item.icon}</span>{item.label}
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
