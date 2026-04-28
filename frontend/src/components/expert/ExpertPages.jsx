import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { expertAPI } from '../../services/api';
import { days, timeSlots, expertInitialSlots } from '../../data/mockData';

// ─── MINI BAR CHART ───
function MiniBarChart({ data, color = 'var(--orange)', height = 90 }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', background: color, borderRadius: 4, height: `${(v / max) * 100}%`, opacity: i === data.length - 1 ? 1 : 0.5 }} />
        </div>
      ))}
    </div>
  );
}

// ─── EXPERT DASHBOARD ───
export function ExpertDash({ pendingSessions = [], accepting = null, onAccept = () => {}, onReject = () => {} }) {
  const { currentUser } = useApp();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingBooking, setRejectingBooking] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("Indisponible pour le moment");

  useEffect(() => {
    expertAPI.getMySessions().then(data => {
      setSessions(data || []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const chartData = [0, 0, 0, 0, 0, 0, 0];
  const totalEarned = sessions.reduce((acc, s) => acc + (parseFloat(s.total_price) || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div><div className="page-eyebrow">Bienvenue</div><div className="page-title">{currentUser.first_name} {currentUser.last_name}</div></div>
      </div>

      {/* Pending session notifications */}
      {pendingSessions.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {pendingSessions.map(p => (
            <div key={p.id} className="card" style={{ borderLeft: '4px solid var(--orange)', marginBottom: 10 }}>
              <div className="card-body" style={{ padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <div className="pulse" style={{ width: 8, height: 8 }} />
                      <div style={{ fontWeight: 700, fontSize: 15 }}>Demande de session</div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                      <strong>{p.client_name}</strong> · {p.slot_label || 'Maintenant'} · {p.duration_requested || 10} min max · €{p.total_price}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onAccept(p.id, p.client_name)}
                      disabled={accepting === p.id}>
                      {accepting === p.id ? 'Connexion…' : 'Accepter ✓'}
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
                      onClick={() => setRejectingBooking({ id: p.id, clientName: p.client_name })}
                      disabled={accepting === p.id}>
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid-4" style={{ marginBottom: 22 }}>
        <div className="stat c-orange"><div className="stat-label">Aujourd'hui</div><div className="stat-val orange">€{totalEarned.toFixed(2)}</div><div className="stat-sub">{sessions.length} sessions</div></div>
        <div className="stat c-green"><div className="stat-label">Ce mois</div><div className="stat-val green">€{totalEarned.toFixed(2)}</div><div className="stat-sub">...</div></div>
        <div className="stat c-amber">
          <div className="stat-label">Note</div>
          <div className="stat-val amber">{currentUser?.avg_rating || currentUser?.expert_profile?.avg_rating || '0.00'} ★</div>
          <div className="stat-sub">{currentUser?.review_count || 0} avis reçus</div>
        </div>
        <div className="stat c-blue"><div className="stat-label">File d'attente</div><div className="stat-val blue">{pendingSessions.length}</div><div className="stat-sub">en attente</div></div>
      </div>

      {/* Rejection Modal */}
      {rejectingBooking && (
        <div className="modal-bg open">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-title">Refuser la session</div>
            <div className="modal-sub">Veuillez indiquer la raison du refus pour {rejectingBooking.clientName}</div>
            <div className="form-group">
              <textarea
                className="form-input"
                rows="3"
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="Ex: Je suis déjà en rendez-vous..."
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setRejectingBooking(null)}>Annuler</button>
              <button className="btn btn-primary" style={{ background: 'var(--red)' }} onClick={() => {
                onReject(rejectingBooking.id, rejectingBooking.clientName, rejectionReason);
                setRejectingBooking(null);
              }}>Confirmer le refus</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Prochaines réservations</div></div>
          <div className="card-body" style={{ padding: '0 20px' }}>
            {loading ? <div style={{ padding: 20 }}>Chargement...</div> : sessions.length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--muted)' }}>Aucune réservation pour le moment.</div>
            ) : (
              <div className="tl">
                {sessions.filter(s => s.status !== 'completed' && s.status !== 'cancelled').slice(0, 5).map((item, i) => (
                  <div key={i} className="tl-item">
                    <div className="tl-dot-col">
                      <div className="tl-dot blue" />
                      {i < sessions.length - 1 && <div className="tl-line" />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 4 }}>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{item.client_name || `Client #${item.client}`}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.slot_label || new Date(item.scheduled_at).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'var(--syne)', fontWeight: 700, color: 'var(--orange)' }}>€{item.total_price}</div>
                      <span className="badge badge-pending" style={{ fontSize: 10 }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Derniers avis</div></div>
          <div className="card-body" style={{ padding: '0 20px' }}>
            {sessions.filter(s => s.rating).length === 0 ? (
              <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--muted)' }}>Aucun avis reçu.</div>
            ) : (
              <div className="tl">
                {sessions.filter(s => s.rating).slice(0, 5).map((item, i) => (
                  <div key={i} className="tl-item" style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none', padding: '12px 0' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{item.client_name}</div>
                        <div style={{ color: 'var(--amber)', fontWeight: 700 }}>{item.rating} ★</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--ink2)', fontStyle: item.review_comment ? 'normal' : 'italic' }}>
                        {item.review_comment || "Pas de commentaire laissé."}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                        Session du {new Date(item.scheduled_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXPERT AVAILABILITY ───
export function ExpertAvailability() {
  const { showToast } = useApp();
  const [activeSlots, setActiveSlots] = useState(expertInitialSlots);
  const bookedByClients = { Lundi: [1], Mercredi: [3] };

  const toggleSlot = (day, si) => {
    const isBooked = (bookedByClients[day] || []).includes(si);
    if (isBooked) return;
    setActiveSlots(prev => {
      const current = prev[day] || [];
      const next = current.includes(si) ? current.filter(s => s !== si) : [...current, si];
      return { ...prev, [day]: next };
    });
  };

  return (
    <div>
      <div className="page-eyebrow">Planning</div>
      <div className="page-title">Mes créneaux de disponibilité</div>
      <div className="page-sub">Cliquez pour activer/désactiver. Les créneaux réservés sont verrouillés.</div>
      <div className="card">
        <div className="card-header">
          <div className="card-title">Semaine en cours</div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Créneaux sauvegardés ✓', 'Vos disponibilités ont été mises à jour.')}>Sauvegarder</button>
        </div>
        <div className="card-body">
          <div className="avail-grid">
            {days.map(day => (
              <div key={day} className="avail-row">
                <div className="avail-day">{day}</div>
                <div className="avail-slots">
                  {timeSlots.map((slot, si) => {
                    const isBooked = (bookedByClients[day] || []).includes(si);
                    const isActive = (activeSlots[day] || []).includes(si);
                    let cls = 'slot-btn';
                    if (isBooked) cls += ' booked';
                    else if (isActive) cls += ' on';
                    return (
                      <button key={si} className={cls} onClick={() => toggleSlot(day, si)} disabled={isBooked}>
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EXPERT SESSIONS ───
export function ExpertSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    expertAPI.getMySessions().then(data => {
      setSessions(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-eyebrow">Historique</div>
      <div className="page-title">Mes sessions</div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div style={{ padding: 30, textAlign: 'center' }}>Chargement...</div> : sessions.length === 0 ? (
             <div style={{ padding: 50, textAlign: 'center', color: 'var(--muted)' }}>Vous n'avez pas encore de sessions terminées.</div>
          ) : (
            <table className="table">
              <thead><tr><th>Client</th><th>Date</th><th>Durée</th><th>Montant reçu</th><th>Note</th></tr></thead>
              <tbody>
                {sessions.map((r, i) => (
                  <tr key={i}>
                    <td><strong>{r.client_name || `Client #${r.client}`}</strong></td>
                    <td style={{ color: 'var(--muted)' }}>{new Date(r.scheduled_at).toLocaleDateString()}</td>
                    <td>{r.actual_duration || '--'} min</td>
                    <td><strong style={{ color: 'var(--green)' }}>€{r.total_price || '0.00'}</strong></td>
                    <td style={{ color: 'var(--amber)' }}>{r.rating ? `${r.rating} ★` : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── EXPERT PROFILE ───
export function ExpertProfile() {
  const { currentUser, showToast } = useApp();
  const [profile, setProfile] = useState({ 
    title: currentUser?.title || '', 
    bio: currentUser?.bio || '', 
    hourly_rate: currentUser?.hourly_rate || 0 
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        title: currentUser.title || '',
        bio: currentUser.bio || '',
        hourly_rate: currentUser.hourly_rate || 0
      });
    }
  }, [currentUser]);

  const handleSaveInfo = async () => {
    try {
      await expertAPI.updateMe({ title: profile.title, bio: profile.bio });
      showToast('Profil mis à jour ✓');
    } catch (err) {
      showToast('Erreur', err.message);
    }
  };

  const handleSaveRate = async () => {
    try {
      await expertAPI.updateMe({ hourly_rate: profile.hourly_rate });
      showToast('Tarifs mis à jour ✓', 'Vos nouveaux tarifs sont en ligne.');
    } catch (err) {
      showToast('Erreur', err.message);
    }
  };

  if (loading) return <div>Chargement du profil...</div>;

  return (
    <div>
      <div className="page-eyebrow">Mon profil</div>
      <div className="page-title">Paramètres expert</div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Informations</div></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Nom affiché</label><input className="form-input" disabled defaultValue={`${currentUser.first_name} ${currentUser.last_name}`} /></div>
            <div className="form-group"><label className="form-label">Titre</label><input className="form-input" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} placeholder="Ex: Développeur Senior" /></div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows="4" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} placeholder="Décrivez votre expertise..." />
            </div>
            <button className="btn btn-primary" onClick={handleSaveInfo}>Sauvegarder</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Tarification</div></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Tarif (€/minute)</label><input className="form-input" type="number" value={profile.hourly_rate} onChange={e => setProfile({...profile, hourly_rate: e.target.value})} step="0.05" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Min (min)</label><input className="form-input" type="number" defaultValue="3" disabled /></div>
              <div className="form-group"><label className="form-label">Max (min)</label><input className="form-input" type="number" defaultValue="60" disabled /></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={handleSaveRate}>Mettre à jour</button>
          </div>
        </div>
      </div>
    </div>
  );
}
