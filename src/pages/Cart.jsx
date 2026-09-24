import React from 'react'
import useCart from '../features/cart/hooks/useCart'
import usePayments from '../features/payments/hooks/usePayments'
import useOrders from '../features/orders/hooks/useOrders'
import { getCropPrimaryImage } from '../features/crops/utils'

export default function Cart(){
  const { items, loading, update, remove, load } = useCart()
  const { place } = useOrders()
  const { create: createPayment, verify: verifyPayment } = usePayments()

  const placeOrder = async (item) => {
    try{
      const order = await place({ cropId: item.cropId._id, quantity: item.quantity })
      const p = await createPayment(order._id)
      await verifyPayment(p.paymentId, true)
      alert('Order placed: '+order._id)
      await load()
    }catch(e){ alert('Order failed') }
  }

  return (
    <div>
      <h2>Your Cart</h2>
      {loading && <div>Loading...</div>}
      <ul className="list-group">
        {items.map(it=> (
          <li className="list-group-item d-flex justify-content-between align-items-center gap-3" key={it._id}>
            <div className="d-flex align-items-center gap-3">
              <div className="cart-thumb">
                {getCropPrimaryImage(it.cropId) ? <img src={getCropPrimaryImage(it.cropId)} alt={it.cropId?.cropName} /> : <span>{(it.cropId?.cropName || 'C').charAt(0)}</span>}
              </div>
              <div>
                <strong>{it.cropId.cropName}</strong>
                <div className="text-muted">Rs. {it.cropId.price} x {it.quantity}</div>
              </div>
            </div>
            <div>
              <button className="btn btn-sm btn-outline-secondary me-1" onClick={()=>update(it._id, it.quantity+1)}>+</button>
              <button className="btn btn-sm btn-outline-secondary me-1" onClick={()=>update(it._id, Math.max(1,it.quantity-1))}>-</button>
              <button className="btn btn-sm btn-danger me-1" onClick={()=>remove(it._id)}>Remove</button>
              <button className="btn btn-sm btn-primary" onClick={()=>placeOrder(it)}>Place Order</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
