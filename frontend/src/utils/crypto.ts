/**
 * 加密工具集 - 仅保留核心加密和签名功能
 *
 * 功能说明：
 * - AESEncrypt/AESDecrypt: 用于请求参数的加密和解密
 * - HMACSHA256/HMACSHA512: 用于请求签名，验证请求的完整性和真实性
 *
 * 使用场景：
 * - 请求加密：敏感参数（如密码、个人信息）在传输前进行 AES 加密
 * - 请求签名：使用 HMAC 算法对请求进行签名，防止请求被篡改
 */
import CryptoJS from 'crypto-js'

/**
 * AES 加密 - 用于参数加密
 *
 * @param {string} plaintext - 明文，需要加密的原始字符串
 * @param {string} key - 密钥，必须是 16/24/32 字节长度（对应 AES-128/192/256）
 * @param {string} iv - 初始化向量，长度必须与密钥相同
 * @returns {string} base64 编码的密文
 *
 * @example
 * const encrypted = AESEncrypt('hello', '1234567890123456', 'abcdefghijklmnop')
 * // 返回: "U2FsdGVkX1..."
 */
export function AESEncrypt(plaintext: string, key: string, iv: string): string {
  try {
    // 将密钥和 IV 从字符串转换为 WordArray 对象（CryptoJS 内部格式）
    const keyHex = CryptoJS.enc.Utf8.parse(key)
    const ivHex = CryptoJS.enc.Utf8.parse(iv)

    // 使用 AES-CBC 模式加密
    // - CBC 模式：密码分组链接模式，每个明文块先与前一个密文块进行异或
    // - Pkcs7 填充：自动填充数据到块大小的整数倍
    const encrypted = CryptoJS.AES.encrypt(plaintext, keyHex, {
      iv: ivHex,                    // 初始化向量
      mode: CryptoJS.mode.CBC,       // 使用 CBC 模式
      padding: CryptoJS.pad.Pkcs7,   // 使用 PKCS7 填充
    })

    // 返回 base64 编码的密文字符串
    return encrypted.toString()
  } catch (error) {
    console.error('AES encrypt error:', error)
    throw new Error('加密失败')
  }
}

/**
 * AES 解密 - 用于参数解密
 *
 * @param {string} ciphertext - base64 编码的密文
 * @param {string} key - 密钥，必须与加密时使用的密钥一致
 * @param {string} iv - 初始化向量，必须与加密时使用的 IV 一致
 * @returns {string} 明文
 *
 * @example
 * const decrypted = AESDecrypt(encrypted, '1234567890123456', 'abcdefghijklmnop')
 * // 返回: "hello"
 */
export function AESDecrypt(ciphertext: string, key: string, iv: string): string {
  try {
    // 将密钥和 IV 从字符串转换为 WordArray 对象
    const keyHex = CryptoJS.enc.Utf8.parse(key)
    const ivHex = CryptoJS.enc.Utf8.parse(iv)

    // 使用 AES-CBC 模式解密，参数必须与加密时完全一致
    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    })

    // 将解密结果转换为 UTF-8 字符串
    return decrypted.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('AES decrypt error:', error)
    throw new Error('解密失败')
  }
}

/**
 * HMAC-SHA256 签名 - 用于请求签名
 *
 * HMAC（Hash-based Message Authentication Code）是一种基于哈希的消息认证码
 * 使用密钥和哈希算法对数据进行签名，用于验证数据的完整性和真实性
 *
 * @param {string} key - 密钥，用于签名的共享密钥
 * @param {string} data - 数据，需要签名的原始数据
 * @returns {string} HMAC 签名，SHA256 格式的 16 进制字符串
 *
 * @example
 * const signature = HMACSHA256('secret-key', 'message to sign')
 * // 返回: "5b4c8e7f..."
 *
 * 使用场景：
 * - API 请求签名：将请求参数拼接后签名，放在请求头中
 * - 数据完整性验证：接收方用相同密钥和数据重新计算签名，比对结果
 */
export function HMACSHA256(key: string, data: string): string {
  try {
    // 使用 HMAC-SHA256 算法生成签名
    // 返回 16 进制格式的签名字符串（64 个字符）
    return CryptoJS.HmacSHA256(data, key).toString()
  } catch (error) {
    console.error('HMAC-SHA256 error:', error)
    throw new Error('签名失败')
  }
}

/**
 * HMAC-SHA512 签名 - 用于请求签名
 *
 * HMAC-SHA512 与 HMAC-SHA256 功能相同，但安全性更高（512 位 vs 256 位）
 * 适用于对安全性要求更高的场景
 *
 * @param {string} key - 密钥，用于签名的共享密钥
 * @param {string} data - 数据，需要签名的原始数据
 * @returns {string} HMAC 签名，SHA512 格式的 16 进制字符串（128 个字符）
 *
 * @example
 * const signature = HMACSHA512('secret-key', 'message to sign')
 * // 返回: "a1b2c3d4..."
 */
export function HMACSHA512(key: string, data: string): string {
  try {
    // 使用 HMAC-SHA512 算法生成签名
    // 返回 16 进制格式的签名字符串（128 个字符）
    return CryptoJS.HmacSHA512(data, key).toString()
  } catch (error) {
    console.error('HMAC-SHA512 error:', error)
    throw new Error('签名失败')
  }
}
