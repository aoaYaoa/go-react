/**
 * 加密配置文件
 *
 * 功能说明：
 * - 统一管理前端加密相关的密钥和配置
 * - 控制 API 请求的加密/解密行为
 * - 支持灵活的接口配置（通配符匹配）
 *
 * 安全提示：
 * - 生产环境请务必更换默认密钥
 * - 密钥应存储在环境变量中，不要提交到代码仓库
 * - AES 密钥长度必须是 16/24/32 字节
 * - 定期更换密钥以提高安全性
 *
 * 使用示例：
 * 1. 启用加密：将 request.enabled 和 response.enabled 设置为 true
 * 2. 配置接口：在 encryptedEndpoints 中添加需要加密的接口 URL
 * 3. 使用加密：调用 fetchWithInterceptor，自动完成加密/解密
 */

/**
 * 加密配置对象
 *
 * 包含所有加密相关的配置项：
 * - aes: AES 加密配置（参数加密）
 * - hmac: HMAC 签名配置（请求签名）
 * - request: 请求加密配置
 * - response: 响应解密配置
 */
export const cryptoConfig = {
  // ========== AES 加密配置 ==========
  // AES（Advanced Encryption Standard）是一种对称加密算法
  // 用于加密请求参数和响应数据，确保数据在传输过程中的安全性
  aes: {
    /**
     * AES 密钥
     *
     * 密钥长度要求：
     * - 16 字节 = 128 位（AES-128）
     * - 24 字节 = 192 位（AES-192）
     * - 32 字节 = 256 位（AES-256，推荐）
     *
     * 安全提示：
     * - 生产环境请使用随机生成的强密钥
     * - 不要使用简单或常见的密码作为密钥
     * - 建议通过环境变量配置：process.env.AES_KEY
     */
    key: '1234567890123456', // 16 字节 = 128 位（示例密钥，请更换）

    /**
     * IV（初始化向量）
     *
     * IV 是加密算法中的随机值，用于确保相同的明文加密后产生不同的密文
     * IV 长度必须与密钥长度相同
     *
     * 安全提示：
     * - 生产环境每次加密应使用不同的 IV
     * - IV 可以公开传输，但不应重复使用
     * - 建议通过环境变量配置：process.env.AES_IV
     */
    iv: 'abcdefghijklmnop', // 16 字节（示例 IV，请更换）

    /**
     * 加密模式
     *
     * 常用模式：
     * - CBC: 密码分组链接模式（推荐，较安全）
     * - ECB: 电子密码本模式（不推荐，安全性低）
     * - GCM: 认证加密模式（最安全，支持认证）
     */
    mode: 'CBC',
  },

  // ========== HMAC 签名配置 ==========
  // HMAC（Hash-based Message Authentication Code）是一种基于哈希的消息认证码
  // 用于对 API 请求进行签名，验证请求的完整性和真实性
  hmac: {
    /**
     * HMAC 密钥
     *
     * 用于生成和验证 HMAC 签名的密钥
     *
     * 安全提示：
     * - 生产环境请使用强密钥（至少 32 字节）
     * - 前端和后端必须使用相同的密钥
     * - 建议通过环境变量配置：process.env.HMAC_KEY
     * - 不要与 AES 密钥混淆
     */
    key: 'your-secret-key-here', // 请替换为实际密钥
  },

  // ========== 请求加密配置 ==========
  // 控制哪些 API 请求需要加密请求体
  request: {
    /**
     * 是否启用请求加密
     *
     * 设置为 true 后，fetchWithInterceptor 会自动加密指定接口的请求体
     *
     * 使用场景：
     * - 登录请求：加密用户名和密码
     * - 敏感数据提交：加密个人信息、银行卡号等
     * - 隐私保护：防止数据在网络传输中被窃取
     */
    enabled: false, // 默认关闭，需要时开启

    /**
     * 需要加密的接口列表
     *
     * 支持通配符匹配：
     * - '/api/login': 只加密登录接口
     * - '/api/tasks/*': 加密所有 /api/tasks/ 开头的接口
     * - '/api/*': 加密所有 /api/ 开头的接口
     *
     * 配置示例：
     * encryptedEndpoints: [
     *   '/api/login',              // 登录接口
     *   '/api/user/profile',       // 用户资料接口
     *   '/api/payment/*',          // 所有支付相关接口
     * ]
     */
    encryptedEndpoints: [
      // 示例配置（根据实际需求添加）
      // '/api/login',
      // '/api/user/profile',
      // '/api/tasks/*',
    ],

    /**
     * 是否启用请求签名
     *
     * 设置为 true 后，会自动在请求头中添加 X-Signature 和 X-Timestamp
     *
     * 使用场景：
     * - API安全性要求较高的接口
     * - 防止请求被篡改
     * - 防止重放攻击
     */
    signEnabled: false, // 默认关闭，需要时开启（需与后端 ENABLE_SIGNATURE 配置一致）
  },

  // ========== 响应解密配置 ==========
  // 控制哪些 API 响应需要解密
  response: {
    /**
     * 是否启用响应解密
     *
     * 设置为 true 后，fetchWithInterceptor 会自动解密指定接口的响应数据
     */
    enabled: false, // 默认关闭，需要时开启

    /**
     * 需要解密的接口列表
     *
     * 支持通配符匹配，规则同 encryptedEndpoints
     *
     * 配置示例：
     * decryptedEndpoints: [
     *   '/api/user/info',        // 用户信息接口
     *   '/api/orders/*',         // 所有订单相关接口
     * ]
     */
    decryptedEndpoints: [
      // 示例配置（根据实际需求添加）
      // '/api/user/info',
      // '/api/orders/*',
    ],
  },
}

/**
 * 获取 AES 密钥
 *
 * @returns {string} AES 密钥（字符串格式）
 *
 * @example
 * const key = getAESKey()
 * console.log(key) // "1234567890123456"
 */
export function getAESKey() {
  return cryptoConfig.aes.key
}

/**
 * 获取 AES IV
 *
 * @returns {string} AES IV（字符串格式）
 *
 * @example
 * const iv = getAESIV()
 * console.log(iv) // "abcdefghijklmnop"
 */
export function getAESIV() {
  return cryptoConfig.aes.iv
}

/**
 * 获取 HMAC 密钥
 *
 * @returns {string} HMAC 密钥（字符串格式）
 *
 * @example
 * const key = getHMACKey()
 * console.log(key) // "your-secret-key-here"
 */
export function getHMACKey() {
  return cryptoConfig.hmac.key
}

/**
 * 检查接口是否需要加密请求体
 *
 * 根据配置判断指定的 URL 是否在加密列表中
 * 支持通配符匹配（* 表示任意字符）
 *
 * @param {string} url - 请求 URL（如：'/api/tasks/123'）
 * @returns {boolean} 是否需要加密（true=需要，false=不需要）
 *
 * @example
 * // 配置: encryptedEndpoints: ['/api/tasks/*']
 * shouldEncryptRequest('/api/tasks/123') // true
 * shouldEncryptRequest('/api/users')     // false
 * shouldEncryptRequest('/api/tasks')      // true
 *
 * @example
 * // 配置: encryptedEndpoints: ['/api/login']
 * shouldEncryptRequest('/api/login')      // true
 * shouldEncryptRequest('/api/login/step2') // false（精确匹配）
 */
export function shouldEncryptRequest(url) {
  // 如果未启用请求加密，直接返回 false
  if (!cryptoConfig.request.enabled) {
    return false
  }

  // 遍历加密接口列表，检查 URL 是否匹配
  return cryptoConfig.request.encryptedEndpoints.some((pattern) => {
    // 将通配符 * 转换为正则表达式 .*
    // 例如: '/api/tasks/*' -> '^/api/tasks/.*$'
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$')

    // 测试 URL 是否匹配该模式
    return regex.test(url)
  })
}

/**
 * 检查接口是否需要解密响应数据
 *
 * 根据配置判断指定的 URL 是否在解密列表中
 * 支持通配符匹配（* 表示任意字符）
 *
 * @param {string} url - 请求 URL（如：'/api/user/info'）
 * @returns {boolean} 是否需要解密（true=需要，false=不需要）
 *
 * @example
 * // 配置: decryptedEndpoints: ['/api/user/*']
 * shouldDecryptResponse('/api/user/info')   // true
 * shouldDecryptResponse('/api/user/orders') // true
 * shouldDecryptResponse('/api/tasks')        // false
 *
 * @example
 * // 配置: decryptedEndpoints: ['/api/user/info']
 * shouldDecryptResponse('/api/user/info')   // true
 * shouldDecryptResponse('/api/user/orders') // false（精确匹配）
 */
export function shouldDecryptResponse(url) {
  // 如果未启用响应解密，直接返回 false
  if (!cryptoConfig.response.enabled) {
    return false
  }

  // 遍历解密接口列表，检查 URL 是否匹配
  return cryptoConfig.response.decryptedEndpoints.some((pattern) => {
    // 将通配符 * 转换为正则表达式 .*
    const regex = new RegExp('^' + pattern.replace('*', '.*') + '$')

    // 测试 URL 是否匹配该模式
    return regex.test(url)
  })
}
