import * as productsApi from '../api/products'
import { toServiceError } from '../api/axios'

export async function fetchProducts(params) {
  try {
    const response = await productsApi.listProducts(params)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function fetchProduct(id) {
  try {
    const response = await productsApi.getProduct(id)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

/** @param {{ name: string, description?: string }} payload */
export async function createProduct(payload) {
  try {
    const response = await productsApi.createProduct(payload)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

/** @param {{ name?: string, description?: string }} payload */
export async function updateProduct(id, payload) {
  try {
    const response = await productsApi.updateProduct(id, payload)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function deleteProduct(id) {
  try {
    await productsApi.deleteProduct(id)
  } catch (error) {
    throw toServiceError(error)
  }
}
