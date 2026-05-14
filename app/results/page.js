import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { createClient } from '@/lib/supabase'
import { scoreAndRank } from '@/lib/scoring'
import { generateInsightsWithAI, generateInsightFallback } from '@/lib/insights'

export const metadata = {
  title: 'Your Recommendations | Car Recommender',
  description: 'Data-driven vehicle recommendations matched to your budget and usage profile.',
}

// ─── DB query ─────────────────────────────────────────────────────────────────

async function fetchVehicles(params) {
  const supabase = createClient()
  let query = supabase.from('vehicles').select('*')

  if (params.budget) query = query.lte('price', parseInt(params.budget))
  if (params.fuel_type && params.fuel_type !== 'Any') {
    query = query.eq('fuel_type', params.fuel_type)
  }
  if (params.drivetrain && params.drivetrain !== 'Any') {
    query = query.eq('drivetrain', params.drivetrain)
  }
  if (params.seats && params.seats !== '8+') {
    query = query.gte('seating_capacity', parseInt(params.seats))
  }

  // Fetch a wider pool so the scoring engine has enough candidates to rank meaningfully
  const { data, error } = await query.limit(50)

  if (error) throw error
  return data || []
}

// ─── Data mappers ─────────────────────────────────────────────────────────────

function toStats(v) {
  return [
    { label: 'Purchase Price',   value: `$${v.price.toLocaleString()}`,                                       highlight: null      },
    { label: 'Est. 5yr TCO',     value: v._tcoDisplay ? `$${v._tcoDisplay.toLocaleString()}` : 'N/A',         highlight: 'primary' },
    { label: 'MPG Combined',     value: v.mpg_combined ? `${v.mpg_combined} mpg` : 'N/A',                     highlight: null      },
    { label: 'Reliability',      value: `${v.reliability_score}/100`,                                         highlight: null      },
    { label: 'Safety Rating',    value: v.safety_rating ? `${v.safety_rating}/10` : 'N/A',                    highlight: null      },
    { label: 'Resale (5yr est.)', value: v.resale_value_5yr ? `$${v.resale_value_5yr.toLocaleString()}` : 'N/A', highlight: 'tertiary' },
  ]
}

function toBreakdown(v) {
  const d = v._dimensions || { cost: 0, reliability: 0, safety: 0, resale: 0 }
  return [
    { label: 'Cost Efficiency', width: d.cost,        colorClass: 'from-primary to-primary-container',       glow: false },
    { label: 'Reliability',     width: d.reliability, colorClass: 'from-tertiary to-tertiary-fixed-dim',     glow: true  },
    { label: 'Safety',          width: d.safety,      colorClass: 'from-tertiary to-tertiary-fixed-dim',     glow: false },
    { label: 'Resale Value',    width: d.resale,      colorClass: 'from-secondary to-secondary-fixed-dim',   glow: false },
  ]
}

function toTags(v) {
  const tags = []
  if (v.drivetrain) tags.push(v.drivetrain)
  if (v.fuel_type) tags.push(v.fuel_type)
  if (v.seating_capacity >= 7) tags.push(`${v.seating_capacity}-Seat`)
  return tags
}


// ─── Learn more content ───────────────────────────────────────────────────────

const LEARN_MORE = [
  {
    icon: 'calculate',
    title: 'How we calculate the 5-year TCO',
    body: 'TCO = Purchase price + (miles/year x years x fuel price / MPG) + financing interest, minus estimated resale value at end of ownership. This produces a single net out-of-pocket figure that makes different vehicles directly comparable regardless of sticker price.',
  },
  {
    icon: 'timeline',
    title: 'Why ownership length changes what matters',
    body: 'In the first 1-2 years, depreciation drives most of your cost. Beyond 3-4 years, reliability and maintenance become the bigger variable. A vehicle with a 92 reliability score may cost thousands less than an 85-score alternative over 7 years, even if its sticker price is higher.',
  },
  {
    icon: 'tune',
    title: 'How the match score is calculated',
    body: 'Each vehicle is scored across four dimensions: total cost, reliability, safety, and resale value. Within your results, every dimension is normalized 0-100 relative to the other vehicles shown, not industry averages. Your weight sliders combine these into a composite score, so 95% match means this vehicle is near-optimal for your specific priorities.',
  },
]

// ─── Rank config ──────────────────────────────────────────────────────────────

const RANKS = [
  { badge: 'Top Pick', badgeClass: 'rank-badge-gold' },
  { badge: 'Runner Up', badgeClass: 'rank-badge-silver' },
  { badge: 'Also Consider', badgeClass: 'bg-outline text-white' },
]

const HIGHLIGHT = {
  primary: { bg: 'bg-primary/5', border: 'border-primary/10', text: 'text-primary', label: 'text-primary' },
  secondary: { bg: 'bg-secondary/5', border: 'border-secondary/10', text: 'text-secondary', label: 'text-secondary' },
  tertiary: { bg: 'bg-tertiary/5', border: 'border-tertiary/10', text: 'text-tertiary', label: 'text-tertiary' },
  null: { bg: 'bg-white', border: 'border-outline-variant/20', text: 'text-on-surface', label: 'text-outline' },
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultsPage({ searchParams }) {
  const params = await searchParams

  let vehicles = []
  let setupRequired = false
  let aiInsights = null

  try {
    const pool = await fetchVehicles(params)
    vehicles = scoreAndRank(pool, params).slice(0, 5)
  } catch (err) {
    console.error('[/results]', err.message)
    setupRequired = true
  }

  if (vehicles.length > 0) {
    try {
      aiInsights = await generateInsightsWithAI(vehicles, params)
    } catch (err) {
      console.error('[/results AI insights]', err.message)
    }
  }

  const budget = params.budget || '35000'
  const miles = params.miles || '12000'
  const years = params.years || '5'

  return (
    <>
      <Header activePage="analysis" />

      {/* Summary bar */}
      <div className="sticky top-20 z-40" style={{ background: 'rgba(234,242,249,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
        <div className="max-w-[1280px] mx-auto px-margin py-4 flex flex-wrap items-center justify-between gap-md">
          <div className="flex flex-wrap items-center gap-3">
            {[
              { icon: 'payments', label: `$${Number(budget).toLocaleString()} Budget` },
              { icon: 'distance', label: `${Number(miles).toLocaleString()} mi/yr` },
              { icon: 'calendar_today', label: `${years} yr ownership` },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-xl neuro-btn"
              >
                <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
                <span className="font-label-caps text-[11px] text-on-surface font-semibold tracking-wide">
                  {label}
                </span>
              </div>
            ))}
          </div>
          {!setupRequired && (
            <div className="text-on-surface-variant font-body-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} matched your profile
            </div>
          )}
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-margin py-xl space-y-xl">

        {/* Setup notice */}
        {setupRequired && (
          <div className="bg-surface-container-low border border-outline-variant/40 rounded-2xl p-lg space-y-md">
            <div className="flex items-center gap-md">
              <span className="material-symbols-outlined text-secondary">info</span>
              <h3 className="font-title-sm text-title-sm text-on-surface">Connect your database to see results</h3>
            </div>
            <ol className="font-body-sm text-body-sm text-on-surface-variant space-y-sm list-decimal list-inside">
              <li>Create a free project at <strong>supabase.com</strong></li>
              <li>Copy <code className="bg-surface-container px-1 rounded">.env.local.example</code> to <code className="bg-surface-container px-1 rounded">.env.local</code> and fill in your project URL and service role key</li>
              <li>Run <code className="bg-surface-container px-1 rounded">supabase/migrations/001_schema.sql</code> in your Supabase SQL editor (includes sample vehicles)</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        )}

        {/* Empty state */}
        {!setupRequired && vehicles.length === 0 && (
          <div className="text-center py-xl space-y-md">
            <span className="material-symbols-outlined text-outline text-5xl">search_off</span>
            <p className="font-title-sm text-title-sm text-on-surface">No vehicles match your criteria</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Try relaxing your budget or changing the fuel type or drivetrain filter.</p>
          </div>
        )}

        {/* Vehicle cards */}
        {vehicles.map((vehicle, index) => {
          const rank      = RANKS[index] || RANKS[2]
          const stats     = toStats(vehicle)
          const breakdown = toBreakdown(vehicle)
          const tags      = toTags(vehicle)
          const insight   = aiInsights?.[index] ?? generateInsightFallback(vehicle, params, index, vehicles)

          return (
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

              {/* Rank badge */}
              <div
                className={`absolute top-0 left-0 ${rank.badgeClass} font-bold px-8 py-4 rounded-br-[2rem] shadow-xl z-10 flex items-center gap-2`}
              >
                <span
                  className="material-symbols-outlined text-white"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
                <span className="font-headline-md text-[18px] text-white tracking-tight">
                  {rank.badge}
                </span>
              </div>

              <div className="p-10 pt-24">
                <div className="flex flex-col lg:flex-row gap-12">

                  {/* Image placeholder + title */}
                  <div className="w-full lg:w-[40%] space-y-6">
                    <div className="aspect-[4/3] bg-gradient-to-br from-surface-container-low to-surface-container-high rounded-[1.5rem] overflow-hidden shadow-inner border border-outline-variant/20 flex items-center justify-center">
                      <span
                        className="material-symbols-outlined text-outline-variant text-[80px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        directions_car
                      </span>
                    </div>
                    <div>
                      <h2 className="font-display-lg text-[32px] text-on-surface leading-tight font-extrabold">
                        {vehicle.year} {vehicle.make} {vehicle.model}{' '}
                        {vehicle.trim && (
                          <span className="text-secondary font-normal text-[24px]">{vehicle.trim}</span>
                        )}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {tags.map(tag => (
                          <span
                            key={tag}
                            className="bg-white px-3 py-1.5 rounded-lg border border-outline-variant/30 font-label-caps text-[10px] uppercase text-on-surface-variant font-bold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Insight block */}
                    <div className="space-y-3">
                      {insight.costSummary && (
                        <p className="font-body-sm text-[13px] text-on-surface leading-relaxed">
                          {insight.costSummary}
                          {insight.contextLine && (
                            <span className="text-on-surface-variant"> {insight.contextLine}</span>
                          )}
                        </p>
                      )}
                      {insight.rankReason && (
                        <div className="flex gap-2 items-start">
                          <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0 text-primary">
                            {index === 0 ? 'emoji_events' : 'info'}
                          </span>
                          <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
                            {insight.rankReason}
                          </p>
                        </div>
                      )}
                      {insight.noiseNote && (
                        <div className="flex gap-2 items-start opacity-70">
                          <span className="material-symbols-outlined text-secondary text-[14px] mt-0.5 flex-shrink-0">
                            remove_circle
                          </span>
                          <p className="font-body-sm text-[12px] text-on-surface-variant italic leading-relaxed">
                            {insight.noiseNote}
                          </p>
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
                          <div
                            key={stat.label}
                            className={`${h.bg} p-4 rounded-2xl neuro-btn`}
                          >
                            <p className={`font-label-caps text-[10px] ${h.label} uppercase tracking-wider mb-1 font-bold`}>
                              {stat.label}
                            </p>
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
                            <span className="text-body-sm font-medium text-on-surface-variant col-span-2">
                              {bar.label}
                            </span>
                            <div className="col-span-3 h-3 rounded-full overflow-hidden p-[2px]" style={{ boxShadow: 'inset 3px 3px 7px rgba(152,182,208,0.42), inset -2px -2px 5px rgba(255,255,255,0.95)' }}>
                              <div
                                className={`h-full bg-gradient-to-r ${bar.colorClass} rounded-full transition-all duration-1000 ${bar.glow ? 'progress-glow' : ''}`}
                                style={{ width: `${bar.width}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Safety features */}
                {vehicle.safety_features?.length > 0 && (
                  <div className="mt-12 p-8 rounded-[1.5rem]" style={{ background: 'rgba(221,234,245,0.5)', boxShadow: 'inset 4px 4px 8px rgba(152,182,208,0.38), inset -2px -2px 6px rgba(255,255,255,0.92)' }}>
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <h4 className="font-title-sm text-on-surface tracking-tight">Safety Features</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vehicle.safety_features.map(feature => (
                        <span
                          key={feature}
                          className="bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/20 font-body-sm text-on-surface-variant"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          )
        })}

        {/* Learn more / methodology */}
        {!setupRequired && vehicles.length > 0 && (
          <section className="space-y-3 pt-4">
            <h3 className="font-label-caps text-[11px] text-on-surface-variant uppercase tracking-[0.15em] font-extrabold flex items-center gap-2">
              <span className="w-8 h-[1px] bg-outline-variant" />
              How the scoring works
            </h3>
            {LEARN_MORE.map(item => (
              <details
                key={item.title}
                className="group bg-surface-container-low/50 rounded-xl border border-outline-variant/20 overflow-hidden"
              >
                <summary className="flex justify-between items-center px-lg py-md cursor-pointer list-none hover:bg-surface-container-low transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-secondary text-[18px]">{item.icon}</span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium">{item.title}</span>
                  </div>
                  <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-secondary text-[18px]">
                    expand_more
                  </span>
                </summary>
                <div className="px-lg pb-md pt-1">
                  <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </details>
            ))}
          </section>
        )}

        {/* Refine CTA */}
        {!setupRequired && (
          <div className="flex flex-col items-center gap-6 pt-12">
            <a
              href="/"
              className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-headline-md text-[18px] hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
              style={{ boxShadow: '5px 5px 16px rgba(0,74,198,0.38), -3px -3px 8px rgba(255,255,255,0.7)' }}
            >
              <span className="material-symbols-outlined">tune</span>
              Refine Selection Criteria
            </a>
            <p className="text-body-sm text-on-surface-variant font-medium">
              Adjust your budget or filters to see different results.
            </p>
          </div>
        )}

      </main>

      <Footer />
    </>
  )
}
