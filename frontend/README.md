# MinuteExpert — React App

> Conversion complète du fichier HTML vers une application React structurée.

## 🚀 Démarrage

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build
```

## 📁 Structure du projet

```
minutexpert/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # Point d'entrée
    ├── App.jsx               # Routeur principal
    ├── index.css             # Styles globaux (variables CSS, composants)
    ├── context/
    │   └── AppContext.jsx    # État global (navigation, booking, session…)
    ├── data/
    │   └── mockData.js       # Données simulées (experts, clients, sessions…)
    └── components/
        ├── ui/
        │   └── index.jsx     # Composants réutilisables (Toast, Modal, Badge, ExpertCard…)
        ├── landing/
        │   └── LandingScreen.jsx   # Page d'accueil publique
        ├── auth/
        │   └── AuthScreens.jsx     # Login + Inscription multi-étapes
        ├── client/
        │   ├── ClientApp.jsx       # Shell + sidebar client
        │   ├── ClientPages.jsx     # Accueil, Explorer, Paramètres
        │   └── ClientBooking.jsx   # Wizard réservation + Historique
        ├── expert/
        │   ├── ExpertApp.jsx       # Shell + sidebar expert
        │   └── ExpertPages.jsx     # Dashboard, Disponibilités, Sessions, Profil
        ├── admin/
        │   ├── AdminApp.jsx        # Shell + sidebar admin
        │   └── AdminPages.jsx      # Vue d'ensemble, Analytics, Candidatures, Experts, Clients, Live, Historique, Finance, Paramètres
        └── session/
            └── SessionScreen.jsx   # Session vidéo live avec timer
```

## 🎭 Comptes démo

Sur l'écran de login, cliquez sur :
- **Se connecter** → Vue Client (Marie Dupont)
- **🧠 Démo Expert** → Vue Expert (Dr. Sarah Benali)
- **🛡 Démo Admin** → Vue Administration

## ✨ Fonctionnalités

- **Landing** : Hero, Features, How it works, Pricing, CTA
- **Auth** : Login, Inscription multi-étapes (Client / Expert)
- **Client** : Explorer experts, filtrer, réserver (wizard 3 étapes), historique, sessions à venir
- **Expert** : Dashboard revenus, planning disponibilités, historique sessions, profil
- **Admin** : Vue d'ensemble, analytics, candidatures (approuver/refuser), experts, clients, sessions live, historique, finance, paramètres
- **Session** : Timer live, coût en temps réel, chat, contrôles micro/caméra, notation

## 🛠 Stack

- **React 18** + Hooks
- **Vite** (bundler)
- **CSS Variables** (sans dépendance CSS externe)
- **Context API** (état global)
