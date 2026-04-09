// ─── EXPERTS DATA ───
export const experts = [
  {
    id: 1, name: 'Dr. Sarah Benali', title: 'Médecin généraliste',
    domain: 'medical', rate: 0.85, rating: 4.97, reviews: 312, status: 'online',
    color: '#ffeaea', tc: '#c0392b', init: 'SB',
    tags: ['Médecine générale', 'Analyse', 'Pédiatrie'],
    bio: "Médecin diplômée de Paris, 12 ans d'expérience en médecine générale et préventive. Réponses précises en quelques minutes.",
    minDur: 3
  },
  {
    id: 2, name: 'Me. Julien Moreau', title: 'Avocat — Droit des affaires',
    domain: 'legal', rate: 1.40, rating: 4.92, reviews: 218, status: 'online',
    color: '#e8f0ff', tc: '#1a4a9e', init: 'JM',
    tags: ['Contrats', 'Droit social', 'Startup'],
    bio: "Avocat au Barreau de Paris, 15 ans d'expérience. Expert en droit des affaires, contrats et création d'entreprise.",
    minDur: 5
  },
  {
    id: 3, name: 'Léa Fontaine', title: 'Développeuse Senior',
    domain: 'tech', rate: 0.60, rating: 4.89, reviews: 445, status: 'online',
    color: '#e8fff4', tc: '#0e6e42', init: 'LF',
    tags: ['React', 'Django', 'Architecture'],
    bio: '10 ans full-stack React/Django. Ancienne lead dev chez une licorne. Debug, architecture, code review en direct.',
    minDur: 3
  },
  {
    id: 4, name: 'Sophie Roux', title: 'Analyste financière',
    domain: 'finance', rate: 1.10, rating: 4.88, reviews: 289, status: 'busy',
    color: '#f0e8ff', tc: '#5a0e8a', init: 'SR',
    tags: ['Bourse', 'Fiscalité', 'Crypto'],
    bio: "Ex-Goldman Sachs, 14 ans en finance de marché. Optimisation fiscale et stratégie d'investissement personnalisée.",
    minDur: 5
  },
  {
    id: 5, name: 'Karim Hadjali', title: 'Directeur artistique',
    domain: 'creative', rate: 0.65, rating: 4.94, reviews: 378, status: 'online',
    color: '#ffe8f0', tc: '#8a0e3a', init: 'KH',
    tags: ['Branding', 'UI/UX', 'Figma'],
    bio: "DA senior, 16 ans en agences internationales. Review design, identité visuelle, conseils créatifs instantanés.",
    minDur: 3
  },
];

// ─── APPLICATIONS DATA ───
export const initialApplications = [
  { id: 'a1', name: 'Marc Tissot', email: 'marc@gmail.com', domain: '⚕ Médical', rate: '€0.75', date: 'Il y a 2h', status: 'pending', bio: 'Chef étoilé 20 ans', skills: ['Cuisine', 'Recettes'] },
  { id: 'a2', name: 'Emma Chen', email: 'emma@tech.io', domain: '💻 Tech', rate: '€0.55', date: 'Il y a 5h', status: 'pending', bio: 'Senior Dev 8 ans', skills: ['React', 'TypeScript'] },
  { id: 'a3', name: 'Antoine Dupuis', email: 'a.dupuis@cabinet.fr', domain: '⚖ Juridique', rate: '€1.20', date: 'Hier', status: 'pending', bio: 'Avocat fiscaliste 10 ans', skills: ['Fiscalité', 'TVA'] },
  { id: 'a4', name: 'Lucie Martin', email: 'lucie@design.co', domain: '🎨 Créatif', rate: '€0.65', date: 'Il y a 3j', status: 'approved', bio: 'DA senior 12 ans', skills: ['Branding', 'Figma'] },
  { id: 'a5', name: 'Romain Bernard', email: 'romain@finance.fr', domain: '📈 Finance', rate: '€0.90', date: 'Il y a 4j', status: 'rejected', bio: 'Analyste 6 ans', skills: ['Analyse', 'Trading'] },
];

// ─── LIVE SESSIONS ───
export const liveSessions = [
  { client: 'Thomas M.', expert: 'Dr. Benali', domain: '⚕ Médical', rate: 0.85, startedAgo: 12, secs: 720, clientColor: '#dae8fc', clientTc: '#1a5cff', clientInit: 'TM' },
  { client: 'Julie K.', expert: 'Me. Moreau', domain: '⚖ Juridique', rate: 1.40, startedAgo: 7, secs: 420, clientColor: '#ffe8f0', clientTc: '#8a0e3a', clientInit: 'JK' },
  { client: 'Alexis R.', expert: 'Léa Fontaine', domain: '💻 Tech', rate: 0.60, startedAgo: 3, secs: 180, clientColor: '#e8fff4', clientTc: '#0e6e42', clientInit: 'AR' },
];

// ─── CLIENTS DATA ───
export const clients = [
  { init: 'MD', name: 'Marie Dupont', email: 'marie@exemple.com', color: '#dae8fc', tc: '#1a5cff', date: 'Il y a 2j', sessions: 12, spent: '€42.80', last: 'Aujourd\'hui', status: 'VIP' },
  { init: 'TM', name: 'Thomas Martin', email: 'thomas@mail.fr', color: '#e8fff4', tc: '#0e6e42', date: 'Il y a 1 sem', sessions: 6, spent: '€28.40', last: 'Hier', status: 'Actif' },
  { init: 'JK', name: 'Julie Karim', email: 'julie@corp.com', color: '#ffe8f0', tc: '#8a0e3a', date: 'Il y a 2 sem', sessions: 18, spent: '€89.20', last: 'Il y a 2j', status: 'VIP' },
  { init: 'AB', name: 'Alexis Bernard', email: 'alexis@startup.io', color: '#f0e8ff', tc: '#5a0e8a', date: 'Il y a 1 mois', sessions: 3, spent: '€11.40', last: 'Il y a 1 sem', status: 'Actif' },
  { init: 'SL', name: 'Sarah Legrand', email: 'sarah@pro.fr', color: '#fff8e8', tc: '#8a6e0e', date: 'Il y a 2 mois', sessions: 24, spent: '€142.60', last: 'Aujourd\'hui', status: 'VIP' },
];

// ─── HISTORY ROWS ───
export const historyRows = [
  { client: 'Thomas M.', expert: 'Dr. Benali', domain: '⚕ Médical', date: 'Auj. 11:23', dur: '4:12', amount: '€3.57', comm: '€0.54', note: '★★★★★' },
  { client: 'Julie K.', expert: 'Me. Moreau', domain: '⚖ Juridique', date: 'Auj. 09:45', dur: '8:00', amount: '€11.20', comm: '€1.68', note: '★★★★★' },
  { client: 'Alexis R.', expert: 'Léa Fontaine', domain: '💻 Tech', date: 'Hier 16:10', dur: '11:34', amount: '€6.94', comm: '€1.04', note: '★★★★☆' },
  { client: 'Emma D.', expert: 'Sophie Roux', domain: '📈 Finance', date: 'Hier 14:22', dur: '15:08', amount: '€16.65', comm: '€2.50', note: '★★★★★' },
  { client: 'Marc V.', expert: 'Karim Hadjali', domain: '🎨 Créatif', date: 'Il y a 2j', dur: '6:30', amount: '€4.23', comm: '€0.63', note: '★★★★★' },
];

// ─── PAYOUT ROWS ───
export const payoutRows = [
  { init: 'SB', name: 'Dr. Sarah Benali', color: '#ffeaea', tc: '#c0392b', sessions: 48, gmv: '€284.40', comm: '€42.66', payout: '€241.74' },
  { init: 'JM', name: 'Me. Julien Moreau', color: '#e8f0ff', tc: '#1a4a9e', sessions: 22, gmv: '€198.80', comm: '€29.82', payout: '€168.98' },
  { init: 'LF', name: 'Léa Fontaine', color: '#e8fff4', tc: '#0e6e42', sessions: 35, gmv: '€126.00', comm: '€18.90', payout: '€107.10' },
  { init: 'SR', name: 'Sophie Roux', color: '#f0e8ff', tc: '#5a0e8a', sessions: 19, gmv: '€166.10', comm: '€24.92', payout: '€141.18' },
];

// ─── FEED DATA ───
export const feedData = [
  { name: 'Thomas M.', expert: 'Dr. Benali', cost: '€2.55' },
  { name: 'Julie K.', expert: 'Me. Moreau', cost: '€9.80' },
  { name: 'Alexis R.', expert: 'Léa Fontaine', cost: '€4.20' },
  { name: 'Emma D.', expert: 'Sophie Roux', cost: '€7.15' },
];

// ─── AVAILABILITY ───
export const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
export const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

// Expert's initially active slots
export const expertInitialSlots = {
  Lundi: [0, 1, 2],
  Mardi: [3, 4, 5],
  Mercredi: [0, 1],
  Jeudi: [3, 4, 5, 6],
  Vendredi: [0, 1, 2, 3],
};

// Globally booked slots (by other clients)
export const globalBookedSlots = {
  1: { Lundi: [1], Mercredi: [3] },
  2: { Mardi: [0, 2] },
};
