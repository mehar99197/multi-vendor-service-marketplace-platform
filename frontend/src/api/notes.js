import api from './axios';

// The caller's private CRM notes about one contact (subject = a User id).
export async function getNotes(subjectId) {
  const res = await api.get('/notes', { params: { subject: subjectId } });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createNote({ subject, body, tags }) {
  const res = await api.post('/notes', { subject, body, tags });
  return res.data;
}

export async function updateNote(id, updates) {
  const res = await api.put(`/notes/${id}`, updates);
  return res.data;
}

export async function deleteNote(id) {
  const res = await api.delete(`/notes/${id}`);
  return res.data;
}
