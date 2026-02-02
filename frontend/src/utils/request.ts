/**
 * 请求拦截器工具
 *
 * 功能说明：
 * - 自动加密/解密请求数据
 * - 自动添加请求签名
 * - 统一错误处理
 * - 请求日志记录
 *
 * 使用方式：
 * 使用 fetchWithInterceptor 代替原生 fetch，自动完成加密和签名
 *
 * @example
 * import { fetchWithInterceptor } from './utils/request'
 * const response = await fetchWithInterceptor('/api/tasks', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: '新任务' })
 * })
 */
import { AESEncrypt, AESDecrypt } from './crypto'
import { shouldEncryptRequest, shouldDecryptResponse, getAESKey, getAESIV, cryptoConfig } from '../config/cryptoConfig'
import { EncryptedData, RequestOptions, ApiResponse } from '../types'

/**
 * 加密请求数据（内部函数）
 *
 * 将原始数据转换为加密后的格式
 * 格式: { encrypted: true, data: "<base64加密后的数据>" }
 *
 * @param {Object} data - 原始数据对象
 * @returns {Object} 加密后的数据对象
 *
 * @example
 * encryptRequestData({ username: 'admin', password: '123456' })
 * // 返回: { encrypted: true, data: "U2FsdGVkX1..." }
 */
function encryptRequestData(data: any): EncryptedData | any {
  try {
    // 将对象转换为 JSON 字符串
    const jsonString = JSON.stringify(data)

    // 使用 AES-CBC 加密（从配置获取密钥和 IV）
    const encrypted = AESEncrypt(jsonString, getAESKey(), getAESIV())

    // 返回加密后的数据结构
    // encrypted 标识表示数据已加密，后端可以据此判断是否需要解密
    return { encrypted: true, data: encrypted }
  } catch (error) {
    // 加密失败时返回原始数据，避免阻塞请求
    console.error('加密请求失败:', error)
    return data
  }
}

/**
 * 解密响应数据（内部函数）
 *
 * 将加密的响应数据解密为原始对象
 * 格式: { encrypted: true, data: "<base64加密后的数据>" }
 *
 * @param {Object} data - 响应数据对象
 * @returns {Object} 解密后的数据对象
 *
 * @example
 * decryptResponseData({ encrypted: true, data: "U2FsdGVkX1..." })
 * // 返回: { username: 'admin', password: '123456' }
 */
function decryptResponseData(data: any): any {
  try {
    // 检查数据是否加密格式
    if (data?.encrypted && data?.data) {
      // 使用 AES-CBC 解密
      const decrypted = AESDecrypt(data.data, getAESKey(), getAESIV())

      // 将解密后的字符串转换为对象
      return JSON.parse(decrypted)
    }

    // 未加密的数据直接返回
    return data
  } catch (error) {
    // 解密失败时返回原始数据，避免阻塞业务
    console.error('解密响应失败:', error)
    return data
  }
}

/**
 * 创建请求签名
 *
 * 根据请求参数生成签名，用于验证请求的完整性和真实性
 * 签名通常包含：请求方法、URL、请求体、时间戳等
 *
 * @param {string} method - 请求方法（GET、POST、PUT、DELETE 等）
 * @param {string} url - 请求 URL
 * @param {Object} body - 请求体对象（可选）
 * @returns {string} 签名字符串
 *
 * @example
 * createRequestSignature('POST', '/api/tasks', { title: '新任务' })
 * // 返回: "POST/api/tasks{"title":"新任务"}1704067200000"
 *
 * 注意事项：
 * - 当前实现使用简单的字符串拼接，实际项目应根据后端要求使用 HMAC 签名
 * - 建议添加时间戳防止重放攻击
 * - 参数应按字母顺序排序以保证签名一致性
 */
export function createRequestSignature(method: string, url: string, body: any = null): string {
  // 获取当前时间戳（毫秒）
  // 时间戳用于防止重放攻击
  const timestamp = Date.now().toString()

  // 将请求体转换为字符串（如果有）
  const bodyStr = body ? JSON.stringify(body) : ''

  // 拼接签名字符串
  // 格式: method + url + body + timestamp
  const signString = `${method}${url}${bodyStr}${timestamp}`

  // 返回签名（这里简单拼接，实际应使用 HMAC）
  // 实际项目示例:
  // return HMACSHA256(secretKey, signString)
  return `${signString}`
}

/**
 * 创建带有拦截器的 fetch 请求
 *
 * 这是一个增强版的 fetch 函数，自动处理：
 * 1. 请求体加密（根据配置）
 * 2. 请求签名（根据配置）
 * 3. 响应数据解密（根据配置）
 * 4. 错误处理和日志记录
 *
 * @param {string} url - 请求 URL
 * @param {Object} options - fetch 选项，与原生 fetch 相同
 * @returns {Promise<Response>} - fetch 响应对象
 *
 * @example
 * // 普通请求
 * const response = await fetchWithInterceptor('/api/tasks')
 *
 * // POST 请求（会自动加密和签名）
 * const response = await fetchWithInterceptor('/api/tasks', {
 *   method: 'POST',
 *   body: JSON.stringify({ title: '新任务' })
 * })
 *
 * // 自定义请求头
 * const response = await fetchWithInterceptor('/api/tasks', {
 *   method: 'GET',
 *   headers: {
 *     'Authorization': 'Bearer token123'
 *   }
 * })
 */
export async function fetchWithInterceptor(url: string, options: RequestOptions = {}): Promise<Response> {
  // 合并默认请求选项
  let requestOptions: RequestOptions = {
    ...options,
    headers: {
      // 默认设置 Content-Type 为 JSON
      'Content-Type': 'application/json',
      // 保留用户自定义的请求头
      ...(options.headers || {}),
    },
  }

  // ========== 请求加密处理 ==========
  // 检查是否需要加密请求体（仅 POST/PUT/PATCH 请求）
  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
    // 检查该 URL 是否需要加密（根据配置）
    if (options.body && shouldEncryptRequest(url)) {
      try {
        // 解析请求体（处理字符串和对象两种格式）
        const bodyData = typeof options.body === 'string' ? JSON.parse(options.body) : options.body

        // 加密请求体
        const encryptedData = encryptRequestData(bodyData)

        // 将加密后的数据重新赋值给请求体
        requestOptions.body = JSON.stringify(encryptedData)

        // 记录加密日志
        console.log(`[Encrypt] Request body encrypted for: ${url}`)
      } catch (error) {
        // 加密失败，记录错误但不中断请求
        console.error('[Encrypt] Failed to encrypt request body:', error)
      }
    }
  }

  // ========== 请求签名处理 ==========
  // 检查是否需要添加签名
  if (cryptoConfig.request.signEnabled) {
    // 获取请求体数据（用于签名）
    const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body as string) : options.body) : null

    // 生成签名
    const signature = createRequestSignature(options.method || 'GET', url, body)

    // 将签名添加到请求头
    if (requestOptions.headers) {
      const headers = requestOptions.headers as Record<string, string>
      headers['X-Signature'] = signature
      // 添加时间戳请求头（后端需要）
      const timestamp: string = Date.now().toString()
      headers['X-Timestamp'] = timestamp
    }
  }

  // ========== 请求性能监控 ==========
  // 记录请求开始时间，用于计算耗时
  const startTime = performance.now()

  try {
    // 发送请求
    const response = await fetch(url, requestOptions)

    // 获取服务器返回的 Request ID（如果有）
    // Request ID 用于追踪请求链路，排查问题
    const requestId = response.headers.get('X-Request-Id')

    // 计算请求耗时（毫秒）
    const duration = performance.now() - startTime

    // 记录请求日志（包含请求方法、URL、状态码、耗时）
    console.log(`[${requestId || 'N/A'}] ${options.method || 'GET'} ${url} - ${response.status} (${duration.toFixed(2)}ms)`)

    // ========== 错误响应处理 ==========
    // 检查响应状态码（200-299 为成功）
    if (!response.ok) {
      // 尝试读取错误响应体
      let errorData: any = null
      try {
        const clonedResponse = response.clone()
        errorData = await clonedResponse.json()
      } catch (e) {
        // 无法解析 JSON，使用默认错误
      }

      // 创建自定义错误对象
      const errorMessage = errorData?.error || errorData?.message || `HTTP error! status: ${response.status}`
      const error: any = new Error(errorMessage)
      error.status = response.status
      error.requestId = requestId
      error.url = url
      error.response = { data: errorData }
      throw error
    }

    // ========== 响应解密处理 ==========
    // 检查该 URL 是否需要解密响应
    if (shouldDecryptResponse(url)) {
      // 克隆响应对象（因为 response 只能读取一次）
      const clonedResponse = response.clone()

      try {
        // 解析响应数据
        const responseData = await clonedResponse.json()

        // 解密响应数据
        const decryptedData = decryptResponseData(responseData)

        // 返回带有解密数据的新响应对象
        // 重写 json 方法，返回解密后的数据
        return {
          ...response,
          json: async () => decryptedData,
        } as Response
      } catch (error) {
        // 解密失败，返回原始响应
        console.error('[Decrypt] Failed to decrypt response:', error)
      }
    }

    // 返回原始响应
    return response

  } catch (error: any) {
    // 记录请求错误日志
    console.error(`[Request Error] ${url}:`, error?.message || error)
    // 重新抛出错误，让调用者处理
    throw error
  }
}

/**
 * 处理 API 错误
 *
 * 将各种类型的错误转换为用户友好的错误消息
 *
 * @param {Error} error - 错误对象
 * @returns {string} 用户友好的错误消息
 *
 * @example
 * try {
 *   const response = await fetchWithInterceptor('/api/tasks')
 * } catch (error) {
 *   const message = getErrorMessage(error)
 *   showToast(message)  // 显示错误提示
 * }
 */
export function getErrorMessage(error: any): string {
  // 情况 1: 服务器返回了错误响应（4xx, 5xx）
  if (error.response) {
    const data = error.response.data
    return data?.error || data?.message || '服务器错误'
  }

  // 情况 2: 请求已发送但没有收到响应（网络错误）
  if (error.request) {
    return '网络错误，请检查网络连接'
  }

  // 情况 3: 其他错误（包括网络超时、CORS 等）
  if (error.message) {
    // 根据错误消息中的状态码返回对应提示
    if (error.message.includes('404')) {
      return '请求的资源不存在'
    }
    if (error.message.includes('401')) {
      return '未授权，请重新登录'
    }
    if (error.message.includes('403')) {
      return '权限不足'
    }
    if (error.message.includes('429')) {
      return '请求过于频繁，请稍后再试'
    }
    if (error.message.includes('500')) {
      return '服务器内部错误'
    }
    // 返回原始错误消息
    return error.message
  }

  // 默认错误消息
  return '未知错误，请稍后重试'
}

/**
 * 检查响应是否成功
 *
 * @param {Object} response - API 响应对象
 * @returns {boolean} 是否成功
 *
 * @example
 * const response = await fetchWithInterceptor('/api/tasks')
 * const data = await response.json()
 *
 * if (isSuccessResponse(data)) {
 *   // 处理成功响应
 *   console.log(data.data)
 * } else {
 *   // 处理失败响应
 *   console.error(data.error)
 * }
 */
export function isSuccessResponse(response: ApiResponse): boolean {
  // 检查响应对象的 success 字段
  // 假设后端返回格式为: { success: true, data: {...} }
  return response?.success === true
}

/**
 * 从响应中提取数据
 *
 * @param {Object} response - API 响应对象
 * @returns {any} 数据内容
 *
 * @example
 * const response = await fetchWithInterceptor('/api/tasks')
 * const data = await response.json()
 * const tasks = extractData(data)
 */
export function extractData(response: ApiResponse): any {
  // 提取 data 字段
  // 假设后端返回格式为: { success: true, data: [...] }
  return response?.data
}

/**
 * 从响应中提取错误消息
 *
 * @param {Object} response - API 响应对象
 * @returns {string} 错误消息
 *
 * @example
 * const response = await fetchWithInterceptor('/api/tasks')
 * const data = await response.json()
 *
 * if (!isSuccessResponse(data)) {
 *   const errorMsg = extractError(data)
 *   console.error(errorMsg)
 * }
 */
export function extractError(response: ApiResponse): string {
  // 提取 error 或 message 字段
  // 假设后端返回格式为: { success: false, error: '错误信息' }
  return response?.error || response?.message || '未知错误'
}

/**
 * 手动加密数据
 *
 * 用于不通过请求拦截器的场景，手动对数据进行加密
 *
 * @param {Object} data - 要加密的数据对象
 * @returns {Object} 加密后的数据对象
 *
 * @example
 * const encrypted = encryptData({ username: 'admin', password: '123' })
 * // 可以直接发送到后端，或存储到本地
 */
export function encryptData(data: any): EncryptedData | any {
  return encryptRequestData(data)
}

/**
 * 手动解密数据
 *
 * 用于不通过请求拦截器的场景，手动对数据进行解密
 *
 * @param {Object} data - 要解密的数据对象
 * @returns {Object} 解密后的数据对象
 *
 * @example
 * const encrypted = { encrypted: true, data: "U2FsdGVkX1..." }
 * const decrypted = decryptData(encrypted)
 * // 解密后得到原始数据
 */
export function decryptData(data: any): any {
  return decryptResponseData(data)
}
