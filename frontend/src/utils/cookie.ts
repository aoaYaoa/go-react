/**
 * Cookie 工具函数
 */

/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param days 过期天数
 */
export function setCookie(name: string, value: string, days: number): void {
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`
}

/**
 * 获取 Cookie
 * @param name Cookie 名称
 * @returns Cookie 值或 null
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`
  const cookies = document.cookie.split(';')
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length, cookie.length)
    }
  }
  
  return null
}

/**
 * 删除 Cookie
 * @param name Cookie 名称
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`
}

/**
 * 检查 Cookie 是否存在
 * @param name Cookie 名称
 * @returns 是否存在
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null
}
