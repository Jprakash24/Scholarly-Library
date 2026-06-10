import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

export function useMaterials({ kind = 'all', q = '', page = 1, limit = 20, ids = null } = {}) {
  const [materials, setMaterials] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // When ids is explicitly an empty array, skip the fetch
  const idsKey = ids === null ? null : ids.length === 0 ? '__empty__' : ids.join(',')

  const fetchData = useCallback(async () => {
    // Skip fetch if ids is an empty array
    if (idsKey === '__empty__') {
      setMaterials([])
      setTotal(0)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page, limit })
      if (kind !== 'all') params.set('kind', kind)
      if (q) params.set('q', q)
      if (idsKey !== null) params.set('ids', idsKey)
      const data = await api.get(`/materials?${params}`)
      setMaterials(data.materials)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [kind, q, page, limit, idsKey])

  useEffect(() => { fetchData() }, [fetchData])
  return { materials, total, loading, error, refetch: fetchData }
}

export function useMaterial(id) {
  const [material, setMaterial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    api.get(`/materials/${id}`)
      .then(setMaterial)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  return { material, loading, error }
}
