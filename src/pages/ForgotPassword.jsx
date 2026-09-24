import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-toastify'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      toast.success(res.data.message || 'Reset token generated!')
      if (res.data.token) {
        setResetToken(res.data.token)
        toast.info('Local Dev Mode: Token displayed below.')
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Failed to generate reset token'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your registered email to request a reset token.</p>

        {!resetToken ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label" htmlFor="emailInput">Email Address</label>
              <input
                id="emailInput"
                className="form-control"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Get Reset Token'}
            </button>
          </form>
        ) : (
          <div className="mt-3">
            <div className="alert alert-success p-3 border-0 rounded-3 mb-4">
              <h6 className="alert-heading fw-bold mb-2">Reset Token Generated!</h6>
              <p className="small mb-2 text-break" style={{ fontSize: '0.85rem' }}>
                Copy the token below to reset your password:
              </p>
              <div className="bg-white p-2 rounded border font-monospace text-dark text-break select-all" style={{ fontSize: '0.8rem', maxHeight: '100px', overflowY: 'auto' }}>
                {resetToken}
              </div>
            </div>
            <button
              onClick={() => navigate('/reset-password', { state: { token: resetToken } })}
              className="btn btn-primary w-100 mb-2"
            >
              Proceed to Reset Password
            </button>
            <button
              onClick={() => setResetToken('')}
              className="btn btn-light w-100 text-muted"
            >
              Request Another Token
            </button>
          </div>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="small fw-semibold text-muted">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
