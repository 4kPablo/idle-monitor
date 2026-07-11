import { describe, expect, it } from "vitest"
import { elapsedStopwatchSeconds, remainingTimerSeconds } from "./timekeeping"

describe("remainingTimerSeconds", () => {
  it("derives remaining time from the deadline after a delayed tick", () => {
    expect(remainingTimerSeconds(70_000, 42_500)).toBe(28)
  })

  it("never returns a negative duration", () => {
    expect(remainingTimerSeconds(10_000, 20_000)).toBe(0)
  })
})

describe("elapsedStopwatchSeconds", () => {
  it("combines previous elapsed time with the current run", () => {
    expect(elapsedStopwatchSeconds(2_500, 10_000, 14_900)).toBe(7)
  })

  it("ignores clock movement before the start timestamp", () => {
    expect(elapsedStopwatchSeconds(3_000, 10_000, 9_000)).toBe(3)
  })
})
