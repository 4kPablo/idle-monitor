"use client"

import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from "react"
import { Volume2, VolumeX, Coffee, TreePine, Brain, Zap, Cpu } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useLanguage } from "@/lib/language-context"

// ─── Brown noise buffer generator ───────────────────────────────────────────
function fillBrownNoise(data) {
  let last = 0
  for (let i = 0; i < data.length; i++) {
    const w = Math.random() * 2 - 1
    last = (last + 0.02 * w) / 1.02
    data[i] = last * 3.5
  }
}

const BUFFER_DURATION = 30 // seconds

// ─── Sound definitions ───────────────────────────────────────────────────────
//
// type: 'binaural'  → two oscillators, one per ear
// type: 'generated' → AudioBufferSourceNode with loop=true
// type: 'url'       → HTMLAudioElement routed through Web Audio
//
const SOUNDS = [
  {
    id: "theta",
    label: "Theta",
    subtitle: "4–8 Hz · Meditación",
    icon: Brain,
    type: "binaural",
    baseFreq: 200,
    beatFreq: 6,
  },
  {
    id: "alpha",
    label: "Alpha",
    subtitle: "8–12 Hz · Enfoque",
    icon: Zap,
    type: "binaural",
    baseFreq: 200,
    beatFreq: 10,
  },
  {
    id: "beta",
    label: "Beta",
    subtitle: "12–30 Hz · Alerta",
    icon: Cpu,
    type: "binaural",
    baseFreq: 200,
    beatFreq: 20,
  },
  {
    id: "brown",
    label: "Marrón",
    subtitle: "Ruido de fondo",
    icon: Coffee,
    type: "generated",
  },
  {
    id: "forest",
    label: "Bosque",
    subtitle: "Ambiente natural",
    icon: TreePine,
    type: "url",
    url: "https://upload.wikimedia.org/wikipedia/commons/0/0a/20090610_0_ambience.ogg",
  },
]

// ─── Component ───────────────────────────────────────────────────────────────
const AmbientSounds = forwardRef((props, ref) => {
  const { lang, t } = useLanguage()
  const [activeSound, setActiveSound] = useState(null)
  const [volume, setVolume] = useState(0.5)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioCtxRef  = useRef(null)
  const gainNodeRef  = useRef(null)
  const stopFnRef    = useRef(null) // function to stop current sound

  // ── Create / get AudioContext ─────────────────────────────────────────────
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const gain = ctx.createGain()
      gain.gain.value = volume * (volume > 0 ? 1 : 0)
      gain.connect(ctx.destination)
      audioCtxRef.current = ctx
      gainNodeRef.current = gain
    }
    return { ctx: audioCtxRef.current, gain: gainNodeRef.current }
  }, [volume])

  // ── Stop whatever is playing ──────────────────────────────────────────────
  const stopAll = useCallback(() => {
    if (stopFnRef.current) {
      stopFnRef.current()
      stopFnRef.current = null
    }
  }, [])

  // ── Binaural beats ────────────────────────────────────────────────────────
  // Two sine oscillators, one per stereo channel, slightly different freq.
  // The brain perceives the difference as a low-frequency beat (the brainwave).
  // IMPORTANT: works best with headphones/earphones.
  const playBinaural = useCallback((baseFreq, beatFreq) => {
    const { ctx, gain } = getCtx()
    if (ctx.state === "suspended") ctx.resume()

    // We need a stereo output: merge two mono oscillators into L/R channels
    const merger = ctx.createChannelMerger(2)
    merger.connect(gain)

    const makeOsc = (freq) => {
      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.value = freq
      // Soft gain so a pure sine isn't too piercing
      const g = ctx.createGain()
      g.gain.value = 0.25
      osc.connect(g)
      return { osc, g }
    }

    const left  = makeOsc(baseFreq)
    const right = makeOsc(baseFreq + beatFreq)

    left.g.connect(merger,  0, 0) // → left channel
    right.g.connect(merger, 0, 1) // → right channel

    left.osc.start()
    right.osc.start()

    stopFnRef.current = () => {
      left.osc.stop()
      right.osc.stop()
      merger.disconnect()
    }
  }, [getCtx])

  // ── Brown noise (generated buffer, seamless loop) ─────────────────────────
  const playGenerated = useCallback(() => {
    const { ctx, gain } = getCtx()
    if (ctx.state === "suspended") ctx.resume()

    const bufferSize = ctx.sampleRate * BUFFER_DURATION
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    fillBrownNoise(buffer.getChannelData(0))

    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    source.connect(gain)
    source.start(0)

    stopFnRef.current = () => {
      try { source.stop() } catch (_) {}
      source.disconnect()
    }
  }, [getCtx])

  // ── URL-based (HTMLAudioElement routed through Web Audio) ─────────────────
  const playUrl = useCallback((url) => {
    const { ctx, gain } = getCtx()
    if (ctx.state === "suspended") ctx.resume()

    const audio = new Audio(url)
    audio.loop = true
    audio.crossOrigin = "anonymous"

    const mediaSource = ctx.createMediaElementSource(audio)
    mediaSource.connect(gain)
    audio.play().catch(err => console.error("Error playing URL audio:", err))

    stopFnRef.current = () => {
      audio.pause()
      audio.src = ""
      mediaSource.disconnect()
    }
  }, [getCtx])

  // ── Main play / toggle ────────────────────────────────────────────────────
  const playSound = useCallback((sound) => {
    if (activeSound === sound.id) {
      stopAll()
      setActiveSound(null)
      setIsPlaying(false)
      return
    }

    stopAll()

    if (sound.type === "binaural")  playBinaural(sound.baseFreq, sound.beatFreq)
    else if (sound.type === "generated") playGenerated()
    else if (sound.type === "url")  playUrl(sound.url)

    setActiveSound(sound.id)
    setIsPlaying(true)
  }, [activeSound, stopAll, playBinaural, playGenerated, playUrl])

  // ── Volume ────────────────────────────────────────────────────────────────
  const handleVolumeChange = useCallback((val) => {
    const vol = val[0]
    setVolume(vol)
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(
        vol,
        audioCtxRef.current.currentTime,
        0.02
      )
    }
  }, [])

  // ── Expose to parent (Pomodoro integration) ───────────────────────────────
  useImperativeHandle(ref, () => ({
    autoPlay: () => {
      if (!isPlaying) {
        const sound = SOUNDS.find(s => s.id === activeSound) || SOUNDS[0]
        playSound(sound)
      }
    },
    autoPause: () => {
      if (isPlaying) {
        stopAll()
        setIsPlaying(false)
      }
    },
  }), [isPlaying, activeSound, playSound, stopAll])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => () => {
    stopAll()
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close()
    }
  }, [stopAll])

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        {isPlaying
          ? <Volume2 className="w-4 h-4 text-muted-foreground" />
          : <VolumeX className="w-4 h-4 text-muted-foreground" />
        }
        <h3 className="text-sm font-medium text-muted-foreground">{t.ambient.title}</h3>
      </div>

      {/* Sound buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        {SOUNDS.map((sound) => {
          const Icon = sound.icon
          const isActive = activeSound === sound.id
          const label = t.ambient[sound.id] || sound.label
          const subtitle = t.ambient[sound.id + "Sub"] || sound.subtitle
          const binauralHint = sound.type === "binaural" ? (lang === 'es' ? "\n🎧 Mejor con auriculares" : "\n🎧 Better with headphones") : ""
          return (
            <button
              key={sound.id}
              type="button"
              onClick={() => playSound(sound)}
              title={`${label} — ${subtitle}${binauralHint}`}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 cursor-pointer
                ${isActive
                  ? "bg-primary/20 text-primary scale-105"
                  : "bg-secondary/30 text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:scale-105"
                }
              `}
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>

      {/* Headphones hint for binaural */}
      {activeSound && SOUNDS.find(s => s.id === activeSound)?.type === "binaural" && (
        <p className="text-[10px] text-muted-foreground/60 text-center">
          {t.ambient.headphones}
        </p>
      )}

      {/* Volume slider */}
      <div className="flex items-center gap-3 pt-1">
        <VolumeX className="w-3 h-3 text-muted-foreground" />
        <Slider
          value={[volume]}
          onValueChange={handleVolumeChange}
          max={1}
          step={0.01}
          className="flex-1 cursor-pointer"
        />
        <Volume2 className="w-3 h-3 text-muted-foreground" />
      </div>
    </div>
  )
})

AmbientSounds.displayName = "AmbientSounds"
export default React.memo(AmbientSounds)
