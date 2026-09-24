import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'

export default function SettingsPage() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    api.get('/notifications').then(res => setNotifications(res.data || [])).catch(() => setNotifications([]))
  }, [])

  return (
    <DashboardLayout title="Settings">
      <div className="row g-4">
        <div className="col-lg-6">
          <div className="premium-card">
            <div className="premium-card-header"><h5 className="mb-0">Session and Security</h5></div>
            <div className="premium-card-body">
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Keep session active with refresh token</label></div>
              <div className="form-check form-switch mb-3"><input className="form-check-input" type="checkbox" defaultChecked /><label className="form-check-label">Show order status notifications</label></div>
              <div className="form-check form-switch"><input className="form-check-input" type="checkbox" /><label className="form-check-label">Email weekly reports</label></div>
            </div>
          </div>
        </div>
        <div className="col-lg-6">
          <div className="premium-card">
            <div className="premium-card-header"><h5 className="mb-0">Notifications</h5></div>
            <div className="premium-card-body notification-list">
              {notifications.map(item => <div key={item.id}><strong>{item.title}</strong><span>{item.message}</span></div>)}
              {notifications.length === 0 && <div className="empty-state">No notifications</div>}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
