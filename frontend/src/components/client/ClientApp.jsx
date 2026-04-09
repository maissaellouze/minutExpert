import { useApp } from '../../context/AppContext';
import { ClientHome, ClientBrowse, ClientSettings } from './ClientPages';
import { ClientBook, BookingSuccess, ClientHistory } from './ClientBooking';

function AppNav() {
  const { navigate, setClientPage } = useApp();
  return (
    <nav className="app-nav">
      <div className="app-logo" onClick={() => setClientPage('client-home')}>
        <div className="pulse" />Minute<span>Expert</span>
      </div>
      <div className="app-nav-right">
        <div className="live-count" style={{ fontSize: 11 }}>
          <div className="pulse" style={{ width: 6, height: 6 }} />47 en ligne
        </div>
        <div className="app-avatar" style={{ background: '#dae8fc', color: '#1a5cff' }}>M</div>
      </div>
    </nav>
  );
}

function Sidebar() {
  const { clientPage, setClientPage, navigate, logout, upcomingSessions } = useApp();
  const items = [
    { id: 'client-home', icon: '🏠', label: 'Accueil' },
    { id: 'client-browse', icon: '🔍', label: 'Explorer les experts' },
    { id: 'client-book', icon: '🗓', label: 'Réserver' },
    { id: 'client-history', icon: '📋', label: 'Mes sessions', badge: upcomingSessions.length || null },
  ];
  return (
    <div className="sidebar">
      <div className="sidebar-section">Menu</div>
      {items.map(item => (
        <div key={item.id} className={`sidebar-item${clientPage === item.id || (clientPage === 'booking-success' && item.id === 'client-book') ? ' active' : ''}`}
          onClick={() => setClientPage(item.id)}>
          <span className="si-icon">{item.icon}</span>
          {item.label}
          {item.badge ? <span style={{ marginLeft: 'auto', background: 'var(--orange)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 10 }}>{item.badge}</span> : null}
        </div>
      ))}
      <div className="sidebar-section">Compte</div>
      <div className={`sidebar-item${clientPage === 'client-settings' ? ' active' : ''}`} onClick={() => setClientPage('client-settings')}>
        <span className="si-icon">⚙️</span>Paramètres
      </div>
      <div className="sidebar-item" onClick={logout}>
        <span className="si-icon">🚪</span>Déconnexion
      </div>
    </div>
  );
}

export default function ClientApp() {
  const { clientPage } = useApp();

  const renderPage = () => {
    switch (clientPage) {
      case 'client-home': return <ClientHome />;
      case 'client-browse': return <ClientBrowse />;
      case 'client-book': return <ClientBook />;
      case 'client-history': return <ClientHistory />;
      case 'client-settings': return <ClientSettings />;
      case 'booking-success': return <BookingSuccess />;
      default: return <ClientHome />;
    }
  };

  return (
    <div>
      <AppNav />
      <div className="app-shell">
        <Sidebar />
        <div className="app-main">
          <div className="app-page active">
            {renderPage()}
          </div>
        </div>
      </div>
    </div>
  );
}
