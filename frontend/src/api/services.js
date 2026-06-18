import api from './axios';

// Services the logged-in provider owns (GET /services/my, provider-only).
export async function getMyServices() {
  const res = await api.get('/services/my');
  return Array.isArray(res.data) ? res.data : res.data.services || [];
}

// Delete one of the provider's own services.
export async function deleteService(id) {
  const res = await api.delete(`/services/${id}`);
  return res.data;
}
