import { useCallback, useEffect, useState } from 'react'
import * as feedbackService from '../services/feedbackService'

const DEFAULT_PAGINATION = { page: 1, limit: 20, total: 0, pages: 0 }

/** @param {{ page?, limit?, search?, product_id?, source?, customer_type? }} params */
export function useFeedback(params) {
  const [items, setItems] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Stringify so the effect only re-fires when the actual filter values change,
  // not on every render where the caller passes a fresh object literal.
  const paramsKey = JSON.stringify(params)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    return feedbackService
      .fetchFeedback(JSON.parse(paramsKey))
      .then((res) => {
        setItems(res.data.items)
        setPagination(res.data.pagination)
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [paramsKey])

  useEffect(() => {
    refetch()
  }, [refetch])

  const removeFeedback = useCallback(async (id) => {
    await feedbackService.deleteFeedback(id)
    setItems((prev) => prev.filter((item) => item.id !== id))
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
  }, [])

  return { items, pagination, isLoading, error, refetch, removeFeedback }
}
