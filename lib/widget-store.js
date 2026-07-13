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

export function getWidgetColumn(layout, widgetId) {
  const current = normalizeLayout(layout)
  if (current.left.includes(widgetId)) return "left"
  if (current.right.includes(widgetId)) return "right"
  return null
}

function getDropColumn(layout, overId) {
  if (overId === "left" || overId === "right") return overId
  return getWidgetColumn(layout, overId)
}

export function previewWidgetDrag(layout, activeId, overId, placeAfter = false, originColumn = null) {
  const current = normalizeLayout(layout)
  const activeColumn = getWidgetColumn(current, activeId)
  const overColumn = getDropColumn(current, overId)
  if (!activeColumn || !overColumn) return current
  if (activeColumn === overColumn && (!originColumn || activeColumn === originColumn)) return current
  const overIndex = current[overColumn].indexOf(overId)
  const activeIndex = current[overColumn].indexOf(activeId)
  const shiftAfterRemoval = activeColumn === overColumn && activeIndex >= 0 && activeIndex < overIndex ? 1 : 0
  const index = overIndex < 0 ? current[overColumn].length : overIndex - shiftAfterRemoval + (placeAfter ? 1 : 0)
  return moveWidget(activeId, activeColumn, overColumn, current, index)
}

export function finishWidgetDrag({ layout, snapshot, activeId, overId, originColumn, cancelled = false }) {
  if (cancelled || !overId) return normalizeLayout(snapshot)
  const current = normalizeLayout(layout)
  const activeColumn = getWidgetColumn(current, activeId)
  const overColumn = getDropColumn(current, overId)
  if (!activeColumn || !overColumn) return normalizeLayout(snapshot)
  if (originColumn && activeColumn !== originColumn) return current
  const overIndex = current[overColumn].indexOf(overId)
  return moveWidget(activeId, activeColumn, overColumn, current, overIndex < 0 ? current[overColumn].length : overIndex)
}
