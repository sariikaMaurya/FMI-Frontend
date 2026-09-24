import api from '../../services/api'

export const fetchCart = () => api.get('/cart')
export const addToCart = (data) => api.post('/cart/add', data)
export const updateCart = (id, data) => api.put(`/cart/update/${id}`, data)
export const removeFromCart = (id) => api.delete(`/cart/remove/${id}`)
