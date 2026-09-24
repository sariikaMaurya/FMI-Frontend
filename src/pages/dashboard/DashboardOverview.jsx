import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'
import useAuth from '../../hooks/useAuth'

const money = value => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

function StatCard({ label, value, tone = 'primary' }) {
  return (
    <div className={`stat-card stat-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function MiniChart({ title, data }) {
  const max = Math.max(...data.map(item => item.value), 1)
  return (
    <div className="premium-card h-100">
      <div className="premium-card-header"><h6 className="mb-0">{title}</h6></div>
      <div className="premium-card-body">
        {data.length === 0 ? <div className="empty-state">No data yet</div> : data.map(item => (
          <div className="chart-row" key={item.label}>
            <span>{item.label}</span>
            <div className="chart-track"><div style={{ width: `${(item.value / max) * 100}%` }} /></div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardOverview({ mode }) {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      setLoading(true)
      try {
        const requests = [api.get('/reports/summary')]
        if (user?.role === 'admin') requests.push(api.get('/admin/analytics'))
        const [reportRes, analyticsRes] = await Promise.all(requests)
        if (!alive) return
        setReport(reportRes.data)
        setAnalytics(analyticsRes?.data || null)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [user?.role])

  const cards = useMemo(() => {
    if (analytics?.cards) return analytics.cards
    return {
      totalOrders: report?.totals?.orders || 0,
      revenue: report?.totals?.revenue || 0,
      pendingOrders: report?.totals?.pending || 0,
      completedOrders: report?.totals?.completed || 0,
      crops: report?.totals?.crops || 0,
    }
  }, [analytics, report])

  return (
    <DashboardLayout title={`${mode || user?.role || 'User'} Dashboard`}>
      {loading ? <div className="loading-state">Loading dashboard...</div> : (
        <>
          <div className="stat-grid">
            {user?.role === 'admin' && <StatCard label="Total Farmers" value={cards.totalFarmers || 0} />}
            {user?.role === 'admin' && <StatCard label="Total Merchants" value={cards.totalMerchants || 0} tone="info" />}
            <StatCard label="Total Orders" value={cards.totalOrders || 0} tone="dark" />
            <StatCard label="Revenue" value={money(cards.revenue)} tone="success" />
            <StatCard label="Pending Orders" value={cards.pendingOrders || 0} tone="warning" />
            <StatCard label="Completed Orders" value={cards.completedOrders || 0} tone="success" />
          </div>

          <div className="row g-4 mt-1">
            <div className="col-lg-6">
              <MiniChart title="Orders by Status" data={analytics?.charts?.ordersByStatus || [
                { label: 'pending', value: report?.totals?.pending || 0 },
                { label: 'completed', value: report?.totals?.completed || 0 },
              ]} />
            </div>
            <div className="col-lg-6">
              <MiniChart title={user?.role === 'admin' ? 'Users by Role' : 'Activity'} data={analytics?.charts?.usersByRole || [
                { label: 'orders', value: report?.totals?.orders || 0 },
                { label: 'crops', value: report?.totals?.crops || 0 },
              ]} />
            </div>
          </div>

          <div className="premium-card mt-4">
            <div className="premium-card-header"><h6 className="mb-0">Recent Orders</h6></div>
            <div className="table-responsive border-0">
              <table className="table align-middle">
                <thead><tr><th>Order ID</th><th>Product</th><th>Quantity</th><th>Status</th><th>Amount</th></tr></thead>
                <tbody>
                  {(report?.recentOrders || []).map(order => (
                    <tr key={order._id}>
                      <td>{order._id.slice(-8).toUpperCase()}</td>
                      <td>{order.cropId?.cropName || 'Crop'}</td>
                      <td>{order.quantity}</td>
                      <td><span className="status-pill">{order.status}</span></td>
                      <td>{money(order.amount)}</td>
                    </tr>
                  ))}
                  {(report?.recentOrders || []).length === 0 && <tr><td colSpan="5"><div className="empty-state">No recent orders</div></td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
