import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import useAuth from '../hooks/useAuth'
import { toast } from 'react-toastify'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Use the api helper which appends /api automatically
      const res = await api.post('/auth/login', { email, password })
      
      // Update global auth context
      login({
        token: res.data.token,
        refreshToken: res.data.refreshToken,
        user: res.data.user
      })
      
      toast.success(`Success! Logged in as ${res.data.user.name}`)
      
      // Redirect to role-specific dashboard
      navigate(`/dashboard/${res.data.user.role}`)
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  // Pre-fill helper for test credentials
  const fillCredentials = (testEmail) => {
    setEmail(testEmail)
    setPassword('Password123')
  }

  return (
    <div className="auth-container d-flex flex-column align-items-center">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your Farm-Merchant account</p>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="loginEmail">Email Address</label>
            <input
              id="loginEmail"
              className="form-control"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="form-label mb-0" htmlFor="loginPassword">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem' }} className="fw-semibold text-teal">
                Forgot Password?
              </Link>
            </div>
            <input
              id="loginPassword"
              className="form-control"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 mb-3"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

       

        {/* Role-Specific Registration Options */}
        <hr className="my-4" />
        <div>
          <h6 className="text-center fw-bold text-muted mb-3" style={{ fontSize: '0.85rem' }}>
            New to the platform? Register here:
          </h6>
          
          <div className="role-options">
            <div 
              className="role-option-btn" 
              onClick={() => navigate('/register?role=farmer')}
            >
              <div className="role-option-info">
                <span className="role-option-title">Register as Farmer</span>
                <span className="role-option-desc">Sell your fresh crops to merchants</span>
              </div>
              <span className="role-option-arrow">→</span>
            </div>

            <div 
              className="role-option-btn" 
              onClick={() => navigate('/register?role=merchant')}
            >
              <div className="role-option-info">
                <span className="role-option-title">Register as Merchant</span>
                <span className="role-option-desc">Browse, buy and trade quality farm produce</span>
              </div>
              <span className="role-option-arrow">→</span>
            </div>

            <div 
              className="role-option-btn" 
              onClick={() => navigate('/register?role=admin')}
            >
              <div className="role-option-info">
                <span className="role-option-title">Register as Admin</span>
                <span className="role-option-desc">Manage marketplace, verify crops and system users</span>
              </div>
              <span className="role-option-arrow">→</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
