import api from './axios';

// Recent notifications for the logged-in user + the unread count for the bell.
export async function getNotifications() {
  const res = await api.get('/notifications');
  return res.data; // { notifications, unreadCount }
}

export async function markNotificationRead(id) {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.put('/notifications/read-all');
  return res.data;
}
