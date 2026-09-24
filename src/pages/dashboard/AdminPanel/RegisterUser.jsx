import React, { useState } from 'react'
import api from '../../../services/api'
import { toast } from 'react-toastify'

export default function RegisterUser({ onUserAdded }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) {
      return toast.error('Password must be at least 6 characters long')
    }

    setLoading(true)
    try {
      await api.post('/admin/users', { name, email, password, role })
      toast.success(`${role.toUpperCase()} account created successfully!`)
      
     
      setName('')
      setEmail('')
      setPassword('')
      
      if (onUserAdded) {
        onUserAdded()
      }
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.message || 'Failed to register user'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="premium-card dashboard-form-card mb-4">
      <div className="premium-card-header bg-light">
        <h5 className="mb-0 fw-bold text-teal" style={{ color: 'var(--primary-color)' }}>Add Platform User</h5>
      </div>
      <div className="premium-card-body">
        <p className="text-muted small mb-4">
          Create farmer, merchant, or admin accounts. Admin accounts are only available from this dashboard.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="dashboard-form-grid">
            <div className="dashboard-form-field">
              <label className="form-label" htmlFor="newUserName">Full Name</label>
              <input
                id="newUserName"
                className="form-control"
                placeholder="E.g., Raj Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field">
              <label className="form-label" htmlFor="newUserEmail">Email Address</label>
              <input
                id="newUserEmail"
                className="form-control"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="dashboard-form-field">
              <label className="form-label" htmlFor="newUserPassword">Password</label>
              <input
                id="newUserPassword"
                className="form-control"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="dashboard-form-field">
              <label className="form-label" htmlFor="newUserRole">Assign System Role</label>
              <select
                id="newUserRole"
                className="form-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Administrator (Platform Controller)</option>
                <option value="merchant">Merchant (Trader/Buyer)</option>
                <option value="farmer">Farmer (Producer/Seller)</option>
              </select>
            </div>
          </div>

          <div className="dashboard-form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
