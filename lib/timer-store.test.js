import { describe, expect, it, vi } from "vitest"
import { isCancellableTimer, timerSnapshot, useTimerStore } from "./timer-store"

describe("timer state", () => {
  it("derives countdown time from timestamps instead of interval ticks", () => {
    const result = timerSnapshot({ type: "timer", status: "running", remaining: 60, elapsed: 0, startedAt: 1_000 }, 31_000)
    expect(result.remaining).toBe(30)
    expect(result.elapsed).toBe(30)
  })

  it("caps elapsed time at the planned countdown duration", () => {
    const result = timerSnapshot({ type: "timer", status: "running", remaining: 10, elapsed: 0, startedAt: 1_000 }, 31_000)
    expect(result.remaining).toBe(0)
    expect(result.elapsed).toBe(10)
  })

  it("preserves fractional time across frequent reconciliations", () => {
    const initial = { type: "timer", status: "running", remaining: 2, elapsed: 0, startedAt: 1_000, deadline: 3_000 }
    const first = timerSnapshot(initial, 1_250)
    const second = timerSnapshot(first, 2_000)
    expect(second).toMatchObject({ remaining: 1, elapsed: 1, startedAt: 2_000 })
  })

  it("transitions a completed pomodoro to a persisted break once", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000)
    const store = useTimerStore.getState()
    store.configure({ type: "pomodoro", duration: 1, activity: "Study", activityId: "study" })
    store.start()
    useTimerStore.getState().reconcile(2_000)
    const completed = useTimerStore.getState()
    expect(completed.isBreak).toBe(true)
    expect(completed.completion.activityId).toBe("study")
    completed.consumeCompletion()
    useTimerStore.getState().reconcile(2_500)
    expect(useTimerStore.getState().completion).toBeNull()
    vi.restoreAllMocks()
  })

  it("returns to a fresh paused work session after a break", () => {
    useTimerStore.setState({ type: "pomodoro", status: "running", isBreak: true, duration: 1, remaining: 1, elapsed: 0, startedAt: 1_000 })
    useTimerStore.getState().reconcile(2_000)
    expect(useTimerStore.getState()).toMatchObject({ status: "paused", isBreak: false, remaining: 25 * 60 })
  })

  it("reconciles through an overdue work and break phase", () => {
    useTimerStore.setState({ type: "pomodoro", status: "running", isBreak: false, duration: 25 * 60, remaining: 25 * 60, elapsed: 0, startedAt: 1_000, activityId: "study" })
    useTimerStore.getState().reconcile(35 * 60 * 1000 + 1_000)
    expect(useTimerStore.getState()).toMatchObject({ status: "paused", isBreak: false, remaining: 25 * 60 })
    expect(useTimerStore.getState().completion.elapsed).toBe(25 * 60)
  })

  it("classifies partial work sessions for cancelled logging", () => {
    expect(isCancellableTimer({ status: "paused", isBreak: false, activityId: "study", elapsed: 300 })).toBe(true)
    expect(isCancellableTimer({ status: "paused", isBreak: true, activityId: "study", elapsed: 300 })).toBe(false)
    expect(isCancellableTimer({ status: "completed", isBreak: false, activityId: "study", elapsed: 300 })).toBe(false)
  })
})
