import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  ShoppingCart,
  Plus,
  Minus,
  Search,
  CheckCircle,
  Package,
  Info,
  Star,
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Modal,
  Loading,
} from "../../components/ui";
import {
  subscribeToMenuData,
  createOrder,
} from "../../services/restaurantService";
import type { MenuItem } from "../../config/supabase";
import { supabase } from "../../config/supabase";

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
    const filtered = menuItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesVeg = !vegOnly || isVegItem(item);
      return matchesSearch && matchesVeg && item.is_available;
    });
    
    const groups: { [key: string]: { category: any, items: MenuItem[] } } = {};
    
    // Sort items by display_order within categories
    const sortedFiltered = [...filtered].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

    sortedFiltered.forEach((item) => {
      const categoryId = item.category_id || "others";
      const categoryObj = menuCategories.find(c => c.id === categoryId) || { name: "Others", id: "others", display_order: 999 };
      
      if (!groups[categoryObj.id]) {
        groups[categoryObj.id] = { category: categoryObj, items: [] };
      }
      groups[categoryObj.id].items.push(item);
    });
    
    // Convert to array and sort by category display_order
    return Object.values(groups)
      .filter(group => group.items.length > 0)
      .sort((a, b) => (a.category.display_order || 0) - (b.category.display_order || 0));
  }, [menuItems, searchTerm, vegOnly, menuCategories]);

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

  if (loading) {
    return <Loading text="Fetching the best flavors..." />;
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="text-center p-8 max-w-md w-full">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Unavailable</h2>
          <p className="text-gray-500">The restaurant is not taking orders at the moment.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Hero Header */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {restaurant.banner_url ? (
          <img src={restaurant.banner_url} alt={restaurant.name} className="w-full h-full object-cover" />
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
                placeholder="Search for dishes..."
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
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${vegOnly ? 'left-5.5' : 'left-0.5'}`} style={{ left: vegOnly ? 'calc(100% - 18px)' : '2px' }} />
              </button>
            </div>
          </div>

          {/* Category Anchors */}
          {!searchTerm && groupedItems.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide no-scrollbar mt-3 pb-1">
              {groupedItems.map((group) => (
                <button
                  key={group.category.id}
                  onClick={() => scrollToCategory(group.category.id)}
                  className={`px-4 py-1.5 rounded-full text-[11px] font-black whitespace-nowrap transition-all uppercase tracking-wider ${
                    activeCategory === group.category.id
                      ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                      : "bg-gray-50 text-gray-500 border border-gray-100"
                  }`}
                >
                  {group.category.name}
                </button>
              ))}
            </div>
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
                  {group.items.map((item) => {
                    const quantity = getItemQuantity(item.id);
                    const isVeg = isVegItem(item);
                    const hasVariations = (item.sizes && item.sizes.length > 0) || (item.addons && item.addons.length > 0);
                    const isBestseller = item.name.toLowerCase().includes("dolphin special chicken biryani");

                    return (
                      <div key={item.id} className="pt-8 first:pt-0 flex gap-4 relative group">
                        {/* Bestseller Ribbon */}
                        {isBestseller && (
                          <div className="absolute -left-4 top-2 z-10">
                            <div className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-r-md shadow-sm uppercase">
                              Bestseller
                            </div>
                          </div>
                        )}

                        {/* Left Side: Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {/* Veg/Non-Veg Icon */}
                            <div className={`w-4 h-4 border-2 p-0.5 flex items-center justify-center ${isVeg ? 'border-green-600' : 'border-red-600'}`}>
                              {isVeg ? (
                                <div className="w-full h-full rounded-full bg-green-600" />
                              ) : (
                                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-red-600" />
                              )}
                            </div>
                          </div>

                          <h3 className="font-extrabold text-gray-800 text-base mb-0.5 group-hover:text-orange-600 transition-colors">
                            {item.name}
                          </h3>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold text-gray-900">₹{item.base_price}</span>
                            <div className="flex items-center gap-0.5 bg-green-50 px-1 rounded text-green-700 text-[10px] font-bold">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>4.2</span>
                            </div>
                          </div>

                          <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed font-medium pr-4">
                            {item.description || "Freshly prepared with authentic ingredients and spices."}
                          </p>
                        </div>

                        {/* Right Side: Image & ADD Button */}
                        <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-xl shadow-md border border-gray-50" />
                          ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center rounded-xl border border-gray-100">
                              <Package className="w-8 h-8 text-gray-200" />
                            </div>
                          )}

                          {/* ADD Button Overlay */}
                          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[80%]">
                            {quantity === 0 ? (
                              <button
                                onClick={() => handleItemClick(item)}
                                className="w-full bg-white text-green-600 font-black text-sm py-1.5 rounded-lg shadow-lg border border-gray-100 uppercase tracking-wider hover:bg-gray-50 transition-all active:scale-95"
                              >
                                ADD
                                {hasVariations && <span className="absolute -top-1 -right-1 text-[8px] text-gray-400">+</span>}
                              </button>
                            ) : (
                              <div className="w-full flex items-center justify-between bg-white text-green-600 font-black text-sm py-1.5 px-1 rounded-lg shadow-lg border border-gray-100">
                                <button onClick={() => handleRemoveItem(item.id)} className="w-6 h-6 flex items-center justify-center hover:bg-green-50 rounded">
                                  <Minus className="w-3 h-3 stroke-[3px]" />
                                </button>
                                <span>{quantity}</span>
                                <button onClick={() => handleItemClick(item)} className="w-6 h-6 flex items-center justify-center hover:bg-green-50 rounded">
                                  <Plus className="w-3 h-3 stroke-[3px]" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-6 left-4 right-4 z-50">
          <button
            onClick={() => setShowCart(true)}
            className="w-full max-w-screen-md mx-auto bg-green-700 text-white shadow-2xl rounded-xl p-3.5 flex items-center justify-between transform transition-all active:scale-[0.98]"
          >
            <div className="flex flex-col items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
                {cartCount} Item{cartCount > 1 ? 's' : ''} | ₹{cartTotal}
              </span>
              <span className="text-xs font-bold">Extra charges may apply</span>
            </div>
            <div className="flex items-center gap-1 font-black text-sm uppercase tracking-widest">
              <span>View Cart</span>
              <ShoppingCart className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

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
        onClose={() => setShowCheckout(false)}
        onSuccess={() => { setCart([]); setShowCheckout(false); }}
      />
    </div>
  );
};

// --- Sub-components (Simplified for brevity, following the same style) ---

const CartModal: React.FC<any> = ({ isOpen, cart, onClose, onUpdateQuantity, onCheckout }) => {
  const total = cart.reduce((sum: number, item: any) => sum + item.itemTotal * item.quantity, 0);
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Summary" size="lg">
      <div className="space-y-6">
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {cart.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                <p className="text-[10px] text-gray-500 font-bold">₹{item.itemTotal}</p>
              </div>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">
                <button onClick={() => onUpdateQuantity(index, -1)} className="p-1 hover:bg-gray-50 rounded"><Minus className="w-3 h-3" /></button>
                <span className="font-black text-xs">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(index, 1)} className="p-1 hover:bg-gray-50 rounded"><Plus className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-black uppercase text-xs text-gray-400">Total Bill</span>
            <span className="text-2xl font-black text-gray-900">₹{total}</span>
          </div>
          <Button onClick={onCheckout} fullWidth size="lg" className="bg-green-600 hover:bg-green-700 h-14 rounded-xl font-black uppercase">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ItemCustomizationModal: React.FC<any> = ({ isOpen, item, onClose, onAdd }) => {
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  useEffect(() => {
    if (item) {
      setSelectedSize(item.sizes && item.sizes.length > 0 ? item.sizes[0] : null);
      setSelectedAddons([]);
    }
  }, [item]);

  if (!item || !isOpen) return null;

  const toggleAddon = (addon: any) => {
    if (selectedAddons.find((a: any) => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter((a: any) => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateTotal = () => {
    const basePrice = selectedSize ? selectedSize.price : item.base_price;
    const addonsTotal = selectedAddons.reduce((sum: number, addon: any) => sum + addon.price, 0);
    return basePrice + addonsTotal;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name} size="md">
      <div className="space-y-6">
        {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-48 object-cover rounded-xl" />}
        
        {item.sizes && item.sizes.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3">Select Size</h4>
            <div className="grid grid-cols-2 gap-2">
              {item.sizes.map((size: any) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${selectedSize?.name === size.name ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100'}`}
                >
                  {size.name} • ₹{size.price}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.addons && item.addons.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3">Add-ons</h4>
            <div className="space-y-2">
              {item.addons.map((addon: any) => (
                <button
                  key={addon.name}
                  onClick={() => toggleAddon(addon)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all ${selectedAddons.find((a: any) => a.name === addon.name) ? 'border-orange-500 bg-orange-50' : 'border-gray-100'}`}
                >
                  <span className="font-bold text-xs">{addon.name}</span>
                  <span className="font-black text-xs">₹{addon.price}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Item Total</p>
            <p className="text-2xl font-black">₹{calculateTotal()}</p>
          </div>
          <Button onClick={() => onAdd(item, selectedSize, selectedAddons)} className="bg-orange-600 px-8 h-12 rounded-xl font-black uppercase">
            Add to Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const CheckoutModal: React.FC<any> = ({ isOpen, cart, restaurantId, onClose, onSuccess }) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = cart.reduce((sum: number, item: any) => sum + item.itemTotal * item.quantity, 0);
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const orderData = {
      restaurant_id: restaurantId,
      order_type: "qr" as const,
      table_number: tableNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      items: cart.map((item: any) => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        base_price: item.base_price,
        selected_size: item.selectedSize,
        selected_addons: item.selectedAddons,
        item_total: item.itemTotal,
      })),
      subtotal, tax, total,
    };

    const { error } = await createOrder(orderData);
    if (!error) {
      setSuccess(true);
      setTimeout(onSuccess, 2000);
    }
    setLoading(false);
  };

  if (!isOpen) return null;
  if (success) return (
    <Modal isOpen={isOpen} onClose={onClose} title="Success!" size="md">
      <div className="text-center py-10">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-black">Order Placed!</h3>
        <p className="text-gray-500 font-bold">Your food is on the way.</p>
      </div>
    </Modal>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Table No" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} required placeholder="Ex: 5" />
          <Input label="Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="John" />
        </div>
        <Input label="Phone" type="tel" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required placeholder="9876543210" />
        
        <div className="bg-gray-900 text-white rounded-2xl p-5">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
            <span>Bill Amount</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-4 pb-4 border-b border-white/10">
            <span>GST (5%)</span>
            <span>₹{tax}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-xs">To Pay</span>
            <span className="text-2xl font-black">₹{total}</span>
          </div>
        </div>

        <Button type="submit" loading={loading} fullWidth className="bg-green-600 h-14 rounded-xl font-black uppercase">
          Confirm Order
        </Button>
      </form>
    </Modal>
  );
};

export default CustomerMenu;
