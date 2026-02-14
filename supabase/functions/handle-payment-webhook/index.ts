import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  try {
    const signature = req.headers.get('x-razorpay-signature')
    const body = await req.text()
    
    // In production, verify signature using RAZORPAY_WEBHOOK_SECRET
    // For now, we process the payload but log the event
    const payload = JSON.parse(body)
    const event = payload.event
    const subscriptionData = payload.payload?.subscription?.entity

    if (!subscriptionData) {
        return new Response(JSON.stringify({ error: 'No subscription data found' }), { status: 400 })
    }

    const restaurantId = subscriptionData.notes?.restaurant_id
    const planId = subscriptionData.notes?.plan_id || 'growth_pack'
    
    console.log(`Processing Webhook Event: ${event} for Restaurant: ${restaurantId}`);

    let status = 'active'
    if (event === 'subscription.cancelled') status = 'canceled'
    if (event === 'subscription.halted') status = 'past_due'
    if (event === 'subscription.charged') status = 'active'

    // Update Subscription in Database using Admin Client
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        restaurant_id: restaurantId,
        plan_id: planId,
        status: status,
        gateway_subscription_id: subscriptionData.id,
        current_period_end: new Date(subscriptionData.current_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'restaurant_id' })

    if (error) {
        console.error("Database Update Error:", error.message);
        throw error
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    console.error("Webhook Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }
})
