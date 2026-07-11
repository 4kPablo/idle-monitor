"use client"

import { z } from "zod"
import { readStorage, writeStorage } from "@/lib/storage"

const STORAGE_KEY = "idle-widget-layout"
export const WIDGET_IDS = ["weather", "calendar", "clock", "pomodoro", "tech-news", "progress-bars", "task-list", "youtube", "quick-links", "ai-news", "ambient"]
const layoutSchema = z.object({ left: z.array(z.enum(WIDGET_IDS)), right: z.array(z.enum(WIDGET_IDS)) })
const storedLayoutSchema = z.object({ left: z.array(z.string()), right: z.array(z.string()) })
const LEGACY_IDS = { progress: "progress-bars", "analog-clock": "clock", "digital-clock": "clock" }

export const defaultLayout = {
  left: ["weather", "calendar", "clock"],
  right: ["pomodoro", "tech-news", "progress-bars", "task-list", "youtube"],
}

export function normalizeLayout(layout) {
  const parsed = storedLayoutSchema.safeParse(layout)
  if (!parsed.success) return structuredClone(defaultLayout)
  const seen = new Set()
  const normalizeColumn = column => column
    .map(id => LEGACY_IDS[id] || id)
    .filter(id => WIDGET_IDS.includes(id))
    .filter(id => !seen.has(id) && seen.add(id))
  return {
    left: normalizeColumn(parsed.data.left),
    right: normalizeColumn(parsed.data.right),
  }
}

export function getWidgetLayout() { return normalizeLayout(readStorage(STORAGE_KEY, storedLayoutSchema, defaultLayout)) }
export function saveWidgetLayout(layout) { return writeStorage(STORAGE_KEY, layoutSchema, normalizeLayout(layout)) }

export function layoutReducer(layout, action) {
  const current = normalizeLayout(layout)
  if (action.type === "remove") return normalizeLayout({ left: current.left.filter(id => id !== action.id), right: current.right.filter(id => id !== action.id) })
  if (action.type === "add" && WIDGET_IDS.includes(action.id)) {
    if (current.left.includes(action.id) || current.right.includes(action.id)) return current
    const column = action.column === "right" ? "right" : "left"
    return normalizeLayout({ ...current, [column]: [...current[column], action.id] })
  }
  if (action.type === "move" && WIDGET_IDS.includes(action.id) && ["left", "right"].includes(action.to)) {
    const next = { left: current.left.filter(id => id !== action.id), right: current.right.filter(id => id !== action.id) }
    const index = Math.max(0, Math.min(Number.isInteger(action.index) ? action.index : next[action.to].length, next[action.to].length))
    next[action.to].splice(index, 0, action.id)
    return normalizeLayout(next)
  }
  return current
}

export function moveWidget(widgetId, fromColumn, toColumn, layout, destinationIndex = null) {
  return layoutReducer(layout, { type: "move", id: widgetId, to: toColumn, index: destinationIndex })
}
