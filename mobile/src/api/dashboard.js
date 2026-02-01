import api from '../services/api';

export async function fetchHostDashboard(params = {}) {
  const response = await api.get('/host/dashboard', { params });
  return response.data?.data || response.data;
}
