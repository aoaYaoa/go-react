import { StateCreator } from 'zustand'
import type { UserInfo } from '../services/user'
import type { Role, Menu } from '../types'

/**
 * 认证状态 Slice
 */
export interface AuthSlice {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  roles: Role[]
  menus: Menu[]
  setUser: (user: UserInfo | null) => void
  setToken: (token: string | null) => void
  setRoles: (roles: Role[]) => void
  setMenus: (menus: Menu[]) => void
  logout: () => void
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  roles: [],
  menus: [],

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setToken: (token) =>
    set({
      token,
    }),

  setRoles: (roles) =>
    set({
      roles,
    }),

  setMenus: (menus) =>
    set({
      menus,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      roles: [],
      menus: [],
    }),
})
