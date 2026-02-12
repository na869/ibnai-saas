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

  // Platform Owner Payment Details (Where restaurants pay YOU)
  adminPayment: {
    upiId: "shaik-naseer@ptyes", // Replace with your actual UPI ID
    bankName: "Punjab National Bank",
    accountHolder: "shaik naseer",
    qrImageUrl: "https://mnqnsegcldgwdrhramtf.supabase.co/storage/v1/object/public/assets/admin-upi-qr.png" 
  },

  // Subscription plans
  plans: {
    starter_pack: {
      id: "starter_pack",
      name: "Starter Pack",
      price: 0,
      duration: "Free",
      features: [
        "Up to 20 Menu Items",
        "Basic QR Menu",
        "Dine-in Orders Only",
        "Standard Branding",
        "Email Support",
      ],
      limits: {
        maxItems: 20,
        customBranding: false,
        analytics: false,
        takeaway: false,
        upi: false,
      }
    },
    growth_pack: {
      id: "growth_pack",
      name: "Growth Pack",
      price: 999,
      duration: "per month",
      features: [
        "Unlimited Menu Items",
        "Dine-in & Takeaway",
        "Custom Logo & Cover",
        "Basic Analytics",
        "Priority Email Support",
      ],
      limits: {
        maxItems: 1000000,
        customBranding: true,
        analytics: true,
        takeaway: true,
        upi: false,
      }
    },
    customizeble_pack: {
      id: "customizeble_pack",
      name: "Customizable Pack",
      price: 2499,
      duration: "per month",
      features: [
        "Everything in Growth",
        "Custom Domain (Optional)",
        "Advanced Analytics",
        "UPI Integration",
        "Dedicated Account Manager",
        "Custom CSS/Branding",
      ],
      limits: {
        maxItems: 1000000,
        customBranding: true,
        analytics: true,
        takeaway: true,
        upi: true,
      }
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
