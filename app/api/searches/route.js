import { createClient } from '@/lib/supabase'

export async function POST(request) {
  try {
    const body = await request.json()
    const supabase = createClient()
    const { error } = await supabase
      .from('searches')
      .insert({
        max_budget: body.budget ? parseInt(body.budget) : null,
        miles_per_year: body.miles ? parseInt(body.miles) : null,
        ownership_years: body.years ? parseInt(body.years) : null,
        fuel_price: body.fuel_price ? parseFloat(body.fuel_price) : null,
        min_seats: body.seats && body.seats !== '8+' ? parseInt(body.seats) : null,
        fuel_type_preference: body.fuel_type || null,
        drivetrain_preference: body.drivetrain || null,
        weight_total_cost: body.w_cost ? parseInt(body.w_cost) : null,
        weight_reliability: body.w_reliability ? parseInt(body.w_reliability) : null,
        weight_safety: body.w_safety ? parseInt(body.w_safety) : null,
        weight_resale: body.w_resale ? parseInt(body.w_resale) : null,
        down_payment: body.down_payment ? parseInt(body.down_payment) : null,
        interest_rate: body.interest_rate ? parseFloat(body.interest_rate) : null,
        loan_term_months: body.loan_term ? parseInt(body.loan_term) : null,
      })
    if (error) throw error
    return Response.json({ ok: true }, { status: 201 })
  } catch (err) {
    console.error('[/api/searches]', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
