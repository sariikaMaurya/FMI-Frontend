import api from '../../services/api'

export const fetchCrops = () => api.get('/crops')
export const createCrop = (data) => api.post('/crops', data)
export const updateCrop = (id, data) => api.put(`/crops/${id}`, data)
export const deleteCrop = (id) => api.delete(`/crops/${id}`)
export const uploadCropImage = (id, file) => {
	const form = new FormData();
	form.append('image', file);
	return api.post(`/crops/${id}/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' } })
}
