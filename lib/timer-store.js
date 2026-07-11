"use client"

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export const TIMER_STORE_VERSION = 1
export const isCancellableTimer = (timer, minimumSeconds = 5 * 60) =>
  !timer.isBreak && Boolean(timer.activityId) && timer.elapsed >= minimumSeconds && ["running", "paused"].includes(timer.status)
const EMPTY = {
  type: null,
  status: "idle",
  activity: null,
  activityId: null,
  isBreak: false,
  duration: 0,
  remaining: 0,
  elapsed: 0,
  startedAt: null,
  deadline: null,
  completion: null,
}

export function timerSnapshot(timer, now = Date.now()) {
  if (timer.status !== "running" || !timer.startedAt) return timer
  const delta = Math.max(0, Math.floor((now - timer.startedAt) / 1000))
  if (timer.type === "stopwatch") {
    return { ...timer, elapsed: timer.elapsed + delta, startedAt: timer.startedAt + delta * 1000 }
  }
  const consumed = Math.min(delta, timer.remaining)
  return {
    ...timer,
    remaining: Math.max(0, timer.remaining - consumed),
    elapsed: timer.elapsed + consumed,
    startedAt: timer.startedAt + consumed * 1000,
    deadline: timer.deadline,
  }
}

const formatTime = (seconds) => {
  const safe = Math.max(0, Math.floor(seconds || 0))
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`
}

export const useTimerStore = create(persist((set, get) => ({
  ...EMPTY,
  timeLeft: 0,
  display: "00:00",

  configure: ({ type, duration, activity, activityId }) => set({
    ...EMPTY,
    type,
    activity,
    activityId,
    duration,
    remaining: type === "stopwatch" ? 0 : duration,
    timeLeft: type === "stopwatch" ? 0 : duration,
    display: formatTime(type === "stopwatch" ? 0 : duration),
  }),

  start: () => set((state) => {
    if (!state.type || state.status === "running") return state
    const now = Date.now()
    const restarted = state.status === "completed"
      ? { ...state, remaining: state.type === "stopwatch" ? 0 : state.duration, elapsed: 0, completion: null }
      : state
    return { ...restarted, status: "running", startedAt: now, deadline: restarted.type === "stopwatch" ? null : now + restarted.remaining * 1000 }
  }),

  pause: () => set((state) => {
    const next = timerSnapshot(state)
    const shown = next.type === "stopwatch" ? next.elapsed : next.remaining
    return { ...next, status: "paused", startedAt: null, deadline: null, timeLeft: shown, display: formatTime(shown) }
  }),

  reconcile: (now = Date.now()) => set((state) => {
    if (state.status !== "running") return state
    if (state.type === "stopwatch") {
      const next = timerSnapshot(state, now)
      return { ...next, timeLeft: next.elapsed, display: formatTime(next.elapsed) }
    }

    const delta = Math.max(0, Math.floor((now - state.startedAt) / 1000))
    if (delta < state.remaining) {
      const next = timerSnapshot(state, now)
      return { ...next, timeLeft: next.remaining, display: formatTime(next.remaining) }
    }

    const phaseElapsed = state.elapsed + state.remaining
    const overdue = delta - state.remaining
    const completion = { id: now, type: state.type, activityId: state.activityId, elapsed: phaseElapsed, isBreak: state.isBreak }
    let next
    if (state.type === "pomodoro" && !state.isBreak && overdue < 5 * 60) {
      const remaining = 5 * 60 - overdue
      const phaseStartedAt = state.startedAt + (state.remaining + overdue) * 1000
      next = { ...state, isBreak: true, duration: 5 * 60, remaining, elapsed: overdue, startedAt: phaseStartedAt, deadline: phaseStartedAt + remaining * 1000, completion }
    } else if (state.type === "pomodoro") {
      next = { ...state, isBreak: false, duration: 25 * 60, remaining: 25 * 60, elapsed: 0, status: "paused", startedAt: null, deadline: null, completion }
    } else {
      next = { ...state, remaining: 0, elapsed: phaseElapsed, status: "completed", startedAt: null, deadline: null, completion }
    }
    const shown = next.type === "stopwatch" ? next.elapsed : next.remaining
    return { ...next, timeLeft: shown, display: formatTime(shown) }
  }),

  skipBreak: () => set((state) => {
    if (state.type !== "pomodoro" || !state.isBreak) return state
    const now = Date.now()
    return { ...state, isBreak: false, duration: 25 * 60, remaining: 25 * 60, elapsed: 0, status: "running", startedAt: now, deadline: now + 25 * 60 * 1000, completion: null }
  }),
  consumeCompletion: () => set({ completion: null }),
  clear: () => set({ ...EMPTY, timeLeft: 0, display: "00:00" }),
}), {
  name: "idle-timer",
  version: TIMER_STORE_VERSION,
  storage: createJSONStorage(() => localStorage),
  partialize: ({ type, status, activity, activityId, isBreak, duration, remaining, elapsed, startedAt, deadline }) =>
    ({ type, status, activity, activityId, isBreak, duration, remaining, elapsed, startedAt, deadline }),
}))
