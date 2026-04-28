import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { sessionAPI } from '../../services/api';

export default function ExpertSessionScreen() {
  const { navigate, setExpertPage, showToast } = useApp();

  // Retrieve session data stored by ExpertDash when expert accepted
  const sessionData = (typeof window !== 'undefined' && window.__expertSessionData) || {};
  const { bookingId, meetingLink, clientName } = sessionData;

  const [secs, setSecs] = useState(0);
  const [ending, setEnding] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const timerRef = useRef(null);

  // Start timer
  useEffect(() => {
    timerRef.current = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleEnd = useCallback(async () => {
    clearInterval(timerRef.current);
    setEnding(true);
    try {
      if (bookingId) {
        await sessionAPI.end(bookingId);
      }
      showToast('Session terminée ✓', 'Le paiement a été traité automatiquement.');
    } catch (err) {
      showToast('Session terminée', err.message || 'Paiement traité.');
    }
    // Clear session data
    if (typeof window !== 'undefined') window.__expertSessionData = null;
    navigate('expert');
    setExpertPage('expert-dash');
  }, [bookingId]);

  const m = Math.floor(secs / 60), s = secs % 60;

  return (
    <div>
      <nav className="app-nav">
        <div className="app-logo"><div className="pulse" />Minute<span>Expert</span></div>
        <div className="app-nav-right">
          <span style={{ fontSize: 13, color: 'var(--muted)', marginRight: 16 }}>
            Session avec {clientName || 'Client'}
          </span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={handleEnd}
            disabled={ending}>
            {ending ? 'Clôture…' : 'Terminer la session'}
          </button>
        </div>
      </nav>

      <div style={{ padding: '80px 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <div className="page-eyebrow">Session en cours</div>
            <div className="page-title" style={{ marginBottom: 0 }}>avec {clientName || 'Client'}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="pulse" style={{ width: 8, height: 8 }} />
            <span style={{ fontFamily: 'var(--syne)', fontWeight: 700, fontSize: 22, color: 'var(--orange)' }}>
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* Jitsi iframe */}
        {meetingLink ? (
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid var(--border)', height: 500, marginBottom: 20 }}>
            <iframe
              src={meetingLink}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title="Session vidéo expert"
            />
          </div>
        ) : (
          <div className="video-box" style={{ marginBottom: 20 }}>
            <div className="vid-placeholder">
              <div style={{ fontSize: 40, marginBottom: 8 }}>📹</div>
              <div>Chargement de la vidéo…</div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="vc-btn" style={!micOn ? { background: 'var(--red)', color: '#fff' } : {}}
            onClick={() => { setMicOn(v => !v); showToast(micOn ? '🔇 Micro coupé' : '🎤 Micro activé'); }}>
            {micOn ? '🎤' : '🔇'}
          </button>
          <button className="vc-btn" style={!camOn ? { background: 'var(--red)', color: '#fff' } : {}}
            onClick={() => { setCamOn(v => !v); showToast(camOn ? '📵 Caméra off' : '📷 Caméra on'); }}>
            {camOn ? '📷' : '📵'}
          </button>
          <button className="vc-btn end-btn" onClick={handleEnd} disabled={ending}>📵</button>
        </div>
      </div>
    </div>
  );
}
