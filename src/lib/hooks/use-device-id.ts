'use client'

import { useEffect, useState } from 'react'

// Browser-compatible UUID v4 generator
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Generate or retrieve device ID from IndexedDB
export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initDeviceId = async () => {
      try {
        // Try to open IndexedDB
        const db = await new Promise<IDBDatabase>((resolve, reject) => {
          const request = indexedDB.open('yollr', 1)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result)
          request.onupgradeneeded = (e) => {
            const db = (e.target as IDBOpenDBRequest).result
            if (!db.objectStoreNames.contains('user')) {
              db.createObjectStore('user', { keyPath: 'key' })
            }
          }
        })

        // Get or create device ID
        const transaction = db.transaction('user', 'readonly')
        const store = transaction.objectStore('user')
        const request = store.get('device_id')

        request.onsuccess = () => {
          const result = request.result
          if (result?.value) {
            setDeviceId(result.value)
          } else {
            // Generate new device ID
            const newDeviceId = generateUUID()
            const writeTransaction = db.transaction('user', 'readwrite')
            const writeStore = writeTransaction.objectStore('user')
            writeStore.put({ key: 'device_id', value: newDeviceId })
            setDeviceId(newDeviceId)
          }
          setLoading(false)
        }

        request.onerror = () => {
          // Fallback: use localStorage
          const stored = localStorage.getItem('device_id')
          if (stored) {
            setDeviceId(stored)
          } else {
            const newDeviceId = generateUUID()
            localStorage.setItem('device_id', newDeviceId)
            setDeviceId(newDeviceId)
          }
          setLoading(false)
        }
      } catch (error) {
        // Fallback: use localStorage
        console.error('IndexedDB error:', error)
        const stored = localStorage.getItem('device_id')
        if (stored) {
          setDeviceId(stored)
        } else {
          const newDeviceId = generateUUID()
          localStorage.setItem('device_id', newDeviceId)
          setDeviceId(newDeviceId)
        }
        setLoading(false)
      }
    }

    initDeviceId()
  }, [])

  return { deviceId, loading }
}
