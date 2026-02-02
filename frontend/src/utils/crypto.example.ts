/**
 * 加密工具使用示例
 * 演示如何在项目中使用各种加密功能
 */

import {
  AESEncrypt,
  AESDecrypt,
  AESGCMEncrypt,
  MD5,
  SHA256,
  SHA512,
  HMACSHA256,
  HMACSHA512,
  Base64Encode,
  Base64Decode,
  StringToHex,
  HexToString,
  Hash,
  GenerateRandomKey,
  GenerateUUID,
} from './crypto'
import { getAESKey, getAESIV } from '../config/cryptoConfig'

// ============================================
// AES 加密示例
// ============================================
function exampleAESCrypto() {
  const plaintext = 'Hello, World!'
  const key = getAESKey()
  const iv = getAESIV()

  // AES-CBC 加密
  const encryptedCBC = AESEncrypt(plaintext, key, iv)
  console.log('AES-CBC 加密:', encryptedCBC)

  // AES-CBC 解密
  const decryptedCBC = AESDecrypt(encryptedCBC, key, iv)
  console.log('AES-CBC 解密:', decryptedCBC)

  // AES-GCM 加密（更安全）
  const encryptedGCM = AESGCMEncrypt(plaintext, key)
  console.log('AES-GCM 加密:', encryptedGCM)
}

// ============================================
// 哈希算法示例
// ============================================
function exampleHash() {
  const text = 'Hello, World!'

  // MD5 哈希
  const md5Hash = MD5(text)
  console.log('MD5:', md5Hash)

  // SHA256 哈希
  const sha256Hash = SHA256(text)
  console.log('SHA256:', sha256Hash)

  // SHA512 哈希
  const sha512Hash = SHA512(text)
  console.log('SHA512:', sha512Hash)

  // 使用通用 Hash 函数
  const hash = Hash(text, 'sha256')
  console.log('通用 Hash:', hash)
}

// ============================================
// HMAC 签名示例
// ============================================
function exampleHMAC() {
  const data = 'Hello, World!'
  const secretKey = 'my-secret-key'

  // HMAC-SHA256 签名
  const hmac256 = HMACSHA256(secretKey, data)
  console.log('HMAC-SHA256:', hmac256)

  // HMAC-SHA512 签名
  const hmac512 = HMACSHA512(secretKey, data)
  console.log('HMAC-SHA512:', hmac512)
}

// ============================================
// 编码转换示例
// ============================================
function exampleEncoding() {
  const text = 'Hello, World!'

  // Base64 编码
  const base64Encoded = Base64Encode(text)
  console.log('Base64 编码:', base64Encoded)

  // Base64 解码
  const base64Decoded = Base64Decode(base64Encoded)
  console.log('Base64 解码:', base64Decoded)

  // 字符串转 Hex
  const hexEncoded = StringToHex(text)
  console.log('Hex 编码:', hexEncoded)

  // Hex 转字符串
  const hexDecoded = HexToString(hexEncoded)
  console.log('Hex 解码:', hexDecoded)
}

// ============================================
// 密钥生成示例
// ============================================
function exampleKeyGeneration() {
  // 生成随机密钥（32 字节）
  const randomKey = GenerateRandomKey(32)
  console.log('随机密钥:', randomKey)

  // 生成 UUID
  const uuid = GenerateUUID()
  console.log('UUID:', uuid)
}

// ============================================
// API 请求加密示例
// ============================================
import { encryptData, decryptData } from './request'

function exampleAPIEncryption() {
  // 加密请求数据
  const requestData = {
    username: 'admin',
    password: 'password123',
  }

  const encryptedData = encryptData(requestData)
  console.log('加密后的请求数据:', encryptedData)

  // 解密响应数据
  const responseData = {
    encrypted: true,
    data: encryptedData.data,
  }

  const decryptedData = decryptData(responseData)
  console.log('解密后的响应数据:', decryptedData)
}

// ============================================
// 实际应用场景示例
// ============================================

// 场景 1: 密码加密存储
function examplePasswordHash() {
  const password = 'user123456'
  const hashedPassword = SHA256(password)
  console.log('加密后的密码:', hashedPassword)

  // 验证密码
  const inputPassword = 'user123456'
  const isMatch = SHA256(inputPassword) === hashedPassword
  console.log('密码匹配:', isMatch)
}

// 场景 2: API 请求签名
function exampleAPISignature() {
  const apiKey = 'my-api-key'
  const timestamp = Date.now().toString()
  const requestPath = '/api/tasks'

  // 构建签名字符串
  const signString = `${timestamp}:${requestPath}`
  const signature = HMACSHA256(apiKey, signString)
  console.log('API 签名:', signature)

  // 发送请求时可以携带签名
  const headers = {
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  }
  console.log('请求头:', headers)
}

// 场景 3: 敏感数据传输
function exampleSensitiveDataTransmission() {
  const sensitiveData = {
    creditCard: '1234-5678-9012-3456',
    cvv: '123',
  }

  // 加密敏感数据
  const key = getAESKey()
  const iv = getAESIV()
  const encryptedData = AESEncrypt(JSON.stringify(sensitiveData), key, iv)
  console.log('加密后的敏感数据:', encryptedData)

  // 模拟传输
  // ... 传输加密数据 ...

  // 解密数据
  const decryptedData = JSON.parse(AESDecrypt(encryptedData, key, iv))
  console.log('解密后的敏感数据:', decryptedData)
}

// 场景 4: Token 生成
function exampleTokenGeneration() {
  // 生成唯一 Token
  const token = GenerateUUID()
  console.log('生成的 Token:', token)

  // 对 Token 进行签名
  const secretKey = 'token-secret'
  const signedToken = HMACSHA256(secretKey, token)
  console.log('签名的 Token:', signedToken)

  // 组合成最终的 Token
  const finalToken = `${token}.${signedToken}`
  console.log('最终 Token:', finalToken)
}

// 场景 5: 数据完整性验证
function exampleDataIntegrity() {
  const originalData = { id: 1, name: 'Test' }

  // 计算数据的哈希值
  const originalHash = SHA256(JSON.stringify(originalData))
  console.log('原始数据哈希:', originalHash)

  // 模拟数据传输
  const receivedData = { id: 1, name: 'Test' }

  // 验证数据完整性
  const receivedHash = SHA256(JSON.stringify(receivedData))
  const isIntact = originalHash === receivedHash
  console.log('数据完整性验证:', isIntact)
}

// ============================================
// 运行所有示例
// ============================================
export function runAllExamples() {
  console.log('='.repeat(50))
  console.log('AES 加密示例')
  console.log('='.repeat(50))
  exampleAESCrypto()

  console.log('\n' + '='.repeat(50))
  console.log('哈希算法示例')
  console.log('='.repeat(50))
  exampleHash()

  console.log('\n' + '='.repeat(50))
  console.log('HMAC 签名示例')
  console.log('='.repeat(50))
  exampleHMAC()

  console.log('\n' + '='.repeat(50))
  console.log('编码转换示例')
  console.log('='.repeat(50))
  exampleEncoding()

  console.log('\n' + '='.repeat(50))
  console.log('密钥生成示例')
  console.log('='.repeat(50))
  exampleKeyGeneration()

  console.log('\n' + '='.repeat(50))
  console.log('API 请求加密示例')
  console.log('='.repeat(50))
  exampleAPIEncryption()

  console.log('\n' + '='.repeat(50))
  console.log('实际应用场景示例')
  console.log('='.repeat(50))

  console.log('\n--- 场景 1: 密码加密存储 ---')
  examplePasswordHash()

  console.log('\n--- 场景 2: API 请求签名 ---')
  exampleAPISignature()

  console.log('\n--- 场景 3: 敏感数据传输 ---')
  exampleSensitiveDataTransmission()

  console.log('\n--- 场景 4: Token 生成 ---')
  exampleTokenGeneration()

  console.log('\n--- 场景 5: 数据完整性验证 ---')
  exampleDataIntegrity()
}

// 在浏览器控制台运行: runAllExamples()
