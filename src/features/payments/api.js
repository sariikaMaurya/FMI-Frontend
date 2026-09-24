import api from '../../services/api'

export const createPayment = (data) => api.post('/payments/create', data)
export const verifyPayment = (data) => api.post('/payments/verify', data)
export const fetchHistory = () => api.get('/payments/history')
export const createRazorpay = (data) => api.post('/payments/razorpay/create', data)
export const verifyRazorpay = (data) => api.post('/payments/razorpay/verify', data)
