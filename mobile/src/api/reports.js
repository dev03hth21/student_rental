import api from '../services/api';

export async function createReport({ roomId, reason, attachment }) {
  if (!roomId) {
    throw new Error('roomId is required');
  }

  // If there is an attachment (local asset), send multipart/form-data
  if (attachment?.uri) {
    const formData = new FormData();
    formData.append('roomId', roomId);
    formData.append('reason', reason);

    const fileName = attachment.fileName || attachment.name || `evidence_${Date.now()}.jpg`;
    const mimeType = attachment.mimeType || attachment.type || 'image/jpeg';

    formData.append('attachment', {
      uri: attachment.uri,
      name: fileName,
      type: mimeType,
    });

    const response = await api.post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (data) => data,
    });
    return response.data?.data?.report || response.data?.data || response.data;
  }

  // Fallback: JSON payload without attachment
  const payload = { roomId, reason };
  const response = await api.post('/reports', payload);
  return response.data?.data?.report || response.data?.data || response.data;
}
