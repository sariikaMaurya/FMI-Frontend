import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (location.state && location.state.token) {
      setToken(location.state.token)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long')
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword })
      toast.success('Password reset successful! Please login with your new password.')
      navigate('/login')
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Failed to reset password. Token may be invalid or expired.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Reset Password</h2>
        <p className="auth-subtitle">Enter your token and set a new password.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label" htmlFor="tokenInput">Reset Token</label>
            <textarea
              id="tokenInput"
              className="form-control font-monospace"
              rows="3"
              placeholder="Paste your reset token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="newPasswordInput">New Password</label>
            <input
              id="newPasswordInput"
              className="form-control"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="mb-4">
            <label className="form-label" htmlFor="confirmPasswordInput">Confirm New Password</label>
            <input
              id="confirmPasswordInput"
              className="form-control"
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="small fw-semibold text-muted">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
