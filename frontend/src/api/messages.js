import api from './axios';

// The full message thread for a project (also marks messages to me as read).
export async function getProjectMessages(projectId) {
  const res = await api.get(`/messages/project/${projectId}`);
  return Array.isArray(res.data) ? res.data : [];
}

// Send a message to the other party of a project.
export async function sendMessage(projectId, text) {
  const res = await api.post('/messages', { project: projectId, text });
  return res.data;
}
