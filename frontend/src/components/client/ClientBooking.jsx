import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { experts, days, timeSlots, globalBookedSlots } from '../../data/mockData';
import { ExpertCard } from '../ui';

// ─── BOOKING WIZARD ───
export function ClientBook() {
  const { selectedExpert, setSelectedExpert, selectedSlot, setSelectedSlot,
    selectedDur, setSelectedDur, bookStep, setBookStep, bookedSlots, mySlots, confirmBooking } = useApp();

  const [localDur, setLocalDur] = useState(selectedDur);

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
          {experts.map(e => <ExpertCard key={e.id} expert={e} onBook={handleSelectExpert} onOpen={handleSelectExpert} />)}
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
                🔒 <span style={{ color: 'var(--orange)' }}>Orange</span> = déjà réservé ·{' '}
                ✓ <span style={{ color: 'var(--blue)' }}>Bleu</span> = mes réservations
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
                        let cls = 'slot-btn';
                        if (isMySlot) cls += ' mine';
                        else if (isGloballyBooked || isBookedByOther) cls += ' booked';
                        else if (isSelected) cls += ' on';
                        return (
                          <button key={si} className={cls} onClick={() => handleSelectSlot(day, si)}
                            disabled={isGloballyBooked || isBookedByOther}>
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
  const { upcomingSessions, cancelUpcoming, launchSession } = useApp();
  const [tab, setTab] = useState('upcoming');

  const historyData = [
    { init: 'SB', color: '#ffeaea', tc: '#c0392b', name: 'Dr. Sarah Benali', sub: 'Médecin généraliste', date: "Aujourd'hui · 11:23", dur: '4 min 12s', amount: '€3.57', note: '★★★★★', id: 1 },
    { init: 'JM', color: '#e8f0ff', tc: '#1a4a9e', name: 'Me. Julien Moreau', sub: 'Avocat', date: 'Hier · 15:40', dur: '8 min 00s', amount: '€11.20', note: '★★★★★', id: 2 },
    { init: 'LF', color: '#e8fff4', tc: '#0e6e42', name: 'Léa Fontaine', sub: 'Développeuse Senior', date: 'Il y a 3j · 09:15', dur: '12 min 33s', amount: '€7.53', note: '★★★★☆', id: 3 },
  ];

  return (
    <div>
      <div className="page-eyebrow">Suivi</div>
      <div className="page-title">Mes sessions</div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1.5px solid var(--border)', marginBottom: 24 }}>
        <div onClick={() => setTab('upcoming')} style={{ padding: '10px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, ...(tab === 'upcoming' ? { color: 'var(--orange)', borderBottom: '2px solid var(--orange)', marginBottom: -1.5 } : { color: 'var(--muted)' }) }}>
          🗓 À venir
          {upcomingSessions.length > 0 && <span style={{ background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{upcomingSessions.length}</span>}
        </div>
        <div onClick={() => setTab('history')} style={{ padding: '10px 22px', fontSize: 14, fontWeight: 500, cursor: 'pointer', ...(tab === 'history' ? { color: 'var(--orange)', fontWeight: 600, borderBottom: '2px solid var(--orange)', marginBottom: -1.5 } : { color: 'var(--muted)' }) }}>
          📋 Historique
        </div>
      </div>

      {/* Upcoming tab */}
      {tab === 'upcoming' && (
        upcomingSessions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🗓</div>
            <div style={{ fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Aucune session à venir</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 20 }}>Réservez votre première session avec un expert.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {upcomingSessions.map(b => (
              <div key={b.id} className="card" style={{ borderLeft: '4px solid var(--green)' }}>
                <div className="card-body" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: b.expert.color, color: b.expert.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>{b.expert.init}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--syne)', fontSize: 16, fontWeight: 700 }}>{b.expert.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--muted)' }}>{b.expert.title}</div>
                    </div>
                    <span className="badge badge-approved">🗓 À venir</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    {[{ lbl: 'Créneau', val: b.slot, color: 'var(--orange)' }, { lbl: 'Durée max', val: `${b.dur} min` }, { lbl: 'Max estimé', val: `€${b.maxCost}`, color: 'var(--orange)' }].map(item => (
                      <div key={item.lbl} style={{ fontSize: 13 }}>
                        <div style={{ color: 'var(--muted)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{item.lbl}</div>
                        <div style={{ fontWeight: 600, color: item.color || 'inherit' }}>{item.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => cancelUpcoming(b.id)}>Annuler</button>
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => launchSession(b.expert, b.dur)}>Rejoindre la session →</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div className="card">
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr><th>Expert</th><th>Date</th><th>Durée réelle</th><th>Montant facturé</th><th>Note</th><th></th></tr>
              </thead>
              <tbody>
                {historyData.map(h => (
                  <tr key={h.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: h.color, color: h.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{h.init}</div>
                        <div><div style={{ fontWeight: 600 }}>{h.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{h.sub}</div></div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--muted)', fontSize: 13 }}>{h.date}</td>
                    <td>{h.dur}</td>
                    <td><strong style={{ color: 'var(--orange)' }}>{h.amount}</strong></td>
                    <td style={{ color: 'var(--amber)' }}>{h.note}</td>
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
