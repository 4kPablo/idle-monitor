import { z } from "zod"

export function readStorage(key, schema, fallback) {
  if (typeof window === "undefined") return structuredClone(fallback)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return structuredClone(fallback)
    const result = schema.safeParse(JSON.parse(raw))
    return result.success ? result.data : structuredClone(fallback)
  } catch {
    return structuredClone(fallback)
  }
}

export function writeStorage(key, schema, value) {
  if (typeof window === "undefined") return false
  const result = schema.safeParse(value)
  if (!result.success) return false
  try {
    localStorage.setItem(key, JSON.stringify(result.data))
    return true
  } catch {
    return false
  }
}

export const BACKUP_VERSION = 1
export const BACKUP_KEYS = [
  "idle-settings", "idle-widget-layout", "idle-pomodoros", "idle-timer",
  "pomodoroActivityModes", "pomodoroActivities", "idle-youtube",
  "idle-weather-loc", "idle-tasks", "idle-quick-links", "idle-youtube-playlist",
]
const RAW_STRING_KEYS = new Set(["idle-youtube", "idle-weather-loc"])

const backupSchema = z.object({
  version: z.literal(BACKUP_VERSION),
  exportedAt: z.string().datetime(),
  data: z.record(z.string(), z.string().nullable()),
})

export function createBackup(storage = localStorage) {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: Object.fromEntries(BACKUP_KEYS.map(key => [key, storage.getItem(key)])),
  }
}

export function restoreBackup(input, storage = localStorage) {
  const legacyMap = {
    settings: "idle-settings", layout: "idle-widget-layout", pomodoro: "idle-pomodoros",
    pomodoroActivityModes: "pomodoroActivityModes", pomodoroActivities: "pomodoroActivities", youtube: "idle-youtube",
  }
  const candidate = input?.version === undefined && input && typeof input === "object"
    ? {
        version: BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        data: Object.fromEntries(
          Object.entries(legacyMap)
            .filter(([oldKey]) => Object.prototype.hasOwnProperty.call(input, oldKey))
            .map(([oldKey, key]) => [key, input[oldKey]]),
        ),
      }
    : input
  const parsed = backupSchema.safeParse(candidate)
  if (!parsed.success) return false
  for (const key of BACKUP_KEYS) {
    const value = parsed.data.data[key]
    if (typeof value === "string" && !RAW_STRING_KEYS.has(key)) JSON.parse(value)
  }
  for (const key of BACKUP_KEYS) {
    const value = parsed.data.data[key]
    if (typeof value === "string") storage.setItem(key, value)
    else if (value === null) storage.removeItem(key)
  }
  return true
}
