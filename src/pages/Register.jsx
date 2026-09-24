import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('farmer')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // Parse role from URL query string
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const queryRole = params.get('role')
    if (queryRole && ['farmer', 'merchant', 'admin'].includes(queryRole)) {
      setRole(queryRole)
    }
  }, [location])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Use the api instance which points to /api automatically
      await api.post('/auth/register', { name, email, password, role })
      toast.success('Registration successful! Please sign in with your credentials.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      const message = err.response?.data?.message || 'Registration failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  // Prettify role name
  const getRoleTitle = () => {
    if (role === 'farmer') return 'Farmer Account'
    if (role === 'merchant') return 'Merchant Account'
    if (role === 'admin') return 'Admin Account'
    return 'User Account'
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Register a new {getRoleTitle()}</p>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="registerName">Full Name</label>
            <input
              id="registerName"
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="registerEmail">Email Address</label>
            <input
              id="registerEmail"
              className="form-control"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="registerPassword">Password</label>
            <input
              id="registerPassword"
              className="form-control"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Registering As</label>
            <div className="role-card-grid">
              <button
                type="button"
                className={`role-card-choice ${role === 'farmer' ? 'active' : ''}`}
                onClick={() => setRole('farmer')}
              >
                <strong>Farmer</strong>
                <span>Sell crops and manage produce listings.</span>
              </button>
              <button
                type="button"
                className={`role-card-choice ${role === 'merchant' ? 'active' : ''}`}
                onClick={() => setRole('merchant')}
              >
                <strong>Merchant</strong>
                <span>Buy verified crops and manage orders.</span>
              </button>
              <button
                type="button"
                className={`role-card-choice ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                <strong>Admin</strong>
                <span>Oversee marketplace operations & users.</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 mb-3"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center mt-3">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/login" className="small fw-semibold text-teal">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
