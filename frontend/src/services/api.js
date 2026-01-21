import { fetchWithInterceptor, getErrorMessage, isSuccessResponse } from '../utils/request'

const API_BASE_URL = '/api'

export const api = {
  // 获取所有任务
  getTasks: async () => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks`)
      const data = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 获取单个任务
  getTask: async (id) => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}`)
      const data = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 创建任务
  createTask: async (task) => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(task),
      })
      const data = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 更新任务
  updateTask: async (id, task) => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      })
      const data = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 删除任务
  deleteTask: async (id) => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 切换任务状态
  toggleTask: async (id) => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
      })
      const data = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 健康检查
  healthCheck: async () => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/health`)
      const data = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}
