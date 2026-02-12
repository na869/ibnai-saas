import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Search, Info, Package, ChevronRight, Star, Clock, ShieldCheck, ShoppingBag, ArrowLeft, MapPin } from "lucide-react";
import { Loading, Badge, Button } from "../../components/ui";
import {
  subscribeToMenuData,
  getOptimizedMenu,
} from "../../services/restaurantService";
import type { MenuItem } from "../../config/supabase";
import { supabase } from "../../config/supabase";

// Sub-components (These will also be updated in subsequent steps)
import MenuItemCard from "../../components/menu/MenuItemCard";
import CategoryNav from "../../components/menu/CategoryNav";
import CartBar from "../../components/menu/CartBar";
import CartModal from "../../components/menu/modals/CartModal";
import ItemCustomizationModal from "../../components/menu/modals/ItemCustomizationModal";
import CheckoutModal from "../../components/menu/modals/CheckoutModal";

import { APP_CONFIG } from "../../config/config";

interface CartItem extends MenuItem {
  quantity: number;
  selectedSize?: { name: string; price: number };
  selectedAddons: { name: string; price: number }[];
  itemTotal: number;
}

const CustomerMenu: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [vegOnly, setVegOnly] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const observer = useRef<IntersectionObserver | null>(null);

  const loadRestaurant = useCallback(async () => {
    if (!slug) return;

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      setLoading(false);
      return;
    }

    setRestaurant(data);
  }, [slug]);

  useEffect(() => {
    loadRestaurant();
  }, [loadRestaurant]);

  useEffect(() => {
    if (restaurant?.id) {
      const fetchInitialData = async () => {
        const { data, error } = await getOptimizedMenu(restaurant.id);
        if (!error && data) {
          const allItems: MenuItem[] = [];
          data.categories?.forEach((cat: any) => {
            if (cat.items) allItems.push(...cat.items);
          });
          
          setMenuCategories(data.categories || []);
          setMenuItems(allItems);
          setLoading(false);
        }
      };
      
      fetchInitialData();

      const subscription = subscribeToMenuData(restaurant.id, (data) => {
        setMenuCategories(data.categories);
        setMenuItems(data.items);
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [restaurant]);

  // Veg Heuristic
  const isVegItem = (item: MenuItem) => {
    const nonVegKeywords = ["chicken", "mutton", "fish", "egg", "meat", "beef", "pork", "prawn", "crab", "keema"];
    const name = item.name.toLowerCase();
    const description = (item.description || "").toLowerCase();
    return !nonVegKeywords.some(keyword => name.includes(keyword) || description.includes(keyword));
  };

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-120px 0px -70% 0px",
        threshold: 0,
      }
    );

    const currentRefs = categoryRefs.current;
    Object.values(currentRefs).forEach((ref) => {
      if (ref) observer.current?.observe(ref);
    });

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [menuItems, searchTerm, vegOnly, menuCategories]);

  const groupedItems = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    const filtered = menuItems.filter((item) => {
      const matchesSearch = 
        !searchLower ||
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower));
      
      const categoryObj = menuCategories.find(c => c.id === item.category_id);
      const matchesCategorySearch = searchLower && categoryObj?.name.toLowerCase().includes(searchLower);

      const matchesVeg = !vegOnly || isVegItem(item);
      return (matchesSearch || matchesCategorySearch) && matchesVeg && item.is_available;
    });
    
    const groups: { [key: string]: { category: any, items: MenuItem[] } } = {};
    const sortedFiltered = [...filtered].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    const businessType = restaurant?.restaurant_type || "Other";
    const defaultCats = APP_CONFIG.businessCategories[businessType as keyof typeof APP_CONFIG.businessCategories] || APP_CONFIG.businessCategories["Other"];

    sortedFiltered.forEach((item) => {
      let categoryObj = item.category_id ? menuCategories.find(c => c.id === item.category_id) : null;
      if (!categoryObj && item.category) {
        categoryObj = menuCategories.find(c => c.name.toLowerCase() === item.category!.toLowerCase());
        if (!categoryObj) categoryObj = { id: item.category.toLowerCase().replace(/\s+/g, '-'), name: item.category, display_order: 50 };
      }
      if (!categoryObj) categoryObj = { name: "Others", id: "others", display_order: 999 };
      
      if (!groups[categoryObj.id]) groups[categoryObj.id] = { category: categoryObj, items: [] };
      groups[categoryObj.id].items.push(item);
    });
    
    return Object.values(groups)
      .filter(group => group.items.length > 0)
      .sort((a, b) => {
        if (a.category.display_order !== b.category.display_order) return (a.category.display_order || 0) - (b.category.display_order || 0);
        const indexA = defaultCats.indexOf(a.category.name);
        const indexB = defaultCats.indexOf(b.category.name);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.category.name.localeCompare(b.category.name);
      });
  }, [menuItems, searchTerm, vegOnly, menuCategories, restaurant]);

  const addToCart = (item: MenuItem, selectedSize?: any, selectedAddons: any[] = []) => {
    const basePrice = selectedSize ? selectedSize.price : item.base_price;
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.price, 0);
    const itemTotal = basePrice + addonsTotal;

    const cartItem: CartItem = { ...item, quantity: 1, selectedSize, selectedAddons, itemTotal };
    const existingIndex = cart.findIndex(ci => ci.id === item.id && ci.selectedSize?.name === selectedSize?.name && JSON.stringify(ci.selectedAddons) === JSON.stringify(selectedAddons));

    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, cartItem]);
    }
    setShowItemModal(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity += delta;
    if (newCart[index].quantity <= 0) newCart.splice(index, 1);
    setCart(newCart);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.itemTotal * item.quantity, 0);

  const handleItemClick = (item: MenuItem) => {
    if ((item.sizes && item.sizes.length > 0) || (item.addons && item.addons.length > 0)) {
      setSelectedItem(item);
      setShowItemModal(true);
    } else {
      addToCart(item);
    }
  };

  const getItemQuantity = (itemId: string) => cart.reduce((sum, cartItem) => cartItem.id === itemId ? sum + cartItem.quantity : sum, 0);

  const handleRemoveItem = (itemId: string) => {
    const index = cart.findIndex((ci) => ci.id === itemId);
    if (index >= 0) updateQuantity(index, -1);
  };

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 160; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      window.scrollTo({ top: elementPosition - offset, behavior: "smooth" });
      setActiveCategory(categoryId);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loading text="Waking up the kitchen..." />
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-20 h-20 bg-white rounded-[32px] shadow-xl mx-auto flex items-center justify-center">
           <Package className="w-10 h-10 text-slate-200" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Kitchen Currently Offline</h2>
        <p className="text-slate-500 font-medium">This restaurant is not accepting orders at the moment. Please check back later.</p>
        <Button fullWidth onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-40 font-sans selection:bg-emerald-100">
      {/* Premium Hero Header */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {/* Floating Back Button for PWA */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 z-50 w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-all shadow-xl active:scale-90"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {restaurant.cover_image_url ? (
          <img src={restaurant.cover_image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 text-white">
          <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
            {restaurant.logo_url && (
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-[32px] p-2 shadow-2xl flex-shrink-0 animate-in zoom-in duration-700">
                <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover rounded-[24px]" />
              </div>
            )}
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                 <Badge variant="success" className="bg-emerald-500 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">Open Now</Badge>
                 <div className="flex items-center gap-1.5 text-amber-400 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="text-xs font-black uppercase tracking-widest">4.9 Excellent</span>
                 </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none animate-in slide-in-from-left-4 duration-700">{restaurant.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-300">
                <p className="text-sm font-bold flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <MapPin className="w-4 h-4 text-emerald-400" /> {restaurant.city || "Digital Menu"}
                </p>
                <p className="text-sm font-bold flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                  <Clock className="w-4 h-4 text-emerald-400" /> 15-20 Min Prep
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Intelligence Control Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-screen-md mx-auto p-4 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="What are you craving?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-600/10 placeholder:text-slate-400 transition-all"
              />
            </div>
            
            <button 
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 px-4 py-3.5 rounded-2xl border-2 transition-all ${vegOnly ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
            >
              <div className={`w-3 h-3 rounded-full border-2 ${vegOnly ? 'bg-white border-white' : 'border-slate-300'}`}></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Veg Only</span>
            </button>
          </div>

          {!searchTerm && groupedItems.length > 0 && (
            <CategoryNav 
              categories={groupedItems} 
              activeCategory={activeCategory} 
              onCategoryClick={scrollToCategory} 
            />
          )}
        </div>
      </div>

      {/* Menu Catalog */}
      <div className="max-w-screen-md mx-auto px-4 py-10">
        {groupedItems.length === 0 ? (
          <div className="text-center py-20">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-200" />
             </div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No flavor matches found.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {groupedItems.map((group) => (
              <div 
                key={group.category.id} 
                id={group.category.id}
                ref={(el) => { categoryRefs.current[group.category.id] = el; }}
                className="scroll-mt-40 animate-in fade-in slide-in-from-bottom-2"
              >
                <div className="flex items-center gap-4 mb-10">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                    {group.category.name}
                  </h2>
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{group.items.length} Choice{group.items.length > 1 ? 's' : ''}</span>
                </div>
                
                <div className="grid grid-cols-1 gap-12">
                  {group.items.map((item) => (
                    <MenuItemCard 
                      key={item.id}
                      item={item}
                      quantity={getItemQuantity(item.id)}
                      onAdd={handleItemClick}
                      onRemove={handleRemoveItem}
                      isVeg={isVegItem(item)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Persistent Value Bar (Cart) */}
      <CartBar 
        cartCount={cartCount} 
        cartTotal={cartTotal} 
        onClick={() => setShowCart(true)} 
      />

      {/* System Modals */}
      <CartModal
        isOpen={showCart}
        cart={cart}
        onClose={() => setShowCart(false)}
        onUpdateQuantity={updateQuantity}
        onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
      />

      <ItemCustomizationModal
        isOpen={showItemModal}
        item={selectedItem}
        onClose={() => setShowItemModal(false)}
        onAdd={addToCart}
      />

      <CheckoutModal
        isOpen={showCheckout}
        cart={cart}
        restaurantId={restaurant.id}
        restaurantType={restaurant.restaurant_type}
        subscriptionPlan={restaurant.subscription_plan}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => { setCart([]); setShowCheckout(false); }}
      />
    </div>
  );
};

export default CustomerMenu;
