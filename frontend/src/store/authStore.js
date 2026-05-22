import { create } from 'zustand'
import api from '../lib/api'

const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  init: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    try {
      const { data } = await api.get('/auth/me')
      set({ user: data.user, isAuthenticated: true })
    } catch {
      localStorage.clear()
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    set({ user: data.user, isAuthenticated: true, isLoading: false })
    return data
  },

  register: async (username, email, password) => {
    set({ isLoading: true })
    const { data } = await api.post('/auth/register', { username, email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    set({ user: data.user, isAuthenticated: true, isLoading: false })
    return data
  },

  logout: () => {
    localStorage.clear()
    set({ user: null, isAuthenticated: false })
  },

  updateUser: (user) => set({ user }),
}))

export default useAuthStore
