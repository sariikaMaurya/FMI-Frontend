import React, { useEffect, useState } from 'react'
import api from '../../../services/api'
import { addToCart as apiAddToCart } from '../../../features/cart/api'
import { getCropPrimaryImage } from '../../../features/crops/utils'

export default function Market({ onBuy }){
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(false)
  const [qtyMap, setQtyMap] = useState({})
  const addToCart = async (crop, qty=1) => {
    setAdding(true)
    try{ await apiAddToCart({ cropId: crop._id, quantity: qty }); alert('Added to cart') }catch(e){ alert('Add failed') }
    setAdding(false)
  }

  useEffect(() => { load() }, [])
  const load = async () => {
    setLoading(true)
    try{ const res = await api.get('/crops'); setCrops(res.data) }catch(e){}
    setLoading(false)
  }

  const filtered = crops.filter(c => c.cropName.toLowerCase().includes(query.toLowerCase()))

  return (
    <div>
      <div className="d-flex mb-2">
        <input aria-label="Search crops" className="form-control me-2" placeholder="Search crops" value={query} onChange={e => setQuery(e.target.value)} />
        <button className="btn btn-outline-secondary" onClick={load}>Refresh</button>
      </div>
      <div className="row">
        {filtered.map(c => (
          <div className="col-md-4" key={c._id}>
            <div className="card mb-3">
              {getCropPrimaryImage(c) && <img src={getCropPrimaryImage(c)} className="card-img-top" alt={c.cropName || 'crop'} />}
              <div className="card-body">
                <h6>{c.cropName}</h6>
                <p>Price: ₹{c.price}</p>
                <p>Available: {c.quantity}</p>
                <div className="d-flex align-items-center mb-2">
                  <input aria-label={`Quantity for ${c.cropName}`} type="number" min="1" max={c.quantity} className="form-control form-control-sm me-2" style={{width:80}} value={qtyMap[c._id]||1} onChange={e => setQtyMap({...qtyMap, [c._id]: Number(e.target.value) })} />
                  <button type="button" aria-label={`Buy ${c.cropName}`} className="btn btn-sm btn-primary me-2" onClick={() => onBuy(c, qtyMap[c._id] || 1)}>Buy</button>
                  <button type="button" aria-label={`Add ${c.cropName} to cart`} className="btn btn-sm btn-outline-secondary" onClick={() => addToCart(c, qtyMap[c._id] || 1)} disabled={adding}>Add to cart</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
