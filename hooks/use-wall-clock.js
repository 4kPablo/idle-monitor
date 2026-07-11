"use client"

import { useEffect, useState } from "react"

export function useWallClock(intervalMs = 1000) {
  const [time, setTime] = useState(() => new Date())

  useEffect(() => {
    const update = () => setTime(new Date())
    const timer = setInterval(update, intervalMs)
    document.addEventListener("visibilitychange", update)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", update)
    }
  }, [intervalMs])

  return time
}
