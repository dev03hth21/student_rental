import api from './api';

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const register = async (payload) => {
  const { data } = await api.post('/auth/register', payload);
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async ({ token, password, email }) => {
  const { data } = await api.post('/auth/reset-password', { token, password, email });
  return data;
};
