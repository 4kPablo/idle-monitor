"use client"

import { create } from 'zustand'

const useTimerStore = create((set) => ({
  type: null,
  status: 'idle',
  timeLeft: 0,
  display: '00:00',
  isBreak: false,
  activity: null,

  update: (data) => set(data),
  clear: () => set({ type: null, status: 'idle', timeLeft: 0, display: '00:00', isBreak: false, activity: null }),
}))

export { useTimerStore }
