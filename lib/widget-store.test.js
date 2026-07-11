import { describe, expect, it } from "vitest"
import { layoutReducer, normalizeLayout } from "./widget-store"

describe("widget layout", () => {
  it("removes duplicates and rejects unknown widget ids", () => {
    expect(normalizeLayout({ left: ["clock", "clock"], right: ["unknown", "weather"] })).toEqual({ left: ["clock"], right: ["weather"] })
  })

  it("moves a widget without duplicating it and clamps its index", () => {
    const result = layoutReducer({ left: ["clock", "weather"], right: ["calendar"] }, { type: "move", id: "clock", to: "right", index: 99 })
    expect(result).toEqual({ left: ["weather"], right: ["calendar", "clock"] })
  })

  it("migrates legacy widget ids before validation", () => {
    expect(normalizeLayout({ left: ["analog-clock", "progress"], right: ["weather"] })).toEqual({
      left: ["clock", "progress-bars"], right: ["weather"],
    })
  })
})
