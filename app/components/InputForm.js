'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DRIVETRAINS = ['Any', 'FWD', 'AWD', '4WD']

const SLIDERS = [
  { key: 'wtCost', label: 'Total Cost', defaultVal: 75 },
  { key: 'wtReliability', label: 'Reliability', defaultVal: 90 },
  { key: 'wtSafety', label: 'Safety', defaultVal: 80 },
  { key: 'wtResale', label: 'Resale Value', defaultVal: 60 },
]

export default function InputForm() {
  const router = useRouter()

  const [budget, setBudget] = useState('')
  const [milesPerYear, setMilesPerYear] = useState('')
  const [ownershipYears, setOwnershipYears] = useState('')
  const [fuelPrice, setFuelPrice] = useState('')
  const [minSeats, setMinSeats] = useState('5')
  const [fuelType, setFuelType] = useState('Any')
  const [drivetrain, setDrivetrain] = useState('Any')
  const [sliderValues, setSliderValues] = useState({ wtCost: 75, wtReliability: 90, wtSafety: 80, wtResale: 60 })
  const [downPayment, setDownPayment] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [loanTerm, setLoanTerm] = useState('60')

  function setSlider(key, val) {
    setSliderValues(prev => ({ ...prev, [key]: val }))
  }

  function handleSubmit() {
    const payload = {
      budget: budget || '35000',
      miles: milesPerYear || '12000',
      years: ownershipYears || '5',
      fuel_price: fuelPrice || '3.85',
      seats: minSeats,
      fuel_type: fuelType,
      drivetrain,
      w_cost: String(sliderValues.wtCost),
      w_reliability: String(sliderValues.wtReliability),
      w_safety: String(sliderValues.wtSafety),
      w_resale: String(sliderValues.wtResale),
      loan_term: loanTerm,
      ...(downPayment && { down_payment: downPayment }),
      ...(interestRate && { interest_rate: interestRate }),
    }

    // fire-and-forget: log search to DB, don't block navigation
    fetch('/api/searches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {})

    const params = new URLSearchParams(payload)
    router.push(`/results?${params.toString()}`)
  }

  return (
    <main className="max-w-[1280px] mx-auto px-margin py-24 min-h-[calc(100vh-140px)] flex flex-col items-center relative">
      {/* Hero */}
      <div className="w-full max-w-3xl mb-16 text-center">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-md tracking-tight">
          Find Your Perfect Drive
        </h1>
        <p className="font-body-md text-body-md text-secondary max-w-[36rem] mx-auto leading-relaxed">
          Our AI-driven analysis matches your lifestyle and budget with real-world technical data to
          find the vehicle that fits you best.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-3xl glass-card rounded-2xl shadow-2xl shadow-primary-fixed/30 overflow-hidden">
        <div className="p-lg md:p-xl space-y-xl">

          {/* Section 1: Your Details */}
          <section>
            <div className="flex items-center gap-md mb-lg">
              <span className="material-symbols-outlined text-primary">person</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Your Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  MAX BUDGET ($)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 45000"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl px-md py-3 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all font-body-md"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  MILES PER YEAR
                </label>
                <input
                  type="number"
                  placeholder="e.g. 12000"
                  value={milesPerYear}
                  onChange={e => setMilesPerYear(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl px-md py-3 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all font-body-md"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  YEARS OF OWNERSHIP
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={ownershipYears}
                  onChange={e => setOwnershipYears(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl px-md py-3 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all font-body-md"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  FUEL PRICE ($/GAL)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 3.85"
                  step="0.01"
                  value={fuelPrice}
                  onChange={e => setFuelPrice(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl px-md py-3 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all font-body-md"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  MINIMUM SEATS
                </label>
                <select
                  value={minSeats}
                  onChange={e => setMinSeats(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl px-md py-3 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all font-body-md appearance-none cursor-pointer"
                >
                  <option value="2">2</option>
                  <option value="5">5</option>
                  <option value="7">7</option>
                  <option value="8+">8+</option>
                </select>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  FUEL TYPE PREFERENCE
                </label>
                <select
                  value={fuelType}
                  onChange={e => setFuelType(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-outline-variant/50 rounded-xl px-md py-3 focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none transition-all font-body-md appearance-none cursor-pointer"
                >
                  <option value="Any">Any</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div className="md:col-span-2 flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  DRIVETRAIN
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-sm">
                  {DRIVETRAINS.map(dt => (
                    <button
                      key={dt}
                      type="button"
                      onClick={() => setDrivetrain(dt)}
                      className={
                        drivetrain === dt
                          ? 'px-md py-sm rounded-xl border-2 border-primary bg-primary text-on-primary font-body-sm font-semibold transition-all shadow-md shadow-primary/20'
                          : 'px-md py-sm rounded-xl border-2 border-outline-variant/30 hover:border-primary/50 transition-all text-on-surface font-body-sm font-medium'
                      }
                    >
                      {dt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-outline-variant/40 to-transparent" />

          {/* Section 2: What Matters Most */}
          <section>
            <div className="flex items-center gap-md mb-lg">
              <span className="material-symbols-outlined text-tertiary">analytics</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                What Matters Most
              </h2>
            </div>
            <div className="space-y-xl">
              {SLIDERS.map(({ key, label }) => (
                <div key={key} className="space-y-md">
                  <div className="flex justify-between items-end">
                    <label className="font-title-sm text-title-sm text-on-surface font-semibold">
                      {label}
                    </label>
                    <span className="font-label-caps text-[11px] font-bold text-primary bg-primary-fixed/50 border border-primary/10 px-md py-1 rounded-full">
                      {sliderValues[key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValues[key]}
                    onChange={e => setSlider(key, parseInt(e.target.value))}
                    className="w-full h-[6px] bg-surface-container-high rounded-full appearance-none cursor-pointer slider-thumb"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Collapsible Financing */}
          <details className="group bg-surface-container-low/50 rounded-2xl border border-outline-variant/30 overflow-hidden">
            <summary className="flex justify-between items-center p-lg cursor-pointer list-none hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-secondary text-xl">payments</span>
                <h2 className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Include Financing Options
                </h2>
              </div>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform text-secondary">
                expand_more
              </span>
            </summary>
            <div className="px-lg pb-lg grid grid-cols-1 md:grid-cols-3 gap-lg">
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  DOWN PAYMENT ($)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 5000"
                  value={downPayment}
                  onChange={e => setDownPayment(e.target.value)}
                  className="w-full bg-surface-container-lowest/80 border border-outline-variant/50 rounded-xl px-md py-sm focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none font-body-sm transition-all"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  INTEREST RATE %
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4.5"
                  step="0.1"
                  value={interestRate}
                  onChange={e => setInterestRate(e.target.value)}
                  className="w-full bg-surface-container-lowest/80 border border-outline-variant/50 rounded-xl px-md py-sm focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none font-body-sm transition-all"
                />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  LOAN TERM (MO)
                </label>
                <select
                  value={loanTerm}
                  onChange={e => setLoanTerm(e.target.value)}
                  className="w-full bg-surface-container-lowest/80 border border-outline-variant/50 rounded-xl px-md py-sm focus:border-primary-container focus:ring-4 focus:ring-primary-container/10 outline-none font-body-sm appearance-none cursor-pointer transition-all"
                >
                  <option value="36">36</option>
                  <option value="48">48</option>
                  <option value="60">60</option>
                  <option value="72">72</option>
                </select>
              </div>
            </div>
          </details>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-primary text-on-primary font-headline-md text-headline-md py-lg rounded-2xl hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 active:scale-[0.99] transition-all flex items-center justify-center gap-md"
          >
            Get My Recommendations
            <span className="material-symbols-outlined font-bold">arrow_forward</span>
          </button>

        </div>
      </div>

      {/* Trust Badges */}
      <div className="mt-24 flex flex-wrap justify-center gap-xl">
        {[
          { icon: 'verified', label: 'Market Data Backed' },
          { icon: 'security', label: 'Privacy Guaranteed' },
          { icon: 'database', label: '50k+ Models Analyzed' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-sm px-lg py-sm rounded-full bg-surface-container-low/50 border border-outline-variant/20"
          >
            <span className="material-symbols-outlined text-primary/70 text-lg">{icon}</span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Decorative blurs */}
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none" />
    </main>
  )
}
