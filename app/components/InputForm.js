'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DRIVETRAINS = ['Any', 'FWD', 'AWD', '4WD']

const SLIDERS = [
  {
    key: 'wtCost',
    label: 'Total Cost',
    defaultVal: 75,
    hint: 'Weights the 5-year net cost including fuel, depreciation, and any financing',
  },
  {
    key: 'wtReliability',
    label: 'Reliability',
    defaultVal: 90,
    hint: 'Critical if keeping 5+ years. Small score gaps compound into real repair costs over time.',
  },
  {
    key: 'wtSafety',
    label: 'Safety',
    defaultVal: 80,
    hint: 'Covers crash test ratings and active prevention systems like automatic braking',
  },
  {
    key: 'wtResale',
    label: 'Resale Value',
    defaultVal: 60,
    hint: 'More important for shorter ownership. You recover more of your purchase price at resale.',
  },
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
  const [showFinancing, setShowFinancing] = useState(false)
  const [errors, setErrors] = useState({})

  function setSlider(key, val) {
    setSliderValues(prev => ({ ...prev, [key]: val }))
  }

  function handleSubmit() {
    const newErrors = {}
    if (!budget)        newErrors.budget        = 'Please enter your maximum budget'
    if (!milesPerYear)  newErrors.milesPerYear  = 'Please enter your annual mileage'
    if (!ownershipYears) newErrors.ownershipYears = 'Please enter how long you plan to keep the car'
    if (!fuelPrice)     newErrors.fuelPrice     = 'Please enter your local fuel price'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setErrors({})
    const payload = {
      budget,
      miles: milesPerYear,
      years: ownershipYears,
      fuel_price: fuelPrice,
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
      <div className="w-full max-w-5xl glass-card rounded-3xl overflow-hidden">
        <div className="p-lg md:p-xl space-y-xl">

          {/* Sections: Your Details + What Matters Most — side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl items-start">

          {/* Section 1: Your Details */}
          <section>
            <div className="flex items-center gap-md mb-lg">
              <span className="material-symbols-outlined text-primary">person</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">Your Details</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-lg">

              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  MAX BUDGET ($) <span className="text-error">*</span>
                </label>
                <input
                  id="budget"
                  type="number"
                  min="0"
                  placeholder="e.g. 45000"
                  value={budget}
                  onChange={e => { setBudget(e.target.value); setErrors(prev => ({ ...prev, budget: null })) }}
                  className={`w-full rounded-xl px-md py-3 font-body-md transition-all ${errors.budget ? 'neuro-input-error' : 'neuro-input'}`}
                />
                {errors.budget
                  ? <p className="font-body-sm text-[11px] text-error ml-1">{errors.budget}</p>
                  : <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">Sets a hard ceiling. Only vehicles at or below this price are shown.</p>
                }
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  MILES PER YEAR <span className="text-error">*</span>
                </label>
                <input
                  id="milesPerYear"
                  type="number"
                  min="0"
                  placeholder="e.g. 12000"
                  value={milesPerYear}
                  onChange={e => { setMilesPerYear(e.target.value); setErrors(prev => ({ ...prev, milesPerYear: null })) }}
                  className={`w-full rounded-xl px-md py-3 font-body-md transition-all ${errors.milesPerYear ? 'neuro-input-error' : 'neuro-input'}`}
                />
                {errors.milesPerYear
                  ? <p className="font-body-sm text-[11px] text-error ml-1">{errors.milesPerYear}</p>
                  : <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">Higher mileage increases fuel and wear costs significantly over time</p>
                }
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  YEARS OF OWNERSHIP <span className="text-error">*</span>
                </label>
                <input
                  id="ownershipYears"
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={ownershipYears}
                  onChange={e => { setOwnershipYears(e.target.value); setErrors(prev => ({ ...prev, ownershipYears: null })) }}
                  className={`w-full rounded-xl px-md py-3 font-body-md transition-all ${errors.ownershipYears ? 'neuro-input-error' : 'neuro-input'}`}
                />
                {errors.ownershipYears
                  ? <p className="font-body-sm text-[11px] text-error ml-1">{errors.ownershipYears}</p>
                  : <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">This affects depreciation vs. reliability importance in your results</p>
                }
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  FUEL PRICE ($/GAL) <span className="text-error">*</span>
                </label>
                <input
                  id="fuelPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 3.85"
                  value={fuelPrice}
                  onChange={e => { setFuelPrice(e.target.value); setErrors(prev => ({ ...prev, fuelPrice: null })) }}
                  className={`w-full rounded-xl px-md py-3 font-body-md transition-all ${errors.fuelPrice ? 'neuro-input-error' : 'neuro-input'}`}
                />
                {errors.fuelPrice
                  ? <p className="font-body-sm text-[11px] text-error ml-1">{errors.fuelPrice}</p>
                  : <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">Used to estimate total fuel spend across your full ownership period</p>
                }
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  MINIMUM SEATS
                </label>
                <select
                  value={minSeats}
                  onChange={e => setMinSeats(e.target.value)}
                  className="w-full rounded-xl px-md py-3 font-body-md neuro-input appearance-none cursor-pointer"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8+">8+</option>
                </select>
                <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">
                  Filters out vehicles below this seating capacity
                </p>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                  FUEL TYPE PREFERENCE
                </label>
                <select
                  value={fuelType}
                  onChange={e => setFuelType(e.target.value)}
                  className="w-full rounded-xl px-md py-3 font-body-md neuro-input appearance-none cursor-pointer"
                >
                  <option value="Any">Any</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
                <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">
                  Choose Any to compare all powertrains side by side
                </p>
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
                          ? 'px-md py-sm rounded-xl font-body-sm font-semibold transition-all neuro-btn-active text-primary'
                          : 'px-md py-sm rounded-xl font-body-sm font-medium transition-all neuro-btn text-on-surface'
                      }
                    >
                      {dt}
                    </button>
                  ))}
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">
                  AWD/4WD adds upfront cost but improves traction in snow or rough terrain
                </p>
              </div>

            </div>
          </section>

          {/* Section 2: What Matters Most */}
          <section className="border-l border-outline-variant/30 pl-xl">
            <div className="flex items-center gap-md mb-lg">
              <span className="material-symbols-outlined text-tertiary">analytics</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                What Matters Most
              </h2>
            </div>
            <div className="space-y-xl">
              {SLIDERS.map(({ key, label, hint }) => (
                <div key={key} className="space-y-sm">
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
                    className="slider-glassy"
                    style={{
                      background: `linear-gradient(to right, #2563eb 0%, #60a5fa ${sliderValues[key]}%, rgba(221,234,245,0.5) ${sliderValues[key]}%)`,
                    }}
                  />
                  <p className="font-body-sm text-[11px] text-on-surface-variant/60">
                    {hint}
                  </p>
                </div>
              ))}
            </div>
          </section>

          </div>{/* end two-column grid */}

          {/* Financing Toggle */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowFinancing(prev => !prev)}
              className="w-full flex justify-between items-center p-lg hover:bg-surface-container-low transition-colors"
            >
              <div className="flex items-center gap-md">
                <span className="material-symbols-outlined text-secondary text-xl">payments</span>
                <div className="text-left">
                  <p className="font-title-sm text-title-sm text-on-surface font-semibold">
                    Include Financing Options
                  </p>
                  <p className="font-body-sm text-[11px] text-on-surface-variant/60 mt-0.5">
                    Factor in your loan for accurate total cost estimates
                  </p>
                </div>
              </div>
              {/* Toggle pill — 48×28px container, 20×20px knob */}
              <div
                aria-checked={showFinancing}
                role="switch"
                className="relative flex-shrink-0 rounded-full transition-all duration-300"
                style={{
                  width: 48,
                  height: 28,
                  background: showFinancing ? 'linear-gradient(145deg, #2c6ef7, #1d56e0)' : '#ddeaf5',
                  boxShadow: showFinancing
                    ? '4px 4px 10px rgba(0,74,198,0.38), -2px -2px 6px rgba(255,255,255,0.45)'
                    : 'inset 3px 3px 7px rgba(152,182,208,0.44), inset -2px -2px 5px rgba(255,255,255,0.96)',
                }}
              >
                <span
                  className="absolute rounded-full bg-white transition-all duration-300"
                  style={{
                    width: 20,
                    height: 20,
                    top: 4,
                    left: showFinancing ? 24 : 4,
                    boxShadow: showFinancing
                      ? '3px 3px 8px rgba(0,74,198,0.28), -2px -2px 5px rgba(255,255,255,0.7)'
                      : '3px 3px 8px rgba(152,182,208,0.4), -2px -2px 5px rgba(255,255,255,0.98)',
                  }}
                />
              </div>
            </button>

            {/* Expandable fields */}
            <div
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{ maxHeight: showFinancing ? '320px' : '0px', opacity: showFinancing ? 1 : 0 }}
            >
              <div className="px-lg pb-lg grid grid-cols-1 md:grid-cols-3 gap-lg">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                    DOWN PAYMENT ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={downPayment}
                    onChange={e => setDownPayment(e.target.value)}
                    className="w-full rounded-xl px-md py-sm font-body-sm neuro-input"
                  />
                  <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">
                    Reduces your loan principal and total interest paid
                  </p>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                    INTEREST RATE %
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="e.g. 4.5"
                    value={interestRate}
                    onChange={e => setInterestRate(e.target.value)}
                    className="w-full rounded-xl px-md py-sm font-body-sm neuro-input"
                  />
                  <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">
                    Check your bank or credit union for current rates before estimating
                  </p>
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant ml-1">
                    LOAN TERM (MO)
                  </label>
                  <select
                    value={loanTerm}
                    onChange={e => setLoanTerm(e.target.value)}
                    className="w-full rounded-xl px-md py-sm font-body-sm neuro-input appearance-none cursor-pointer"
                  >
                    <option value="36">36</option>
                    <option value="48">48</option>
                    <option value="60">60</option>
                    <option value="72">72</option>
                  </select>
                  <p className="font-body-sm text-[11px] text-on-surface-variant/60 ml-1">
                    Longer terms lower monthly payments but increase total interest paid
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="w-full rounded-2xl p-6 flex items-center justify-center">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full neuro-btn-primary text-on-surface font-headline-md text-headline-md py-lg rounded-xl flex items-center justify-center gap-md"
            >
              Get My Recommendations
              <span className="material-symbols-outlined font-bold">arrow_forward</span>
            </button>
          </div>

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
