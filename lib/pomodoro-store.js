// Store para guardar y recuperar pomodoros completados usando localStorage

const STORAGE_KEY = "idle-pomodoros"

export function getPomodoroLogs() {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function savePomodoroLog(activity, durationMinutes, date = new Date()) {
  const logs = getPomodoroLogs()
  const newLog = {
    id: Date.now(),
    activity,
    duration: durationMinutes,
    date: date.toISOString(),
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  }
  logs.push(newLog)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  return newLog
}

export function deletePomodoroLog(id) {
  const logs = getPomodoroLogs()
  const newLogs = logs.filter((log) => log.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newLogs))
  return newLogs
}

export function getPomodorosForMonth(year, month) {
  const logs = getPomodoroLogs()
  return logs.filter((log) => log.year === year && log.month === month)
}

export function getPomodorosForDay(year, month, day) {
  const logs = getPomodoroLogs()
  return logs.filter((log) => log.year === year && log.month === month && log.day === day)
}
