import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
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
export function ExpertDash() {
  const chartData = [210, 280, 195, 340, 290, 260, 284];
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
        <div><div className="page-eyebrow">Bienvenue</div><div className="page-title">Dr. Sarah Benali</div></div>
      </div>
      <div className="grid-4" style={{ marginBottom: 22 }}>
        <div className="stat c-orange"><div className="stat-label">Aujourd'hui</div><div className="stat-val orange">€284</div><div className="stat-sub">11 sessions</div></div>
        <div className="stat c-green"><div className="stat-label">Ce mois</div><div className="stat-val green">€3 420</div><div className="stat-sub">+22%</div></div>
        <div className="stat c-amber"><div className="stat-label">Note</div><div className="stat-val amber">4.97 ★</div><div className="stat-sub">248 avis</div></div>
        <div className="stat c-blue"><div className="stat-label">File d'attente</div><div className="stat-val blue">3</div><div className="stat-sub">en attente</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Prochaines réservations</div></div>
          <div className="card-body" style={{ padding: '0 20px' }}>
            <div className="tl">
              {[
                { init: 'TM', name: 'Thomas M.', slot: 'Lundi 10:00 · 15 min', amount: '€12.75', dotColor: 'orange' },
                { init: 'JK', name: 'Julie K.', slot: 'Mercredi 14:00 · 30 min', amount: '€25.50', dotColor: 'blue' },
                { init: 'AR', name: 'Alexis R.', slot: 'Jeudi 09:00 · 5 min', amount: '€4.25', dotColor: 'gray' },
              ].map((item, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-dot-col">
                    <div className={`tl-dot ${item.dotColor}`} />
                    {i < 2 && <div className="tl-line" />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{item.slot}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--syne)', fontWeight: 700, color: 'var(--orange)' }}>{item.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Revenus 7 jours</div></div>
          <div className="card-body">
            <MiniBarChart data={chartData} />
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
  const rows = [
    { client: 'Thomas M.', date: 'Auj. 11:23', dur: '4 min 12s', amount: '€3.04', note: '★★★★★' },
    { client: 'Julie K.', date: 'Auj. 09:45', dur: '8 min 00s', amount: '€5.78', note: '★★★★★' },
    { client: 'Emma D.', date: 'Hier 16:10', dur: '11 min 34s', amount: '€8.36', note: '★★★★☆' },
  ];
  return (
    <div>
      <div className="page-eyebrow">Historique</div>
      <div className="page-title">Mes sessions</div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Client</th><th>Date</th><th>Durée</th><th>Montant reçu</th><th>Note</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.client}</strong></td>
                  <td style={{ color: 'var(--muted)' }}>{r.date}</td>
                  <td>{r.dur}</td>
                  <td><strong style={{ color: 'var(--green)' }}>{r.amount}</strong></td>
                  <td style={{ color: 'var(--amber)' }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── EXPERT PROFILE ───
export function ExpertProfile() {
  const { showToast } = useApp();
  return (
    <div>
      <div className="page-eyebrow">Mon profil</div>
      <div className="page-title">Paramètres expert</div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Informations</div></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Nom affiché</label><input className="form-input" defaultValue="Dr. Sarah Benali" /></div>
            <div className="form-group"><label className="form-label">Titre</label><input className="form-input" defaultValue="Médecin généraliste — 12 ans" /></div>
            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea className="form-input" rows="3" defaultValue="Médecin diplômée de Paris, spécialisée en médecine générale et préventive." />
            </div>
            <button className="btn btn-primary" onClick={() => showToast('Profil mis à jour ✓')}>Sauvegarder</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Tarification</div></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Tarif (€/minute)</label><input className="form-input" type="number" defaultValue="0.85" step="0.05" /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Min (min)</label><input className="form-input" type="number" defaultValue="3" /></div>
              <div className="form-group"><label className="form-label">Max (min)</label><input className="form-input" type="number" defaultValue="60" /></div>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => showToast('Tarifs mis à jour ✓', 'Vos nouveaux tarifs sont en ligne.')}>Mettre à jour</button>
          </div>
        </div>
      </div>
    </div>
  );
}
