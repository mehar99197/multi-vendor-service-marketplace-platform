import api from './axios';

// The logged-in user's follow-up tasks. Pass a projectId to scope to one project.
export async function getMyTasks(projectId) {
  const res = await api.get('/tasks', { params: projectId ? { project: projectId } : {} });
  return Array.isArray(res.data) ? res.data : [];
}

export async function createTask({ project, title, description, dueDate }) {
  const res = await api.post('/tasks', { project, title, description, dueDate });
  return res.data;
}

export async function updateTask(id, updates) {
  const res = await api.put(`/tasks/${id}`, updates);
  return res.data;
}

export async function deleteTask(id) {
  const res = await api.delete(`/tasks/${id}`);
  return res.data;
}
