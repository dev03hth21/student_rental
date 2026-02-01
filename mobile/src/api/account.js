import api from '../services/api';

const extractPayload = (response) =>
  response.data?.data || response.data?.user || response.data;

export async function getMyProfile() {
  const response = await api.get('/users/me');
  return extractPayload(response);
}

export async function updateMyProfile(payload) {
  const response = await api.put('/users/me', payload);
  return extractPayload(response);
}

export async function uploadAvatar(imageAsset) {
  const formData = new FormData();
  
  // React Native FormData requires specific object structure
  const imageUri = imageAsset.uri;
  const fileName = imageAsset.fileName || `avatar_${Date.now()}.jpg`;
  const mimeType = imageAsset.mimeType || 'image/jpeg';
  
  formData.append('avatar', {
    uri: imageUri,
    type: mimeType,
    name: fileName,
  });

  console.log('Uploading avatar:', { uri: imageUri, type: mimeType, name: fileName });
  console.log('API baseURL:', api.defaults.baseURL);

  const response = await api.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data, // Prevent axios from transforming FormData
  });
  return extractPayload(response);
}

export async function uploadIdCard(imageAsset) {
  const formData = new FormData();

  const imageUri = imageAsset.uri;
  const fileName = imageAsset.fileName || `idcard_${Date.now()}.jpg`;
  const mimeType = imageAsset.mimeType || 'image/jpeg';

  formData.append('idCard', {
    uri: imageUri,
    type: mimeType,
    name: fileName,
  });

  const response = await api.post('/users/me/id-card', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    transformRequest: (data) => data,
  });

  return extractPayload(response);
}
