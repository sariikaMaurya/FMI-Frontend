import React, { useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import UsersList from './AdminPanel/UsersList'
import CropVerification from './AdminPanel/CropVerification'
import RegisterUser from './AdminPanel/RegisterUser'

export default function AdminDashboard(){
  const [refreshKey, setRefreshKey] = useState(0)

  const handleUserAdded = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="admin-workbench">
        <div className="module-toolbar">
          <div>
            <h4>Admin Control Center</h4>
            <p>Create admin accounts, manage user roles, and verify crop listings.</p>
          </div>
        </div>
        <div className="row g-4">
          <div className="col-lg-7">
            <UsersList key={refreshKey} />
          </div>
          <div className="col-lg-5">
            <RegisterUser onUserAdded={handleUserAdded} />
            <CropVerification />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
