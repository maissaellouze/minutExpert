import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

export default function SessionScreen() {
  const { sessExpert, sessDur, navigate, setClientPage, showToast } = useApp();
  const [secs, setSecs] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatMsgs, setChatMsgs] = useState([{ me: false, text: 'Bonjour ! Je suis prête, comment puis-je vous aider ?' }]);
  const [chatInput, setChatInput] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const chatRef = useRef(null);
  const maxSecs = (sessDur || 10) * 60;
  const expert = sessExpert;

  useEffect(() => {
    const t = setInterval(() => {
      setSecs(s => {
        if (s + 1 >= maxSecs) { clearInterval(t); setShowEndModal(true); return s + 1; }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [maxSecs]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chatMsgs]);

  const m = Math.floor(secs / 60), s = secs % 60;
  const cost = secs * ((expert?.rate || 0.85) / 60);
  const pct = (secs / maxSecs) * 100;
  const rem = maxSecs - secs;
  const rm = Math.floor(rem / 60), rs = rem % 60;
  const timerClass = `timer-big${pct > 80 ? ' danger' : pct > 60 ? ' warn' : ''}`;
  const barColor = pct > 80 ? 'var(--orange)' : pct > 60 ? 'var(--amber)' : 'var(--green)';

  const endSession = () => setShowEndModal(true);

  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChatMsgs(prev => [...prev, { me: true, text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMsgs(prev => [...prev, { me: false, text: 'Bien reçu, je vous réponds dans un instant…' }]);
    }, 1200);
  };

  const extend = () => { showToast('Session prolongée', '5 minutes supplémentaires ajoutées.'); };

  const finishSession = () => {
    setShowEndModal(false);
    setClientPage('client-home');
    navigate('client');
    showToast('Session terminée ✓', `€${cost.toFixed(2)} facturés · Merci !`);
  };

  return (
    <div>
      <nav className="app-nav">
        <div className="app-logo"><div className="pulse" />Minute<span>Expert</span></div>
        <div className="app-nav-right">
          <button className="btn btn-ghost btn-sm" onClick={endSession}>Terminer la session</button>
        </div>
      </nav>

      <div style={{ padding: '80px 32px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <div>
            <div className="page-eyebrow">Session en cours</div>
            <div className="page-title" style={{ marginBottom: 0 }}>{expert?.name || 'Dr. Sarah Benali'}</div>
          </div>
        </div>

        <div className="session-layout">
          {/* Left: video + chat */}
          <div>
            <div className="video-box">
              <div className="vid-placeholder">
                <div style={{ fontSize: 40, marginBottom: 8 }}>📹</div>
                <div style={{ fontSize: 14 }}>WebRTC peer-to-peer</div>
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.5 }}>simulation prototype</div>
              </div>
              <div className="vid-pip">👤</div>
              <div className="vid-controls">
                <button className={`vc-btn ${micOn ? 'normal' : ''}`}
                  style={!micOn ? { background: 'var(--red)', color: '#fff' } : {}}
                  onClick={() => { setMicOn(v => !v); showToast(micOn ? '🔇 Micro coupé' : '🎤 Micro activé'); }}>
                  {micOn ? '🎤' : '🔇'}
                </button>
                <button className={`vc-btn ${camOn ? 'normal' : ''}`}
                  style={!camOn ? { background: 'var(--red)', color: '#fff' } : {}}
                  onClick={() => { setCamOn(v => !v); showToast(camOn ? '📵 Caméra désactivée' : '📷 Caméra activée'); }}>
                  {camOn ? '📷' : '📵'}
                </button>
                <button className="vc-btn end-btn" onClick={endSession}>📵</button>
              </div>
            </div>

            <div className="chat-box">
              <div className="chat-msgs" ref={chatRef}>
                {chatMsgs.map((msg, i) => (
                  <div key={i} className={`cmsg ${msg.me ? 'me' : 'them'}`}>{msg.text}</div>
                ))}
              </div>
              <div className="chat-in">
                <input
                  placeholder="Écrire un message…"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                />
                <button className="chat-send" onClick={sendChat}>Envoyer</button>
              </div>
            </div>
          </div>

          {/* Right: timer panel */}
          <div>
            <div className="timer-panel">
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10 }}>Temps écoulé</div>
              <div className={timerClass}>{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}</div>
              <div className="timer-cost">€{cost.toFixed(2)}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginBottom: 12 }}>facturé jusqu'ici</div>
              <div className="bar-track">
                <div className="bar-fill" id="timer-bar" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
              </div>
              <hr className="div" />
              <div className="info-row"><span className="lbl">Expert</span><span className="val">{expert?.name || '—'}</span></div>
              <div className="info-row"><span className="lbl">Tarif</span><span className="val">€{(expert?.rate || 0.85).toFixed(2)}/min</span></div>
              <div className="info-row"><span className="lbl">Durée max</span><span className="val">{sessDur || 10} min</span></div>
              <div className="info-row">
                <span className="lbl" style={{ color: 'var(--green)' }}>Restant</span>
                <span className="val" style={{ color: barColor }}>{String(rm).padStart(2, '0')}:{String(rs).padStart(2, '0')}</span>
              </div>
              <button className="btn btn-ghost btn-full" style={{ marginTop: 12 }} onClick={extend}>+ Prolonger 5 min</button>
            </div>
          </div>
        </div>
      </div>

      {/* End session modal */}
      {showEndModal && (
        <div className="modal-bg open">
          <div className="modal">
            <div className="modal-title">Session terminée !</div>
            <div className="modal-sub">Merci d'avoir utilisé MinuteExpert</div>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 20, textAlign: 'center', marginBottom: 18 }}>
              <div style={{ fontFamily: 'var(--syne)', fontSize: 44, fontWeight: 800, color: 'var(--orange)' }}>€{cost.toFixed(2)}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>{m} min {s} sec</div>
            </div>
            <div className="form-group">
              <label className="form-label">Votre note</label>
              <div style={{ display: 'flex', gap: 8, fontSize: 30, cursor: 'pointer', marginBottom: 8 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <span key={n}
                    style={{ color: n <= (hoverRating || rating) ? 'var(--amber)' : 'inherit' }}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(n)}>
                    {n <= (hoverRating || rating) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <textarea className="form-input" rows="2" placeholder="Partagez votre expérience…" />
            </div>
            <button className="btn btn-primary btn-full" onClick={finishSession}>Terminer →</button>
          </div>
        </div>
      )}
    </div>
  );
}
