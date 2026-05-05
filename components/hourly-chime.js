"use client"

import { useEffect, useRef } from "react"

// soundType: "chime" | "bell" | "digital"
export function playChimeSound(soundType = "chime", volume = 0.15) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const makeOsc = (freq, startOffset, duration, type = "sine", gain = volume) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.connect(g)
      g.connect(ctx.destination)
      osc.type = type
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset)
      g.gain.setValueAtTime(gain, ctx.currentTime + startOffset)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration)
      osc.start(ctx.currentTime + startOffset)
      osc.stop(ctx.currentTime + startOffset + duration)
    }

    if (soundType === "chime") {
      makeOsc(523.25, 0, 0.8)       // C5
      makeOsc(659.25, 0.15, 0.7)    // E5
      makeOsc(783.99, 0.3, 0.8)     // G5
    } else if (soundType === "bell") {
      makeOsc(880, 0, 1.2, "sine", volume)
      makeOsc(1760, 0, 0.6, "sine", volume * 0.4)
      makeOsc(880, 0.5, 0.8, "sine", volume * 0.5)
    } else if (soundType === "digital") {
      makeOsc(1000, 0, 0.1, "square", volume * 0.3)
      makeOsc(1200, 0.15, 0.1, "square", volume * 0.3)
      makeOsc(1000, 0.3, 0.1, "square", volume * 0.3)
    }
  } catch (e) {
    console.error("Error playing chime:", e)
  }
}

export function playAlarmSound(soundType = "beep") {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()

    const makeOsc = (freq1, freq2, start, duration, type = "square", gain = 0.4) => {
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.connect(g)
      g.connect(ctx.destination)
      osc.type = type
      osc.frequency.setValueAtTime(freq1, ctx.currentTime + start)
      if (freq2) osc.frequency.setValueAtTime(freq2, ctx.currentTime + start + duration * 0.5)
      g.gain.setValueAtTime(gain, ctx.currentTime + start)
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration)
      osc.start(ctx.currentTime + start)
      osc.stop(ctx.currentTime + start + duration)
    }

    if (soundType === "beep") {
      makeOsc(800, 1200, 0, 0.4)
      makeOsc(800, 1200, 0.5, 0.4)
      makeOsc(800, 1200, 1.0, 0.4)
    } else if (soundType === "siren") {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.connect(g)
        g.connect(ctx.destination)
        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(400, ctx.currentTime + i * 0.6)
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + i * 0.6 + 0.3)
        osc.frequency.linearRampToValueAtTime(400, ctx.currentTime + i * 0.6 + 0.6)
        g.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.6)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.6 + 0.6)
        osc.start(ctx.currentTime + i * 0.6)
        osc.stop(ctx.currentTime + i * 0.6 + 0.6)
      }
    } else if (soundType === "chime") {
      makeOsc(880, 440, 0, 1, "sine", 0.3)
      makeOsc(880, 440, 0.7, 0.8, "sine", 0.2)
    }
  } catch (e) {
    console.error("Error playing alarm:", e)
  }
}

export default function HourlyChime({ currentTime, enabled = true, silentFrom = 0, silentTo = 7, soundType = "chime", onChime }) {
  const lastChimeHour = useRef(-1)

  useEffect(() => {
    if (!enabled) return

    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentSecond = currentTime.getSeconds()

    // Check silence window (handles wrap-around midnight)
    const isSilent = silentFrom <= silentTo
      ? currentHour >= silentFrom && currentHour < silentTo
      : currentHour >= silentFrom || currentHour < silentTo

    if (currentMinute === 0 && currentSecond === 0 && currentHour !== lastChimeHour.current) {
      lastChimeHour.current = currentHour
      if (!isSilent) {
        playChimeSound(soundType)
        if (onChime) onChime()
      }
    }
  }, [currentTime, enabled, silentFrom, silentTo, soundType, onChime])

  return null
}
