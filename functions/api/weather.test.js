import { describe, expect, it } from "vitest"
import { parseWeatherQuery } from "./weather"

describe("parseWeatherQuery", () => {
  it.each([
    "https://example.com/api/weather",
    "https://example.com/api/weather?lat=",
    "https://example.com/api/weather?lon=10",
    "https://example.com/api/weather?lat=10",
    "https://example.com/api/weather?lat=10&lon=",
  ])("rejects missing, empty, or partial coordinates: %s", (value) => {
    expect(parseWeatherQuery(new URL(value))).toEqual({ error: "A valid location or coordinates are required" })
  })

  it("accepts zero coordinates only when both are explicitly present", () => {
    expect(parseWeatherQuery(new URL("https://example.com/api/weather?lat=0&lon=0"))).toEqual({ lang: "es", lat: 0, lon: 0 })
  })
})
