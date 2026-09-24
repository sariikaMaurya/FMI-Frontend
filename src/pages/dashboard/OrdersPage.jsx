import React, { useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import useOrders from '../../features/orders/hooks/useOrders'
import useAuth from '../../hooks/useAuth'

const money = value => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

export default function OrdersPage() {
  const { user } = useAuth()
  const { orders, loading, updateStatus } = useOrders()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const perPage = 8

  const filtered = useMemo(() => {
    const rows = orders.filter(order => {
      const haystack = [
        order._id,
        order.farmerId?.name,
        order.merchantId?.name,
        order.cropId?.cropName,
        order.status,
      ].join(' ').toLowerCase()
      return haystack.includes(q.toLowerCase()) && (!status || order.status === status)
    })
    rows.sort((a, b) => sort === 'amount' ? (b.amount || 0) - (a.amount || 0) : new Date(b.createdAt) - new Date(a.createdAt))
    return rows
  }, [orders, q, status, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageRows = filtered.slice((page - 1) * perPage, page * perPage)
  const canEditOrders = user?.role === 'farmer'

  const getPaymentBadge = (order) => {
    const paymentStatus = String(order.paymentStatus || order.payment?.paymentStatus || '').toLowerCase()
    if (['success', 'paid', 'completed', 'done'].includes(paymentStatus) || order.status === 'delivered') {
      return { label: 'Paid', className: 'success' }
    }
    if (['failed', 'cancelled', 'rejected'].includes(paymentStatus)) {
      return { label: 'Failed', className: 'danger' }
    }
    return { label: 'Pending', className: 'warning' }
  }

  return (
    <DashboardLayout title="Orders">
      <div className="module-toolbar">
        <div><h4>Orders</h4><p>Track order, farmer, merchant, payment, and fulfillment details.</p></div>
        <div className="toolbar-actions">
          <input className="form-control" placeholder="Search orders" value={q} onChange={e => { setQ(e.target.value); setPage(1) }} />
          <select className="form-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All status</option>
            {['pending', 'accepted', 'dispatched', 'delivered', 'cancelled'].map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          <select className="form-select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="amount">Highest amount</option>
          </select>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Order ID</th><th>Farmer</th><th>Merchant</th><th>Product</th><th>Qty</th><th>Price</th><th>Status</th><th>Date</th><th>Payment</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="9"><div className="loading-state">Loading orders...</div></td></tr> : pageRows.map(order => {
              const paymentBadge = getPaymentBadge(order)
              return (
                <tr key={order._id}>
                  <td>{order._id.slice(-8).toUpperCase()}</td>
                  <td>{order.farmerId?.name || '-'}</td>
                  <td>{order.merchantId?.name || '-'}</td>
                  <td>{order.cropId?.cropName || '-'}</td>
                  <td>{order.quantity}</td>
                  <td>{money(order.amount)}</td>
                  <td>
                    {canEditOrders ? (
                      <select className="form-select form-select-sm" value={order.status} onChange={e => updateStatus(order._id, e.target.value)}>
                        {['pending', 'accepted', 'dispatched', 'delivered', 'cancelled'].map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    ) : (
                      <span className="status-pill">{order.status}</span>
                    )}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td><span className={`status-pill ${paymentBadge.className}`}>{paymentBadge.label}</span></td>
                </tr>
              )
            })}
            {!loading && pageRows.length === 0 && <tr><td colSpan="9"><div className="empty-state">No orders found</div></td></tr>}
          </tbody>
        </table>
      </div>
      <div className="pagination-row">
        <button className="btn btn-light" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
        <span>Page {page} of {pages}</span>
        <button className="btn btn-light" disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </DashboardLayout>
  )
}
