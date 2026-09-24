import React, { useMemo, useState } from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import useCart from '../../features/cart/hooks/useCart'
import useOrders from '../../features/orders/hooks/useOrders'
import usePayments from '../../features/payments/hooks/usePayments'
import { getCropPrimaryImage } from '../../features/crops/utils'
import { toast } from 'react-toastify'

const money = value => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`

export default function CartPage() {
  const { items, loading, update, remove, load } = useCart()
  const { place } = useOrders()
  const { create, verify, loading: paymentLoading } = usePayments()
  const [checkingOutId, setCheckingOutId] = useState(null)
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + ((item.cropId?.price || 0) * item.quantity), 0), [items])
  const tax = subtotal * 0.05
  const grandTotal = subtotal + tax

  const checkout = async item => {
    setCheckingOutId(item._id)
    try {
      const order = await place({ cropId: item.cropId._id, quantity: item.quantity })
      const payment = await create(order._id, 'online')
      if (payment.paymentId) await verify(payment.paymentId, true)
      toast.success('Checkout complete. Payment recorded successfully.')
      await load()
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.message || 'Checkout failed')
    } finally {
      setCheckingOutId(null)
    }
  }

  const checkoutAll = async () => {
    for (const item of items) {
      await checkout(item)
    }
  }

  return (
    <DashboardLayout title="Cart">
      <div className="module-toolbar">
        <div>
          <h4>Cart</h4>
          <p>Review crops, adjust quantity, and complete checkout with payment.</p>
        </div>
        <button className="btn btn-primary" onClick={checkoutAll} disabled={loading || paymentLoading || items.length === 0 || checkingOutId}>
          {checkingOutId ? 'Processing...' : 'Checkout All'}
        </button>
      </div>
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="premium-card">
            <div className="premium-card-header"><h5 className="mb-0">Cart Items</h5></div>
            <div className="premium-card-body">
              {loading ? <div className="loading-state">Loading cart...</div> : items.length === 0 ? <div className="empty-state">Your cart is empty</div> : items.map(item => (
                <div className="cart-row" key={item._id}>
                  <div className="cart-item-main">
                    <div className="cart-thumb">
                      {getCropPrimaryImage(item.cropId) ? <img src={getCropPrimaryImage(item.cropId)} alt={item.cropId?.cropName} /> : <span>{(item.cropId?.cropName || 'C').charAt(0)}</span>}
                    </div>
                    <div>
                      <h6>{item.cropId?.cropName}</h6>
                      <span>{money(item.cropId?.price)} x {item.quantity}</span>
                      <strong>{money((item.cropId?.price || 0) * item.quantity)}</strong>
                    </div>
                  </div>
                  <div className="cart-actions">
                    <button className="btn btn-light" onClick={() => update(item._id, Math.max(1, item.quantity - 1))} disabled={checkingOutId === item._id}>-</button>
                    <strong>{item.quantity}</strong>
                    <button className="btn btn-light" onClick={() => update(item._id, item.quantity + 1)} disabled={checkingOutId === item._id}>+</button>
                    <button className="btn btn-outline-danger" onClick={() => remove(item._id)} disabled={checkingOutId === item._id}>Remove</button>
                    <button className="btn btn-primary" onClick={() => checkout(item)} disabled={paymentLoading || checkingOutId === item._id}>
                      {checkingOutId === item._id ? 'Paying...' : 'Checkout & Pay'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="premium-card">
            <div className="premium-card-header"><h5 className="mb-0">Summary</h5></div>
            <div className="premium-card-body summary-list">
              <div><span>Total quantity</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <div><span>Tax 5%</span><strong>{money(tax)}</strong></div>
              <div className="grand-total"><span>Grand total</span><strong>{money(grandTotal)}</strong></div>
              <button className="btn btn-primary w-100" onClick={checkoutAll} disabled={loading || paymentLoading || items.length === 0 || checkingOutId}>
                {checkingOutId ? 'Processing checkout...' : 'Checkout & Pay All'}
              </button>
              <p className="text-muted small mb-0">Payment is recorded after order creation and shown in Payments history.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
