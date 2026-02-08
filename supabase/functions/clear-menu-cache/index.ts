import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Redis from "https://esm.sh/ioredis"

const redis = new Redis(Deno.env.get("REDIS_URL") || "")

serve(async (req: Request): Promise<Response> => {
  try {
    const { record, old_record, table, type } = await req.json()
    
    // Get restaurantId from whichever record has it (new or old)
    const restaurantId = record?.restaurant_id || old_record?.restaurant_id

    if (!restaurantId) {
      return new Response(JSON.stringify({ error: "No restaurantId found" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    }

    const cacheKey = `menu_cache:${restaurantId}`
    
    // 🚀 THE AUTOMATION: Delete the key from Redis
    await redis.del(cacheKey)
    
    console.log(`✅ Successfully cleared cache for ${restaurantId} due to ${type} on ${table}`)

    return new Response(JSON.stringify({ cleared: true, key: cacheKey }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})