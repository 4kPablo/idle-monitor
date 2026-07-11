import { describe, expect, it } from "vitest"
import { createRequestGenerationGuard } from "./weather-request"

describe("weather request generation guard", () => {
  it("rejects a delayed geolocation generation after a newer user intent", () => {
    const guard = createRequestGenerationGuard()
    const geolocationGeneration = guard.next()
    const searchGeneration = guard.next()

    expect(guard.isCurrent(geolocationGeneration)).toBe(false)
    expect(guard.isCurrent(searchGeneration)).toBe(true)
  })

  it("invalidates the current request on unmount", () => {
    const guard = createRequestGenerationGuard()
    const activeGeneration = guard.next()
    guard.invalidate()
    expect(guard.isCurrent(activeGeneration)).toBe(false)
  })
})
