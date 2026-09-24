import React from 'react'
import DashboardLayout from '../../layouts/DashboardLayout'
import Market from './MerchantPanel/Market'
import OrdersList from './MerchantPanel/OrdersList'
import useOrders from '../../features/orders/hooks/useOrders'
import usePayments from '../../features/payments/hooks/usePayments'
import { verifyRazorpay as verifyRazorpayApi } from '../../features/payments/api'
import { useState } from 'react'

export default function MerchantDashboard(){
  const { orders, loading, place, updateStatus } = useOrders()
  const [showBuy, setShowBuy] = useState(null)

  const handleBuy = async (crop, qty=1) => {
    const order = await place({ cropId: crop._id, quantity: qty })
    try{
      // create payment (hook will attempt Razorpay then fallback)
      const res = await createPayment(order._id)
      if (res.razorpayOrderId) {
        // open Razorpay checkout
        await loadScript('https://checkout.razorpay.com/v1/checkout.js')
        const options = {
          key: res.key_id,
          amount: res.amount,
          currency: res.currency || 'INR',
          name: 'FarmMarket',
          description: `Order ${order._id}`,
          order_id: res.razorpayOrderId,
          handler: async (razorRes) => {
            try{
              await verifyRazorpayApi({ orderId: order._id, razorpay_payment_id: razorRes.razorpay_payment_id, razorpay_order_id: razorRes.razorpay_order_id, razorpay_signature: razorRes.razorpay_signature })
              await updateStatus(order._id, 'accepted')
            }catch(err){ console.error('verify failed', err) }
          },
          prefill: { }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else if (res.paymentId) {
        // fallback stub: verify then accept
        await verifyPayment(res.paymentId, true)
        await updateStatus(order._id, 'accepted')
      }
    }catch(err){ console.error('payment error', err) }
    setShowBuy(null)
  }

  const loadScript = (src) => new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve()
    const s = document.createElement('script')
    s.src = src
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
  })

  const { create: createPayment, verify: verifyPayment } = usePayments()

  return (
    <DashboardLayout title="Merchant Dashboard">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-8">
            <Market onBuy={(c,q) => setShowBuy({ crop: c, qty: q })} />
            {showBuy && (
              <div className="card mt-3 p-3">
                <h6>Confirm Purchase: {showBuy.crop.cropName} × {showBuy.qty}</h6>
                <button type="button" aria-label="Confirm purchase" className="btn btn-primary" onClick={() => handleBuy(showBuy.crop, showBuy.qty)}>Confirm Buy</button>
                <button type="button" aria-label="Cancel purchase" className="btn btn-outline-secondary ms-2" onClick={() => setShowBuy(null)}>Cancel</button>
              </div>
            )}
          </div>
          <div className="col-md-4">
            <OrdersList orders={orders} onUpdate={updateStatus} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
