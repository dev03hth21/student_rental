import api from '../services/api';

export async function getCallLogs(params = {}) {
  const response = await api.get('/host/call-logs', { params });
  return response.data?.data || response.data;
}

export async function markCallLogAsRead(callLogId) {
  if (!callLogId) return null;
  const response = await api.patch(`/host/call-logs/${callLogId}/read`);
  return response.data?.data || response.data;
}

export async function markAllCallLogsAsRead() {
  const response = await api.patch('/host/call-logs/read-all');
  return response.data?.data || response.data;
}
