import React, { useEffect, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'

export default function ReportsPage() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/summary').then(res => setReport(res.data)).finally(() => setLoading(false))
  }, [])

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'farmtrade-report.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout title="Reports">
      <div className="module-toolbar">
        <div><h4>Reports</h4><p>Generate operational summaries for orders, crops, and payments.</p></div>
        <button className="btn btn-primary" disabled={!report} onClick={exportJson}>Export JSON</button>
      </div>
      {loading ? <div className="loading-state">Preparing report...</div> : (
        <div className="stat-grid">
          <div className="stat-card"><span>Orders</span><strong>{report?.totals?.orders || 0}</strong></div>
          <div className="stat-card stat-success"><span>Revenue</span><strong>Rs. {Number(report?.totals?.revenue || 0).toLocaleString('en-IN')}</strong></div>
          <div className="stat-card stat-warning"><span>Pending</span><strong>{report?.totals?.pending || 0}</strong></div>
          <div className="stat-card stat-dark"><span>Crops</span><strong>{report?.totals?.crops || 0}</strong></div>
        </div>
      )}
    </DashboardLayout>
  )
}
