import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { createClient } from '@/lib/supabase'

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

  const { data, error } = await query
    .order('reliability_score', { ascending: false })
    .limit(5)

  if (error) throw error
  return data || []
}

// ─── Data mappers ─────────────────────────────────────────────────────────────

function toStats(v) {
  return [
    { label: 'Purchase Price', value: `$${v.price.toLocaleString()}`, highlight: null },
    { label: 'MPG Combined', value: v.mpg_combined ? `${v.mpg_combined} mpg` : 'N/A', highlight: 'primary' },
    { label: 'Reliability', value: `${v.reliability_score}/100`, highlight: null },
    { label: 'Safety Rating', value: v.safety_rating ? `${v.safety_rating}/10` : 'N/A', highlight: null },
    { label: 'Resale (5yr est.)', value: v.resale_value_5yr ? `$${v.resale_value_5yr.toLocaleString()}` : 'N/A', highlight: 'tertiary' },
    { label: 'Current Miles', value: v.mileage.toLocaleString(), highlight: null },
  ]
}

function toBreakdown(v) {
  return [
    {
      label: 'Reliability',
      width: v.reliability_score || 0,
      colorClass: 'from-tertiary to-tertiary-fixed-dim',
      glow: true,
    },
    {
      label: 'Safety Rating',
      width: v.safety_rating ? Math.round(v.safety_rating * 10) : 0,
      colorClass: 'from-tertiary to-tertiary-fixed-dim',
      glow: false,
    },
    {
      label: 'Equity Retention',
      width: v.depreciation_rate ? Math.max(0, Math.round(100 - v.depreciation_rate)) : 50,
      colorClass: 'from-primary to-primary-container',
      glow: false,
    },
  ]
}

function toTags(v) {
  const tags = []
  if (v.drivetrain) tags.push(v.drivetrain)
  if (v.fuel_type) tags.push(v.fuel_type)
  if (v.seating_capacity >= 7) tags.push(`${v.seating_capacity}-Seat`)
  return tags
}

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

  try {
    vehicles = await fetchVehicles(params)
  } catch (err) {
    if (err.message?.includes('Missing Supabase')) {
      setupRequired = true
    }
  }

  const budget = params.budget || '35000'
  const miles = params.miles || '12000'
  const years = params.years || '5'

  return (
    <>
      <Header activePage="analysis" />

      {/* Summary bar */}
      <div className="bg-white/40 backdrop-blur-sm border-b border-outline-variant/50 sticky top-20 z-40">
        <div className="max-w-[1280px] mx-auto px-margin py-4 flex flex-wrap items-center justify-between gap-md">
          <div className="flex flex-wrap items-center gap-3">
            {[
              { icon: 'payments', label: `$${Number(budget).toLocaleString()} Budget` },
              { icon: 'distance', label: `${Number(miles).toLocaleString()} mi/yr` },
              { icon: 'calendar_today', label: `${years} yr ownership` },
            ].map(({ icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white/80 px-4 py-2 rounded-xl shadow-sm border border-outline-variant/30"
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
          const rank = RANKS[index] || RANKS[2]
          const stats = toStats(vehicle)
          const breakdown = toBreakdown(vehicle)
          const tags = toTags(vehicle)

          return (
            <article
              key={vehicle.id}
              className="card-glass rounded-[2rem] shadow-[0px_20px_50px_rgba(0,0,0,0.08)] border border-white overflow-hidden relative group transition-all hover:shadow-[0px_30px_60px_rgba(0,0,0,0.12)]"
            >
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
                  </div>

                  {/* Stats + breakdown */}
                  <div className="w-full lg:w-[60%] flex flex-col gap-10">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {stats.map(stat => {
                        const h = HIGHLIGHT[stat.highlight] ?? HIGHLIGHT.null
                        return (
                          <div
                            key={stat.label}
                            className={`${h.bg} p-4 rounded-2xl shadow-sm border ${h.border}`}
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
                        Analysis Breakdown
                      </h3>
                      <div className="grid gap-y-4">
                        {breakdown.map(bar => (
                          <div key={bar.label} className="grid grid-cols-5 gap-4 items-center">
                            <span className="text-body-sm font-medium text-on-surface-variant col-span-2">
                              {bar.label}
                            </span>
                            <div className="col-span-3 h-3 bg-surface-container rounded-full overflow-hidden p-[2px]">
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
                  <div className="mt-12 p-8 bg-white/60 rounded-[1.5rem] border border-white shadow-inner">
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

        {/* Refine CTA */}
        {!setupRequired && (
          <div className="flex flex-col items-center gap-6 pt-12">
            <a
              href="/"
              className="bg-on-surface text-white px-10 py-5 rounded-2xl font-headline-md text-[18px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
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
