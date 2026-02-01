import axiosClient from '../api/axiosClient';

export const getPendingRooms = async ({ page = 1, limit = 10, q = '' } = {}) => {
  const { data } = await axiosClient.get('/admin/rooms', { params: { status: 'pending', page, limit, q } });
  return { rooms: data?.data?.rooms || [], pagination: data?.data?.pagination };
};

export const getRoomDetail = async (roomId) => {
  const { data } = await axiosClient.get(`/admin/rooms/${roomId}`);
  return data?.data?.room || data?.data;
};

export const approveRoom = async (roomId) => {
  const { data } = await axiosClient.put(`/admin/rooms/${roomId}/approve`);
  return data;
};

export const rejectRoom = async (roomId, reason) => {
  const { data } = await axiosClient.put(`/admin/rooms/${roomId}/reject`, { reason });
  return data;
};

export const getApprovedRooms = async ({ page = 1, limit = 10, q = '' } = {}) => {
  const { data } = await axiosClient.get('/admin/rooms', { params: { status: 'approved', page, limit, q } });
  return { rooms: data?.data?.rooms || [], pagination: data?.data?.pagination };
};

export const getRejectedRooms = async ({ status = 'rejected', page = 1, limit = 10, q = '' } = {}) => {
  const { data } = await axiosClient.get('/admin/rooms', { params: { status, page, limit, q } });
  return { rooms: data?.data?.rooms || [], pagination: data?.data?.pagination };
};

export const requestRoomChanges = async (roomId, note) => {
  const { data } = await axiosClient.patch(`/admin/rooms/${roomId}/status`, {
    status: 'needs_changes',
    reason: note,
  });
  return data;
};
