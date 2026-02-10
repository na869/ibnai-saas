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
} from "lucide-react";
import RestaurantHome from "./RestaurantHome";
import Orders from "./Orders";
import Menu from "./Menu";
import Reports from "./Reports";
import RestaurantSettings from "./RestaurantSettings";

const RestaurantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user] = useState<any>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });
  const [restaurant] = useState<any>(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      return {
        name: parsedUser.restaurant?.name || "Demo Restaurant",
        slug: parsedUser.restaurant?.slug || "demo-restaurant",
      };
    }
    return null;
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) return null;

  const navItems = [
    { path: "/restaurant", icon: LayoutDashboard, label: "Overview", shortLabel: "Home" },
    { path: "/restaurant/orders", icon: ShoppingBag, label: "Live Orders", shortLabel: "Orders" },
    { path: "/restaurant/menu", icon: UtensilsCrossed, label: "Menu Manager", shortLabel: "Menu" },
    { path: "/restaurant/reports", icon: FileText, label: "Sales Reports", shortLabel: "Stats" },
    { path: "/restaurant/settings", icon: Settings, label: "Settings", shortLabel: "Settings" },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <StoreIcon className="w-6 h-6 text-white" />
           </div>
           <div>
             <h1 className="font-black tracking-tight text-lg leading-none">IBNai</h1>
             <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Partner</p>
           </div>
         </div>
         <a href="tel:+919390949028" className="p-2 text-slate-500 hover:text-emerald-500 transition-colors" title="Support">
           <HelpCircle className="w-5 h-5" />
         </a>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
         {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
             <Link
               key={item.path}
               to={item.path}
               onClick={() => setIsMobileMenuOpen(false)}
               className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                 isActive
                   ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 font-bold"
                   : "text-slate-400 hover:bg-slate-800 hover:text-white font-medium"
               }`}
             >
               <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
               <span>{item.label}</span>
             </Link>
           );
         })}
      </div>

      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="bg-slate-800 rounded-xl p-4">
           <div className="flex items-center justify-between mb-2">
             <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Restaurant</span>
             <Link to={`/menu/${restaurant?.slug}`} target="_blank" className="text-emerald-500 hover:text-emerald-400">
               <ExternalLink className="w-4 h-4" />
             </Link>
           </div>
           <p className="font-bold text-sm truncate">{restaurant?.name}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 pb-20 lg:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 fixed inset-y-0 left-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-40 flex items-center justify-between px-6 border-b border-slate-100 shadow-sm">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-slate-900 text-lg tracking-tighter">IBNai</span>
         </div>
         <div className="flex items-center gap-2">
           <a href="tel:+919390949028" className="p-2 text-slate-400 hover:text-emerald-600 transition-colors">
             <HelpCircle className="w-5 h-5" />
           </a>
           <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
             <LogOut className="w-5 h-5" />
           </button>
         </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 z-50 px-4 pb-safe">
        <div className="flex items-center justify-around h-full">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1.5 px-2 transition-all ${
                  isActive ? "text-emerald-600 scale-110" : "text-slate-400"
                }`}
              >
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-emerald-50 shadow-inner' : ''}`}>
                  <item.icon className="w-5 h-5" strokeWidth={isActive ? 3 : 2} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                  {item.shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
          <Routes>
            <Route index element={<RestaurantHome />} />
            <Route path="orders" element={<Orders />} />
            <Route path="menu" element={<Menu />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<RestaurantSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default RestaurantDashboard;
