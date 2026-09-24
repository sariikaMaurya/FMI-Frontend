import React, { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import api from '../../services/api'

export default function PeoplePage({ type }) {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const title = type === 'farmers' ? 'Farmers' : 'Merchants'

  useEffect(() => {
    setLoading(true)
    api.get(`/admin/${type}`).then(res => setItems(res.data || [])).finally(() => setLoading(false))
  }, [type])

  const filtered = useMemo(() => items.filter(item => [item.name, item.email, item.phone].join(' ').toLowerCase().includes(q.toLowerCase())), [items, q])

  return (
    <DashboardLayout title={title}>
      <div className="module-toolbar">
        <div><h4>{title}</h4><p>Manage verified platform {title.toLowerCase()}.</p></div>
        <input className="form-control toolbar-search" placeholder={`Search ${title.toLowerCase()}`} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Role</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan="5"><div className="loading-state">Loading...</div></td></tr> : filtered.map(user => (
              <tr key={user._id}>
                <td className="fw-semibold">{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || '-'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td><span className="status-pill">{user.role}</span></td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && <tr><td colSpan="5"><div className="empty-state">No {title.toLowerCase()} found</div></td></tr>}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
