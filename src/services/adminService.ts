import { supabase } from "../config/supabase";
import type { RegistrationRequest, Restaurant } from "../config/supabase";
import {
  generateSlug,
} from "../utils/helpers";

/**
 * Admin API Service
 * All admin-related database operations
 */

// Get all pending registration requests with real-time updates
export const subscribeToPendingRequests = (
  callback: (requests: RegistrationRequest[]) => void
) => {
  // Initial fetch
  const fetchPending = async () => {
    const { data, error } = await supabase
      .from("registration_requests")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (!error && data) {
      callback(data);
    }
  };

  fetchPending();

  // Subscribe to changes
  const subscription = supabase
    .channel("pending-requests")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "registration_requests",
        filter: "status=eq.pending",
      },
      () => {
        fetchPending();
      }
    )
    .subscribe();

  return subscription;
};

// Approve request (handles both new account and upgrade)
export const approveRequest = async (
  requestId: string,
  data: {
    subscriptionPlan: string;
    internalNotes?: string;
  }
) => {
  try {
    const { data: result, error: rpcError } = await supabase.rpc(
      "admin_approve_request",
      {
        p_request_id: requestId,
        p_subscription_plan: data.subscriptionPlan,
        p_internal_notes: data.internalNotes || null,
      }
    );

    if (rpcError) throw rpcError;

    if (!result || result.length === 0 || !result[0].is_success) {
      throw new Error(result?.[0]?.msg || "Failed to process request");
    }

    return {
      success: true,
      restaurantId: result[0].r_id,
    };
  } catch (error: any) {
    console.error("Approve error:", error);
    return {
      success: false,
      error: error.message || "Failed to process request",
    };
  }
};

// Reject registration request
export const rejectRegistrationRequest = async (
  requestId: string,
  reason: string
) => {
  const { error } = await supabase.rpc("admin_reject_request", {
    p_request_id: requestId,
    p_rejection_reason: reason,
  });

  return !error;
};

// Get all restaurants with real-time updates
export const subscribeToRestaurants = (
  callback: (restaurants: Restaurant[]) => void
) => {
  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      callback(data);
    }
  };

  fetchRestaurants();

  const subscription = supabase
    .channel("restaurants")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "restaurants",
      },
      () => {
        fetchRestaurants();
      }
    )
    .subscribe();

  return subscription;
};

// Toggle restaurant block/unblock status
export const toggleRestaurantStatus = async (
  restaurantId: string,
  isCurrentlyBlocked: boolean,
  blockReason?: string
) => {
  const { error } = await supabase.rpc("admin_toggle_restaurant_status", {
    p_restaurant_id: restaurantId,
    p_is_active: isCurrentlyBlocked, // If currently blocked, set to active (true)
    p_block_reason: blockReason || null,
  });

  return !error;
};

// Get platform statistics
export const getPlatformStats = async () => {
  try {
    // Get counts
    const [
      { count: activeRestaurants },
      { count: pendingRequests },
      { count: totalOrders },
      { data: todayOrders },
      { data: planCounts }
    ] = await Promise.all([
      supabase
        .from("restaurants")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("registration_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase
        .from("orders")
        .select("total")
        .gte(
          "created_at",
          new Date(new Date().setHours(0, 0, 0, 0)).toISOString()
        ),
      supabase.from("restaurants").select("subscription_plan")
    ]);

    const todayRevenue =
      todayOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

    const distribution: Record<string, number> = {
      starter_pack: 0,
      growth_pack: 0,
      customizeble_pack: 0
    };

    planCounts?.forEach(r => {
      if (r.subscription_plan && distribution[r.subscription_plan] !== undefined) {
        distribution[r.subscription_plan]++;
      }
    });

    return {
      activeRestaurants: activeRestaurants || 0,
      pendingRequests: pendingRequests || 0,
      totalOrders: totalOrders || 0,
      todayRevenue,
      planDistribution: distribution
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      activeRestaurants: 0,
      pendingRequests: 0,
      totalOrders: 0,
      todayRevenue: 0,
    };
  }
};
