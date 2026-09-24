import React from 'react'
import useAuth from '../hooks/useAuth'

export default function Topbar({ title }){
  const { user } = useAuth()
  const profileInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

  return (
    <header className="dashboard-topbar">
      <div>
        <h5 className="mb-0">{title || 'Dashboard'}</h5>
        <span className="text-muted small">{user?.name || 'User'} - {user?.role || 'workspace'}</span>
      </div>
      <div className="topbar-user">
        <div className="text-end d-none d-sm-block">
          <strong className="d-block small">{user?.name || 'User'}</strong>
          <span className="text-muted small">{user?.email || ''}</span>
        </div>
        <div className="topbar-profile" aria-label="Profile">
          {user?.profileImage ? <img src={user.profileImage} alt={user.name || 'Profile'} /> : <span>{profileInitial}</span>}
        </div>
      </div>
    </header>
  )
}
