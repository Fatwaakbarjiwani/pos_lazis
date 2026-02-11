import React from 'react'

const DEFAULT_COLORS = ['#059669']

export default function BarChart({ data, valueKey, nameKey, maxHeight = 160, color, colors = DEFAULT_COLORS, formatValue }) {
  const singleColor = color || (Array.isArray(colors) && colors[0]) || '#059669'
  const useMultiColor = Array.isArray(colors) && colors.length > 1
  const max = Math.max(...data.map((d) => d[valueKey] || 0), 1)
  const barHeight = 28
  const gap = 10
  const totalHeight = data.length * (barHeight + gap) - gap

  return (
    <div className="flex flex-col gap-2" style={{ minHeight: totalHeight }}>
      {data.map((d, i) => {
        const value = d[valueKey] || 0
        const widthPct = (value / max) * 100
        const fill = useMultiColor ? colors[i % colors.length] : singleColor
        return (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 shrink-0 font-mono text-xs font-medium text-zinc-700">
              {d[nameKey]}
            </span>
            <div className="flex-1 min-w-0">
              <div
                className="h-7 rounded-lg transition-all duration-500"
                style={{
                  width: `${widthPct}%`,
                  maxWidth: '100%',
                  backgroundColor: fill,
                  minWidth: value > 0 ? 8 : 0,
                }}
              />
            </div>
            <span className="w-20 shrink-0 text-right font-mono text-xs tabular-nums font-medium text-zinc-700">
              {formatValue ? formatValue(value) : value}
            </span>
          </div>
        )
      })}
    </div>
  )
}
