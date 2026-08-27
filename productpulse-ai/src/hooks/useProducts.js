import { useCallback, useEffect, useState } from 'react'
import * as productService from '../services/productService'

const DEFAULT_PAGINATION = { page: 1, limit: 20, total: 0, pages: 0 }

/** @param {{ page?: number, limit?: number, search?: string }} params */
export function useProducts(params = {}) {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const paramsKey = JSON.stringify(params)

  const refetch = useCallback(() => {
    setIsLoading(true)
    setError(null)
    return productService
      .fetchProducts(JSON.parse(paramsKey))
      .then((res) => {
        setProducts(res.data.items)
        setPagination(res.data.pagination)
      })
      .catch((err) => setError(err))
      .finally(() => setIsLoading(false))
  }, [paramsKey])

  useEffect(() => {
    refetch()
  }, [refetch])

  const createProduct = useCallback(async (payload) => {
    const res = await productService.createProduct(payload)
    setProducts((prev) => [res.data, ...prev])
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }))
    return res.data
  }, [])

  const updateProduct = useCallback(async (id, payload) => {
    const res = await productService.updateProduct(id, payload)
    setProducts((prev) => prev.map((p) => (p.id === id ? res.data : p)))
    return res.data
  }, [])

  const removeProduct = useCallback(async (id) => {
    await productService.deleteProduct(id)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }))
  }, [])

  return { products, pagination, isLoading, error, refetch, createProduct, updateProduct, removeProduct }
}
