import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { sessionAPI } from '../../services/api';

// ─── PHASES ───
// 'waiting'   → client a cliqué Rejoindre, attend que l'expert accepte
// 'in_progress' → expert a accepté, Jitsi + compteur actifs
// 'ended'     → session terminée, modal de notation

export default function SessionScreen() {
  const { sessExpert, sessDur, sessBookingId, navigate, setClientPage, showToast, currentUser } = useApp();
  const expert = sessExpert;
  const bookingId = sessBookingId;

  // ─── State ───────────────────────────────────────────
  const [phase, setPhase]           = useState('waiting'); // 'waiting' | 'in_progress' | 'ended'
  const [secs, setSecs]             = useState(0);
  const [meetingLink, setMeetingLink] = useState(null);
  const [startTime, setStartTime]   = useState(null);
  const [sessionResult, setSessionResult] = useState(null); // from /sessions/end/
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [micOn, setMicOn]           = useState(true);
  const [camOn, setCamOn]           = useState(true);

  const pollingRef = useRef(null);
  const timerRef  = useRef(null);

  const maxSecs = (sessDur || 10) * 60;

  // ─── Step 1: Tell backend client is ready (sets waiting_expert) ───────
  useEffect(() => {
    if (!bookingId) return;
    sessionAPI.start(bookingId).catch(err => {
      // Ignore if already waiting_expert or in_progress
      console.warn('session start:', err.message);
    });
  }, [bookingId]);

  // ─── Step 2: Poll until expert accepts ────────────────────────────────
  useEffect(() => {
    if (phase !== 'waiting' || !bookingId) return;

    pollingRef.current = setInterval(async () => {
      try {
        const data = await sessionAPI.getStatus(bookingId);
        if (data.status === 'in_progress' && data.meeting_link) {
          clearInterval(pollingRef.current);
          setMeetingLink(data.meeting_link);
          setStartTime(data.start_time ? new Date(data.start_time) : new Date());
          setPhase('in_progress');
          showToast('Expert connecté !', 'La session a démarré.');
        } else if (data.status === 'cancelled') {
          clearInterval(pollingRef.current);
          const reason = data.rejection_reason || "L'expert a refusé la session.";
          showToast('Session refusée', reason);
          navigate('client');
          setClientPage('client-history');
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 4000); // every 4 seconds

    return () => clearInterval(pollingRef.current);
  }, [phase, bookingId]);

  // ─── Step 3: Real timer once session starts ────────────────────────────
  useEffect(() => {
    if (phase !== 'in_progress') return;

    timerRef.current = setInterval(() => {
      setSecs(s => {
        if (s + 1 >= maxSecs) {
          clearInterval(timerRef.current);
          handleEndSession();
          return s + 1;
        }
        return s + 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase, maxSecs]);

  // ─── End session ──────────────────────────────────────────────────────
  const handleEndSession = useCallback(async () => {
    clearInterval(timerRef.current);
    if (!bookingId) {
      setPhase('ended');
      return;
    }
    try {
      const result = await sessionAPI.end(bookingId);
      setSessionResult(result);
    } catch (err) {
      console.warn('End session error:', err.message);
    }
    setPhase('ended');
  }, [bookingId]);

  // ─── Submit review ─────────────────────────────────────────────────────
  const handleSubmitReview = async () => {
    if (rating === 0) { showToast('Note requise', 'Veuillez sélectionner une note.'); return; }
    setSubmitting(true);
    try {
      if (bookingId) {
        await sessionAPI.submitReview({ booking: bookingId, rating, comment });
        showToast('Merci pour votre avis ✓', `Session notée ${rating}/5`);
        setSubmitting(false);
        setClientPage('client-history');
        navigate('client');
      }
    } catch (err) {
      setSubmitting(false);
      showToast('Erreur', err.message);
      console.warn('Review error:', err.message);
    }
  };

  // ─── Computed display ──────────────────────────────────────────────────
  const m = Math.floor(secs / 60), s = secs % 60;
  const cost = secs * ((expert?.rate || 0.85) / 60);
  const pct = (secs / maxSecs) * 100;
  const rem = maxSecs - secs;
  const rm = Math.floor(rem / 60), rs = rem % 60;
  const barColor = pct > 80 ? 'var(--orange)' : pct > 60 ? 'var(--amber)' : 'var(--green)';

  // ─── PHASE: WAITING ────────────────────────────────────────────────────
  if (phase === 'waiting') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          {/* Avatar */}
          <div style={{
            width: 88, height: 88, borderRadius: 22, margin: '0 auto 24px',
            background: expert?.color || '#e0f2fe', color: expert?.tc || '#0284c7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--syne)', fontWeight: 800, fontSize: 36
          }}>
            {expert?.init || 'E'}
          </div>

          {/* Spinner */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: 'var(--orange)',
                animation: `pulse-dot 1.2s ${i * 0.3}s infinite ease-in-out`
              }} />
            ))}
          </div>

          <div className="page-title" style={{ marginBottom: 8 }}>En attente de {expert?.name || 'l\'expert'}…</div>
          <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 32 }}>
            Votre demande a été envoyée. L'expert va accepter la session dans quelques instants.
          </div>

          <div className="card" style={{ textAlign: 'left', marginBottom: 24 }}>
            <div className="card-body">
              <div className="info-row"><span className="lbl">Expert</span><span className="val">{expert?.name}</span></div>
              <div className="info-row"><span className="lbl">Spécialité</span><span className="val">{expert?.title}</span></div>
              <div className="info-row"><span className="lbl">Durée max</span><span className="val">{sessDur} min</span></div>
              <div className="info-row"><span className="lbl">Tarif</span><span className="val">€{(expert?.rate || 0.85).toFixed(2)}/min</span></div>
            </div>
          </div>

          <button className="btn btn-ghost btn-full" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={() => { navigate('client'); setClientPage('client-history'); }}>
            ✕ Annuler
          </button>
        </div>

        <style>{`
          @keyframes pulse-dot {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ─── PHASE: IN PROGRESS ────────────────────────────────────────────────
  if (phase === 'in_progress') {
    return (
      <div>
        <nav className="app-nav">
          <div className="app-logo"><div className="pulse" />Minute<span>Expert</span></div>
          <div className="app-nav-right">
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
              onClick={handleEndSession}>Terminer la session</button>
          </div>
        </nav>

        <div style={{ padding: '80px 32px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
            <div>
              <div className="page-eyebrow">Session en cours</div>
              <div className="page-title" style={{ marginBottom: 0 }}>{expert?.name || 'Expert'}</div>
            </div>
            <span className="badge badge-online" style={{ fontSize: 13 }}>
              <div className="pulse" style={{ width: 7, height: 7 }} /> Live
            </span>
          </div>

          <div className="session-layout">
            {/* Left: Jitsi iframe */}
            <div>
              {meetingLink ? (
                <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid var(--border)', height: 420, position: 'relative' }}>
                  <iframe
                    src={meetingLink}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    title="Session vidéo"
                  />
                </div>
              ) : (
                <div className="video-box">
                  <div className="vid-placeholder">
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📹</div>
                    <div style={{ fontSize: 14 }}>Connexion vidéo…</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'center' }}>
                <button className="vc-btn" style={!micOn ? { background: 'var(--red)', color: '#fff' } : {}}
                  onClick={() => { setMicOn(v => !v); showToast(micOn ? '🔇 Micro coupé' : '🎤 Micro activé'); }}>
                  {micOn ? '🎤' : '🔇'}
                </button>
                <button className="vc-btn" style={!camOn ? { background: 'var(--red)', color: '#fff' } : {}}
                  onClick={() => { setCamOn(v => !v); showToast(camOn ? '📵 Caméra off' : '📷 Caméra on'); }}>
                  {camOn ? '📷' : '📵'}
                </button>
                <button className="vc-btn end-btn" onClick={handleEndSession}>📵</button>
              </div>
            </div>

            {/* Right: timer panel */}
            <div>
              <div className="timer-panel">
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Temps écoulé</div>
                <div className={`timer-big${pct > 80 ? ' danger' : pct > 60 ? ' warn' : ''}`}>
                  {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
                </div>
                <div className="timer-cost">€{cost.toFixed(2)}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 12 }}>facturé jusqu'ici</div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                </div>
                <hr className="div" />
                <div className="info-row"><span className="lbl">Expert</span><span className="val">{expert?.name || '—'}</span></div>
                <div className="info-row"><span className="lbl">Tarif</span><span className="val">€{(expert?.rate || 0.85).toFixed(2)}/min</span></div>
                <div className="info-row"><span className="lbl">Durée max</span><span className="val">{sessDur || 10} min</span></div>
                <div className="info-row">
                  <span className="lbl" style={{ color: 'var(--green)' }}>Restant</span>
                  <span className="val" style={{ color: barColor }}>{String(rm).padStart(2, '0')}:{String(rs).padStart(2, '0')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── PHASE: ENDED — Notation ──────────────────────────────────────────
  return (
    <div className="modal-bg open">
      <div className="modal" style={{ maxWidth: 480, width: '90%' }}>
        <div className="modal-title">Session terminée !</div>
        <div className="modal-sub">Merci d'avoir utilisé MinuteExpert</div>

        {/* Summary card */}
        <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontFamily: 'var(--syne)', fontSize: 44, fontWeight: 800, color: 'var(--orange)' }}>
            {sessionResult ? `€${sessionResult.total_price}` : `€${cost.toFixed(2)}`}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
            {sessionResult ? `${sessionResult.duration_min} min` : `${m} min ${s} sec`} · Facturé exactement
          </div>
          {sessionResult && (
            <div style={{ fontSize: 12, color: 'var(--green)', marginTop: 6 }}>
              Nouveau solde : €{sessionResult.nouveau_solde_client}
            </div>
          )}
        </div>

        {/* Star rating */}
        <div className="form-group">
          <label className="form-label">Notez votre expérience avec {expert?.name}</label>
          <div style={{ display: 'flex', gap: 8, fontSize: 34, cursor: 'pointer', marginBottom: 10, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <span key={n}
                style={{ color: n <= (hoverRating || rating) ? 'var(--amber)' : 'var(--border)', transition: '.15s' }}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(n)}>
                {n <= (hoverRating || rating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <textarea
            className="form-input"
            rows="2"
            placeholder="Partagez votre expérience (optionnel)…"
            value={comment}
            onChange={e => setComment(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleSubmitReview}
          disabled={submitting}
          style={{ marginTop: 8 }}>
          {submitting ? 'Envoi…' : 'Valider et terminer →'}
        </button>

        <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }}
          onClick={() => { setClientPage('client-home'); navigate('client'); }}>
          Passer cette étape
        </button>
      </div>
    </div>
  );
}
