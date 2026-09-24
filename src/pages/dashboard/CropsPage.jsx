import React, { useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import useCrops from '../../features/crops/hooks/useCrops'
import useCart from '../../features/cart/hooks/useCart'
import useAuth from '../../hooks/useAuth'
import CropForm from '../../features/crops/components/CropForm'
import { getCropPrimaryImage } from '../../features/crops/utils'
import { toast } from 'react-toastify'

export default function CropsPage() {
  const { user } = useAuth()
  const { crops, loading, create, update, remove } = useCrops()
  const { add } = useCart()
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [addingId, setAddingId] = useState(null)
  const userId = user?.id || user?._id
  const isFarmer = user?.role === 'farmer'
  const isMerchant = user?.role === 'merchant'

  const visibleCrops = useMemo(() => {
    if (isFarmer) return crops.filter(crop => String(crop.farmerId?._id || crop.farmerId || '') === String(userId || ''))
    if (isMerchant) return crops.filter(crop => crop.verified)
    return crops
  }, [crops, isFarmer, isMerchant, userId])

  const categories = useMemo(() => [...new Set(visibleCrops.map(c => c.category).filter(Boolean))], [visibleCrops])
  const filtered = useMemo(() => visibleCrops.filter(crop => {
    const queryMatch = [crop.cropName, crop.category, crop.farmerId?.name].join(' ').toLowerCase().includes(q.toLowerCase())
    const categoryMatch = !category || crop.category === category
    return queryMatch && categoryMatch
  }), [visibleCrops, q, category])

  const getCropImage = (crop) => getCropPrimaryImage(crop)

  const saveCrop = async (data, file, onProgress) => {
    if (editing?._id) {
      await update(editing._id, data, file, onProgress)
      toast.success('Crop updated successfully.')
    } else {
      await create(data, file, onProgress)
      toast.success('Crop added successfully. Admin verification pending.')
    }
    setEditing(null)
    setShowForm(false)
  }

  const deleteCrop = async (id) => {
    await remove(id)
    toast.success('Crop deleted.')
  }

  const addCropToCart = async (crop) => {
    setAddingId(crop._id)
    try {
      await add(crop._id, 1)
      toast.success(`${crop.cropName} Add to the cart.`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Not added into the cart.')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <DashboardLayout title="Crops">
      <div className="module-toolbar">
        <div>
          <h4>{isFarmer ? 'My Crop Listings' : 'Crops Marketplace'}</h4>
          <p>{isFarmer ? 'Add crops with images, manage stock, and wait for verification.' : 'Search verified produce, stock, prices, and farmer information.'}</p>
        </div>
        <div className="toolbar-actions">
          <input className="form-control" placeholder="Search crops" value={q} onChange={e => setQ(e.target.value)} />
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
          {isFarmer && (
            <button className="btn btn-primary" onClick={() => {
              setEditing(showForm ? null : {})
              setShowForm(value => !value)
            }}>
              {showForm ? 'Close Form' : 'Add Crop'}
            </button>
          )}
        </div>
      </div>
      {isFarmer && showForm && (
        <CropForm
          initial={editing || {}}
          onCancel={() => {
            setEditing(null)
            setShowForm(false)
          }}
          onSave={saveCrop}
          requireImage={!editing?._id}
        />
      )}
      {loading ? <div className="loading-state">Loading crops...</div> : (
        <div className="crop-grid">
          {filtered.map(crop => (
            <article className="crop-card" key={crop._id}>
              {getCropImage(crop) ? <img src={getCropImage(crop)} alt={crop.cropName} /> : <div className="crop-image-placeholder">{crop.category || 'Crop'}</div>}
              <div className="crop-card-body">
                <div className="d-flex justify-content-between gap-2">
                  <h5>{crop.cropName}</h5>
                  <span className={`status-pill ${crop.verified ? 'success' : ''}`}>{crop.verified ? 'Verified' : 'Pending'}</span>
                </div>
                <p>{crop.description || 'Fresh produce listed on the marketplace.'}</p>
                <dl className="crop-meta">
                  <div><dt>Price</dt><dd>Rs. {crop.price}</dd></div>
                  <div><dt>Stock</dt><dd>{crop.quantity}</dd></div>
                  <div><dt>Category</dt><dd>{crop.category || '-'}</dd></div>
                  <div><dt>Farmer</dt><dd>{crop.farmerId?.name || 'Unknown'}</dd></div>
                </dl>
                {isMerchant && <button className="btn btn-primary w-100" onClick={() => addCropToCart(crop)} disabled={addingId === crop._id}>{addingId === crop._id ? 'Adding...' : 'Add to Cart'}</button>}
                {isFarmer && (
                  <div className="d-flex gap-2">
                    <button className="btn btn-outline-secondary w-100" onClick={() => {
                      setEditing(crop)
                      setShowForm(true)
                    }}>Edit</button>
                    <button className="btn btn-outline-danger w-100" onClick={() => deleteCrop(crop._id)}>Delete</button>
                  </div>
                )}
              </div>
            </article>
          ))}
          {filtered.length === 0 && <div className="empty-state grid-empty">{isFarmer ? 'No crops yet. Add your first crop with an image.' : 'No crops match your filters'}</div>}
        </div>
      )}
    </DashboardLayout>
  )
}
