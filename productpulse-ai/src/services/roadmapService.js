import * as roadmapApi from '../api/roadmap'
import { toServiceError } from '../api/axios'

export async function generateRoadmap(productId) {
  try {
    const response = await roadmapApi.generateRoadmap(productId)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function fetchRoadmap(productId) {
  try {
    const response = await roadmapApi.getRoadmap(productId)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}

export async function updateRoadmapItemStatus(itemId, status) {
  try {
    const response = await roadmapApi.updateRoadmapItemStatus(itemId, status)
    return response.data
  } catch (error) {
    throw toServiceError(error)
  }
}
