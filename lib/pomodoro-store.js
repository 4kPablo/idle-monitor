import { z } from "zod"
import { readStorage, writeStorage } from "@/lib/storage"

const STORAGE_KEY = "idle-pomodoros"

export function getPomodoroLogs() {
  return readStorage(STORAGE_KEY, z.array(z.object({ id: z.number(), activity: z.string(), duration: z.number().nonnegative(), date: z.string(), day: z.number(), month: z.number(), year: z.number(), status: z.string().optional(), mode: z.string().optional() }).passthrough()), [])
}

export function savePomodoroLog(activity, durationMinutes, date = new Date(), status = "completed", mode = "pomodoro") {
  const logs = getPomodoroLogs()
  const newLog = {
    id: Date.now(),
    activity,
    duration: durationMinutes,
    date: date.toISOString(),
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    status,
    mode,
  }
  logs.push(newLog)
  writeStorage(STORAGE_KEY, z.array(z.any()), logs)
  return newLog
}

export function deletePomodoroLog(id) {
  const logs = getPomodoroLogs()
  const newLogs = logs.filter((log) => log.id !== id)
  writeStorage(STORAGE_KEY, z.array(z.any()), newLogs)
  return newLogs
}

export function getPomodorosForMonth(year, month) {
  const logs = getPomodoroLogs()
  return logs.filter((log) => log.year === year && log.month === month && (!log.status || log.status === "completed"))
}

export function getPomodorosForDay(year, month, day) {
  const logs = getPomodoroLogs()
  return logs.filter((log) => log.year === year && log.month === month && log.day === day && (!log.status || log.status === "completed"))
}
