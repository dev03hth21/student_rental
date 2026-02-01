import api from '../services/api';

/**
 * Favorites API Services
 * Quản lý danh sách phòng yêu thích của student
 */

/**
 * Lấy danh sách phòng đã lưu
 * @returns {Promise<Array>} Danh sách phòng yêu thích
 */
export async function getMyFavorites() {
  const response = await api.get('/favorites/my');
  const payload = response.data?.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.favorites)) return payload.favorites;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

/**
 * Thêm phòng vào danh sách yêu thích
 * @param {string} roomId - ID phòng
 * @returns {Promise<Object>} Favorite object
 */
export async function addFavorite(roomId) {
  const response = await api.post('/favorites', { roomId });
  return response.data?.data?.favorite || response.data?.data || response.data;
}

/**
 * Xóa phòng khỏi danh sách yêu thích (by favorite ID)
 * @param {string} favoriteId - ID của favorite record
 * @returns {Promise<Object>} Result
 */
export async function removeFavorite(favoriteId) {
  const response = await api.delete(`/favorites/${favoriteId}`);
  return response.data?.data || response.data;
}

/**
 * Xóa phòng khỏi danh sách yêu thích (by room ID)
 * @param {string} roomId - ID phòng
 * @returns {Promise<Object>} Result
 */
export async function removeFavoriteByRoom(roomId) {
  const response = await api.delete(`/favorites/by-room/${roomId}`);
  return response.data?.data || response.data;
}

export default {
  getMyFavorites,
  addFavorite,
  removeFavorite,
  removeFavoriteByRoom,
};
