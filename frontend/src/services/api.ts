import { fetchWithInterceptor, getErrorMessage, isSuccessResponse, extractError } from '../utils/request'
import { Task, ApiResponse } from '../types'

const API_BASE_URL = '/api'

export const api = {
  // 获取所有任务
  getTasks: async (): Promise<Task[]> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks`)
      const data: ApiResponse<Task[]> = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data || []
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 获取单个任务
  getTask: async (id: string): Promise<Task> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}`)
      const data: ApiResponse<Task> = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 创建任务
  createTask: async (task: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        body: JSON.stringify(task),
      })
      const data: ApiResponse<Task> = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 更新任务
  updateTask: async (id: string, task: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(task),
      })
      const data: ApiResponse<Task> = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 删除任务
  deleteTask: async (id: string): Promise<ApiResponse> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      })
      const data: ApiResponse = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 切换任务状态
  toggleTask: async (id: string): Promise<Task> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/tasks/${id}/toggle`, {
        method: 'PATCH',
      })
      const data: ApiResponse<Task> = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },

  // 健康检查
  healthCheck: async (): Promise<ApiResponse> => {
    try {
      const response = await fetchWithInterceptor(`${API_BASE_URL}/health`)
      const data: ApiResponse = await response.json()
      if (!isSuccessResponse(data)) {
        throw new Error(extractError(data))
      }
      return data
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  },
}
