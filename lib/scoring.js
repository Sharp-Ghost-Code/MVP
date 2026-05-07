// Min-max normalization clamped to [0, 1]
function minMax(value, min, max) {
  if (max === min) return 1
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

// Total Cost of Ownership over the user's ownership period:
//   purchase price + fuel cost + financing interest − estimated residual value
function computeTCO(vehicle, miles, years, fuelPrice, downPayment, interestRate, loanTerm) {
  const mpg = vehicle.mpg_combined || 28
  const fuelCost = (miles * years * fuelPrice) / mpg

  let financingInterest = 0
  const principal = vehicle.price - downPayment
  if (interestRate > 0 && loanTerm > 0 && principal > 0) {
    const r = interestRate / 100 / 12
    const n = loanTerm
    const monthly = r > 0
      ? (principal * r) / (1 - Math.pow(1 + r, -n))
      : principal / n
    financingInterest = monthly * n - principal
  }

  // Linear depreciation from price to resale_value_5yr over 5 years, extrapolated beyond
  let residual = 0
  if (vehicle.resale_value_5yr) {
    const annualLoss = (vehicle.price - vehicle.resale_value_5yr) / 5
    residual = Math.max(0, vehicle.price - annualLoss * years)
  } else if (vehicle.depreciation_rate) {
    const annualRate = vehicle.depreciation_rate / 100 / 5
    residual = vehicle.price * Math.pow(1 - annualRate, years)
  }

  return vehicle.price + fuelCost + financingInterest - residual
}

/**
 * Score and rank a pool of vehicles against user preferences.
 *
 * Each of the 4 dimensions is normalized to [0,1] within the candidate set
 * (min-max), so scores reflect relative performance rather than absolute values.
 * The composite is a weighted average of the 4 normalized scores.
 *
 * @param {object[]} vehicles - raw rows from the DB
 * @param {object}   params   - URL/search params from the user's form
 * @returns {object[]} vehicles enriched with _matchScore, _tcoDisplay, _dimensions, sorted desc
 */
export function scoreAndRank(vehicles, params) {
  if (!vehicles.length) return []

  const miles        = parseFloat(params.miles)         || 12000
  const years        = parseFloat(params.years)         || 5
  const fuelPrice    = parseFloat(params.fuel_price)    || 3.85
  const downPayment  = parseFloat(params.down_payment)  || 0
  const interestRate = parseFloat(params.interest_rate) || 0
  const loanTerm     = parseInt(params.loan_term)       || 60

  const wCost = parseFloat(params.w_cost)        ?? 75
  const wRel  = parseFloat(params.w_reliability) ?? 90
  const wSaf  = parseFloat(params.w_safety)      ?? 80
  const wRes  = parseFloat(params.w_resale)      ?? 60
  const totalW = wCost + wRel + wSaf + wRes || 1

  // ── Step 1: compute raw metrics ─────────────────────────────────────────────
  const withMetrics = vehicles.map(v => ({
    ...v,
    _tco:         computeTCO(v, miles, years, fuelPrice, downPayment, interestRate, loanTerm),
    _reliability: v.reliability_score ?? 0,
    _safety:      v.safety_rating ? parseFloat(v.safety_rating) * 10 : 0,
    _resale_pct:  v.resale_value_5yr ? (v.resale_value_5yr / v.price) * 100 : 0,
  }))

  // ── Step 2: min / max per dimension ─────────────────────────────────────────
  const tcos  = withMetrics.map(v => v._tco)
  const rels  = withMetrics.map(v => v._reliability)
  const safs  = withMetrics.map(v => v._safety)
  const ress  = withMetrics.map(v => v._resale_pct)

  const [minTco, maxTco] = [Math.min(...tcos),  Math.max(...tcos)]
  const [minRel, maxRel] = [Math.min(...rels),  Math.max(...rels)]
  const [minSaf, maxSaf] = [Math.min(...safs),  Math.max(...safs)]
  const [minRes, maxRes] = [Math.min(...ress),  Math.max(...ress)]

  // ── Step 3: weighted composite score ────────────────────────────────────────
  return withMetrics
    .map(v => {
      const costScore   = 1 - minMax(v._tco,         minTco, maxTco) // lower TCO → higher score
      const relScore    =     minMax(v._reliability,  minRel, maxRel)
      const safScore    =     minMax(v._safety,       minSaf, maxSaf)
      const resaleScore =     minMax(v._resale_pct,   minRes, maxRes)

      const composite = (
        wCost * costScore   +
        wRel  * relScore    +
        wSaf  * safScore    +
        wRes  * resaleScore
      ) / totalW

      return {
        ...v,
        _matchScore:  Math.round(composite * 100),
        _tcoDisplay:  Math.round(v._tco),
        _dimensions: {
          cost:        Math.round(costScore   * 100),
          reliability: Math.round(relScore    * 100),
          safety:      Math.round(safScore    * 100),
          resale:      Math.round(resaleScore * 100),
        },
      }
    })
    .sort((a, b) => b._matchScore - a._matchScore)
}
