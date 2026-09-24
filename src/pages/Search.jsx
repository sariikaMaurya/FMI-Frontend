import React, { useState } from 'react'
import api from '../services/api'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useCart from '../features/cart/hooks/useCart'
import { getCropPrimaryImage } from '../features/crops/utils'

export default function Search() {
  const { user } = useAuth()
  const { add } = useCart({ enabled: Boolean(user) })
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [addingId, setAddingId] = useState(null)

  const search = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      const res = await api.get('/crops/search', { params: { q } })
      const allCrops = res.data || []
      setResults(allCrops)
      setHasSearched(true)
    } catch (err) {
      console.error(err)
      toast.error('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addCropToCart = async (crop) => {
    if (!crop.verified) {
      toast.warning('This crop is pending verification and cannot be added to cart yet.')
      return
    }
    setAddingId(crop._id)
    try {
      await add(crop._id, 1)
      toast.success(`${crop.cropName} added to cart successfully.`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart.')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="search-shell">
      <div className="search-header-block">
        <span className="eyebrow" style={{ color: 'var(--primary-color)' }}>Discover</span>
        <h2 className="search-title">Search Produce</h2>
        <p className="search-subtitle">Find fresh crops listed by farmers — both verified and newly added.</p>
      </div>

      <div className="premium-card search-bar-card">
        <div className="premium-card-body p-3">
          <form onSubmit={search} className="search-form">
            <div className="search-input-wrap">
              <span className="search-input-icon">🔍</span>
              <input
                aria-label="Search crops"
                className="form-control search-input-styled"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Enter crop name (e.g., Wheat, Potato, Rice)..."
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="search-loading">
          <div className="search-spinner"></div>
          <span>Searching crops...</span>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="search-empty-state">
          <div className="search-empty-icon">🌾</div>
          <strong>No crops found</strong>
          <p>No results matching "<strong>{q}</strong>". Try a different search term.</p>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="search-results-info">
            <span>{results.length} crop{results.length !== 1 ? 's' : ''} found</span>
          </div>
          <div className="search-results-grid">
            {results.map((r, index) => (
              <div className="search-result-card" key={r._id} style={{ animationDelay: `${index * 0.06}s` }}>
                <div className="search-card-inner">
                  {getCropPrimaryImage(r) ? (
                    <div className="search-card-img-wrap">
                      <img src={getCropPrimaryImage(r)} alt={r.cropName} />
                      <span className={`search-card-badge ${r.verified ? 'verified' : 'pending'}`}>
                        {r.verified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  ) : (
                    <div className="search-card-img-placeholder">
                      <span>{r.category || 'Crop'}</span>
                      <span className={`search-card-badge ${r.verified ? 'verified' : 'pending'}`}>
                        {r.verified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  )}
                  <div className="search-card-body">
                    <div className="search-card-top">
                      <h5>{r.cropName}</h5>
                      <span className="search-card-category">{r.category || 'General'}</span>
                    </div>
                    <p className="search-card-desc">
                      {r.description || 'Fresh produce from local fields.'}
                    </p>

                    <div className="search-card-meta">
                      <div className="search-card-price">
                        <span>Price</span>
                        <strong>Rs. {r.price}</strong>
                      </div>
                      <div className="search-card-stock">
                        <span>Available</span>
                        <strong>{r.quantity} units</strong>
                      </div>
                    </div>

                    {r.farmerId?.name && (
                      <div className="search-card-farmer">
                        <div className="search-farmer-avatar">{r.farmerId.name.charAt(0).toUpperCase()}</div>
                        <span>{r.farmerId.name}</span>
                      </div>
                    )}

                    <div className="search-card-action">
                      {user?.role === 'merchant' ? (
                        <button
                          className={`btn btn-sm w-100 ${r.verified ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => addCropToCart(r)}
                          disabled={addingId === r._id || !r.verified}
                        >
                          {!r.verified ? 'Pending Verification' : addingId === r._id ? 'Adding...' : 'Add to Cart'}
                        </button>
                      ) : user ? (
                        <Link to="/dashboard/crops" className="btn btn-sm btn-outline-primary w-100">
                          Open Crops
                        </Link>
                      ) : (
                        <Link to="/login" className="btn btn-sm btn-outline-primary w-100">
                          Sign in to Purchase
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="search-welcome-state">
          <div className="search-welcome-icon">🌱</div>
          <strong>Start Exploring</strong>
          <p>Enter a crop name above and click search to discover available produce.</p>
        </div>
      )}
    </div>
  )
}

