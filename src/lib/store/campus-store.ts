'use client'

import { create } from 'zustand'
import type { Campus } from '@/types/mvp'

interface CampusStore {
  campusId: string | null
  campus: Campus | null
  setCampus: (campusId: string, campus: Campus) => void
  clearCampus: () => void
}

export const useCampusStore = create<CampusStore>((set) => ({
  campusId: null,
  campus: null,
  setCampus: (campusId: string, campus: Campus) => {
    // Persist to localStorage
    localStorage.setItem('selected_campus_id', campusId)
    set({ campusId, campus })
  },
  clearCampus: () => {
    localStorage.removeItem('selected_campus_id')
    set({ campusId: null, campus: null })
  },
}))

// Restore from localStorage on mount
export function initializeCampusStore() {
  const stored = localStorage.getItem('selected_campus_id')
  if (stored) {
    // You'd typically fetch the full campus object here
    useCampusStore.setState({ campusId: stored })
  }
}
