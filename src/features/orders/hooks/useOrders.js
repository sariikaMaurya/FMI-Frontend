import { useEffect, useState, useCallback } from 'react'
import * as api from '../api'

export default function useOrders(){
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try{ const res = await api.fetchOrders(); setOrders(res.data) }catch(e){}
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const place = async (data) => {
    const res = await api.placeOrder(data)
    setOrders(prev => [res.data, ...prev])
    return res.data
  }

  const updateStatus = async (id, status) => {
    const res = await api.updateOrderStatus(id, status)
    setOrders(prev => prev.map(o => o._id === id ? res.data : o))
    return res.data
  }

  return { orders, loading, load, place, updateStatus }
}
