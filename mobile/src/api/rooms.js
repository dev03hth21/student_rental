import api from '../services/api';
import * as FileSystem from 'expo-file-system';

const IMAGE_MIME_MAP = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
};

const getFileExtension = (value = '') => {
  const match = value.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
};

const guessMimeType = (name = '', fallbackType = '') => {
  if (fallbackType && fallbackType.includes('/')) {
    return fallbackType;
  }
  const ext = getFileExtension(name);
  if (ext && IMAGE_MIME_MAP[ext]) {
    return IMAGE_MIME_MAP[ext];
  }
  if (fallbackType === 'image') {
    return 'image/jpeg';
  }
  return fallbackType || 'image/jpeg';
};

const ensureUploadableFile = async (file, index, tempFiles) => {
  if (!file?.uri) {
    return null;
  }

  const extFromName = getFileExtension(file.name || file.fileName || file.uri);
  const safeExt = extFromName || 'jpg';
  const normalizedName = file.name || file.fileName || `room-${index}.${safeExt}`;
  const mimeType = guessMimeType(normalizedName, file.mimeType || file.type);
  let targetUri = file.uri;

  if (!targetUri.startsWith('file://')) {
    const cacheDir = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
    const cachePath = `${cacheDir}room-upload-${Date.now()}-${index}.${safeExt}`;
    await FileSystem.copyAsync({ from: targetUri, to: cachePath });
    tempFiles.push(cachePath);
    targetUri = cachePath;
  }

  return {
    uri: targetUri,
    name: normalizedName,
    type: mimeType,
  };
};

const cleanupTempFiles = async (files = []) => {
  if (!files.length) return;
  await Promise.all(
    files.map((uri) =>
      FileSystem.deleteAsync(uri, { idempotent: true }).catch(() => undefined)
    )
  );
};

const unwrapRoom = (response) => response.data?.data?.room || response.data?.data || response.data;

/**
 * Public APIs for Students
 */

// Lấy danh sách phòng với filter
export async function getPublicRooms(params = {}) {
  const response = await api.get('/rooms', { params });
  return {
    rooms: response.data?.data?.rooms || response.data?.data || [],
    pagination: response.data?.data?.pagination || {},
  };
}

// Lấy phòng đề xuất (trending + mới)
export async function getRecommendedRooms(limit = 10) {
  const response = await api.get('/rooms/recommend', { params: { limit } });
  return response.data?.data?.rooms || response.data?.data || [];
}

// Lấy chi tiết phòng
export async function getRoomDetail(roomId) {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data?.data?.room || response.data?.data || response.data;
}

// Ghi nhận lượt xem phòng (cần login)
export async function recordRoomView(roomId) {
  const response = await api.post(`/rooms/${roomId}/view`);
  return response.data?.data || response.data;
}

// Gọi chủ trọ (cần login)
export async function recordRoomCall(roomId) {
  const response = await api.post(`/rooms/${roomId}/call`);
  return response.data?.data || response.data;
}

/**
 * Host APIs
 */
export async function getHostRooms(params = {}) {
  const response = await api.get('/host/rooms', { params });
  return response.data?.data?.rooms || response.data?.data || response.data;
}

export async function getHostRoomDetail(roomId) {
  const response = await api.get(`/host/rooms/${roomId}`);
  return unwrapRoom(response);
}

export async function updateRoomStatus(roomId, payload) {
  const response = await api.put(`/rooms/${roomId}`, payload);
  return unwrapRoom(response);
}

export async function deleteRoom(roomId) {
  const response = await api.delete(`/rooms/${roomId}`);
  return response.data?.data || response.data;
}

export async function createRoomBasic(payload) {
  const response = await api.post('/rooms', payload);
  return unwrapRoom(response);
}

export async function updateRoomBasic(roomId, payload) {
  const response = await api.put(`/rooms/${roomId}`, payload);
  return unwrapRoom(response);
}

export async function uploadRoomImages(roomId, files, options = {}) {
  if (!roomId) {
    throw new Error('roomId is required');
  }

  if (!Array.isArray(files) || !files.length) {
    throw new Error('Vui lòng chọn ít nhất 1 ảnh');
  }

  const formData = new FormData();
  const tempFiles = [];

  const normalizedFiles = (
    await Promise.all(
      files.map((file, index) => ensureUploadableFile(file, index, tempFiles))
    )
  ).filter(Boolean);

  if (!normalizedFiles.length) {
    await cleanupTempFiles(tempFiles);
    throw new Error('Không có ảnh hợp lệ để tải lên');
  }

  normalizedFiles.forEach((file) => {
    formData.append('images', file);
  });

  const replace = options.replace !== false;
  formData.append('replace', replace ? 'true' : 'false');

  try {
    const response = await api.post(`/rooms/${roomId}/images`, formData, {
      timeout: options.timeout || 60000, // 60s for large image uploads
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapRoom(response);
  } finally {
    await cleanupTempFiles(tempFiles);
  }
}

export async function updateRoomLocationMeta(roomId, payload) {
  const response = await api.put(`/rooms/${roomId}/location`, payload);
  return unwrapRoom(response);
}

export async function submitRoomForReview(roomId) {
  const response = await api.post(`/rooms/${roomId}/submit`);
  return unwrapRoom(response);
}

// Backward compatible aliases (in case other modules still import older helpers)
export const createRoomDraft = createRoomBasic;
export const updateRoomDraft = updateRoomBasic;
export const submitRoomDraft = submitRoomForReview;
export async function updateRoomLocation(roomId, location) {
  return updateRoomLocationMeta(roomId, { location });
}
