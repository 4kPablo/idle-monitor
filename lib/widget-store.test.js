import { describe, expect, it } from "vitest"
import { finishWidgetDrag, layoutReducer, normalizeLayout, previewWidgetDrag } from "./widget-store"

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

  it("reorders widgets in the same column when a drag finishes", () => {
    const layout = { left: ["clock", "weather", "calendar"], right: [] }
    expect(finishWidgetDrag({ layout, snapshot: layout, activeId: "clock", overId: "calendar", originColumn: "left" })).toEqual({
      left: ["weather", "calendar", "clock"], right: [],
    })
  })

  it("previews and finishes a cross-column move without duplicating the widget", () => {
    const snapshot = { left: ["clock", "weather"], right: ["calendar"] }
    const preview = previewWidgetDrag(snapshot, "clock", "calendar", true)
    expect(preview).toEqual({ left: ["weather"], right: ["calendar", "clock"] })
    expect(finishWidgetDrag({ layout: preview, snapshot, activeId: "clock", overId: "calendar", originColumn: "left" })).toEqual(preview)
  })

  it("updates insertion position on later hovers in the destination column", () => {
    const snapshot = { left: ["clock", "weather"], right: ["calendar", "pomodoro", "youtube"] }
    const firstPreview = previewWidgetDrag(snapshot, "clock", "calendar", false, "left")
    const laterPreview = previewWidgetDrag(firstPreview, "clock", "youtube", true, "left")
    expect(laterPreview).toEqual({ left: ["weather"], right: ["calendar", "pomodoro", "youtube", "clock"] })
    const allWidgets = [...laterPreview.left, ...laterPreview.right]
    expect(new Set(allWidgets).size).toBe(allWidgets.length)
    expect(finishWidgetDrag({ layout: laterPreview, snapshot, activeId: "clock", overId: null, originColumn: "left" })).toEqual(snapshot)
  })

  it("supports crossing back to the origin column", () => {
    const snapshot = { left: ["clock", "weather"], right: ["calendar"] }
    const crossed = previewWidgetDrag(snapshot, "clock", "calendar")
    expect(previewWidgetDrag(crossed, "clock", "weather")).toEqual(snapshot)
  })

  it("restores the snapshot for cancellation and a missing drop target", () => {
    const snapshot = { left: ["clock"], right: ["calendar"] }
    const preview = previewWidgetDrag(snapshot, "clock", "calendar")
    expect(finishWidgetDrag({ layout: preview, snapshot, activeId: "clock", overId: null, originColumn: "left" })).toEqual(snapshot)
    expect(finishWidgetDrag({ layout: preview, snapshot, activeId: "clock", overId: "calendar", originColumn: "left", cancelled: true })).toEqual(snapshot)
  })

  it("moves a widget into an empty column", () => {
    const layout = { left: ["clock"], right: [] }
    expect(previewWidgetDrag(layout, "clock", "right")).toEqual({ left: [], right: ["clock"] })
  })
})
