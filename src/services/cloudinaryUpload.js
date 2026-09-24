import api from './api'

export async function getSignature(){
  const res = await api.get('/uploads/sign')
  return res.data
}

// Upload with optional progress callback: (percent:number) => void
export async function uploadToCloudinary(file, onProgress){
  const sig = await getSignature()
  const url = `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`
  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', sig.timestamp)
  form.append('signature', sig.signature)
  form.append('folder', sig.folder || 'farmmerchant')

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && typeof onProgress === 'function'){
        const pct = Math.round((e.loaded / e.total) * 100)
        try{ onProgress(pct) }catch(_){}
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try{
          const data = JSON.parse(xhr.responseText)
          resolve(data.secure_url || data.url)
        }catch(err){
          reject(new Error('Invalid upload response'))
        }
      } else reject(new Error('Upload failed with status ' + xhr.status))
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(form)
  })
}
