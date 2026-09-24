import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'

const money = value => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

export default function PaymentsPage() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments/history').then(res => setPayments(res.data || [])).finally(() => setLoading(false))
  }, [])

  const summary = useMemo(() => {
    return payments.reduce((acc, payment) => {
      if (payment.paymentStatus === 'success') acc.paid += payment.amount || 0
      if (payment.paymentStatus === 'pending') acc.pending += 1
      return acc
    }, { paid: 0, pending: 0 })
  }, [payments])

  return (
    <DashboardLayout title="Payments">
      <div className="module-toolbar">
        <div>
          <h4>Payments</h4>
          <p>Track successful and pending checkout payments.</p>
        </div>
      </div>
      <div className="stat-grid mb-4">
        <div className="stat-card stat-success"><span>Paid Amount</span><strong>{money(summary.paid)}</strong></div>
        <div className="stat-card stat-warning"><span>Pending Payments</span><strong>{summary.pending}</strong></div>
        <div className="stat-card stat-dark"><span>Total Records</span><strong>{payments.length}</strong></div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Payment ID</th><th>Order</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="6"><div className="loading-state">Loading payments...</div></td></tr> : payments.map(payment => (
              <tr key={payment._id}>
                <td>{payment._id.slice(-8).toUpperCase()}</td>
                <td>{payment.orderId?._id?.slice(-8).toUpperCase() || '-'}</td>
                <td>{money(payment.amount)}</td>
                <td>{payment.paymentMethod || 'online'}</td>
                <td><span className={`status-pill ${payment.paymentStatus === 'success' ? 'success' : payment.paymentStatus === 'failed' ? 'danger' : ''}`}>{payment.paymentStatus}</span></td>
                <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!loading && payments.length === 0 && <tr><td colSpan="6"><div className="empty-state">No payment records</div></td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
