import { supabase } from "../config/supabase";
import type { Order, MenuItem } from "../config/supabase";

/**
 * Restaurant API Service
 * All restaurant dashboard operations with real-time support
 */

// Subscribe to restaurant's orders with real-time updates
export const subscribeToOrders = (
  restaurantId: string,
  callback: (payload: { event: "INSERT" | "UPDATE" | "INITIAL"; newOrder?: Order; orders?: Order[] }) => void
) => {
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      callback({ event: "INITIAL", orders: data });
    }
  };

  fetchOrders();

  const subscription = supabase
    .channel(`restaurant-orders-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        callback({ event: "INSERT", newOrder: payload.new as Order });
      }
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      (payload) => {
        callback({ event: "UPDATE", newOrder: payload.new as Order });
      }
    )
    .subscribe();

  return subscription;
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"],
  paymentData?: {
    paymentMethod?: string;
    transactionId?: string;
    paymentStatus?: string;
  }
) => {
  const updateData: Partial<Order> = { status };

  if (paymentData) {
    if (paymentData.paymentMethod) updateData.payment_method = paymentData.paymentMethod;
    if (paymentData.transactionId) updateData.payment_transaction_id = paymentData.transactionId;
    if (paymentData.paymentStatus) updateData.payment_status = paymentData.paymentStatus;
  }

  const { error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId);

  return !error;
};

// Helper to trigger cache invalidation (Calls a Supabase Edge Function or Backend Proxy)
const invalidateCache = async (restaurantId: string) => {
  try {
    // This calls your hypothetical Redis invalidation endpoint
    // In a real Supabase setup, a Database Webhook is better (see explanation below)
    console.log(`🧹 Invalidating cache for restaurant: ${restaurantId}`);
    await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/clear-menu-cache`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurantId })
    });
  } catch (err) {
    console.warn("Cache invalidation failed (Expected if function not yet deployed)");
  }
};

// Optimized Menu Data Fetch (Single Query via SQL View)
export const getOptimizedMenu = async (restaurantId: string) => {
  const { data, error } = await supabase
    .from("optimized_restaurant_menu")
    .select("name, restaurant_type, categories")
    .eq("restaurant_id", restaurantId)
    .single();

  return { data, error };
};

// Subscribe to menu data (categories + items) with real-time updates
export const subscribeToMenuData = (
  restaurantId: string,
  callback: (data: { categories: any[]; items: MenuItem[] }) => void
) => {
  const fetchMenuData = async () => {
    const [categoriesRes, itemsRes] = await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("display_order", { ascending: true }),
    ]);

    if (!categoriesRes.error && !itemsRes.error) {
      callback({
        categories: categoriesRes.data || [],
        items: itemsRes.data || [],
      });
    }
  };

  fetchMenuData();

  const categoriesSubscription = supabase
    .channel(`restaurant-categories-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "menu_categories",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      () => fetchMenuData()
    )
    .subscribe();

  const itemsSubscription = supabase
    .channel(`restaurant-menu-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "menu_items",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      () => fetchMenuData()
    )
    .subscribe();

  return {
    unsubscribe: () => {
      categoriesSubscription.unsubscribe();
      itemsSubscription.unsubscribe();
    },
  };
};

// Subscribe to menu items with real-time updates
export const subscribeToMenuItems = (
  restaurantId: string,
  callback: (items: MenuItem[]) => void
) => {
  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      callback(data);
    }
  };

  fetchItems();

  const subscription = supabase
    .channel(`restaurant-menu-${restaurantId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "menu_items",
        filter: `restaurant_id=eq.${restaurantId}`,
      },
      () => {
        fetchItems();
      }
    )
    .subscribe();

  return subscription;
};

// Create menu item
export const createMenuItem = async (item: Partial<MenuItem>) => {
  const { data, error } = await supabase
    .from("menu_items")
    .insert([item])
    .select()
    .single();

  if (!error && item.restaurant_id) {
    invalidateCache(item.restaurant_id);
  }
  return !error;
};

// Update menu item
export const updateMenuItem = async (
  itemId: string,
  updates: Partial<MenuItem>
) => {
  const { error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", itemId);

  if (!error && updates.restaurant_id) {
    invalidateCache(updates.restaurant_id);
  }
  return !error;
};

// Toggle menu item availability (triggers real-time update for customers)
export const toggleMenuItemAvailability = async (
  itemId: string,
  isAvailable: boolean
) => {
  const { data: item } = await supabase.from("menu_items").select("restaurant_id").eq("id", itemId).single();
  
  const { error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", itemId);

  if (!error && item?.restaurant_id) {
    invalidateCache(item.restaurant_id);
  }
  return !error;
};

// Delete menu item
export const deleteMenuItem = async (itemId: string) => {
  const { data: item } = await supabase.from("menu_items").select("restaurant_id").eq("id", itemId).single();
  
  const { error } = await supabase.from("menu_items").delete().eq("id", itemId);

  if (!error && item?.restaurant_id) {
    invalidateCache(item.restaurant_id);
  }
  return !error;
};

// Upload image to Supabase Storage
export const uploadImage = async (
  file: File,
  bucket: string,
  path: string
): Promise<string | null> => {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
};

// Create order (manual or from customer)
export const createOrder = async (order: Partial<Order>) => {
  const { data, error } = await supabase
    .from("orders")
    .insert([order])
    .select()
    .single();

  return { data, error };
};

// Get restaurant stats
export const getRestaurantStats = async (restaurantId: string) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { data: todayOrders },
      { data: pendingOrders },
      { count: totalOrders },
    ] = await Promise.all([
      supabase
        .from("orders")
        .select("total, status")
        .eq("restaurant_id", restaurantId)
        .gte("created_at", today.toISOString()),
      supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("status", "pending"),
      supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId),
    ]);

    const completedToday =
      todayOrders?.filter((o) => o.status === "completed").length || 0;
    const revenueToday =
      todayOrders
        ?.filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    return {
      pendingOrders: pendingOrders?.length || 0,
      completedToday,
      revenueToday,
      totalOrders: totalOrders || 0,
    };
  } catch (error) {
    console.error("Error fetching restaurant stats:", error);
    return {
      pendingOrders: 0,
      completedToday: 0,
      revenueToday: 0,
      totalOrders: 0,
    };
  }
};
