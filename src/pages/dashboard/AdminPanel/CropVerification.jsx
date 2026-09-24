import React, { useEffect, useState } from 'react'
import api from '../../../services/api'
import { getCropPrimaryImage } from '../../../features/crops/utils'
import { toast } from 'react-toastify'

export default function CropVerification(){
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 9
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)

  useEffect(() => { load() }, [page, search])

  const load = async () => {
    setLoading(true)
    try{
      const params = { page, limit: pageSize, unverified: true }
      if (search) params.q = search
      const res = await api.get('/admin/crops', { params })
      setCrops(res.data.items || [])
      setPage(res.data.page || 1)
      setTotal(res.data.total || 0)
      setPages(res.data.pages || 1)
    }catch(e){ 
      console.error(e) 
      toast.error('Failed to load crops for verification')
    } finally {
      setLoading(false)
    }
  }

  const verify = async (id) => { 
    try {
      await api.patch(`/admin/crops/${id}/verify`)
      toast.success('Crop verified successfully!')
      load()
    } catch(e) {
      console.error(e)
      toast.error('Failed to verify crop')
    }
  }

  const pageItems = crops
  const totalPages = pages

  return (
    <div className="premium-card mb-4">
      <div className="premium-card-header bg-light">
        <h5 className="mb-0 fw-bold text-teal" style={{ color: 'var(--primary-color)' }}>Crop Verification</h5>
        <span className="badge bg-warning text-dark">Pending verification: {total}</span>
      </div>
      
      <div className="premium-card-body">
        <div className="d-flex mb-3">
          <input 
            aria-label="Search crops" 
            className="form-control me-2" 
            placeholder="Search crops by name..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1) }} 
          />
          <button type="button" className="btn btn-outline-primary" onClick={load}>Refresh</button>
        </div>

        {loading && (
          <div className="d-flex justify-content-center my-4">
            <div className="spinner-border text-teal" role="status" style={{ color: 'var(--primary-color)' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {!loading && pageItems.length === 0 && (
          <div className="alert alert-success text-center py-4">
            🎉 All crops verified! No pending verifications.
          </div>
        )}

        {!loading && pageItems.length > 0 && (
          <>
            <div className="row g-3">
              {pageItems.map(c => (
                <div className="col-md-6 col-lg-4" key={c._id}>
                  <div className="card h-100 border shadow-sm">
                    {getCropPrimaryImage(c) ? (
                      <img src={getCropPrimaryImage(c)} className="card-img-top" alt={c.cropName} style={{ height: '140px', objectFit: 'cover' }} />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center bg-light text-muted" style={{ height: '140px' }}>
                        No Image Provided
                      </div>
                    )}
                    <div className="card-body p-3 d-flex flex-column justify-content-between">
                      <div>
                        <h6 className="fw-bold mb-1">{c.cropName}</h6>
                        <div className="text-muted small mb-2">Category: {c.category || 'N/A'}</div>
                        <div className="mb-2">
                          <span className="fw-semibold text-teal" style={{ color: 'var(--primary-color)' }}>₹{c.price}</span> / unit
                        </div>
                        <div className="small mb-3 text-truncate">
                          <strong>Farmer:</strong> {c.farmerId?.name || 'Unknown'}
                        </div>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-success w-100" 
                        aria-label={`Verify ${c.cropName}`} 
                        onClick={() => verify(c._id)}
                      >
                        Verify Crop
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="d-flex align-items-center justify-content-between mt-4">
              <div className="text-muted small">
                Showing {pageItems.length} of {total} crops
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
