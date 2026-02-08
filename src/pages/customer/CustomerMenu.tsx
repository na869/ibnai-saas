import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Search, Info, Package } from "lucide-react";
import { Card, Loading } from "../../components/ui";
import { subscribeToMenuData } from "../../services/restaurantService";
import type { MenuItem } from "../../config/supabase";
import { supabase } from "../../config/supabase";

// Sub-components
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
      console.error("Restaurant not found");
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
    
    // Sort items by display_order within categories
    const sortedFiltered = [...filtered].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    // Get default categories for this business type
    const businessType = restaurant?.restaurant_type || "Other";
    const defaultCats = APP_CONFIG.businessCategories[businessType as keyof typeof APP_CONFIG.businessCategories] || APP_CONFIG.businessCategories["Other"];

    sortedFiltered.forEach((item) => {
      let categoryObj;
      
      if (item.category_id) {
        categoryObj = menuCategories.find(c => c.id === item.category_id);
      }
      
      // Fallback: If no category_id but has category name string
      if (!categoryObj && item.category) {
        // Try to find an existing category with the same name to avoid duplicates
        categoryObj = menuCategories.find(c => c.name.toLowerCase() === item.category!.toLowerCase());
        
        if (!categoryObj) {
          categoryObj = { id: item.category.toLowerCase().replace(/\s+/g, '-'), name: item.category, display_order: 50 };
        }
      }

      // Default fallback
      if (!categoryObj) {
        categoryObj = { name: "Others", id: "others", display_order: 999 };
      }
      
      if (!groups[categoryObj.id]) {
        groups[categoryObj.id] = { category: categoryObj, items: [] };
      }
      groups[categoryObj.id].items.push(item);
    });
    
    // Convert to array and sort
    return Object.values(groups)
      .filter(group => group.items.length > 0)
      .sort((a, b) => {
        // First try to sort by explicit display_order
        if (a.category.display_order !== b.category.display_order) {
          return (a.category.display_order || 0) - (b.category.display_order || 0);
        }
        
        // Then try to sort by appearance in businessCategories list
        const indexA = defaultCats.indexOf(a.category.name);
        const indexB = defaultCats.indexOf(b.category.name);
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        
        return a.category.name.localeCompare(b.category.name);
      });
  }, [menuItems, searchTerm, vegOnly, menuCategories, restaurant]);

  const addToCart = (
    item: MenuItem,
    selectedSize?: any,
    selectedAddons: any[] = []
  ) => {
    const basePrice = selectedSize ? selectedSize.price : item.base_price;
    const addonsTotal = selectedAddons.reduce(
      (sum, addon) => sum + addon.price,
      0
    );
    const itemTotal = basePrice + addonsTotal;

    const cartItem: CartItem = {
      ...item,
      quantity: 1,
      selectedSize,
      selectedAddons,
      itemTotal,
    };

    const existingIndex = cart.findIndex(
      (ci) =>
        ci.id === item.id &&
        ci.selectedSize?.name === selectedSize?.name &&
        JSON.stringify(ci.selectedAddons) === JSON.stringify(selectedAddons)
    );

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
    if (newCart[index].quantity <= 0) {
      newCart.splice(index, 1);
    }
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

  const getItemQuantity = (itemId: string) => {
    return cart.reduce((sum, cartItem) => {
      if (cartItem.id === itemId) {
        return sum + cartItem.quantity;
      }
      return sum;
    }, 0);
  };

  const handleRemoveItem = (itemId: string) => {
    const index = cart.findIndex((ci) => ci.id === itemId);
    if (index >= 0) {
      updateQuantity(index, -1);
    }
  };

  const scrollToCategory = (categoryId: string) => {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 140; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setActiveCategory(categoryId);
    }
  };

  const getCustomLabel = (type: string, defaultLabel: string) => {
    const typeLower = type?.toLowerCase();
    if (typeLower === 'bakery') {
      if (defaultLabel === 'Search for dishes...') return 'Search for bakes...';
      if (defaultLabel === 'Order Summary') return 'Basket Summary';
    }
    if (typeLower === 'cafe') {
      if (defaultLabel === 'Search for dishes...') return 'Search for brews...';
    }
    return defaultLabel;
  };

  if (loading) {
    return <Loading text={
      restaurant?.restaurant_type?.toLowerCase() === 'bakery' 
        ? "Warming up the oven..." 
        : restaurant?.restaurant_type?.toLowerCase() === 'cafe'
        ? "Brewing your experience..."
        : "Fetching the best flavors..."
    } />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-md w-full">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {restaurant?.restaurant_type === 'Cloud Kitchen' ? 'Kitchen Offline' : 'Restaurant Unavailable'}
          </h2>
          <p className="text-gray-500">
            {restaurant?.restaurant_type === 'Cloud Kitchen' 
              ? 'Our kitchen is currently not taking orders.' 
              : 'The restaurant is not taking orders at the moment.'}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Hero Header */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {restaurant.cover_image_url ? (
          <img src={restaurant.cover_image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute bottom-6 left-4 right-4 text-white">
          <h1 className="text-2xl sm:text-3xl font-black mb-1">{restaurant.name}</h1>
          <p className="text-white/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3" /> {restaurant.address || "Premium Dining"}
          </p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-screen-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={getCustomLabel(restaurant.restaurant_type, "Search for dishes...")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-orange-500/20 font-medium"
              />
            </div>
            
            {/* Veg Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Veg Only</span>
              <button 
                onClick={() => setVegOnly(!vegOnly)}
                className={`w-10 h-5 rounded-full relative transition-colors ${vegOnly ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all`} style={{ left: vegOnly ? 'calc(100% - 18px)' : '2px' }} />
              </button>
            </div>
          </div>

          {/* Category Anchors */}
          {!searchTerm && groupedItems.length > 0 && (
            <CategoryNav 
              categories={groupedItems} 
              activeCategory={activeCategory} 
              onCategoryClick={scrollToCategory} 
            />
          )}
        </div>
      </div>

      {/* Menu Sections */}
      <div className="max-w-screen-md mx-auto px-4 py-6">
        {groupedItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">No matches found for your criteria.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {groupedItems.map((group) => (
              <div 
                key={group.category.id} 
                id={group.category.id}
                ref={(el) => { categoryRefs.current[group.category.id] = el; }}
                className="scroll-mt-36"
              >
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  {group.category.name}
                  <span className="text-xs text-gray-300 font-bold">({group.items.length})</span>
                </h2>
                
                <div className="space-y-8 divide-y divide-gray-100">
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

      {/* Floating Cart Bar */}
      <CartBar 
        cartCount={cartCount} 
        cartTotal={cartTotal} 
        onClick={() => setShowCart(true)} 
      />

      {/* Modals */}
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
        onClose={() => setShowCheckout(false)}
        onSuccess={() => { setCart([]); setShowCheckout(false); }}
      />
    </div>
  );
};

export default CustomerMenu;