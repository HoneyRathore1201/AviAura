import { useEffect, useRef } from 'react'

export default function ScrollTravelAnimation({ className = '', scrollProgress = 0 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let time = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }

    resize()
    window.addEventListener('resize', resize)

    // Curated Global Waypoints
    const waypoints = [
      { code: 'JAI', city: 'Jaipur', progress: 0.15, label: 'Palaces' },
      { code: 'DXB', city: 'Dubai', progress: 0.42, label: 'Oasis' },
      { code: 'ZRH', city: 'Zurich', progress: 0.68, label: 'Alps' },
      { code: 'HND', city: 'Tokyo', progress: 0.90, label: 'Gion' },
    ]

    const render = () => {
      time += 0.012
      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      ctx.clearRect(0, 0, width, height)

      // 1. Deep Midnight Flight Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height)
      skyGrad.addColorStop(0, '#0a0f1d')
      skyGrad.addColorStop(0.5, '#0e1626')
      skyGrad.addColorStop(1, '#070b14')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, width, height)

      // 2. Subtle Flight Radar Arc Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)'
      ctx.lineWidth = 1
      for (let r = 80; r < Math.max(width, height) * 1.2; r += 70) {
        ctx.beginPath()
        ctx.arc(width * 0.5, height * 1.1, r, Math.PI, Math.PI * 2)
        ctx.stroke()
      }

      // Latitude grid
      for (let y = height * 0.2; y < height; y += 45) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // 3. Subtle Ambient Constellation Stars
      for (let i = 0; i < 24; i++) {
        const sx = ((i * 73 + time * 12) % width)
        const sy = (height * 0.1 + (i * 29) % (height * 0.75))
        const alpha = 0.2 + Math.sin(time * 2 + i) * 0.15
        ctx.fillStyle = `rgba(241, 245, 249, ${alpha})`
        ctx.beginPath()
        ctx.arc(sx, sy, (i % 3 === 0 ? 1.5 : 1), 0, Math.PI * 2)
        ctx.fill()
      }

      // 4. Smooth Flight Path Points Calculation
      const pathPoints = []
      const pathLength = 120
      for (let i = 0; i <= pathLength; i++) {
        const t = i / pathLength
        const px = t * width
        const py = height * 0.52 + Math.sin(t * 4.2 + time * 0.8) * 32 - Math.cos(t * 2.5) * 20
        pathPoints.push({ x: px, y: py })
      }

      // 5. Golden Flight Path Arc
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)'
      ctx.lineWidth = 2
      ctx.setLineDash([6, 6])
      ctx.beginPath()
      pathPoints.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt.x, pt.y)
        else ctx.lineTo(pt.x, pt.y)
      })
      ctx.stroke()
      ctx.setLineDash([])

      // 6. Animated Jet Aircraft
      const planeT = (time * 0.16 + scrollProgress * 0.5) % 1
      const planeIndex = Math.floor(planeT * (pathPoints.length - 2))
      const currPt = pathPoints[planeIndex] || { x: width * 0.5, y: height * 0.5 }
      const nextPt = pathPoints[planeIndex + 1] || currPt
      const angle = Math.atan2(nextPt.y - currPt.y, nextPt.x - currPt.x)

      // Jet Glow
      const jetGlow = ctx.createRadialGradient(currPt.x, currPt.y, 2, currPt.x, currPt.y, 20)
      jetGlow.addColorStop(0, 'rgba(245, 158, 11, 0.4)')
      jetGlow.addColorStop(1, 'rgba(245, 158, 11, 0)')
      ctx.fillStyle = jetGlow
      ctx.beginPath()
      ctx.arc(currPt.x, currPt.y, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.save()
      ctx.translate(currPt.x, currPt.y)
      ctx.rotate(angle)

      // Modern Aircraft Silhouette
      ctx.fillStyle = '#FFFFFF'
      ctx.strokeStyle = '#F59E0B'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      ctx.moveTo(13, 0)
      ctx.lineTo(-9, -7)
      ctx.lineTo(-4, 0)
      ctx.lineTo(-9, 7)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Wing line
      ctx.beginPath()
      ctx.moveTo(-4, 0)
      ctx.lineTo(13, 0)
      ctx.strokeStyle = '#FCD34D'
      ctx.stroke()
      ctx.restore()

      // 7. Refined Waypoint Badges
      waypoints.forEach((wp) => {
        const wpIdx = Math.floor(wp.progress * (pathPoints.length - 1))
        const pt = pathPoints[wpIdx]
        if (!pt) return

        // Pulsing pin ring
        ctx.fillStyle = '#F59E0B'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, 7 + Math.sin(time * 3 + wp.progress * 5) * 1.5, 0, Math.PI * 2)
        ctx.stroke()

        // Waypoint Card Pill
        const pillWidth = 88
        const pillHeight = 24
        const pillX = pt.x - pillWidth / 2
        const pillY = pt.y - 34 + Math.sin(time * 1.8 + wp.progress * 8) * 2

        // Card glass background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 12)
        ctx.fill()
        ctx.stroke()

        // Text
        ctx.fillStyle = '#F8FAFC'
        ctx.font = '600 10px Inter, sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${wp.code} · ${wp.city}`, pt.x, pillY + pillHeight / 2)
      })

      // 8. Corner Telemetry HUD
      ctx.fillStyle = 'rgba(148, 163, 184, 0.7)'
      ctx.font = '500 9px "Space Grotesk", monospace'
      ctx.textAlign = 'left'
      ctx.fillText('AV-RADAR // GLOBAL TRACK', 14, 20)
      ctx.fillText('ALT: 38,000 FT · MACH 0.82', 14, 32)

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [scrollProgress])

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full block" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080B11]/50 via-transparent to-transparent" />
    </div>
  )
}
