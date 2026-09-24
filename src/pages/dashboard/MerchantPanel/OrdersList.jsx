import React from 'react'

export default function OrdersList({ orders, onUpdate }){
  return (
    <div>
      <h5>My Orders</h5>
      <table className="table">
        <thead><tr><th>Crop</th><th>Qty</th><th>Amount</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id}>
              <td>{o.cropId?.cropName}</td>
              <td>{o.quantity}</td>
              <td>₹{o.amount}</td>
              <td>{o.status}</td>
              <td>
                {o.status === 'accepted' && <button className="btn btn-sm btn-success" onClick={() => onUpdate(o._id, 'dispatched')}>Dispatch</button>}
                {o.status !== 'cancelled' && <button className="btn btn-sm btn-danger ms-2" onClick={() => onUpdate(o._id, 'cancelled')}>Cancel</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
