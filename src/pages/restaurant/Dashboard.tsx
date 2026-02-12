import React, { useEffect, useState } from "react";
import {
  useNavigate,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import {
  Store as StoreIcon,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  FileText,
  Settings,
  Menu as MenuIcon,
  X,
  ExternalLink,
  HelpCircle,
  Lock,
  CreditCard
} from "lucide-react";
import RestaurantHome from "./RestaurantHome";
import Orders from "./Orders";
import Menu from "./Menu";
import Reports from "./Reports";
import RestaurantSettings from "./RestaurantSettings";
import Billing from "./Billing";
import { supabase } from "../../config/supabase";
import { hasFeature } from "../../utils/helpers";

const RestaurantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user] = useState<any>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    // Check initial session
    if (!user) {
      navigate("/login");
      return;
    }

    // Subscribe to auth changes (e.g. token refresh fail, sign out)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.removeItem("user");
        navigate("/login");
      }
    });

    const fetchRestaurant = async () => {
      // Validate UUID format to prevent 400 errors
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!user.restaurant_id || !uuidRegex.test(user.restaurant_id)) {
        console.error("Invalid Restaurant ID format");
        return;
      }

      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", user.restaurant_id)
        .single();
      
      if (error) {
        console.error("Dashboard fetch error:", error.message);
        // If we can't fetch the restaurant (e.g. 400/403), likely auth issue or bad ID
        if (error.code === 'PGRST116') {
           // Handle specifically if needed
        }
      } else {
        setRestaurant(data);
      }
    };

    fetchRestaurant();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const navItems = [
    { path: "/restaurant", icon: LayoutDashboard, label: "Overview", shortLabel: "Home", feature: null },
    { path: "/restaurant/orders", icon: ShoppingBag, label: "Live Orders", shortLabel: "Orders", feature: null },
    { path: "/restaurant/menu", icon: UtensilsCrossed, label: "Menu Manager", shortLabel: "Menu", feature: null },
    { path: "/restaurant/reports", icon: FileText, label: "Sales Reports", shortLabel: "Stats", feature: "analytics" },
    { path: "/restaurant/billing", icon: CreditCard, label: "Billing & Plans", shortLabel: "Billing", feature: null },
    { path: "/restaurant/settings", icon: Settings, label: "Settings", shortLabel: "Settings", feature: null },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-white/5 text-white shadow-2xl relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-600/10 blur-[80px] pointer-events-none"></div>

      <div className="p-8 border-b border-white/5 relative z-10">
         <div className="flex items-center gap-4 mb-1">
           <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 overflow-hidden backdrop-blur-md">
             {restaurant?.logo_url ? (
               <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
             ) : (
               <StoreIcon className="w-6 h-6 text-emerald-400" />
             )}
           </div>
           <div className="truncate flex-1">
             <h1 className="font-black tracking-tighter text-lg leading-none truncate text-white">{restaurant?.name || "IBNai"}</h1>
             <div className="flex items-center gap-2 mt-1.5">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Online</p>
             </div>
           </div>
         </div>
      </div>

      <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto relative z-10">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           const isLocked = item.feature && !hasFeature(restaurant?.subscription_plan, item.feature);

           if (isLocked) {
            return (
              <div
                key={item.path}
                className="flex items-center justify-between px-5 py-4 rounded-2xl text-slate-600 cursor-not-allowed group border border-transparent"
                title="Upgrade plan to unlock this feature"
              >
                <div className="flex items-center space-x-4">
                  <item.icon className="w-5 h-5 opacity-50" />
                  <span className="font-bold text-sm opacity-50">{item.label}</span>
                </div>
                <Lock className="w-3.5 h-3.5 opacity-50" />
              </div>
            );
           }

           return (
             <Link
               key={item.path}
               to={item.path}
               onClick={() => setIsMobileMenuOpen(false)}
               className={`flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                 isActive
                   ? "bg-emerald-600 text-white shadow-[0_0_30px_-5px_rgba(16,185,129,0.4)] border border-emerald-500/50"
                   : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent hover:border-white/5"
               }`}
             >
               <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
               <span className="font-bold text-sm relative z-10 tracking-wide">{item.label}</span>
               
               {isActive && (
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]"></div>
               )}
             </Link>
           );
         })}
      </div>

      <div className="p-6 border-t border-white/5 space-y-4 relative z-10">
        <div className="bg-white/5 rounded-2xl p-5 border border-white/5 backdrop-blur-sm group hover:bg-white/10 transition-colors">
           <div className="flex items-center justify-between mb-3">
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Storefront</span>
             <Link to={`/menu/${restaurant?.slug}`} target="_blank" className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
               <ExternalLink className="w-4 h-4" />
             </Link>
           </div>
           <p className="font-bold text-sm truncate text-white">{restaurant?.slug || "loading..."}</p>
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-3 px-5 py-4 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-slate-900 z-40 flex items-center justify-between px-6 shadow-xl shadow-slate-900/10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <StoreIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-white text-xl tracking-tighter">IBNai</span>
         </div>
         <div className="flex items-center gap-2">
           <button onClick={handleLogout} className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-red-400 transition-colors">
             <LogOut className="w-5 h-5" />
           </button>
         </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-24 bg-white border-t border-slate-100 z-50 px-6 pb-6 pt-2 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between h-full">
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            const isLocked = item.feature && !hasFeature(restaurant?.subscription_plan, item.feature);

            if (isLocked) return null;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                  isActive ? "text-emerald-600 -translate-y-2" : "text-slate-300"
                }`}
              >
                <div className={`p-3 rounded-2xl transition-all duration-300 ${isActive ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30' : 'bg-transparent'}`}>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 3 : 2.5} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100 text-emerald-900' : 'opacity-0'}`}>
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-80 min-h-screen pt-24 lg:pt-0 bg-slate-50/50">
        <div className="p-6 md:p-10 lg:p-12 max-w-screen-2xl mx-auto">
          <Routes>
            <Route index element={<RestaurantHome />} />
            <Route path="orders" element={<Orders />} />
            <Route path="menu" element={<Menu />} />
            <Route path="reports" element={<Reports />} />
            <Route path="billing" element={<Billing />} />
            <Route path="settings" element={<RestaurantSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default RestaurantDashboard;