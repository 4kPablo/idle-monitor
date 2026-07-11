"use client"

import { useEffect, useRef } from "react"

export default function ParticlesBg({ particleColor = "100, 180, 255" }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    let animationFrameId
    let particles = []
    let running = true
    let lastFrame = 0
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const createParticles = () => {
      particles = []
      const particleCount = Math.min(140, Math.floor((window.innerWidth * window.innerHeight) / 20000))
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          radius: Math.random() * 2 + 0.5,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.2,
        })
      }
    }

    const drawParticles = (timestamp = 0) => {
      if (!running) return
      if (!reducedMotion) animationFrameId = requestAnimationFrame(drawParticles)
      if (timestamp - lastFrame < 1000 / 30) return
      lastFrame = timestamp
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy
        if (particle.x < 0) particle.x = window.innerWidth
        if (particle.x > window.innerWidth) particle.x = 0
        if (particle.y < 0) particle.y = window.innerHeight
        if (particle.y > window.innerHeight) particle.y = 0

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const particle2 = particles[j]
          const dx = particle.x - particle2.x
          const dy = particle.y - particle2.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance < 120) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particle2.x, particle2.y)
            ctx.strokeStyle = `rgba(${particleColor}, ${0.15 * (1 - distance / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      })
    }

    resize()
    createParticles()
    if (reducedMotion) drawParticles(1000)
    else drawParticles()

    const handleResize = () => { resize(); createParticles() }
    const handleVisibility = () => {
      running = !document.hidden
      if (running && !reducedMotion) drawParticles()
      else cancelAnimationFrame(animationFrameId)
    }
    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      running = false
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [particleColor])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  )
}
