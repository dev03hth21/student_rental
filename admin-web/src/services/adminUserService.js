import axiosClient from '../api/axiosClient';

export const listUsers = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/users', { params });
  return data?.data || {};
};

export const listHosts = async (params = {}) => {
  const { data } = await axiosClient.get('/admin/hosts', { params });
  return data?.data || {};
};

export const updateUser = async (userId, payload) => {
  const { data } = await axiosClient.put(`/admin/users/${userId}`, payload);
  return data?.data?.user;
};

export const createAdminUser = async ({ fullName, email, phone, password, isSuperAdmin = false }) => {
  const { data } = await axiosClient.post('/admin/users/admin', {
    fullName,
    email,
    phone,
    password,
    isSuperAdmin,
  });
  return data?.data?.user;
};
