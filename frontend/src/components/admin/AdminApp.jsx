import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AdminOverview, AdminAnalytics, AdminApplications, AdminExperts, AdminClients, AdminLiveSessions, AdminHistory, AdminFinance, AdminSettings } from './AdminPages';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export default function AdminApp() {
  const { adminPage, setAdminPage, logout } = useApp();
  const [seconds,      setSeconds]      = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Compteur temps réel
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Badge candidatures en attente depuis Django
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) return;
    fetch(`${API}/admin/expert-requests/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setPendingCount(Array.isArray(data) ? data.filter(a => a.status === 'pending').length : 0))
      .catch(() => {});
  }, []);

  const lastUpdate = seconds < 60 ? `il y a ${seconds}s` : `il y a ${Math.floor(seconds / 60)}min`;

  const navItems = [
    { section: 'Tableau de bord' },
    { id: 'adm-overview',      icon: '📊', label: "Vue d'ensemble" },
    { id: 'adm-analytics',     icon: '📈', label: 'Analytiques' },
    { section: 'Gestion' },
    { id: 'adm-applications',  icon: '📋', label: 'Candidatures', badge: pendingCount || null },
    { id: 'adm-experts',       icon: '🧠', label: 'Experts' },
    { id: 'adm-clients',       icon: '👤', label: 'Clients' },
    { id: 'adm-sessions',      icon: '🎥', label: 'Sessions live' },
    { id: 'adm-history',       icon: '🗂', label: 'Historique' },
    { section: 'Finance' },
    { id: 'adm-finance',       icon: '💳', label: 'Revenus & Commissions' },
    { section: 'Système' },
    { id: 'adm-settings',      icon: '⚙️', label: 'Paramètres' },
  ];

  const renderPage = () => {
    switch (adminPage) {
      case 'adm-overview':     return <AdminOverview />;
      case 'adm-analytics':    return <AdminAnalytics />;
      case 'adm-applications': return <AdminApplications />;
      case 'adm-experts':      return <AdminExperts />;
      case 'adm-clients':      return <AdminClients />;
      case 'adm-sessions':     return <AdminLiveSessions />;
      case 'adm-history':      return <AdminHistory />;
      case 'adm-finance':      return <AdminFinance />;
      case 'adm-settings':     return <AdminSettings />;
      default:                 return <AdminOverview />;
    }
  };

  return (
    <div>
      <nav className="app-nav">
        <div className="app-logo">
          <div className="pulse" />Minute<span>Expert</span>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--red)', background: 'var(--red-dim)', border: '1px solid rgba(229,62,62,.2)', padding: '3px 10px', borderRadius: 6, marginLeft: 8 }}>Admin</span>
        </div>
        <div className="app-nav-right">
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{lastUpdate}</div>
          <div className="live-count" style={{ fontSize: 11 }}>
            <div className="pulse" style={{ width: 6, height: 6 }} />3 sessions live
          </div>
          <div className="app-avatar" style={{ background: '#f8cecc', color: '#b85450' }}>AD</div>
          {/* ← logout() efface les tokens et redirige vers landing */}
          <button className="btn btn-ghost btn-sm" onClick={logout}>Déconnexion</button>
        </div>
      </nav>

      <div className="app-shell">
        <div className="sidebar">
          <div style={{ padding: '16px 20px 8px' }}>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Connecté en tant que</div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Admin Principal</div>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0 4px' }} />

          {navItems.map((item, i) => {
            if (item.section) return <div key={i} className="sidebar-section">{item.section}</div>;
            return (
              <div key={item.id}
                className={`sidebar-item${adminPage === item.id ? ' active' : ''}`}
                onClick={() => setAdminPage(item.id)}>
                <span className="si-icon">{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span style={{ marginLeft: 'auto', background: 'var(--orange)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>
                    {item.badge}
                  </span>
                ) : null}
              </div>
            );
          })}

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
