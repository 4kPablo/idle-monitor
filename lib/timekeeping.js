export function remainingTimerSeconds(deadlineMs, nowMs) {
  if (!Number.isFinite(deadlineMs) || !Number.isFinite(nowMs)) return 0
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000))
}

export function elapsedStopwatchSeconds(accumulatedMs, startedAtMs, nowMs) {
  const base = Number.isFinite(accumulatedMs) ? Math.max(0, accumulatedMs) : 0
  const running = Number.isFinite(startedAtMs) && Number.isFinite(nowMs)
    ? Math.max(0, nowMs - startedAtMs)
    : 0
  return Math.floor((base + running) / 1000)
}
