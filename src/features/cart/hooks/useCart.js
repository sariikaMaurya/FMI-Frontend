import { useCallback, useEffect, useState } from 'react'
import * as api from '../api'

const CART_UPDATED_EVENT = 'farmtrade:cart-updated'

const broadcastCartUpdate = (items) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: { items } }))
}

export default function useCart(options = {}){
  const { enabled = true } = options
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!enabled) {
      setItems([])
      return []
    }
    setLoading(true)
    try{
      const res = await api.fetchCart()
      const nextItems = res.data || []
      setItems(nextItems)
      broadcastCartUpdate(nextItems)
      return nextItems
    }catch(e){
      return []
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return
    load()
  }, [enabled, load])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    const onCartUpdated = (event) => {
      if (Array.isArray(event.detail?.items)) setItems(event.detail.items)
    }
    window.addEventListener(CART_UPDATED_EVENT, onCartUpdated)
    return () => window.removeEventListener(CART_UPDATED_EVENT, onCartUpdated)
  }, [enabled])

  const add = async (cropId, quantity=1) => {
    const res = await api.addToCart({ cropId, quantity })
    await load()
    return res.data
  }

  const update = async (id, quantity) => {
    await api.updateCart(id, { quantity })
    await load()
  }

  const remove = async (id) => {
    await api.removeFromCart(id)
    await load()
  }

  return { items, loading, load, add, update, remove }
}
