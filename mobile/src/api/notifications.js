import api from '../services/api';

export async function fetchNotifications({ page = 1, limit = 20 } = {}) {
  const response = await api.get('/notifications', { params: { page, limit } });
  return response.data?.data || {};
}

export async function markNotificationRead(id) {
  if (!id) return null;
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data?.data?.notification || response.data?.data;
}

export async function markAllNotificationsRead() {
  const response = await api.patch('/notifications/read-all');
  return response.data?.data || {};
}
