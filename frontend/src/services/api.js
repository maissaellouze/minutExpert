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
};
