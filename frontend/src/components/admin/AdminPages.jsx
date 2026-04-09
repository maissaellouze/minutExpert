import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { experts, liveSessions as liveSessionsData, clients, historyRows, payoutRows } from '../../data/mockData';

// AdminApplications est dans son propre fichier dédié
export { default as AdminApplications } from './AdminApplications';

// ─── MINI BAR CHART ───
function BarChart({ data, colors, height = 110, labels }) {
  const max = Math.max(...data);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <div title={`${v}`} style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${(v / max) * 100}%`, background: colors ? colors[i] : (i === data.length - 1 ? 'var(--orange)' : 'rgba(255,77,28,.35)'), transition: '.3s' }} />
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
          {labels.map((l, i) => <span key={i}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN OVERVIEW ───
export function AdminOverview() {
  const { setAdminPage } = useApp();
  const [seconds, setSeconds] = useState(0);
  const [liveRows, setLiveRows] = useState(liveSessionsData.map(s => ({ ...s })));

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds(s => s + 1);
      setLiveRows(prev => prev.map(s => ({ ...s, secs: s.secs + 1 })));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const lastUpdate = seconds < 60 ? `il y a ${seconds}s` : `il y a ${Math.floor(seconds / 60)}min`;
  const gmvData = [312, 289, 410, 380, 445, 390, 412];
  const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Auj'];

  const activityFeed = [
    { dot: 'orange', title: 'Thomas M.', sub: 'Session terminée avec Dr. Benali · €3.57', time: 'il y a 2 min' },
    { dot: 'green', title: 'Julie K.', sub: 'Nouvelle réservation — Me. Moreau · Jeudi 14h', time: 'il y a 5 min' },
    { dot: 'blue', title: 'Emma Chen', sub: 'Candidature expert déposée — Tech', time: 'il y a 12 min' },
    { dot: 'orange', title: 'Alexis R.', sub: 'Session démarrée avec Léa Fontaine', time: 'il y a 18 min' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div><div className="page-eyebrow">Administration</div><div className="page-title">Vue d'ensemble</div></div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Mis à jour <span>{lastUpdate}</span></div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid-4" style={{ marginBottom: 16 }}>
        <div className="stat c-orange"><div className="stat-label">GMV aujourd'hui</div><div className="stat-val orange">€412</div><div className="stat-sub">↑ +18% vs hier (€349)</div></div>
        <div className="stat c-green"><div className="stat-label">Commission générée</div><div className="stat-val green">€61.80</div><div className="stat-sub">15% du GMV</div></div>
        <div className="stat c-blue"><div className="stat-label">Sessions aujourd'hui</div><div className="stat-val blue">48</div><div className="stat-sub">3 en cours · Durée moy: 8.4 min</div></div>
        <div className="stat c-amber"><div className="stat-label">Candidatures en attente</div><div className="stat-val amber">3</div><div className="stat-sub">↑ 2 nouvelles aujourd'hui</div></div>
      </div>

      {/* KPI Row 2 */}
      <div className="grid-4" style={{ marginBottom: 22 }}>
        <div className="stat c-green"><div className="stat-label">Experts actifs</div><div className="stat-val green">12</div><div className="stat-sub">🟢 7 disponibles · 🟡 2 en session</div></div>
        <div className="stat c-blue"><div className="stat-label">Clients inscrits</div><div className="stat-val blue">1 284</div><div className="stat-sub">↑ +23 cette semaine</div></div>
        <div className="stat c-orange"><div className="stat-label">Note moyenne</div><div className="stat-val orange">4.93 ★</div><div className="stat-sub">sur 3 841 avis</div></div>
        <div className="stat c-amber"><div className="stat-label">GMV ce mois</div><div className="stat-val amber">€9 842</div><div className="stat-sub">Commission: €1 476</div></div>
      </div>

      <div className="grid-2">
        {/* Activity feed */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Activité récente</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setAdminPage('adm-history')}>Tout voir →</button>
          </div>
          <div className="card-body" style={{ padding: '0 20px' }}>
            <div className="tl">
              {activityFeed.map((a, i) => (
                <div key={i} className="tl-item" style={{ paddingBottom: 12 }}>
                  <div className="tl-dot-col">
                    <div className={`tl-dot ${a.dot}`} />
                    {i < activityFeed.length - 1 && <div className="tl-line" />}
                  </div>
                  <div style={{ flex: 1, paddingLeft: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.sub}</div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>{a.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GMV Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">GMV — 7 derniers jours</div>
            <div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>↑ +24% cette semaine</div>
          </div>
          <div className="card-body">
            <BarChart data={gmvData} labels={dayLabels} />
          </div>
        </div>
      </div>

      {/* Live sessions snapshot */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pulse" style={{ width: 7, height: 7 }} />
            <div className="card-title">Sessions en cours</div>
            <span className="badge badge-online" style={{ fontSize: 11 }}>{liveRows.length} live</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setAdminPage('adm-sessions')}>Superviser →</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Client</th><th>Expert</th><th>Domaine</th><th>Démarré</th><th>Durée</th><th>Coût actuel</th></tr></thead>
            <tbody>
              {liveRows.map((s, i) => {
                const m = Math.floor(s.secs / 60), sec = s.secs % 60;
                return (
                  <tr key={i}>
                    <td><strong>{s.client}</strong></td>
                    <td style={{ fontSize: 13 }}>{s.expert}</td>
                    <td>{s.domain}</td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>Il y a {s.startedAgo} min</td>
                    <td>{m}:{String(sec).padStart(2, '0')}</td>
                    <td><strong style={{ color: 'var(--orange)' }}>€{((s.secs / 60) * s.rate).toFixed(2)}</strong></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN ANALYTICS ───
export function AdminAnalytics() {
  const [period, setPeriod] = useState(7);
  const gmvData = [2800, 3100, 2950, 3400, 3250, 3600, 3900, 3700, 4100, 4300, 3950, 4500, 4200, 4600];
  const sessData = [38, 42, 35, 51, 47, 55, 58, 52, 61, 65, 59, 68, 64, 71];
  const domains = [
    { label: '⚕ Médical', pct: 38, color: 'var(--orange)' },
    { label: '⚖ Juridique', pct: 24, color: 'var(--blue)' },
    { label: '💻 Tech', pct: 19, color: 'var(--green)' },
    { label: '📈 Finance', pct: 13, color: 'var(--amber)' },
    { label: '🎨 Créatif', pct: 6, color: '#9b59b6' },
  ];
  const slicedGmv = gmvData.slice(-period);
  const slicedSess = sessData.slice(-period);

  return (
    <div>
      <div className="page-eyebrow">Métriques</div>
      <div className="page-title">Analytiques</div>
      <div className="page-sub">Performance de la plateforme sur les {period} derniers jours.</div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        {[7, 30, 90].map(d => (
          <button key={d} className={`btn btn-sm ${period === d ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriod(d)}>{d} jours</button>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-header"><div className="card-title">Évolution GMV</div><div style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>Total: €68 420</div></div>
          <div className="card-body"><BarChart data={slicedGmv} height={130} /></div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Sessions par jour</div><div style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Total: 1 284</div></div>
          <div className="card-body">
            <BarChart data={slicedSess} height={130}
              colors={slicedSess.map((_, i) => i === slicedSess.length - 1 ? 'var(--blue)' : 'rgba(26,92,255,.3)')} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Répartition par domaine</div></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {domains.map(d => (
                <div key={d.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span>{d.label}</span><span style={{ fontWeight: 700 }}>{d.pct}%</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${d.pct}%`, background: d.color }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Métriques clés</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Durée moyenne session', value: '8.4 min', delta: '↑ +0.8' },
              { label: 'Taux de rebooking', value: '43%', delta: '↑ +5%' },
              { label: 'Temps moyen 1ère session', value: '34 sec', delta: '↓ -8s' },
              { label: "Taux d'annulation", value: '2.1%', delta: '↓ -0.4%' },
            ].map(m => (
              <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{m.label}</div>
                  <div style={{ fontFamily: 'var(--syne)', fontSize: 22, fontWeight: 700 }}>{m.value}</div>
                </div>
                <div style={{ color: 'var(--green)', fontSize: 13, fontWeight: 600 }}>{m.delta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN EXPERTS LIST ───
export function AdminExperts() {
  const [search, setSearch] = useState('');
  const { showToast } = useApp();
  const filtered = experts.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="page-eyebrow">Gestion</div>
      <div className="page-title">Experts actifs</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input className="form-input" style={{ flex: 1 }} placeholder="🔍 Rechercher un expert…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input" style={{ width: 160 }}>
          <option>Tous domaines</option><option>⚕ Médical</option><option>⚖ Juridique</option><option>💻 Tech</option>
        </select>
        <select className="form-input" style={{ width: 140 }}>
          <option>Tous statuts</option><option>🟢 En ligne</option><option>🟡 En session</option><option>🔴 Hors ligne</option>
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(e => (
          <div key={e.id} className="card">
            <div className="card-body" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: e.color, color: e.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{e.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{e.name}</div>
                    <span className={`badge ${e.status === 'online' ? 'badge-online' : 'badge-busy'}`}>{e.status === 'online' ? '🟢 En ligne' : '🟡 En session'}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{e.title} · €{e.rate.toFixed(2)}/min · {e.rating} ★ ({e.reviews} avis)</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => showToast('Profil expert', `Édition de ${e.name}`)}>Éditer</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => showToast('Expert suspendu', `${e.name} a été suspendu.`)}>Suspendre</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN CLIENTS ───
export function AdminClients() {
  return (
    <div>
      <div className="page-eyebrow">Utilisateurs</div>
      <div className="page-title">Clients inscrits</div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <input className="form-input" style={{ flex: 1 }} placeholder="🔍 Rechercher par nom ou email…" />
        <select className="form-input" style={{ width: 160 }}>
          <option>Tous</option><option>Actifs (30j)</option><option>Nouveaux (7j)</option><option>Inactifs</option>
        </select>
      </div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Client</th><th>Inscrit</th><th>Sessions</th><th>Dépensé total</th><th>Dernière session</th><th>Statut</th><th></th></tr></thead>
            <tbody>
              {clients.map((c, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: c.color, color: c.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{c.init}</div>
                      <div><div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.email}</div></div>
                    </div>
                  </td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>{c.date}</td>
                  <td style={{ fontWeight: 600 }}>{c.sessions}</td>
                  <td><strong style={{ color: 'var(--orange)' }}>{c.spent}</strong></td>
                  <td style={{ fontSize: 13, color: 'var(--muted)' }}>{c.last}</td>
                  <td><span className={`badge ${c.status === 'VIP' ? 'badge-approved' : 'badge-online'}`}>{c.status === 'VIP' ? '⭐ VIP' : 'Actif'}</span></td>
                  <td><button className="btn btn-ghost btn-sm">Voir →</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN LIVE SESSIONS ───
export function AdminLiveSessions() {
  const { showToast } = useApp();
  const [rows, setRows] = useState(liveSessionsData.map(s => ({ ...s })));

  useEffect(() => {
    const t = setInterval(() => setRows(prev => prev.map(s => ({ ...s, secs: s.secs + 1 }))), 1000);
    return () => clearInterval(t);
  }, []);

  const totalGmv = rows.reduce((a, s) => a + (s.secs / 60) * s.rate, 0);
  const totalSecs = rows.reduce((a, s) => a + s.secs, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div><div className="page-eyebrow">Temps réel</div><div className="page-title">Sessions en cours</div></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="pulse" />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>{rows.length} sessions actives</span>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 22 }}>
        <div className="stat c-orange"><div className="stat-label">GMV live</div><div className="stat-val orange">€{totalGmv.toFixed(2)}</div><div className="stat-sub">en cours</div></div>
        <div className="stat c-green"><div className="stat-label">Durée totale</div><div className="stat-val green">{Math.floor(totalSecs / 60)}:{String(totalSecs % 60).padStart(2, '0')}</div><div className="stat-sub">cumulé</div></div>
        <div className="stat c-blue"><div className="stat-label">Commission live</div><div className="stat-val blue">€{(totalGmv * 0.15).toFixed(2)}</div><div className="stat-sub">15%</div></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map((s, i) => {
          const m = Math.floor(s.secs / 60), sec = s.secs % 60;
          const cost = (s.secs / 60) * s.rate;
          const pct = Math.min((s.secs / (30 * 60)) * 100, 100);
          return (
            <div key={i} className="card" style={{ borderLeft: '4px solid var(--orange)' }}>
              <div className="card-body" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: s.clientColor, color: s.clientTc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{s.clientInit}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{s.client}</div>
                      <span style={{ color: 'var(--muted)', fontSize: 13 }}>avec</span>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{s.expert}</div>
                      <span className="badge badge-online" style={{ fontSize: 10 }}><div className="pulse" style={{ width: 5, height: 5 }} />Live</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{s.domain} · Tarif: €{s.rate.toFixed(2)}/min · Démarré il y a {s.startedAgo} min</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--syne)', fontSize: 24, fontWeight: 800, color: 'var(--orange)' }}>€{cost.toFixed(2)}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m}:{String(sec).padStart(2, '0')} écoulées</div>
                  </div>
                  <button className="btn btn-red btn-sm" onClick={() => showToast('Session interrompue', "La session a été arrêtée par l'admin.")}>Interrompre</button>
                </div>
                <div className="bar-track" style={{ marginTop: 12 }}>
                  <div className="bar-fill" style={{ width: `${pct}%`, background: 'var(--orange)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ADMIN HISTORY ───
export function AdminHistory() {
  return (
    <div>
      <div className="page-eyebrow">Registre</div>
      <div className="page-title">Historique des sessions</div>
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Client</th><th>Expert</th><th>Domaine</th><th>Date</th><th>Durée</th><th>Montant</th><th>Commission</th><th>Note</th></tr></thead>
            <tbody>
              {historyRows.map((r, i) => (
                <tr key={i}>
                  <td><strong>{r.client}</strong></td>
                  <td style={{ fontSize: 13 }}>{r.expert}</td>
                  <td>{r.domain}</td>
                  <td style={{ fontSize: 12, color: 'var(--muted)' }}>{r.date}</td>
                  <td>{r.dur}</td>
                  <td><strong style={{ color: 'var(--orange)' }}>{r.amount}</strong></td>
                  <td><strong style={{ color: 'var(--green)' }}>{r.comm}</strong></td>
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

// ─── ADMIN FINANCE ───
export function AdminFinance() {
  const { showToast } = useApp();
  return (
    <div>
      <div className="page-eyebrow">Finance</div>
      <div className="page-title">Revenus & Commissions</div>

      <div className="grid-4" style={{ marginBottom: 22 }}>
        <div className="stat c-orange"><div className="stat-label">GMV total</div><div className="stat-val orange">€68 420</div><div className="stat-sub">Depuis le lancement</div></div>
        <div className="stat c-green"><div className="stat-label">Commissions</div><div className="stat-val green">€10 263</div><div className="stat-sub">15% du GMV</div></div>
        <div className="stat c-blue"><div className="stat-label">Payouts experts</div><div className="stat-val blue">€58 157</div><div className="stat-sub">85% du GMV</div></div>
        <div className="stat c-amber"><div className="stat-label">En attente</div><div className="stat-val amber">€2 140</div><div className="stat-sub">4 experts</div></div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Paiements experts en attente</div>
          <button className="btn btn-primary btn-sm" onClick={() => showToast('Paiements lancés ✓', 'Les virements ont été initiés.')}>Tout payer →</button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <table className="table">
            <thead><tr><th>Expert</th><th>Sessions</th><th>GMV généré</th><th>Commission (15%)</th><th>À payer (85%)</th><th>Statut</th></tr></thead>
            <tbody>
              {payoutRows.map((p, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, color: p.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{p.init}</div>
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td>{p.sessions} sessions</td>
                  <td><strong>{p.gmv}</strong></td>
                  <td style={{ color: 'var(--orange)' }}>{p.comm}</td>
                  <td><strong style={{ color: 'var(--green)', fontFamily: 'var(--syne)', fontSize: 15 }}>{p.payout}</strong></td>
                  <td><span className="badge badge-pending">En attente</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN SETTINGS ───
export function AdminSettings() {
  const { showToast } = useApp();
  return (
    <div>
      <div className="page-eyebrow">Système</div>
      <div className="page-title">Paramètres plateforme</div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><div className="card-title">Commissions</div></div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Taux de commission (%)</label><input className="form-input" type="number" defaultValue="15" step="1" /></div>
            <div className="form-group"><label className="form-label">Paiement minimum expert (€)</label><input className="form-input" type="number" defaultValue="10" step="1" /></div>
            <button className="btn btn-primary" onClick={() => showToast('Paramètres sauvegardés ✓')}>Sauvegarder</button>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><div className="card-title">Équipe admin</div></div>
          <div className="card-body">
            {[
              { init: 'AP', name: 'Admin Principal', email: 'admin@minutexpert.com', color: '#f8cecc', tc: '#b85450', role: 'Super Admin' },
              { init: 'SC', name: 'Sophie C.', email: 'sophie@minutexpert.com', color: '#dae8fc', tc: '#1a5cff', role: 'Modérateur' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i === 0 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: m.color, color: m.tc, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--syne)', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{m.init}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{m.email}</div>
                </div>
                <span className="badge badge-pending">{m.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
