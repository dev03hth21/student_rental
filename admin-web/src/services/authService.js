import axiosClient from '../api/axiosClient';

export const login = async (email, password) => {
  const { data } = await axiosClient.post('/auth/login', { email, password });
  const token = data?.data?.tokens?.accessToken;
  const role = data?.data?.user?.role;

  if (role !== 'admin') {
    throw new Error('Chỉ admin mới được đăng nhập ở đây');
  }

  if (token) {
    localStorage.setItem('admin_token', token);
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('admin_token');
};
