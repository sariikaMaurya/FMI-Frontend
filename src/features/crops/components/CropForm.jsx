import React, { useState, useEffect } from 'react'
import { getCropPrimaryImage } from '../utils'

export default function CropForm({ initial = {}, onSave, onCancel, requireImage = false }){
  const [form, setForm] = useState({
    cropName: initial.cropName || '',
    category: initial.category || '',
    description: initial.description || '',
    price: initial.price || '',
    quantity: initial.quantity || ''
  })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(getCropPrimaryImage(initial))
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    // revoke object URL on unmount
    return () => { if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview) }
  }, [preview])

  const submit = async (e) => {
    e.preventDefault();
    if (requireImage && !file && !preview) {
      setError('Add to crop select the image.')
      return
    }
    setUploading(true)
    setError('')
    try{
      await onSave({
        ...form,
        price: Number(form.price),
        quantity: Number(form.quantity)
      }, file, (p) => setProgress(p))
    }catch(err){
      setError(err?.response?.data?.message || err?.message || 'Crop is not save')
    }finally{
      setUploading(false)
      setProgress(0)
    }
  }

  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]
    setFile(f)
    if (f){
      const url = URL.createObjectURL(f)
      setPreview(url)
    }
  }

  return (
    <form onSubmit={submit} className="crop-form-card">
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="crop-form-grid">
        <div className="mb-2">
          <label className="form-label">Crop name</label>
          <input className="form-control" value={form.cropName} onChange={e => setForm({...form, cropName: e.target.value})} disabled={uploading} required />
        </div>
        <div className="mb-2">
          <label className="form-label">Category</label>
          <input className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} disabled={uploading} placeholder="Vegetables, grains, fruits..." />
        </div>
        <div className="mb-2">
          <label className="form-label">Price</label>
          <input type="number" min="0" className="form-control" value={form.price} onChange={e => setForm({...form, price: e.target.value})} disabled={uploading} required />
        </div>
        <div className="mb-2">
          <label className="form-label">Quantity</label>
          <input type="number" min="1" className="form-control" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} disabled={uploading} required />
        </div>
      </div>
      <div className="mb-2">
        <label className="form-label">Description</label>
        <textarea className="form-control" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} disabled={uploading} placeholder="Quality, harvest details, location..." />
      </div>
      <div className="mb-2">
        <label className="form-label">Crop image{requireImage ? '' : ' (optional)'}</label>
        <input type="file" accept="image/*" className="form-control" onChange={onFile} disabled={uploading} required={requireImage && !preview} />
        {preview && (
          <img src={preview} alt="preview" className="crop-form-preview" />
        )}
      </div>
      {uploading && (
        <div className="mb-2">
          <div className="progress">
            <div className="progress-bar" role="progressbar" style={{width: `${progress}%`}} aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">{progress}%</div>
          </div>
        </div>
      )}
      <div className="d-flex gap-2">
        <button className="btn btn-primary" type="submit" disabled={uploading}>Save</button>
        <button className="btn btn-outline-secondary" type="button" onClick={onCancel} disabled={uploading}>Cancel</button>
      </div>
    </form>
  )
}
