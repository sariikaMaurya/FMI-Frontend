import api from '../../services/api'

export const fetchOrders = () => api.get('/orders')
export const placeOrder = (data) => api.post('/orders', data)
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}`, { status })
