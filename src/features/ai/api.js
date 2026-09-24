import api from '../../services/api';

/**
 * Uploads a crop image and requests AI health analysis.
 *
 * @param {File} file - The image file to analyze
 * @param {Function} [onUploadProgress] - Optional upload progress callback
 * @returns {Promise<Object>} The API response data
 */
export const analyzeCropImage = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/ai/analyze-crop', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(percentCompleted);
      }
    },
  });

  return response.data;
};
