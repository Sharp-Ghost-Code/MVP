import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import VehicleList from '@/app/components/VehicleList'
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
  if (params.year_min) query = query.gte('year', parseInt(params.year_min))
  if (params.year_max) query = query.lte('year', parseInt(params.year_max))

  const { data, error } = await query.limit(80)

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
  { badge: 'Top Pick',     badgeClass: 'rank-badge-gold' },
  { badge: 'Runner Up',    badgeClass: 'rank-badge-silver' },
  { badge: 'Also Consider', badgeClass: 'bg-outline text-white' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultsPage({ searchParams }) {
  const params = await searchParams

  let vehicles = []
  let setupRequired = false
  let aiInsights = null

  try {
    const pool = await fetchVehicles(params)
    vehicles = scoreAndRank(pool, params).slice(0, 15)
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
        {vehicles.length > 0 && (
          <VehicleList
            items={vehicles.map((vehicle, index) => ({
              vehicle,
              originalIndex: index,
              rank: index < 3 ? RANKS[index] : null,
              stats: toStats(vehicle),
              breakdown: toBreakdown(vehicle),
              tags: toTags(vehicle),
              insight: aiInsights?.[index] ?? generateInsightFallback(vehicle, params, index, vehicles),
            }))}
          />
        )}

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
