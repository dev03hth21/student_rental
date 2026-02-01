import axiosClient from '../api/axiosClient';

export const listReports = async ({ status, page = 1, limit = 10, q = '' } = {}) => {
  const params = { page, limit };
  if (status) params.status = status;
  if (q) params.q = q;
  const { data } = await axiosClient.get('/admin/reports', { params });
  return { reports: data?.data?.reports || [], pagination: data?.data?.pagination };
};

export const updateReportStatus = async (id, status) => {
  const { data } = await axiosClient.patch(`/admin/reports/${id}/status`, { status });
  return data;
};

export const getReportDetail = async (id) => {
  const { data } = await axiosClient.get(`/admin/reports/${id}`);
  return data?.data?.report;
};
