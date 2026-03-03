'use client'
import * as React from 'react'
import { useEffect, useRef } from 'react'
import { createNoise2D } from 'simplex-noise'

interface Point {
  x: number
  y: number
  wave: { x: number; y: number }
}

export interface WavesProps {
  /** Extra CSS class on the container */
  className?: string
  /** Background fill colour of the container (default: transparent) */
  backgroundColor?: string
  /** Gap in px between lines — smaller = more lines (default: 8) */
  xGap?: number
  /** Gap in px between points on each line (default: 8) */
  yGap?: number
  /** Max horizontal wave displacement in px (default: 20) */
  waveX?: number
  /** Max vertical wave displacement in px (default: 10) */
  waveY?: number
  /** Colour palette to cycle through — array of [R,G,B] tuples */
  palette?: [number, number, number][]
  /** Duration in ms for one full colour cycle (default: 5000) */
  colorCycle?: number
  /** Target interval between frames in ms — higher = fewer fps (default: 42 ≈ 24fps) */
  frameInterval?: number
  /** CSS mask-image applied to the container for gradient fade effects */
  maskImage?: string
}

const DEFAULT_PALETTE: [number, number, number][] = [
  [234,  88,  12],  // orange
  [234, 179,   8],  // yellow
  [ 59, 130, 246],  // blue
  [ 10,  10,  10],  // black
  [234,  88,  12],  // back to orange (smooth loop)
]

function colorAt(
  time: number,
  palette: [number, number, number][],
  cycle: number,
): string {
  const t = ((time % cycle) / cycle) * (palette.length - 1)
  const i = Math.floor(t)
  const f = t - i
  const a = palette[i]
  const b = palette[i + 1] ?? palette[0]
  return `rgb(${Math.round(a[0]*(1-f)+b[0]*f)},${Math.round(a[1]*(1-f)+b[1]*f)},${Math.round(a[2]*(1-f)+b[2]*f)})`
}

const DEFAULT_MASK =
  'radial-gradient(ellipse 90% 45% at 50% 100%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0) 100%)'

export function Waves({
  className      = '',
  backgroundColor = 'transparent',
  xGap           = 8,
  yGap           = 8,
  waveX          = 20,
  waveY          = 10,
  palette        = DEFAULT_PALETTE,
  colorCycle     = 5000,
  frameInterval  = 42,
  maskImage      = DEFAULT_MASK,
}: WavesProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef       = useRef<SVGSVGElement>(null)
  const pathsRef     = useRef<SVGPathElement[]>([])
  const linesRef     = useRef<Point[][]>([])
  const noiseRef     = useRef<((x: number, y: number) => number) | null>(null)
  const rafRef       = useRef<number | null>(null)
  const boundingRef  = useRef<DOMRect | null>(null)
  const lastFrameRef = useRef<number>(0)

  // Keep latest prop values accessible inside the RAF loop without re-subscribing
  const propsRef = useRef({ xGap, yGap, waveX, waveY, palette, colorCycle, frameInterval })
  useEffect(() => {
    propsRef.current = { xGap, yGap, waveX, waveY, palette, colorCycle, frameInterval }
  })

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return
    noiseRef.current = createNoise2D()
    setSize()
    setLines()
    window.addEventListener('resize', onResize)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setSize = () => {
    if (!containerRef.current || !svgRef.current) return
    boundingRef.current = containerRef.current.getBoundingClientRect()
    const { width, height } = boundingRef.current
    svgRef.current.style.width  = `${width}px`
    svgRef.current.style.height = `${height}px`
  }

  const setLines = () => {
    if (!svgRef.current || !boundingRef.current) return
    const { width, height } = boundingRef.current
    const { xGap: gx, yGap: gy } = propsRef.current
    linesRef.current = []
    pathsRef.current.forEach(p => p.remove())
    pathsRef.current = []

    const totalLines  = Math.ceil((width  + 200) / gx)
    const totalPoints = Math.ceil((height +  30) / gy)
    const xStart = (width  - gx * totalLines)  / 2
    const yStart = (height - gy * totalPoints) / 2

    for (let i = 0; i < totalLines; i++) {
      const points: Point[] = []
      for (let j = 0; j < totalPoints; j++) {
        points.push({ x: xStart + gx * i, y: yStart + gy * j, wave: { x: 0, y: 0 } })
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      path.setAttribute('fill', 'none')
      path.setAttribute('stroke', 'currentColor')
      path.setAttribute('stroke-linecap', 'round')
      path.setAttribute('stroke-linejoin', 'round')

      const centerFrac = 1 - Math.abs((i / totalLines) - 0.5) * 2
      path.setAttribute('stroke-width', (0.6 + centerFrac * 1.4).toFixed(2))

      svgRef.current!.appendChild(path)
      pathsRef.current.push(path)
      linesRef.current.push(points)
    }
  }

  const onResize = () => { setSize(); setLines() }

  const movePoints = (time: number) => {
    const noise = noiseRef.current
    if (!noise) return
    const { waveX: wx, waveY: wy } = propsRef.current
    linesRef.current.forEach(points => {
      points.forEach(p => {
        const move = noise((p.x + time * 0.008) * 0.003, (p.y + time * 0.003) * 0.002) * 8
        p.wave.x = Math.cos(move) * wx
        p.wave.y = Math.sin(move) * wy
      })
    })
  }

  const drawLines = () => {
    linesRef.current.forEach((points, li) => {
      if (points.length < 2 || !pathsRef.current[li]) return
      const pts = points.map(p => ({ x: p.x + p.wave.x, y: p.y + p.wave.y }))
      let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)}`
      for (let i = 0; i < pts.length - 1; i++) {
        const c = pts[i], n = pts[i + 1]
        const mx = ((c.x + n.x) / 2).toFixed(2)
        const my = ((c.y + n.y) / 2).toFixed(2)
        d += ` Q ${c.x.toFixed(2)} ${c.y.toFixed(2)} ${mx} ${my}`
      }
      d += ` L ${pts[pts.length - 1].x.toFixed(2)} ${pts[pts.length - 1].y.toFixed(2)}`
      pathsRef.current[li].setAttribute('d', d)
    })
  }

  const tick = (time: number) => {
    rafRef.current = requestAnimationFrame(tick)
    const { frameInterval: fi, palette: pal, colorCycle: cc } = propsRef.current
    if (time - lastFrameRef.current < fi) return
    lastFrameRef.current = time

    const col = colorAt(time, pal, cc)
    pathsRef.current.forEach(path => path.setAttribute('stroke', col))
    movePoints(time)
    drawLines()
  }

  return (
    <div
      ref={containerRef}
      className={`waves-component ${className}`}
      style={{
        backgroundColor,
        position: 'absolute', top: 0, left: 0,
        width: '100%', height: '100%',
        margin: 0, padding: 0, overflow: 'hidden',
        WebkitMaskImage: maskImage,
        maskImage,
        willChange: 'transform',
      } as React.CSSProperties}
    >
      <svg ref={svgRef} style={{ display: 'block', width: '100%', height: '100%' }} xmlns="http://www.w3.org/2000/svg" />
    </div>
  )
}
