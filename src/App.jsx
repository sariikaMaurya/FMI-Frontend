import React, { useEffect, useState } from 'react'
import { Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom'
import { io } from 'socket.io-client'
import { AuthProvider } from './contexts/AuthContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Search from './pages/Search'
import Chat from './pages/Chat'
import RequireAuth from './routes/RequireAuth'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import DashboardOverview from './pages/dashboard/DashboardOverview'
import PeoplePage from './pages/dashboard/PeoplePage'
import CropsPage from './pages/dashboard/CropsPage'
import OrdersPage from './pages/dashboard/OrdersPage'
import CartPage from './pages/dashboard/CartPage'
import PaymentsPage from './pages/dashboard/PaymentsPage'
import ReportsPage from './pages/dashboard/ReportsPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import ProfilePage from './pages/dashboard/ProfilePage'
import CropAnalysisPage from './pages/dashboard/CropAnalysisPage'
import useAuth from './hooks/useAuth'

function Navigation() {
  const { user } = useAuth()
  const location = useLocation()
  const [chatCount, setChatCount] = useState(0)
  const brandTo = user ? `/dashboard/${user.role || 'farmer'}` : '/'
  const isMerchant = user?.role === 'merchant'
  const profileInitial = (user?.name || user?.email || 'U').charAt(0).toUpperCase()

  useEffect(() => {
    if (location.pathname === '/chat') setChatCount(0)
  }, [location.pathname])

  useEffect(() => {
    const token = localStorage.getItem('fm_token')
    if (!user || !token) {
      setChatCount(0)
      return undefined
    }

    const socketUrl = import.meta.env.VITE_API_URL || '/'
    const socket = io(socketUrl, { auth: { token } })
    socket.on('private_message', () => {
      if (window.location.pathname !== '/chat') setChatCount(count => count + 1)
    })

    return () => socket.disconnect()
  }, [user])

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
      <div className="container">
        <Link className="navbar-brand" to={brandTo}>FarmTrade</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item"><NavLink className="nav-link" to="/search">Search</NavLink></li>
            {user && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/dashboard/crops">Crops</NavLink></li>
                {isMerchant && (
                  <li className="nav-item">
                    <NavLink className="nav-link cart-nav-link" to="/dashboard/cart">
                      Cart
                    </NavLink>
                  </li>
                )}
                <li className="nav-item"><NavLink className="nav-link" to="/dashboard/orders">Orders</NavLink></li>
                <li className="nav-item">
                  <NavLink className="nav-link notification-nav-link" to="/chat">
                    Chat
                    {chatCount > 0 && (
                      <>
                        <span className="notification-icon" aria-hidden="true"></span>
                        <span className="cart-count-badge">{chatCount}</span>
                      </>
                    )}
                  </NavLink>
                </li>
                <li className="nav-item"><NavLink className="nav-link" to={`/dashboard/${user.role}`}>Dashboard</NavLink></li>
                <li className="nav-item navbar-user-meta-wrap">
                  <div className="navbar-user-meta">
                    <span className="navbar-user-name">{user?.name || 'User'}</span>
                    <span className="navbar-user-email">{user?.email || ''}</span>
                  </div>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="navbar-profile" to="/dashboard/profile" aria-label="Open profile">
                    {user.profileImage ? <img src={user.profileImage} alt={user.name || 'Profile'} /> : <span>{profileInitial}</span>}
                  </Link>
                </li>
              </>
            )}
            {!user && (
              <>
                <li className="nav-item"><NavLink className="nav-link" to="/register">Register</NavLink></li>
                <li className="nav-item ms-2"><Link className="btn btn-sm btn-primary" to="/login">Login</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

function PublicHome() {
  const { user } = useAuth()

  if (user) return <Navigate to={`/dashboard/${user.role || 'farmer'}`} replace />
  return <Home />
}

export default function App(){
  return (
    <AuthProvider>
      <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
        <Navigation />
        <div className="app-main flex-grow-1">
          <Routes>
            <Route path="/" element={<PublicHome/>} />
            <Route path="/search" element={<Search/>} />
            <Route path="/cart" element={<RequireAuth><CartPage/></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth><OrdersPage/></RequireAuth>} />
            <Route path="/chat" element={<RequireAuth><Chat/></RequireAuth>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>} />
            <Route path="/forgot-password" element={<ForgotPassword/>} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/dashboard/farmer" element={<RequireAuth role="farmer"><DashboardOverview mode="Farmer"/></RequireAuth>} />
            <Route path="/dashboard/merchant" element={<RequireAuth role="merchant"><DashboardOverview mode="Merchant"/></RequireAuth>} />
            <Route path="/dashboard/admin" element={<RequireAuth role="admin"><AdminDashboard/></RequireAuth>} />
            <Route path="/dashboard/farmers" element={<RequireAuth role="admin"><PeoplePage type="farmers"/></RequireAuth>} />
            <Route path="/dashboard/merchants" element={<RequireAuth role="admin"><PeoplePage type="merchants"/></RequireAuth>} />
            <Route path="/dashboard/crops" element={<RequireAuth><CropsPage/></RequireAuth>} />
            <Route path="/dashboard/crop-analysis" element={<RequireAuth role="farmer"><CropAnalysisPage/></RequireAuth>} />
            <Route path="/dashboard/orders" element={<RequireAuth><OrdersPage/></RequireAuth>} />
            <Route path="/dashboard/cart" element={<RequireAuth><CartPage/></RequireAuth>} />
            <Route path="/dashboard/payments" element={<RequireAuth><PaymentsPage/></RequireAuth>} />
            <Route path="/dashboard/reports" element={<RequireAuth><ReportsPage/></RequireAuth>} />
            <Route path="/dashboard/settings" element={<RequireAuth><SettingsPage/></RequireAuth>} />
            <Route path="/dashboard/profile" element={<RequireAuth><ProfilePage/></RequireAuth>} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      </div>
    </AuthProvider>
  )
}
