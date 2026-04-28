// ═══════════════════════════════════════════
//  API SERVICE — communication avec Django
// ═══════════════════════════════════════════

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// ─── Helpers ───────────────────────────────

function getToken() {
  return localStorage.getItem('access');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Extraire le message d'erreur du backend Django
    const message =
      json.detail ||
      Object.values(json).flat().join(' ') ||
      `Erreur ${res.status}`;
    throw new Error(message);
  }
  return json;
}

// ─── AUTH ──────────────────────────────────

export const authAPI = {
  /**
   * Inscription client
   * POST /api/auth/signup/
   * body: { email, username, password, first_name, last_name }
   * returns: { access, refresh, role }
   */
  signup: async (data) => {
    const res = await fetch(`${BASE}/auth/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await handleResponse(res);
    localStorage.setItem('access', json.access);
    localStorage.setItem('refresh', json.refresh);
    localStorage.setItem('role', json.role);
    return json;
  },

  /**
   * Connexion
   * POST /api/auth/login/
   * body: { email, password }
   * returns: { access, refresh, role }
   */
  login: async ({ email, password }) => {
    const res = await fetch(`${BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await handleResponse(res);
    localStorage.setItem('access', json.access);
    localStorage.setItem('refresh', json.refresh);
    localStorage.setItem('role', json.role);
    return json;
  },

  /**
   * Rafraîchir le token
   * POST /api/auth/token/refresh/
   */
  refresh: async () => {
    const refreshToken = localStorage.getItem('refresh');
    if (!refreshToken) throw new Error('Pas de refresh token');
    const res = await fetch(`${BASE}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    const json = await handleResponse(res);
    localStorage.setItem('access', json.access);
    return json;
  },

  logout: () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
  },
};

// ─── EXPERT REQUESTS ───────────────────────

export const expertAPI = {
  /**
   * Envoyer une candidature expert (avec fichier CV)
   * POST /api/expert-requests/
   * body: FormData (multipart)
   */
  submitRequest: async (formData) => {
    const token = getToken();
    const res = await fetch(`${BASE}/expert-requests/`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      // Pas de Content-Type ici → laissé au browser pour le multipart boundary
      body: formData,
    });
    return handleResponse(res);
  },

  getCategories: async () => {
    const res = await fetch(`${BASE}/categories/`);
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${BASE}/experts/me/`, { headers: authHeaders() });
    return handleResponse(res);
  },

  updateMe: async (data) => {
    const res = await fetch(`${BASE}/experts/me/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMySessions: async () => {
    const res = await fetch(`${BASE}/experts/me/sessions/`, { headers: authHeaders() });
    return handleResponse(res);
  },
};

// ─── CLIENT ────────────────────────────────
export const clientAPI = {
  getMe: async () => {
    const res = await fetch(`${BASE}/clients/me/`, { headers: authHeaders() });
    return handleResponse(res);
  },

  updateMe: async (data) => {
    const res = await fetch(`${BASE}/clients/me/`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  getMySessions: async () => {
    const res = await fetch(`${BASE}/clients/me/sessions/`, { headers: authHeaders() });
    return handleResponse(res);
  },

  getExperts: async () => {
    const res = await fetch(`${BASE}/experts/list/`);
    return handleResponse(res);
  },

  createBooking: async ({ expert_id, slot_label, duration, scheduled_at }) => {
    const res = await fetch(`${BASE}/bookings/direct/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ expert_id, slot_label, duration, scheduled_at }),
    });
    return handleResponse(res);
  },

  getMyBookings: async () => {
    const res = await fetch(`${BASE}/bookings/my-bookings/`, { headers: authHeaders() });
    return handleResponse(res);
  },
};

// ─── ADMIN ─────────────────────────────────

export const adminAPI = {
  /**
   * Lister toutes les candidatures experts
   * GET /api/admin/expert-requests/
   */
  getExpertRequests: async () => {
    const res = await fetch(`${BASE}/admin/expert-requests/`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /**
   * Accepter ou refuser une candidature
   * POST /api/admin/expert-requests/:id/decision/
   * body: { decision: 'approved' | 'rejected' }
   */
  decideRequest: async (id, decision) => {
    const res = await fetch(`${BASE}/admin/expert-requests/${id}/decision/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ decision }),
    });
    return handleResponse(res);
  },

  getClients: async () => {
    const res = await fetch(`${BASE}/admin/clients/`, { headers: authHeaders() });
    return handleResponse(res);
  },

  getExperts: async () => {
    const res = await fetch(`${BASE}/admin/experts/`, { headers: authHeaders() });
    return handleResponse(res);
  },
};

// ─── SESSION ───────────────────────────────
export const sessionAPI = {
  /** Client demande le démarrage → expert en attente */
  start: async (booking_id) => {
    const res = await fetch(`${BASE}/sessions/start/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ booking_id }),
    });
    return handleResponse(res);
  },

  /** Expert accepte la session */
  accept: async (booking_id) => {
    const res = await fetch(`${BASE}/sessions/accept/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ booking_id }),
    });
    return handleResponse(res);
  },

  /** Expert refuse la session avec une raison */
  reject: async (booking_id, reason) => {
    const res = await fetch(`${BASE}/sessions/reject/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ booking_id, reason }),
    });
    return handleResponse(res);
  },

  /** Polling: client vérifie si l'expert a accepté */
  getStatus: async (booking_id) => {
    const res = await fetch(`${BASE}/sessions/status/?booking_id=${booking_id}`, {
      headers: authHeaders(),
    });
    return handleResponse(res);
  },

  /** Polling: expert voit les sessions en attente */
  getPending: async () => {
    const res = await fetch(`${BASE}/sessions/pending/`, { headers: authHeaders() });
    return handleResponse(res);
  },

  /** Terminer la session + calculer le prix */
  end: async (booking_id) => {
    const res = await fetch(`${BASE}/sessions/end/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ booking_id }),
    });
    return handleResponse(res);
  },

  /** Soumettre une note après la session */
  submitReview: async ({ booking, rating, comment }) => {
    const res = await fetch(`${BASE}/reviews/create/`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ booking, rating, comment }),
    });
    return handleResponse(res);
  },
};


