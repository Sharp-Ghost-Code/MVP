'use client'
import { useState } from 'react'

const PAGE_SIZE = 5

const HIGHLIGHT = {
  primary:   { bg: 'bg-primary/5',   text: 'text-primary',   label: 'text-primary'   },
  secondary: { bg: 'bg-secondary/5', text: 'text-secondary', label: 'text-secondary' },
  tertiary:  { bg: 'bg-tertiary/5',  text: 'text-tertiary',  label: 'text-tertiary'  },
  null:      { bg: 'bg-white/60',    text: 'text-on-surface', label: 'text-outline'  },
}

export default function VehicleList({ items }) {
  const [showCount, setShowCount] = useState(PAGE_SIZE)
  const visible = items.slice(0, showCount)

  return (
    <>
      {visible.map(({ vehicle, originalIndex, rank, stats, breakdown, tags, insight }) => (
        <article
          key={vehicle.id}
          className="card-glass rounded-[2rem] overflow-hidden relative group transition-all"
        >
          {/* Match score */}
          <div className="absolute top-6 right-8 flex flex-col items-center z-10">
            <div className="w-[72px] h-[72px] rounded-full bg-primary/5 border-2 border-primary/20 flex flex-col items-center justify-center shadow-sm">
              <span className="font-extrabold text-[22px] leading-none text-primary">
                {vehicle._matchScore}
              </span>
              <span className="font-label-caps text-[9px] text-primary/70 tracking-widest mt-0.5">
                MATCH
              </span>
            </div>
          </div>

          {/* Rank badge — top 3 only */}
          {rank ? (
            <div className={`absolute top-0 left-0 ${rank.badgeClass} font-bold px-8 py-4 rounded-br-[2rem] shadow-xl z-10 flex items-center gap-2`}>
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                workspace_premium
              </span>
              <span className="font-headline-md text-[18px] text-white tracking-tight">{rank.badge}</span>
            </div>
          ) : (
            <div className="absolute top-0 left-0 bg-white/40 backdrop-blur-sm border border-white/60 font-bold px-6 py-3 rounded-br-[2rem] z-10">
              <span className="font-label-caps text-[12px] text-on-surface-variant">#{originalIndex + 1}</span>
            </div>
          )}

          <div className="p-10 pt-24">
            <div className="flex flex-col lg:flex-row gap-12">

              {/* Image + title */}
              <div className="w-full lg:w-[40%] space-y-6">
                <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)' }}>
                  <span className="material-symbols-outlined text-outline-variant text-[80px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    directions_car
                  </span>
                </div>
                <div>
                  <h2 className="font-display-lg text-[32px] text-on-surface leading-tight font-extrabold">
                    {vehicle.year} {vehicle.make} {vehicle.model}{' '}
                    {vehicle.trim && <span className="text-secondary font-normal text-[24px]">{vehicle.trim}</span>}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map(tag => (
                      <span key={tag} className="px-3 py-1.5 rounded-lg font-label-caps text-[10px] uppercase text-on-surface-variant font-bold"
                        style={{ background: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.7)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Insight */}
                <div className="space-y-3">
                  {insight.costSummary && (
                    <p className="font-body-sm text-[13px] text-on-surface leading-relaxed">
                      {insight.costSummary}
                      {insight.contextLine && <span className="text-on-surface-variant"> {insight.contextLine}</span>}
                    </p>
                  )}
                  {insight.rankReason && (
                    <div className="flex gap-2 items-start">
                      <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 text-primary">
                        {originalIndex === 0 ? 'emoji_events' : 'info'}
                      </span>
                      <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">{insight.rankReason}</p>
                    </div>
                  )}
                  {insight.noiseNote && (
                    <div className="flex gap-2 items-start opacity-70">
                      <span className="material-symbols-outlined text-secondary text-[14px] mt-0.5 flex-shrink-0">remove_circle</span>
                      <p className="font-body-sm text-[12px] text-on-surface-variant italic leading-relaxed">{insight.noiseNote}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats + breakdown */}
              <div className="w-full lg:w-[60%] flex flex-col gap-10">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {stats.map(stat => {
                    const h = HIGHLIGHT[stat.highlight] ?? HIGHLIGHT.null
                    return (
                      <div key={stat.label} className={`${h.bg} p-4 rounded-2xl neuro-btn`}>
                        <p className={`font-label-caps text-[10px] ${h.label} uppercase tracking-wider mb-1 font-bold`}>{stat.label}</p>
                        <p className={`font-headline-md text-[20px] ${h.text}`}>{stat.value}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="space-y-6">
                  <h3 className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.15em] font-extrabold flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-outline-variant" />
                    Score Breakdown
                  </h3>
                  <div className="grid gap-y-4">
                    {breakdown.map(bar => (
                      <div key={bar.label} className="grid grid-cols-5 gap-4 items-center">
                        <span className="text-body-sm font-medium text-on-surface-variant col-span-2">{bar.label}</span>
                        <div
                          className="col-span-3 rounded-full transition-all duration-1000"
                          style={{
                            height: 8,
                            background: `linear-gradient(to right, rgba(37,99,235,0.85) 0%, rgba(96,165,250,0.7) ${bar.width}%, rgba(255,255,255,0.28) ${bar.width}%)`,
                            border: '1px solid rgba(255,255,255,0.55)',
                            backdropFilter: 'blur(4px)',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Safety features */}
            {vehicle.safety_features?.length > 0 && (
              <div className="mt-12 p-8 rounded-[1.5rem]"
                style={{ background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.52)' }}>
                <div className="flex items-center gap-2 mb-6">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                  <h4 className="font-title-sm text-on-surface tracking-tight">Safety Features</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {vehicle.safety_features.map(feature => (
                    <span key={feature} className="px-3 py-1.5 rounded-lg font-body-sm text-on-surface-variant"
                      style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.65)' }}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </article>
      ))}

      {/* Show More */}
      {showCount < items.length && (
        <div className="flex flex-col items-center gap-3 pt-4">
          <button
            onClick={() => setShowCount(c => c + PAGE_SIZE)}
            className="neuro-btn-primary text-on-surface font-headline-md text-[16px] px-10 py-4 rounded-2xl flex items-center gap-3"
          >
            <span className="material-symbols-outlined">expand_more</span>
            Show More Recommendations ({items.length - showCount} remaining)
          </button>
        </div>
      )}
    </>
  )
}
