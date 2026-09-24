import axios from 'axios'

const base = (import.meta.env.VITE_API_URL || '')
const api = axios.create({
  baseURL: base ? `${base}/api` : '/api'
})

// attach token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
})

// response interceptor: on 401 try refresh once and retry
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('fm_refresh');
      if (!refreshToken) return Promise.reject(error);
      try {
        const resp = await axios.post((import.meta.env.VITE_API_URL || '') + '/api/auth/refresh', { refreshToken });
        const newToken = resp.data.token;
        if (newToken) {
          localStorage.setItem('fm_token', newToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        localStorage.removeItem('fm_token');
        localStorage.removeItem('fm_refresh');
        localStorage.removeItem('fm_user');
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
)

export default api;
