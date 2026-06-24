const TOKEN_KEY = 'shiptrack_admin_token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  login: (password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) }),

  listShipments: (search = '') =>
    request(`/shipments${search ? `?search=${encodeURIComponent(search)}` : ''}`),

  createShipment: (payload) =>
    request('/shipments', { method: 'POST', body: JSON.stringify(payload) }),

  getShipment: (id) => request(`/shipments/${id}`),

  updateShipment: (id, payload) =>
    request(`/shipments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  deleteShipment: (id) => request(`/shipments/${id}`, { method: 'DELETE' }),

  setHold: (id, action) =>
    request(`/shipments/${id}/hold`, { method: 'POST', body: JSON.stringify({ action }) }),

  trackPublic: (trackingNumber) => request(`/shipments/public/${trackingNumber}`),

  geocode: (place) => request(`/geocode?place=${encodeURIComponent(place)}`),

  async uploadImage(file) {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/images/upload', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
