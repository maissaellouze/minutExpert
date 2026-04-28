import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { days, timeSlots, globalBookedSlots } from '../../data/mockData';
import { clientAPI } from '../../services/api';
import { ExpertCard } from '../ui';

// ─── BOOKING WIZARD ───
export function ClientBook() {
  const { selectedExpert, setSelectedExpert, selectedSlot, setSelectedSlot,
    selectedDur, setSelectedDur, bookStep, setBookStep, bookedSlots, mySlots, confirmBooking } = useApp();

  const [localDur, setLocalDur] = useState(selectedDur);
  const [expertsList, setExpertsList] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);

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
        reviews: 0,
        status: 'online',
        color: '#e0f2fe',
        tc: '#0284c7'
      }));
      setExpertsList(mapped);
      setLoadingExperts(false);
    }).catch(() => setLoadingExperts(false));
  }, []);

  const handleSelectExpert = (e) => {
    setSelectedExpert(e);
    setSelectedSlot(null);
    setBookStep(1);
  };

  const handleSelectSlot = (day, si) => {
    const isBooked = (bookedSlots[selectedExpert?.id]?.[day] || []).includes(si) &&
      !(mySlots[selectedExpert?.id]?.[day] || []).includes(si);
    if (isBooked) return;
    const label = `${day} ${timeSlots[si]}`;
    setSelectedSlot({ day, si, label });
  };

  const updateDur = (val) => {
    const v = Number(val);
    setLocalDur(v);
    setSelectedDur(v);
  };

  const setBDur = (v) => {
    setLocalDur(v);
    setSelectedDur(v);
  };

  const maxCost = selectedExpert ? (selectedExpert.rate * localDur * 1.15).toFixed(2) : '0.00';

  return (
    <div>
      <div className="page-eyebrow">Réservation</div>
      <div className="page-title">Réserver une session</div>

      {/* Wizard Bar */}
      <div className="wizard-bar">
        {['Expert', 'Créneau & Durée', 'Paiement'].map((label, i) => (
          <div key={i} className={`wstep${bookStep === i ? ' active' : ''}`} onClick={() => bookStep > i && setBookStep(i)}>
            <div className="wstep-n">{i + 1}</div>
            {label}
          </div>
        ))}
      </div>

      {/* Step 0: Choose expert */}
      {bookStep === 0 && (
        <div className="expert-grid">
          {loadingExperts ? <div>Chargement...</div> : expertsList.map(e => <ExpertCard key={e.id} expert={e} onBook={handleSelectExpert} onOpen={handleSelectExpert} />)}
        </div>
      )}

      {/* Step 1: Slot & Duration */}
      {bookStep === 1 && selectedExpert && (
        <div>
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header">
              <div>
                <div className="card-title">{selectedExpert.name}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>€{selectedExpert.rate.toFixed(2)}/min</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setBookStep(0)}>← Changer</button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <div className="card-header"><div className="card-title">Créneau disponible</div></div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
                ✓ <span style={{ color: 'var(--blue)' }}>Bleu</span> = Disponible ·{' '}
                ✕ <span style={{ color: 'var(--red)' }}>Rouge</span> = Déjà réservé / Indisponible
              </p>
              <div className="avail-grid">
                {days.map(day => (
                  <div key={day} className="avail-row">
                    <div className="avail-day">{day}</div>
                    <div className="avail-slots">
                      {timeSlots.map((slot, si) => {
                        const isGloballyBooked = (globalBookedSlots[selectedExpert.id]?.[day] || []).includes(si);
                        const isMySlot = (mySlots[selectedExpert?.id]?.[day] || []).includes(si);
                        const isBookedByOther = (bookedSlots[selectedExpert.id]?.[day] || []).includes(si) && !isMySlot;
                        const isSelected = selectedSlot?.day === day && selectedSlot?.si === si;
                        
                        // Simulate non-working hours: experts don't work after 5:30 PM (si >= 17) or before 10 AM (si < 2) on some days
                        const isNonWorking = si < 2 || si >= 16 || (['Samedi', 'Dimanche'].includes(day) && si > 6);
                        
                        let cls = 'slot-btn';
                        const isUnavailable = isGloballyBooked || isBookedByOther || isNonWorking;

                        if (isMySlot) cls += ' mine';
                        else if (isUnavailable) cls += ' booked';
                        else if (isSelected) cls += ' on';

                        return (
                          <button key={si} className={cls} onClick={() => handleSelectSlot(day, si)}
                            disabled={isUnavailable}>
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

          <div className="card">
            <div className="card-header"><div className="card-title">Durée de la session</div></div>
            <div className="card-body">
              <div className="dur-display">{localDur} <span>min</span></div>
              <input type="range" className="dur-slider" min="3" max="60" value={localDur}
                onChange={e => updateDur(e.target.value)} />
              <div className="dur-presets">
                {[3, 10, 20, 30].map(v => (
                  <button key={v} className={`dp-btn${localDur === v ? ' active' : ''}`} onClick={() => setBDur(v)}>{v} min</button>
                ))}
              </div>
              <div className="cost-box">
                💳 Pré-autorisation max : <strong>€{maxCost}</strong> · Facturé à la seconde réelle
              </div>
              <button className="btn btn-primary btn-full" onClick={() => setBookStep(2)} disabled={!selectedSlot}>
                Continuer →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {bookStep === 2 && selectedExpert && (
        <div className="grid-2">
          <div>
            <div className="card" style={{ marginBottom: 14 }}>
              <div className="card-header"><div className="card-title">Récapitulatif</div></div>
              <div className="card-body">
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
                  <div className="ec-avatar" style={{ width: 52, height: 52, fontSize: 20, flexShrink: 0, background: selectedExpert.color, color: selectedExpert.tc }}>{selectedExpert.init}</div>
                  <div>
                    <div style={{ fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700 }}>{selectedExpert.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{selectedExpert.title}</div>
                  </div>
                </div>
                <hr className="div" />
                <div className="info-row"><span className="lbl">Créneau</span><span className="val" style={{ color: 'var(--orange)' }}>{selectedSlot?.label}</span></div>
                <div className="info-row"><span className="lbl">Durée max</span><span className="val">{localDur} min</span></div>
                <div className="info-row"><span className="lbl">Tarif</span><span className="val">€{selectedExpert.rate.toFixed(2)}/min</span></div>
                <div className="info-row">
                  <span className="lbl">Max estimé</span>
                  <span className="val" style={{ color: 'var(--orange)', fontFamily: 'var(--syne)', fontSize: 17 }}>€{maxCost}</span>
                </div>
                <div className="info-row"><span className="lbl">Facturation</span><span className="val" style={{ color: 'var(--muted)' }}>À la seconde exacte</span></div>
              </div>
            </div>
          </div>
          <div>
            <div className="card">
              <div className="card-header"><div className="card-title">Paiement sécurisé</div></div>
              <div className="card-body">
                <div className="form-group"><label className="form-label">Numéro de carte</label><input className="form-input" defaultValue="4242 4242 4242 4242" /></div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Expiration</label><input className="form-input" defaultValue="12/27" /></div>
                  <div className="form-group"><label className="form-label">CVV</label><input className="form-input" defaultValue="123" /></div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 14 }}>🔒 Pré-autorisation uniquement · Débité au temps réel</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-ghost" onClick={() => setBookStep(1)}>← Retour</button>
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={confirmBooking}>Confirmer →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BOOKING SUCCESS ───
export function BookingSuccess() {
  const { upcomingSessions, setClientPage } = useApp();
  const booking = upcomingSessions[0];

  if (!booking) return null;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '40px 0' }}>
      <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 38, animation: 'popIn .4s cubic-bezier(.34,1.56,.64,1)' }}>✓</div>
      <div className="page-eyebrow" style={{ textAlign: 'center' }}>Réservation confirmée</div>
      <div style={{ fontFamily: 'var(--syne)', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Session planifiée !</div>
      <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 32, lineHeight: 1.7 }}>
        Votre pré-autorisation Stripe a été validée.<br />
        Vous recevrez un email de rappel 30 min avant la session.
      </div>

      <div className="card" style={{ textAlign: 'left', marginBottom: 20 }}>
        <div className="card-header" style={{ background: 'var(--green-dim)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 20 }}>🗓</div>
            <div><div className="card-title" style={{ color: 'var(--green)' }}>Session planifiée</div><div style={{ fontSize: 12, color: 'var(--green)', opacity: 0.8 }}>Confirmée · Pré-autorisée</div></div>
          </div>
          <span className="badge badge-approved">À venir</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: booking.expert.color, color: booking.expert.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>{booking.expert.init}</div>
            <div>
              <div style={{ fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700 }}>{booking.expert.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{booking.expert.title}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Créneau', value: booking.slot },
              { label: 'Durée max', value: `${booking.dur} min` },
              { label: 'Tarif', value: `€${booking.expert.rate.toFixed(2)}/min` },
              { label: 'Max estimé', value: `€${booking.maxCost}`, highlight: true },
            ].map(item => (
              <div key={item.label} style={{ padding: 14, background: item.highlight ? 'var(--orange-dim)' : 'var(--bg)', borderRadius: 10, border: item.highlight ? '1px solid var(--orange-mid)' : 'none' }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: item.highlight ? 'var(--orange)' : 'var(--muted)', marginBottom: 6 }}>{item.label}</div>
                <div style={{ fontFamily: 'var(--syne)', fontSize: 16, fontWeight: 700, color: item.highlight ? 'var(--orange)' : 'inherit' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, padding: 12, background: 'var(--blue-dim)', borderRadius: 8, fontSize: 13, color: 'var(--blue)', border: '1px solid var(--blue-mid)' }}>
            ⚡ Vous serez facturé uniquement du temps réel consommé — à la seconde près.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={() => setClientPage('client-home')}>← Retour à l'accueil</button>
        <button className="btn btn-primary" onClick={() => setClientPage('client-history')}>Voir mes sessions →</button>
      </div>
    </div>
  );
}

// ─── CLIENT HISTORY ───
export function ClientHistory() {
  const { launchSession, showToast } = useApp();
  const [tab, setTab] = useState('upcoming');
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    clientAPI.getMyBookings().then(data => {
      setAllBookings(data || []);
      setLoading(false);
    }).catch(() => {
      // Fallback to getMySessions if getMyBookings not ready
      clientAPI.getMySessions().then(data => {
        setAllBookings(data || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    });
  };

  useEffect(() => { fetchBookings(); }, []);

  // Split bookings: upcoming = not completed/cancelled, history = completed/cancelled
  const upcomingFromAPI = allBookings.filter(b =>
    !['completed', 'cancelled'].includes(b.status)
  );
  const historyFromAPI = allBookings.filter(b =>
    ['completed', 'cancelled'].includes(b.status)
  );

  const statusLabel = (s) => {
    if (s === 'pending') return { label: 'En attente', cls: 'badge-pending' };
    if (s === 'waiting_expert') return { label: '⏳ Attente expert', cls: 'badge-pending' };
    if (s === 'in_progress') return { label: '🔴 En cours', cls: 'badge-online' };
    if (s === 'accepted') return { label: 'Acceptée', cls: 'badge-approved' };
    if (s === 'completed') return { label: 'Terminée', cls: 'badge-approved' };
    if (s === 'cancelled') return { label: 'Annulée', cls: 'badge-rejected' };
    return { label: s, cls: 'badge-pending' };
  };

  return (
    <div>
      <div className="page-eyebrow">Suivi</div>
      <div className="page-title">Mes sessions</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid var(--border)', marginBottom: 24 }}>
        <div onClick={() => setTab('upcoming')} style={{ padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, ...(tab === 'upcoming' ? { color: 'var(--orange)', borderBottom: '2px solid var(--orange)', marginBottom: -1.5 } : { color: 'var(--muted)' }) }}>
          🗓 À venir
          {upcomingFromAPI.length > 0 && <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{upcomingFromAPI.length}</span>}
        </div>
        <div onClick={() => setTab('history')} style={{ padding: '10px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer', ...(tab === 'history' ? { color: 'var(--orange)', fontWeight: 600, borderBottom: '2px solid var(--orange)', marginBottom: -1.5 } : { color: 'var(--muted)' }) }}>
          📋 Historique
        </div>
      </div>

      {/* Upcoming tab — from real API */}
      {tab === 'upcoming' && (
        loading ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>Chargement…</div>
        ) : upcomingFromAPI.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗓</div>
            <div style={{ fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Aucune session à venir</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>Réservez votre première session avec un expert.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {upcomingFromAPI.map(b => {
              const st = statusLabel(b.status);
              const canJoin = ['pending', 'waiting_expert', 'accepted', 'in_progress'].includes(b.status);
              const expertObj = {
                id: b.expert,
                name: b.expert_name || 'Expert',
                title: b.expert_title || 'Expert MinuteExpert',
                init: b.expert_name ? b.expert_name[0] : 'E',
                color: '#e0f2fe', tc: '#0284c7',
                rate: parseFloat(b.total_price) / Math.max(b.duration_requested || 10, 1)
              };
              return (
                <div key={b.id} className="card" style={{ borderLeft: `4px solid ${b.status === 'in_progress' ? 'var(--orange)' : 'var(--green)'}` }}>
                  <div className="card-body" style={{ padding: '20px 22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                        {b.expert_name ? b.expert_name[0] : 'E'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--syne)', fontSize: 16, fontWeight: 700 }}>{b.expert_name || 'Expert'}</div>
                        <div style={{ fontSize: 13, color: 'var(--muted)' }}>{b.expert_title || 'Expert MinuteExpert'}</div>
                      </div>
                      <span className={`badge ${st.cls}`}>{st.label}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                      {[
                        { lbl: 'Référence', val: b.booking_ref || `#${b.id}` },
                        { lbl: 'Durée max', val: `${b.duration_requested || '--'} min` },
                        { lbl: 'Montant max', val: `€${b.total_price || '0.00'}`, color: 'var(--orange)' }
                      ].map(item => (
                        <div key={item.lbl} style={{ fontSize: 13 }}>
                          <div style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{item.lbl}</div>
                          <div style={{ fontWeight: 600, color: item.color || 'inherit' }}>{item.val}</div>
                        </div>
                      ))}
                    </div>
                    {canJoin && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => launchSession(expertObj, b.duration_requested || 10, b.id)}>
                          {b.status === 'in_progress' ? '🔴 Rejoindre (en cours) →' : 'Rejoindre la session →'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr><th>Expert</th><th>Date</th><th>Durée réelle</th><th>Montant facturé</th><th>Statut</th><th></th></tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20 }}>Chargement...</td></tr>
                ) : historyFromAPI.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 20, color: 'var(--muted)' }}>Aucune session terminée.</td></tr>
                ) : historyFromAPI.map((h, i) => (
                  <tr key={i}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{h.expert_name ? h.expert_name[0] : 'E'}</div>
                        <div><div style={{ fontWeight: 600 }}>{h.expert_name || 'Expert'}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{h.expert_title || 'Expertise'}</div></div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{h.scheduled_at ? new Date(h.scheduled_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '--'}</td>
                    <td>{h.actual_duration || h.duration_requested || '--'} min</td>
                    <td><strong style={{ color: 'var(--orange)' }}>€{h.total_price || '0.00'}</strong></td>
                    <td><span className={`badge ${statusLabel(h.status).cls}`}>{statusLabel(h.status).label}</span></td>
                    <td><button className="btn btn-ghost btn-sm">Re-réserver</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

