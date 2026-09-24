import { useEffect, useState, useCallback } from 'react'
import * as api from '../api'
import { uploadToCloudinary } from '../../../services/cloudinaryUpload'

export default function useCrops(){
  const [crops, setCrops] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try{
      const res = await api.fetchCrops()
      setCrops(res.data || [])
    }catch(err){ setError(err); }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const create = async (data, file, onProgress) => {
    let images = []
    if (file) {
      const url = await uploadToCloudinary(file, onProgress)
      images = [url]
    }
    const res = await api.createCrop({ ...data, images })
    const created = res.data
    setCrops(prev => [created, ...prev])
    return created
  }

  const update = async (id, data, file, onProgress) => {
    let images = undefined
    if (file) {
      const url = await uploadToCloudinary(file, onProgress)
      images = [url]
    }
    const payload = images ? { ...data, images } : data
    const res = await api.updateCrop(id, payload)
    const updated = res.data
    setCrops(prev => prev.map(c => c._id === id ? updated : c))
    return updated
  }

  const remove = async (id) => {
    await api.deleteCrop(id)
    setCrops(prev => prev.filter(c => c._id !== id))
  }

  return { crops, loading, error, load, create, update, remove }
}
