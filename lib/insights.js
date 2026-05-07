import Groq from 'groq-sdk'

// ─── Prompt builder ────────────────────────────────────────────────────────────

function buildPrompt(vehicles, params) {
  const years = parseFloat(params.years)         || 5
  const miles = parseFloat(params.miles)         || 12000
  const wCost = parseFloat(params.w_cost)        || 75
  const wRel  = parseFloat(params.w_reliability) || 90
  const wSaf  = parseFloat(params.w_safety)      || 80
  const wRes  = parseFloat(params.w_resale)      || 60

  const rankLabels = ['Top Pick', 'Runner Up', 'Also Consider', 'Also Consider', 'Also Consider']

  const vehicleBlocks = vehicles.map((v, i) => {
    const annualCost = v._tcoDisplay ? Math.round(v._tcoDisplay / years) : null
    return `Vehicle ${i + 1} (${rankLabels[i] ?? 'Also Consider'}):
  Name: ${v.year} ${v.make} ${v.model}${v.trim ? ' ' + v.trim : ''}
  Match score: ${v._matchScore}%
  Purchase price: $${v.price.toLocaleString()}
  5-year TCO: $${v._tcoDisplay?.toLocaleString() ?? 'N/A'}${annualCost ? ` ($${annualCost.toLocaleString()}/year)` : ''}
  MPG combined: ${v.mpg_combined ?? 'N/A'}
  Reliability score: ${v.reliability_score}/100
  Safety rating: ${v.safety_rating}/10
  5-year resale value: $${v.resale_value_5yr?.toLocaleString() ?? 'N/A'}
  Relative dimension scores: Cost ${v._dimensions?.cost ?? 0}%, Reliability ${v._dimensions?.reliability ?? 0}%, Safety ${v._dimensions?.safety ?? 0}%, Resale ${v._dimensions?.resale ?? 0}%`
  }).join('\n\n')

  return `You are an automotive cost advisor helping everyday car buyers understand their recommendations.

User profile:
- Ownership period: ${years} years
- Annual mileage: ${Number(miles).toLocaleString()} miles/year
- Priority weights: Cost ${wCost}%, Reliability ${wRel}%, Safety ${wSaf}%, Resale value ${wRes}%

Ranked recommendations:
${vehicleBlocks}

Generate a JSON object with key "insights" containing an array of ${vehicles.length} objects, one per vehicle in the same order. Each object must have exactly these four fields:

"costSummary": One sentence stating the specific estimated annual cost and ownership window. Example: "Costs an estimated $7,400/year to own over your 4-year window."

"contextLine": One sentence that teaches the user something meaningful given their specific ownership years, mileage, or top priority. Make it insightful, not generic.

"rankReason": One sentence explaining why this vehicle ranks where it does. For rank 1, highlight its specific strengths with numbers. For ranks 2 and below, explain what specific gap separates it from the top pick, using actual figures.

"noiseNote": For ranks 2 and below only, one sentence identifying a difference vs. the top pick that sounds significant but is not (for example a small mileage gap or minor price difference). For rank 1, set this to null.

Rules: Use specific dollar and percentage figures from the data. No em dashes. Write in plain, direct language. Each sentence should give the user information they could not easily calculate themselves.`
}

// ─── AI insight generation ─────────────────────────────────────────────────────

export async function generateInsightsWithAI(vehicles, params) {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const completion = await client.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: buildPrompt(vehicles, params) }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
    max_tokens: 1800,
  })

  const raw = completion.choices[0]?.message?.content
  const parsed = JSON.parse(raw)
  const arr = Array.isArray(parsed)
    ? parsed
    : (parsed.insights ?? parsed.vehicles ?? Object.values(parsed).find(Array.isArray))

  if (!Array.isArray(arr) || arr.length === 0) throw new Error('Unexpected AI response shape')
  return arr
}

// ─── Deterministic fallback ────────────────────────────────────────────────────

const dimLabel = { cost: 'cost efficiency', reliability: 'reliability', safety: 'safety', resale: 'resale value' }

export function generateInsightFallback(vehicle, params, index, allVehicles) {
  const years = parseFloat(params.years)         || 5
  const miles = parseFloat(params.miles)         || 12000
  const wCost = parseFloat(params.w_cost)        || 75
  const wRel  = parseFloat(params.w_reliability) || 90
  const wSaf  = parseFloat(params.w_safety)      || 80
  const wRes  = parseFloat(params.w_resale)      || 60

  const d   = vehicle._dimensions || { cost: 0, reliability: 0, safety: 0, resale: 0 }
  const top = allVehicles[0]
  const annualCost = vehicle._tcoDisplay ? Math.round(vehicle._tcoDisplay / years) : null

  const costSummary = annualCost
    ? `Costs an estimated $${annualCost.toLocaleString()}/year to own over your ${years}-year window.`
    : null

  const dominant = Math.max(wCost, wRel, wSaf, wRes)
  let contextLine = null
  if (dominant === wRel && years >= 4) {
    contextLine = `Keeping a car ${years}+ years means reliability differences compound. A score gap of even 5 points can translate to hundreds in avoided repairs.`
  } else if (dominant === wRes && years <= 3) {
    contextLine = `With a ${years}-year plan you'll sell before most reliability issues surface, so resale retention matters more than long-term wear here.`
  } else if (dominant === wCost && miles >= 15000) {
    contextLine = `At ${Number(miles).toLocaleString()} mi/year, fuel efficiency drives a large share of total cost. Every extra MPG saves money every month.`
  } else if (dominant === wSaf) {
    contextLine = `Safety scores reflect both passive crash protection and active prevention systems. Both feed into this ranking.`
  }

  let rankReason = null
  if (index === 0) {
    const strong = Object.entries(d)
      .filter(([, v]) => v >= 70)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([k]) => dimLabel[k])
      .filter(Boolean)
    rankReason = strong.length >= 2
      ? `Ranks highest because it leads this group on ${strong[0]} and ${strong[1]}, the two factors that align most with your priorities.`
      : strong.length === 1
        ? `Ranks highest on the strength of ${strong[0]}, which carries the most weight in your profile.`
        : `Ranks highest with the best overall balance across your stated priorities.`
  } else {
    const weakEntry = Object.entries(d).sort((a, b) => a[1] - b[1])[0]
    const weakLabel = dimLabel[weakEntry?.[0]] || 'overall score'
    const tcoGap = top?._tcoDisplay && vehicle._tcoDisplay ? vehicle._tcoDisplay - top._tcoDisplay : 0
    if (Math.abs(tcoGap) < 1000) {
      rankReason = `Close in total cost to the top pick. The ranking gap comes down to a lower score on ${weakLabel}.`
    } else if (tcoGap > 0) {
      rankReason = `Costs $${tcoGap.toLocaleString()} more over the ownership period. The difference in ${weakLabel} is what places it below the top pick.`
    } else {
      rankReason = `Lower total cost than the top pick, but a weaker score on ${weakLabel} prevents it from ranking first given your priorities.`
    }
  }

  let noiseNote = null
  if (index > 0 && top) {
    const mileageDiff = Math.abs((vehicle.mileage || 0) - (top.mileage || 0))
    const mpgDiff     = Math.abs((vehicle.mpg_combined || 0) - (top.mpg_combined || 0))
    const priceDiff   = Math.abs(vehicle.price - top.price)
    if (mileageDiff > 0 && mileageDiff < 8000) {
      noiseNote = `The ${mileageDiff.toLocaleString()}-mile difference vs. the top pick has minimal impact on total cost over your ${years}-year window.`
    } else if (mpgDiff > 0 && mpgDiff <= 2) {
      const dollarDiff = Math.round(miles * years * 3.5 * mpgDiff / 900)
      noiseNote = `The ${mpgDiff} MPG gap vs. the top pick is worth roughly $${dollarDiff} total, a negligible factor in the overall ranking.`
    } else if (priceDiff > 0 && priceDiff < 1500) {
      noiseNote = `The $${priceDiff.toLocaleString()} sticker price difference is within typical dealer negotiation margins.`
    }
  }

  return { costSummary, contextLine, rankReason, noiseNote }
}
