import { create } from 'zustand'
import api from '../lib/api'

const useGameStore = create((set, get) => ({
  skills: [],
  quests: [],
  dashboard: null,
  isLoading: false,

  // ── Skills ──
  fetchSkills: async () => {
    const { data } = await api.get('/skills/')
    set({ skills: data.skills })
  },

  createSkill: async (payload) => {
    const { data } = await api.post('/skills/', payload)
    set((s) => ({ skills: [data.skill, ...s.skills] }))
    return data.skill
  },

  updateSkill: async (id, payload) => {
    const { data } = await api.put(`/skills/${id}`, payload)
    set((s) => ({ skills: s.skills.map((sk) => sk.id === id ? data.skill : sk) }))
    return data.skill
  },

  deleteSkill: async (id) => {
    await api.delete(`/skills/${id}`)
    set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) }))
  },

  // ── Quests ──
  fetchQuests: async (params = {}) => {
    const { data } = await api.get('/quests/', { params })
    set({ quests: data.items })
    return data
  },

  fetchTodayQuests: async () => {
    const { data } = await api.get('/quests/today')
    return data.quests
  },

  createQuest: async (payload) => {
    const { data } = await api.post('/quests/', payload)
    set((s) => ({ quests: [data.quest, ...s.quests] }))
    return data.quest
  },

  updateQuest: async (id, payload) => {
    const { data } = await api.put(`/quests/${id}`, payload)
    set((s) => ({ quests: s.quests.map((q) => q.id === id ? data.quest : q) }))
    return data.quest
  },

  deleteQuest: async (id) => {
    await api.delete(`/quests/${id}`)
    set((s) => ({ quests: s.quests.filter((q) => q.id !== id) }))
  },

  completeQuest: async (id) => {
    const { data } = await api.post(`/quests/${id}/complete`)
    // Update quest in list
    set((s) => ({
      quests: s.quests.map((q) => q.id === id ? data.quest : q),
    }))
    // Refresh skills to reflect new XP
    get().fetchSkills()
    return data
  },

  failQuest: async (id) => {
    const { data } = await api.post(`/quests/${id}/fail`)
    set((s) => ({
      quests: s.quests.map((q) => q.id === id ? data.quest : q),
    }))
    return data
  },

  reorderQuests: async (items) => {
    await api.post('/quests/reorder', { items })
  },

  // ── Dashboard ──
  fetchDashboard: async () => {
    set({ isLoading: true })
    const { data } = await api.get('/analytics/dashboard')
    set({ dashboard: data, isLoading: false })
    return data
  },
}))

export default useGameStore
