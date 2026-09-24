import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

 function Sidebar(){
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const role = user?.role || 'farmer'
  const adminOnly = user?.role === 'admin'
  const showCart = role === 'merchant'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const links = [
    { to: `/dashboard/${role}`, label: 'Dashboard' },
    ...(adminOnly ? [
      { to: '/dashboard/farmers', label: 'Farmers' },
      { to: '/dashboard/merchants', label: 'Merchants' },
    ] : []),
    { to: '/dashboard/crops', label: 'Crops' },
    ...(role === 'farmer' ? [{ to: '/dashboard/crop-analysis', label: 'Crop Health AI' }] : []),
    { to: '/dashboard/orders', label: 'Orders' },
    ...(showCart ? [{ to: '/dashboard/cart', label: 'Cart' }] : []),
    { to: '/dashboard/payments', label: 'Payments' },
    { to: '/dashboard/reports', label: 'Reports' },
    { to: '/dashboard/settings', label: 'Settings' },
    { to: '/dashboard/profile', label: 'Profile' },
  ]

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">FarmTrade</div>
      <div className="sidebar-role">{role} workspace</div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink key={link.to} className="sidebar-link" to={link.to}>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button type="button" className="btn btn-danger w-100" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
export default Sidebar;