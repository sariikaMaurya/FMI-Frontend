import { useState } from 'react'
import * as api from '../api'

export default function usePayments(){
  const [loading, setLoading] = useState(false)

  const create = async (orderId, method = 'stub') => {
    setLoading(true)
    try{
      const res = await api.createRazorpay({ orderId, paymentMethod: method }).catch(async (e) => {
        // fallback to stub create
        const stub = await api.createPayment({ orderId, paymentMethod: method })
        return stub
      })
      if (!res.data?.paymentId) {
        const stub = await api.createPayment({ orderId, paymentMethod: method })
        return stub.data
      }
      return res.data
    }finally{ setLoading(false) }
  }

  const verify = async (paymentId, success) => {
    setLoading(true)
    try{ const res = await api.verifyPayment({ paymentId, success }); return res.data }finally{ setLoading(false) }
  }

  return { create, verify, loading }
}
