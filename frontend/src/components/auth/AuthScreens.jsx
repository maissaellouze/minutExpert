import { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { expertAPI } from '../../services/api';

// ════════════════════════════════════════════
//  LOGIN SCREEN
// ════════════════════════════════════════════
export function LoginScreen() {
  const { navigate, login, authLoading, authError, setAuthError } = useApp();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email || !password) { setAuthError('Veuillez remplir tous les champs.'); return; }
    await login({ email, password });
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo"><div className="pulse" />Minute<span>Expert</span></div>
        <div className="auth-title">Bon retour !</div>
        <div className="auth-sub">Connectez-vous à votre compte</div>

        {/* Erreur backend */}
        {authError && (
          <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--red)' }}>
            ⚠ {authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="votre@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <div className="form-hint" style={{ marginTop: 6 }}>
              <a style={{ color: 'var(--orange)', cursor: 'pointer' }}>Mot de passe oublié ?</a>
            </div>
          </div>

          <button
            className="btn btn-primary btn-full"
            type="submit"
            disabled={authLoading}
            style={{ marginBottom: 10 }}
          >
            {authLoading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <div className="auth-switch">
          Pas encore de compte ?{' '}
          <a onClick={() => { setAuthError(''); navigate('register'); }}>S'inscrire gratuitement</a>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════
//  REGISTER SCREEN
// ════════════════════════════════════════════
export function RegisterScreen() {
  const { navigate, signupClient, authLoading, authError, setAuthError, showToast } = useApp();

  const [step, setStep] = useState(0);   // 0 = rôle | 1 = infos | 2 = expert details
  const [role, setRole] = useState(null);

  // Champs communs (step 1)
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [username,  setUsername]  = useState('');
  const [password,  setPassword]  = useState('');

  // Champs expert (step 2)
  const [category,  setCategory]  = useState('1');
  const [cvFile,    setCvFile]    = useState(null);
  const [bio,       setBio]       = useState('');
  const [expertLoading, setExpertLoading] = useState(false);
  const [expertError,   setExpertError]   = useState('');
  const fileRef = useRef();

  const dots = [0, 1, 2];

  const nextStep = () => {
    setAuthError('');
    if (step === 0 && !role) {
      showToast('Choisissez un rôle', 'Sélectionnez Client ou Expert.');
      return;
    }
    if (step === 1) {
      if (!firstName || !lastName || !email || !password) {
        setAuthError('Tous les champs sont obligatoires.');
        return;
      }
      if (password.length < 8) {
        setAuthError('Le mot de passe doit contenir au moins 8 caractères.');
        return;
      }
    }
    setStep(s => Math.min(s + 1, 2));
  };

  const prevStep = () => { setAuthError(''); setExpertError(''); setStep(s => Math.max(s - 1, 0)); };

  // ── Soumission Client (appel réel Django) ─────────────────────────────────
  const handleClientSignup = async (e) => {
    e.preventDefault();
    await signupClient({
      email,
      username: username || email.split('@')[0],
      password,
      first_name: firstName,
      last_name:  lastName,
    });
  };

  // ── Soumission Expert request (multipart) ─────────────────────────────────
 const handleExpertRequest = async () => {
  if (!cvFile) { 
    setExpertError('Veuillez uploader votre CV / diplôme.'); 
    return; 
  }
  
  setExpertLoading(true);
  setExpertError('');
  
  try {
    const fd = new FormData();
    // Utilise les noms exacts de ton modèle Django
    fd.append('first_name', firstName);
    fd.append('last_name', lastName);
    fd.append('email', email);
    fd.append('category', parseInt(category)); // On s'assure que c'est un entier
    fd.append('languages', JSON.stringify(['fr'])); // Sera parsé par le Serializer
    
    // Ton champ dans models.py s'appelle diploma_file
    fd.append('diploma_file', cvFile); 

    // ❌ SUPPRIME CETTE LIGNE (cv_url n'existe pas dans ton modèle)
    // fd.append('cv_url', 'https://placeholder.cv'); 

    await expertAPI.submitRequest(fd);
    
    showToast('Candidature envoyée ✓', 'Notre équipe examine votre dossier sous 24h.');
    setTimeout(() => navigate('login'), 1800);
  } catch (err) {
    // Si c'est une 400, err.response contiendra les détails des champs qui bloquent
    setExpertError(err.message || 'Erreur lors de l\'envoi.');
  } finally {
    setExpertLoading(false);
  }
};

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo"><div className="pulse" />Minute<span>Expert</span></div>
        <div className="auth-title">Créer un compte</div>
        <div className="auth-sub">Rejoignez MinuteExpert en quelques minutes</div>

        {/* Step dots */}
        <div className="step-indicator">
          {dots.map(i => (
            <div key={i} className={`step-dot${i < step ? ' done' : i === step ? ' active' : ''}`} />
          ))}
        </div>

        {/* ─── STEP 0 : Choix du rôle ─── */}
        {step === 0 && (
          <div>
            <div className="form-group">
              <label className="form-label">Vous êtes…</label>
              <div className="role-selector">
                <div className={`role-opt${role === 'client' ? ' selected' : ''}`} onClick={() => setRole('client')}>
                  <div className="role-icon">👤</div>
                  <div className="role-name">Client</div>
                  <div className="role-desc">Je cherche un expert</div>
                </div>
                <div className={`role-opt${role === 'expert' ? ' selected' : ''}`} onClick={() => setRole('expert')}>
                  <div className="role-icon">🧠</div>
                  <div className="role-name">Expert</div>
                  <div className="role-desc">Je partage mon expertise</div>
                </div>
              </div>
            </div>
            <button className="btn btn-primary btn-full" disabled={!role} onClick={nextStep}>
              Continuer →
            </button>
            <div className="auth-switch">
              Déjà un compte ? <a onClick={() => navigate('login')}>Se connecter</a>
            </div>
          </div>
        )}

        {/* ─── STEP 1 : Infos communes ─── */}
        {step === 1 && (
          <div>
            {authError && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--red)' }}>
                ⚠ {authError}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input className="form-input" placeholder="Marie" value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input className="form-input" placeholder="Dupont" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="votre@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            {role === 'client' && (
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <input className="form-input" placeholder="marie_dupont" value={username} onChange={e => setUsername(e.target.value)} />
                <div className="form-hint">Laissez vide pour utiliser votre email</div>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input className="form-input" type="password" placeholder="8 caractères minimum" value={password} onChange={e => setPassword(e.target.value)} />
              <div className="form-hint">Minimum 8 caractères</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={prevStep}>← Retour</button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={nextStep}>
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 2 CLIENT : Compte créé, envoi API ─── */}
        {step === 2 && role === 'client' && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontFamily: 'var(--syne)', fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              Presque terminé !
            </div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 22 }}>
              Cliquez ci-dessous pour finaliser votre inscription.
            </div>
            {authError && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--red)', textAlign: 'left' }}>
                ⚠ {authError}
              </div>
            )}
            <button className="btn btn-primary btn-full" disabled={authLoading} onClick={handleClientSignup}>
              {authLoading ? 'Création du compte…' : 'Créer mon compte →'}
            </button>
            <button className="btn btn-ghost btn-full" style={{ marginTop: 10 }} onClick={prevStep}>← Retour</button>
          </div>
        )}

        {/* ─── STEP 2 EXPERT : Candidature avec upload CV ─── */}
        {step === 2 && role === 'expert' && (
          <div>
            {expertError && (
              <div style={{ background: 'var(--red-dim)', border: '1px solid var(--red)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: 'var(--red)' }}>
                ⚠ {expertError}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Domaine d'expertise</label>
              <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="1">⚕ Médical</option>
                <option value="2">⚖ Juridique</option>
                <option value="3">💻 Tech &amp; Dev</option>
                <option value="4">📈 Finance</option>
                <option value="5">🎨 Créatif</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bio courte</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Votre expérience en 2-3 phrases…"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            </div>

            {/* Upload CV / Diplôme */}
            <div
              className="upload-zone"
              onClick={() => fileRef.current?.click()}
              style={cvFile ? { borderColor: 'var(--green)', background: 'var(--green-dim)' } : {}}
            >
              <div style={{ fontSize: 28, marginBottom: 6 }}>
                {cvFile ? '✅' : '📄'}
              </div>
              <div style={{ fontSize: 14, color: cvFile ? 'var(--green)' : 'var(--muted)', fontWeight: cvFile ? 600 : 400 }}>
                {cvFile ? cvFile.name : 'Cliquer pour uploader votre CV / diplôme'}
              </div>
              {cvFile && (
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {(cvFile.size / 1024).toFixed(0)} Ko
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files[0]) setCvFile(e.target.files[0]); }}
              />
            </div>
            <div className="form-hint" style={{ marginBottom: 14 }}>Formats acceptés : PDF, DOC, JPG, PNG</div>

            <div style={{ background: 'var(--amber-dim)', border: '1px solid rgba(232,160,32,.3)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--amber)', marginBottom: 14 }}>
              ℹ️ Votre candidature sera examinée par notre équipe. Vous recevrez un email avec vos identifiants si elle est acceptée.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" onClick={prevStep} disabled={expertLoading}>← Retour</button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={handleExpertRequest}
                disabled={expertLoading}
              >
                {expertLoading ? 'Envoi en cours…' : 'Envoyer la candidature →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
