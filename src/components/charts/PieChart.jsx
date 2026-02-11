import React, { useState } from 'react'

// Warna jelas berbeda per irisan (bukan nuansa hijau semua)
const COLORS = ['#059669', '#0284c7', '#d97706', '#dc2626', '#7c3aed']

// Sudut 0 = kanan (3 o'clock), putar searah jarum jam; konversi derajat ke radian
function polarToCart(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export default function PieChart({ data, valueKey, nameKey, size = 200, formatValue }) {
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const total = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0)
  if (total === 0 || data.length === 0) return null

  const r = Math.min(size / 2 - 8, 90)
  const cx = size / 2
  const cy = size / 2
  let startDeg = 0
  const segments = data
    .filter((d) => (Number(d[valueKey]) || 0) > 0)
    .map((d, i) => {
      const v = Number(d[valueKey]) || 0
      const ratio = total > 0 ? v / total : 0
      const angleDeg = ratio * 360
      const endDeg = startDeg + angleDeg
      const p1 = polarToCart(cx, cy, r, startDeg)
      const p2 = polarToCart(cx, cy, r, endDeg)
      const large = angleDeg > 180 ? 1 : 0
      const path = `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`
      const midDeg = startDeg + angleDeg / 2
      const midPoint = polarToCart(cx, cy, r * 0.7, midDeg)
      startDeg = endDeg
      return {
        path,
        color: COLORS[i % COLORS.length],
        label: d[nameKey],
        value: v,
        midPoint,
        ratio: (ratio * 100).toFixed(1),
      }
    })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div
        className="relative"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        <svg width={size} height={size} className="overflow-visible">
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.path}
              fill={seg.color}
              stroke="white"
              strokeWidth={2}
              className="transition-all cursor-pointer"
              style={{ opacity: hoveredIndex === i ? 0.8 : hoveredIndex !== null ? 0.5 : 1 }}
              onMouseEnter={() => setHoveredIndex(i)}
            />
          ))}
        </svg>
        {hoveredIndex !== null && segments[hoveredIndex] && (
          <div
            className="absolute z-10 rounded-lg border border-zinc-300 bg-white px-3 py-2 shadow-lg font-mono text-xs pointer-events-none"
            style={{
              left: `${mousePos.x + 10}px`,
              top: `${mousePos.y - 10}px`,
              transform: 'translateY(-100%)',
            }}
          >
            <div className="font-semibold text-zinc-800">{segments[hoveredIndex].label}</div>
            <div className="text-zinc-600">
              {formatValue ? formatValue(segments[hoveredIndex].value) : segments[hoveredIndex].value}
            </div>
            <div className="text-zinc-500 text-[10px] mt-0.5">
              {segments[hoveredIndex].ratio}%
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-mono">
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-zinc-600">{seg.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
