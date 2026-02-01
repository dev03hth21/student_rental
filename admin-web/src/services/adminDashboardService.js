import axiosClient from '../api/axiosClient';

export const getSummary = async (period = 30) => {
  const { data } = await axiosClient.get('/admin/summary', { params: { period } });
  return data?.data?.summary || {};
};
