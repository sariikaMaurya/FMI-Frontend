import React, { useState } from 'react'
import CropForm from './CropForm'
import { getCropPrimaryImage } from '../utils'

export default function CropList({ crops, onCreate, onUpdate, onRemove }){
  const [editing, setEditing] = useState(null)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>My Crops</h5>
        <button className="btn btn-sm btn-primary" onClick={() => setEditing({})}>Add Crop</button>
      </div>

      {editing && (
        <CropForm initial={editing} onCancel={() => setEditing(null)} onSave={async (data, file, onProgress) => {
          if (editing._id) await onUpdate(editing._id, data, file, onProgress)
          else await onCreate(data, file, onProgress)
          setEditing(null)
        }} requireImage={!editing._id} />
      )}

      <div className="row">
        {crops.map(c => (
          <div className="col-md-4" key={c._id}>
            <div className="card mb-3">
              {getCropPrimaryImage(c) && <img src={getCropPrimaryImage(c)} className="card-img-top" alt={c.cropName || 'crop'} />}
              <div className="card-body">
                <h6 className="card-title">{c.cropName}</h6>
                <p className="card-text">Price: Rs. {c.price}</p>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(c)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => onRemove(c._id)}>Delete</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
