"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

interface ShaderBackgroundProps {
  children: React.ReactNode
}

// Simple mesh gradient implementation without external dependencies
const MeshGradient: React.FC<{
  className?: string
  colors: string[]
  speed?: number
  wireframe?: boolean
  backgroundColor?: string
}> = ({ className, colors, speed = 0.3, wireframe = false, backgroundColor = "#000000" }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const animate = () => {
      timeRef.current += speed

      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Create animated gradient mesh
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(timeRef.current * 0.01) * 200,
        canvas.height / 2 + Math.cos(timeRef.current * 0.01) * 200,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height),
      )

      colors.forEach((color, index) => {
        const offset = index / (colors.length - 1) + Math.sin(timeRef.current * 0.005 + index) * 0.1
        gradient.addColorStop(Math.max(0, Math.min(1, offset)), color)
      })

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      if (wireframe) {
        ctx.strokeStyle = colors[1] || "#ffffff"
        ctx.lineWidth = 1
        ctx.globalAlpha = 0.3

        for (let i = 0; i < 10; i++) {
          ctx.beginPath()
          ctx.moveTo((canvas.width / 10) * i + Math.sin(timeRef.current * 0.01 + i) * 50, 0)
          ctx.lineTo((canvas.width / 10) * i + Math.sin(timeRef.current * 0.01 + i) * 50, canvas.height)
          ctx.stroke()
        }

        ctx.globalAlpha = 1
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [colors, speed, wireframe, backgroundColor])

  return <canvas ref={canvasRef} className={className} />
}

const ShaderBackground: React.FC<ShaderBackgroundProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const handleMouseEnter = () => setIsActive(true)
    const handleMouseLeave = () => setIsActive(false)

    const container = containerRef.current
    if (container) {
      container.addEventListener("mouseenter", handleMouseEnter)
      container.addEventListener("mouseleave", handleMouseLeave)
    }

    return () => {
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter)
        container.removeEventListener("mouseleave", handleMouseLeave)
      }
    }
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen bg-black relative overflow-hidden">
      {/* SVG Filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background Shaders */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#8b5cf6", "#ffffff", "#1e1b4b", "#4c1d95"]}
        speed={0.3}
        backgroundColor="#000000"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#8b5cf6", "#000000"]}
        speed={0.2}
        wireframe={true}
        backgroundColor="transparent"
      />

      {children}
    </div>
  )
}

export default ShaderBackground
