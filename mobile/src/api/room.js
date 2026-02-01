// api/room.js
import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000/api'; // Thay bằng URL backend thật

export const getRecommendedRooms = async () => {
  const res = await axios.get(`${BACKEND_URL}/rooms/recommend`);
  return res.data.data || [];
};

export const getViewedRooms = async () => {
  const res = await axios.get(`${BACKEND_URL}/viewlogs/me`);
  return res.data.data || [];
};

export const getFilteredRooms = async (filters) => {
  // filters: { minPrice, maxPrice, minArea, maxArea, utilities }
  const params = new URLSearchParams(filters).toString();
  const res = await axios.get(`${BACKEND_URL}/rooms?${params}`);
  return res.data.data || [];
};

export const searchRooms = async (params) => {
  // params: { keyword, minPrice, maxPrice, minArea, maxArea, sort }
  const query = new URLSearchParams(params).toString();
  const res = await axios.get(`${BACKEND_URL}/rooms?${query}`);
  return res.data.data || [];
};

export const addFavorite = async (roomId) => {
  const res = await axios.post(`${BACKEND_URL}/favorites`, { roomId });
  return res.data;
};

export const removeFavorite = async (roomId) => {
  const res = await axios.delete(`${BACKEND_URL}/favorites/${roomId}`);
  return res.data;
};
