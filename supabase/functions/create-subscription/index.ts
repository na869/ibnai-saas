import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Get User Session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      console.error("Auth Error Detail:", authError);
      return new Response(JSON.stringify({ error: 'Unauthorized', detail: authError }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 401 
      })
    }

    // 2. Get Plan details from DB
    const body = await req.json();
    const plan_id = body.plan_id;
    console.log(`Received request for plan_id: ${plan_id}`);
    
    if (!plan_id) throw new Error('plan_id is missing in request body');
    
    // Use Admin client to bypass RLS
    const { data: plan, error: planError } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single()

    if (planError || !plan) {
      console.error(`DB Plan Error: ${planError?.message}`);
      throw new Error(`Plan configuration not found in database for ID: ${plan_id}`);
    }

    if (!plan.gateway_plan_id) {
      throw new Error(`Razorpay Plan ID (gateway_plan_id) is missing for plan: ${plan_id}. Please check your database.`);
    }

    // 3. Initialize Razorpay
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID')
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET')

    console.log(`Calling Razorpay for Plan: ${plan.gateway_plan_id}`);

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`)}`
      },
      body: JSON.stringify({
        plan_id: plan.gateway_plan_id,
        total_count: 12,
        quantity: 1,
        customer_notify: 1,
        notes: {
          restaurant_id: user.id,
          user_id: user.id,
          plan_id: plan_id
        }
      })
    })

    const razorpayData = await response.json()

    if (!response.ok) {
      console.error("Razorpay API Error:", JSON.stringify(razorpayData));
      return new Response(JSON.stringify({ 
        error: razorpayData.error?.description || 'Razorpay Gateway Error',
        code: razorpayData.error?.code 
      }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 400 
      })
    }

    return new Response(
      JSON.stringify({ ...razorpayData, key_id: RAZORPAY_KEY_ID }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
