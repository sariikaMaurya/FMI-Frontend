import React, {useEffect, useState} from 'react'
import axios from 'axios'

export default function Orders(){
  const [orders,setOrders]=useState([])
  useEffect(()=>{ axios.get('/api/orders').then(r=>setOrders(r.data)).catch(()=>{}) },[])
  return (
    <div>
      <h2>Orders</h2>
      <ul className="list-group">
        {orders.map(o=> (
          <li key={o._id} className="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <strong>{o.cropId?.cropName}</strong>
              <div className="text-muted">Qty: {o.quantity}</div>
            </div>
            <span className="badge bg-secondary">{o.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Orders;