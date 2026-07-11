"use client"

import { useEffect, useRef } from "react"

export default function SpaceBg() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    let stars = []
    const numStars = 400
    let animationFrameId
    let running = true
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // Configuración
    const speed = 2 // Velocidad base
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const initStars = () => {
      stars = []
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width - centerX,
          y: Math.random() * canvas.height - centerY,
          z: Math.random() * canvas.width // Profundidad
        })
      }
    }

    const draw = () => {
      if (!running) return
      // Fondo negro con un ligero rastro para suavizar movimiento (opcional, aqui usamos limpiar)
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const cy = canvas.height / 2

      stars.forEach(star => {
        // Mover estrella hacia la camara
        star.z -= speed

        // Reset si pasa la camara
        if (star.z <= 0) {
          star.z = canvas.width
          star.x = Math.random() * canvas.width - cx
          star.y = Math.random() * canvas.height - cy
        }

        // Proyección 3D a 2D
        const k = 128.0 / star.z
        const px = star.x * k + cx
        const py = star.y * k + cy

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
          // Tamaño basado en cercania
          const size = (1 - star.z / canvas.width) * 2.5
          const opacity = (1 - star.z / canvas.width)

          ctx.beginPath()
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.arc(px, py, size, 0, Math.PI * 2)
          ctx.fill()
        }
      })

      if (!reducedMotion) animationFrameId = requestAnimationFrame(draw)
    }

    resize()
    initStars()
    draw()

    const handleResize = () => {
      resize()
      initStars()
    }
    const handleVisibility = () => {
      running = !document.hidden
      if (running && !reducedMotion) draw()
      else cancelAnimationFrame(animationFrameId)
    }
    window.addEventListener("resize", handleResize)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelAnimationFrame(animationFrameId)
      running = false
      window.removeEventListener("resize", handleResize)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 bg-black pointer-events-none"
    />
  )
}
