// Supabase Configuration
// Replace these with your actual Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "YOUR_SUPABASE_URL";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY";

// Application Configuration
export const APP_CONFIG = {
  appName: "IBNai DineOS",
  defaultCurrency: "₹",
  taxRate: 0.05, // 5% GST
  orderPrefix: "ORD",

  // Subscription plans
  plans: {
    starter: {
      name: "Starter",
      price: 0,
      duration: "per month",
      features: [
        "Free for first 50 Restaurants",
        "Unlimited QR orders",
        "Basic menu management",
        "Digital menu hosting",
        "Email support",
      ],
    },
    pro: {
      name: "Pro",
      price: 499,
      duration: "per month",
      features: [
        "Complete Control",
        "Unlimited locations",
        "Advanced analytics",
        "Custom branding",
        "Priority support",
        "Inventory management",
      ],
    },
  },

  // Restaurant types
  restaurantTypes: [
    "Restaurant",
    "Food Truck",
    "Cafe",
    "Bakery",
    "Cloud Kitchen",
    "Fine Dining",
    "Quick Service",
    "Other",
  ],

  // Menu categories
  menuCategories: [
    "Starters",
    "Main Course",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Beverages",
    "Desserts",
    "Snacks",
    "Other",
  ],

  // Default categories by business type
  businessCategories: {
    "Restaurant": ["Starters", "Main Course", "Biriyani", "Bread & Roti", "Non-Veg Curries", "Veg Curries", "Beverages", "Desserts"],
    "Cafe": ["Hot Coffee", "Cold Coffee", "Tea & Beverages", "Sandwiches", "Pastries", "Quick Bites"],
    "Bakery": ["Cakes", "Pastries", "Breads", "Cookies", "Savories", "Custom Cakes"],
    "Cloud Kitchen": ["Combos", "Main Course", "Side Dishes", "Beverages"],
    "Fine Dining": ["Appetizers", "Soups", "Salads", "Main Entrée", "Gourmet Sides", "Fine Wines & Drinks", "Artisan Desserts"],
    "Quick Service": ["Burgers", "Pizzas", "Sides", "Combos", "Beverages"],
    "Food Truck": ["Signature Dishes", "Street Food", "Drinks", "Specials"],
    "Other": ["Starters", "Main Course", "Beverages", "Other"]
  },

  // Order statuses
  orderStatuses: {
    pending: { label: "Pending", color: "warning" },
    accepted: { label: "Accepted", color: "accent-secondary" },
    preparing: { label: "Preparing", color: "accent-secondary" },
    ready: { label: "Ready", color: "success" },
    completed: { label: "Completed", color: "success" },
    cancelled: { label: "Cancelled", color: "error" },
    rejected: { label: "Rejected", color: "error" },
  },

  // Payment methods
  paymentMethods: ["Cash", "UPI", "Card", "Other"],

  // Registration sources
  heardFromOptions: [
    "Google Search",
    "Social Media",
    "Friend/Referral",
    "Advertisement",
    "Other",
  ],
};
