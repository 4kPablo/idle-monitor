"use client"

import { useEffect, useRef, useState } from "react"

export default function HourlyChime({ currentTime, isNightMode, onChime }) {
  const lastChimeHour = useRef(-1)
  const audioContextRef = useRef(null)

  const playChime = () => {
    if (isNightMode) return

    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioContextRef.current

      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(523.25, ctx.currentTime) // C5
      oscillator.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15) // E5
      oscillator.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3) // G5

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.8)

      if (onChime) {
        onChime()
      }
    } catch (e) {
      console.error("Error playing chime:", e)
    }
  }

  useEffect(() => {
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentSecond = currentTime.getSeconds()

    if (currentMinute === 0 && currentSecond === 0 && currentHour !== lastChimeHour.current) {
      lastChimeHour.current = currentHour
      playChime()
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        try {
          audioContextRef.current.close()
        } catch (e) {
          console.error("Error closing AudioContext:", e)
        }
      }
      audioContextRef.current = null
    }
  }, [currentTime, isNightMode])

  return null
}
