import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'

export default function ProfilePage() {
  const [form, setForm] = useState({ name: '', phone: '', address: '', profileImage: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/profile').then(res => setForm({
      name: res.data.name || '',
      phone: res.data.phone || '',
      address: res.data.address || '',
      profileImage: res.data.profileImage || '',
    }))
  }, [])

  const save = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/profile', form)
      toast.success('Profile updated successfully.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Profile update failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Profile">
      <form className="premium-card dashboard-form-card" onSubmit={save}>
        <div className="premium-card-header"><h5 className="mb-0">Profile Management</h5></div>
        <div className="premium-card-body">
          <div className="dashboard-form-grid">
            <div className="dashboard-form-field"><label className="form-label">Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="dashboard-form-field"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="dashboard-form-field full-width"><label className="form-label">Address</label><textarea className="form-control" rows="4" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} /></div>
            <div className="dashboard-form-field full-width"><label className="form-label">Profile image URL</label><input className="form-control" value={form.profileImage} onChange={e => setForm({ ...form, profileImage: e.target.value })} /></div>
          </div>
          <div className="dashboard-form-actions">
            <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </div>
      </form>
    </DashboardLayout>
  )
}
