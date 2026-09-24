export function normalizeCropImages(images) {
  if (Array.isArray(images)) {
    return images
      .map((item) => {
        if (typeof item === 'string') return item.trim()
        if (item && typeof item === 'object') return item.url || item.secure_url || item.src || ''
        return ''
      })
      .filter(Boolean)
  }

  if (typeof images === 'string' && images.trim()) {
    return [images.trim()]
  }

  if (images && typeof images === 'object') {
    const fallback = images.url || images.secure_url || images.src || ''
    return fallback ? [fallback] : []
  }

  return []
}

export function getCropPrimaryImage(crop) {
  return normalizeCropImages(crop?.images ?? crop?.image ?? crop?.imageUrl)[0] || null
}
