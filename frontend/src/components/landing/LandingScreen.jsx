import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { feedData } from '../../data/mockData';

function LandingNav() {
  const { navigate } = useApp();
  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate('landing')}>
        <div className="pulse" />
        Minute<span>Expert</span>
      </div>
      <div className="nav-links">
        <button className="nav-link" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Fonctionnalités</button>
        <button className="nav-link" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>Comment ça marche</button>
        <button className="nav-link" onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}>Tarifs</button>
      </div>
      <div className="nav-right">
        <div className="live-count">
          <div className="pulse" style={{ width: 6, height: 6 }} />
          47 experts en ligne
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('login')}>Se connecter</button>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('register')}>Commencer →</button>
      </div>
    </nav>
  );
}

function LiveFeed() {
  const [feed, setFeed] = useState([...feedData]);
  useEffect(() => {
    const t = setInterval(() => setFeed(f => { const n = [...f]; n.push(n.shift()); return n; }), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="hero-card">
      <div className="hero-card-header">
        <div className="pulse" />
        <div className="hero-card-title">Sessions en direct</div>
      </div>
      <div className="live-feed">
        {feed.map((f, i) => (
          <div key={i} className="lf-item">
            <div className="lf-dot" />
            <div className="lf-text"><strong>{f.name}</strong> avec {f.expert}</div>
            <div className="lf-amount">{f.cost}</div>
          </div>
        ))}
      </div>
      <div className="hero-card-footer">
        ⚡ Facturation à la seconde · Pré-autorisation Stripe
      </div>
    </div>
  );
}

function Hero() {
  const { navigate } = useApp();
  return (
    <div className="hero">
      <div className="hero-left">
        <div className="hero-tag"><div className="pulse" style={{ width: 7, height: 7 }} />Plateforme #1 d'expertise à la minute</div>
        <h1 className="hero-title">
          Louez un cerveau,<br />
          <span className="accent">à la minute.</span><br />
          <span className="sub-accent">Pas à l'heure.</span>
        </h1>
        <p className="hero-desc">
          Accédez à des médecins, avocats, développeurs et experts financiers en moins de 60 secondes.
          Payez uniquement le temps consommé — à la seconde près.
        </p>
        <div className="hero-ctas">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('register')}>Trouver un expert →</button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('register')}>Devenir expert</button>
        </div>
        <div className="hero-stats">
          {[
            { val: '12 400+', lbl: 'Sessions réalisées' },
            { val: '4.93 ★', lbl: 'Note moyenne' },
            { val: '34 sec', lbl: 'Temps moyen de connexion' },
          ].map(s => (
            <div key={s.lbl}>
              <div className="hstat-val">{s.val}</div>
              <div className="hstat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-right"><LiveFeed /></div>
    </div>
  );
}

function Features() {
  const feats = [
    { icon: '⚡', bg: 'var(--orange-dim)', name: 'Connexion ultra-rapide', desc: 'Trouvez et connectez-vous à un expert en moins de 60 secondes. Pas de rendez-vous, pas d\'attente.' },
    { icon: '💳', bg: 'var(--green-dim)', name: 'Facturation à la seconde', desc: 'Payez uniquement le temps réellement consommé. Pré-autorisation Stripe, débit précis à la déconnexion.' },
    { icon: '🛡', bg: 'var(--blue-dim)', name: 'Experts vérifiés', desc: 'Chaque expert passe par une vérification rigoureuse : diplômes, expérience, et entretien vidéo.' },
    { icon: '📹', bg: '#f0e8ff', name: 'Vidéo peer-to-peer', desc: 'Session en temps réel via WebRTC. Qualité HD, latence minimale, chiffrement bout en bout.' },
    { icon: '⭐', bg: 'var(--amber-dim)', name: 'Avis vérifiés', desc: 'Chaque note provient d\'une session réelle. Transparence totale pour choisir le meilleur expert.' },
    { icon: '🌐', bg: 'var(--bg)', name: 'Tous les domaines', desc: 'Médecine, droit, tech, finance, créatif… Plus de 30 domaines d\'expertise disponibles 7j/7.' },
  ];
  return (
    <section id="features" className="features">
      <div className="section-eyebrow">Pourquoi MinuteExpert</div>
      <div className="section-title">Tout ce dont vous avez besoin,<br />en quelques secondes.</div>
      <div className="section-sub">Une plateforme pensée pour l'efficacité, la transparence et la confiance.</div>
      <div className="features-grid">
        {feats.map(f => (
          <div key={f.name} className="feature-card">
            <div className="feature-icon" style={{ background: f.bg }}>{f.icon}</div>
            <div className="feature-name">{f.name}</div>
            <div className="feature-desc">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: '01', title: 'Créez votre compte', desc: "Inscription en 2 minutes. Choisissez votre rôle : client ou expert." },
    { n: '02', title: 'Choisissez un expert', desc: "Filtrez par domaine, tarif, disponibilité. Consultez les avis vérifiés." },
    { n: '03', title: 'Réservez un créneau', desc: "Sélectionnez un créneau disponible et prépayez via Stripe. Sans engagement." },
    { n: '04', title: 'Payez ce que vous consommez', desc: "Facturé à la seconde. Le solde non utilisé est remboursé immédiatement." },
  ];
  return (
    <section id="how" className="how">
      <div className="how-inner">
        <div className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.5)' }}>Processus</div>
        <div className="section-title" style={{ color: '#fff' }}>Comment ça marche</div>
        <div className="how-grid">
          {steps.map(s => (
            <div key={s.n} className="how-step">
              <div className="how-num">{s.n}</div>
              <div className="how-step-title">{s.title}</div>
              <div className="how-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { navigate } = useApp();
  const plans = [
    {
      plan: 'PAY-AS-YOU-GO', price: '0', unit: '+ tarif expert', name: 'À la carte',
      tagline: 'Parfait pour les besoins ponctuels. Aucun engagement.',
      features: ['Accès à tous les experts', 'Facturation à la seconde', 'Paiement sécurisé Stripe', 'Historique complet'],
      featured: false,
    },
    {
      plan: 'LE PLUS POPULAIRE', price: '9', unit: '/mois + tarif expert', name: 'Essential',
      tagline: "Pour ceux qui consultent régulièrement. Économisez 15%.",
      features: ['Tout du plan gratuit', '15% de réduction sur les sessions', 'Accès prioritaire', 'Support dédié', 'Historique illimité'],
      featured: true,
    },
    {
      plan: 'ENTREPRISE', price: '49', unit: '/mois · jusqu\'à 10 utilisateurs', name: 'Business',
      tagline: 'Pour les équipes qui ont besoin d\'expertise régulière.',
      features: ['Tout du plan Essential', '20% de réduction', 'Dashboard équipe', 'Facturation unifiée', 'API access', 'SLA 99.9%'],
      featured: false,
    },
  ];
  return (
    <section id="pricing" className="pricing">
      <div className="section-eyebrow">Tarification</div>
      <div className="section-title">Simple, transparent,<br />sans surprise.</div>
      <div className="section-sub">Payez uniquement ce que vous utilisez. Changez de plan à tout moment.</div>
      <div className="pricing-grid">
        {plans.map(p => (
          <div key={p.name} className={`pricing-card${p.featured ? ' featured' : ''}`}>
            {p.featured && <div className="featured-badge">⭐ Recommandé</div>}
            <div className="pricing-plan">{p.plan}</div>
            <div className="pricing-price"><sup>€</sup>{p.price}</div>
            <div className="pricing-price-unit">{p.unit}</div>
            <div className="pricing-name">{p.name}</div>
            <div className="pricing-tagline">{p.tagline}</div>
            <ul className="pricing-features">{p.features.map(f => <li key={f}>{f}</li>)}</ul>
            <button className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} btn-full`} onClick={() => navigate('register')}>
              Commencer →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  const { navigate } = useApp();
  return (
    <section className="cta-section">
      <div className="cta-title">Prêt à consulter un expert<br />en moins de 60 secondes ?</div>
      <div className="cta-sub">Rejoignez 12 400+ utilisateurs qui font confiance à MinuteExpert.</div>
      <div className="cta-btns">
        <button className="btn btn-white btn-lg" onClick={() => navigate('register')}>Commencer gratuitement →</button>
        <button className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.3)' }} onClick={() => navigate('login')}>Déjà un compte ?</button>
      </div>
    </section>
  );
}

export default function LandingScreen() {
  return (
    <div>
      <LandingNav />
      <Hero />
      <Features />
      <HowItWorks />
      <Pricing />
      <CtaSection />
      <footer className="footer">
        © 2025 MinuteExpert · Tous droits réservés · Plateforme d'expertise à la minute
      </footer>
    </div>
  );
}
