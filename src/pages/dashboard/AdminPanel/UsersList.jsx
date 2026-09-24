import React, { useEffect, useState } from 'react'
import api from '../../../services/api'
import { toast } from 'react-toastify'

export default function UsersList(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => { load() }, [page, search, roleFilter])

  const load = async () => {
    setLoading(true)
    try{
      const params = { page, limit: pageSize }
      if (search) params.q = search
      if (roleFilter) params.role = roleFilter
      const res = await api.get('/admin/users', { params })
      setUsers(res.data.items || [])
      setPage(res.data.page || 1)
      setTotal(res.data.total || 0)
      setPages(res.data.pages || 1)
    }catch(e){ 
      console.error(e) 
      toast.error('Failed to load users list')
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role })
      toast.success('User role updated successfully!')
      load()
    } catch(e) {
      console.error(e)
      toast.error('Failed to update user role')
    }
  }

  const pageItems = users
  const totalPages = pages

  return (
    <div className="premium-card mb-4">
      <div className="premium-card-header bg-light">
        <h5 className="mb-0 fw-bold text-teal" style={{ color: 'var(--primary-color)' }}>System Users</h5>
        <span className="badge bg-teal" style={{ backgroundColor: 'var(--primary-color)', color: '#fff' }}>
          Total: {total}
        </span>
      </div>
      <div className="premium-card-body">
        <div className="row g-2 mb-3">
          <div className="col">
            <input 
              aria-label="Search users"
              className="form-control" 
              placeholder="Search name or email..." 
              value={search} 
              onChange={e => { setSearch(e.target.value); setPage(1) }} 
            />
          </div>
          <div className="col-auto">
            <select 
              aria-label="Filter by role"
              className="form-select" 
              value={roleFilter} 
              onChange={e => { setRoleFilter(e.target.value); setPage(1) }} 
              style={{width:160}}
            >
              <option value="">All Roles</option>
              <option value="farmer">Farmer</option>
              <option value="merchant">Merchant</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="col-auto">
            <button className="btn btn-outline-primary" onClick={load}>Refresh</button>
          </div>
        </div>

        {loading && (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-teal" role="status" style={{ color: 'var(--primary-color)' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && pageItems.length === 0 && (
          <div className="alert alert-secondary text-center py-4">No users found.</div>
        )}

        {!loading && pageItems.length > 0 && (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Current Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map(u => (
                    <tr key={u._id}>
                      <td className="fw-semibold">{u.name}</td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge ${
                          u.role === 'admin' ? 'bg-danger' : u.role === 'merchant' ? 'bg-info' : 'bg-success'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <select 
                          aria-label={`Change role for ${u.name}`}
                          className="form-select form-select-sm" 
                          value={u.role} 
                          onChange={e => changeRole(u._id, e.target.value)}
                          style={{ maxWidth: '120px' }}
                        >
                          <option value="farmer">Farmer</option>
                          <option value="merchant">Merchant</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="d-flex align-items-center justify-content-between mt-3">
              <div className="text-muted small">
                Showing {pageItems.length} of {total} users
              </div>
              <div className="d-flex align-items-center">
                <button 
                  className="btn btn-sm btn-outline-secondary me-2" 
                  disabled={page <= 1} 
                  onClick={() => setPage(p => Math.max(1, p-1))}
                >
                  Prev
                </button>
                <span className="small text-muted"> Page {page} of {totalPages} </span>
                <button 
                  className="btn btn-sm btn-outline-secondary ms-2" 
                  disabled={page >= totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p+1))}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
