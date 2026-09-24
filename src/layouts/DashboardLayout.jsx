import React from 'react'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout({ children }){
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <div className="dashboard-main">
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  )
}
