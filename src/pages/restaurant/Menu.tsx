import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Search, 
  Package, 
  ListTree, 
  Utensils, 
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  MoreVertical,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import {
  Card,
  Button,
  Input,
  Badge,
  Modal,
  Loading,
  Textarea,
  ImageUpload,
} from "../../components/ui";
import {
  toggleMenuItemAvailability,
  subscribeToMenuData,
} from "../../services/restaurantService";
import { supabase } from "../../config/supabase";
import type { MenuItem } from "../../config/supabase";
import { formatCurrency, getMenuItemLimit, hasFeature } from "../../utils/helpers";
import { APP_CONFIG } from "../../config/config";

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [showCatModal, setShowCatModal] = useState(false);
  const [showCatDeleteModal, setShowCatDeleteModal] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.restaurant_id) return;

    const fetchRestaurant = async () => {
      const { data } = await supabase
        .from("restaurants")
        .select("*")
        .eq("id", user.restaurant_id)
        .single();
      setRestaurant(data);
    };

    fetchRestaurant();

    const subscription = subscribeToMenuData(user.restaurant_id, (data) => {
      setMenuItems(data.items);
      setMenuCategories(data.categories);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const categoryNames = [
    "all",
    ...menuCategories.map(c => c.name),
  ];

  const filteredItems = menuItems.filter((item) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const categoryName = item.category_id 
      ? menuCategories.find(c => c.id === item.category_id)?.name 
      : item.category;

    if (!searchLower) return categoryFilter === "all" || categoryName === categoryFilter;

    const matchesSearch = 
      item.name.toLowerCase().includes(searchLower) ||
      (categoryName && categoryName.toLowerCase().includes(searchLower)) ||
      (item.description && item.description.toLowerCase().includes(searchLower));
    
    const matchesCategory =
      categoryFilter === "all" || categoryName === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleToggleAvailability = async (item: MenuItem) => {
    await toggleMenuItemAvailability(item.id, !item.is_available);
  };

  const handleEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item: MenuItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading text="Syncing digital catalog..." />
    </div>
  );

  const itemLimit = getMenuItemLimit(restaurant?.subscription_plan);
  const isLimitReached = menuItems.length >= itemLimit;

  return (
    <div className="space-y-10 animate-in-up">
      {/* Plan Limit Warning */}
      {isLimitReached && (
        <div className="bg-amber-50 border-2 border-amber-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-amber-900/5">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-100 rounded-[24px] flex items-center justify-center text-amber-600 shadow-inner">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-black text-amber-900 tracking-tight mb-1 uppercase italic">Inventory Threshold Reached</h4>
              <p className="text-amber-700 font-bold text-sm uppercase tracking-widest opacity-80">Your {APP_CONFIG.plans[restaurant?.subscription_plan as keyof typeof APP_CONFIG.plans]?.name || "Starter"} plan is limited to {itemLimit} items.</p>
            </div>
          </div>
          <Link to="/restaurant/billing">
            <Button className="h-14 px-8 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-amber-600/30">
              Upgrade Capacity
            </Button>
          </Link>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-5 h-5 text-emerald-600" />
             </div>
             <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">Asset Management</p>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">Menu Infrastructure</h1>
          <p className="text-slate-500 font-medium text-lg">Design, categorize, and deploy your culinary assets.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === "categories" ? (
            <Button
              className="h-16 px-8 rounded-2xl bg-slate-900 text-white hover:bg-black font-black uppercase text-xs tracking-widest shadow-xl shadow-slate-900/20"
              icon={<Plus className="w-5 h-5" />}
              onClick={() => {
                setSelectedCategory(null);
                setShowCatModal(true);
              }}
            >
              New Category
            </Button>
          ) : (
            <Button
              className={`h-16 px-8 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all ${
                isLimitReached 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
              icon={<Plus className="w-5 h-5" />}
              disabled={isLimitReached}
              onClick={() => setShowAddModal(true)}
            >
              Deploy New Asset
            </Button>
          )}
        </div>
      </div>

      {/* Tab System */}
      <div className="flex gap-4 p-1.5 bg-slate-100 rounded-[24px] w-fit border border-slate-200/50">
        <button
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === "items" 
              ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-105" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Utensils className="w-4 h-4" />
          Culinary Items
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-3 px-8 py-4 rounded-[20px] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
            activeTab === "categories" 
              ? "bg-white text-slate-900 shadow-xl shadow-slate-200/50 scale-105" 
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <ListTree className="w-4 h-4" />
          Taxonomy
        </button>
      </div>

      {activeTab === "items" ? (
        <div className="space-y-10">
          {/* Intelligence Bar */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search inventory ID, name, or flavor profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="h-16 rounded-[24px] border-2 border-slate-100 bg-white shadow-xl shadow-slate-200/30"
              />
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
              {categoryNames.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category || "all")}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-2 h-16 ${
                    categoryFilter === category
                      ? "bg-slate-900 text-white border-slate-900 shadow-lg"
                      : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                  }`}
                >
                  {category === "all" ? "All Assets" : category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] mb-8 flex items-center justify-center text-slate-200">
                <Package className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Zero Matches Found</h3>
              <p className="text-slate-400 font-medium mb-10 max-w-xs mx-auto uppercase text-xs tracking-widest">Your search yielded no culinary results.</p>
              <Button onClick={() => setShowAddModal(true)} variant="outline" className="h-14 rounded-2xl border-2 border-slate-200 px-10">Reset Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
              {filteredItems.map((item) => {
                const itemCategory = item.category_id 
                  ? menuCategories.find(c => c.id === item.category_id)?.name 
                  : item.category;

                return (
                  <Card
                    key={item.id}
                    className={`flex flex-col h-full border-none shadow-xl shadow-slate-200/40 overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 ${
                      !item.is_available ? "opacity-60 grayscale scale-[0.98]" : ""
                    }`}
                    noPadding
                  >
                    <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-50">
                           <ImageIcon className="w-16 h-16" />
                        </div>
                      )}
                      <div className="absolute top-6 right-6 flex gap-2">
                        <div className={`px-4 py-2 rounded-xl backdrop-blur-xl border border-white/20 shadow-2xl font-black uppercase text-[9px] tracking-[0.2em] ${item.is_available ? 'bg-emerald-500/80 text-white' : 'bg-slate-900/80 text-white'}`}>
                          {item.is_available ? "Deployed" : "Offline"}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="mb-6">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2">{itemCategory || "General"}</p>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none group-hover:text-emerald-600 transition-colors italic">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-500 font-bold line-clamp-2 mb-8 flex-1 leading-relaxed uppercase tracking-tight opacity-70">
                        {item.description || "Culinary asset technical description omitted."}
                      </p>

                      <div className="flex items-center justify-between pt-8 border-t-2 border-slate-50 mt-auto">
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">
                          {formatCurrency(item.base_price)}
                        </span>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleToggleAvailability(item)}
                            className="w-12 h-12 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
                            title={item.is_available ? "Offline Mode" : "Go Live"}
                          >
                            {item.is_available ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="w-12 h-12 rounded-[14px] bg-slate-50 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white transition-all duration-300 shadow-sm"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="w-12 h-12 rounded-[14px] bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          <div className="bg-slate-900 text-white p-10 rounded-[40px] border-none shadow-2xl shadow-emerald-900/20 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
               <ListTree className="w-48 h-48" />
            </div>
            <div className="w-24 h-24 bg-emerald-600 rounded-[32px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/20 relative z-10">
              <ListTree className="w-12 h-12 text-white" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase italic">Taxonomy Architecture</h3>
              <p className="text-slate-400 font-bold leading-relaxed text-sm uppercase tracking-widest opacity-80">
                Optimized grouping logic increases average ticket size by <span className="text-emerald-400">18.5%</span>. Strategic categorization reduces cognitive friction for customers.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {menuCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
                <ListTree className="w-16 h-16 text-slate-200 mb-6" />
                <h3 className="text-xl font-black text-slate-900 mb-8 tracking-tight uppercase">Structure Empty</h3>
                <Button onClick={() => setShowCatModal(true)} className="h-14 px-10 rounded-2xl bg-slate-900 text-white">Initialize Hierarchy</Button>
              </div>
            ) : (
              menuCategories.sort((a,b) => (a.display_order || 0) - (b.display_order || 0)).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-8 bg-white rounded-[32px] hover:border-emerald-600/20 transition-all border-2 border-transparent shadow-xl shadow-slate-200/30 group">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-2xl border-2 border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                      {cat.display_order || 0}
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">{cat.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{cat.description || "Technical metadata omitted."}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      className="rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase h-12 border-slate-100"
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCatModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase h-12 text-red-500 hover:bg-red-50 border-red-50"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCatDeleteModal(true);
                      }}
                    >
                      Purge
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals integrated with new design system */}
      <MenuItemModal
        isOpen={showAddModal}
        categories={menuCategories}
        onClose={() => setShowAddModal(false)}
        mode="add"
      />

      <MenuItemModal
        isOpen={showEditModal}
        item={selectedItem}
        categories={menuCategories}
        onClose={() => {
          setShowEditModal(false);
          setSelectedItem(null);
        }}
        mode="edit"
      />

      <CategoryModal 
        isOpen={showCatModal}
        category={selectedCategory}
        onClose={() => {
          setShowCatModal(false);
          setSelectedCategory(null);
        }}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        item={selectedItem}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
      />

      <CategoryDeleteModal
        isOpen={showCatDeleteModal}
        category={selectedCategory}
        onClose={() => {
          setShowCatDeleteModal(false);
          setSelectedCategory(null);
        }}
      />
    </div>
  );
};

// --- SUBCOMPONENTS (Styled to Billion Dollar Standards) ---

const CategoryModal: React.FC<{ isOpen: boolean; category?: any; onClose: () => void }> = ({
  isOpen, category, onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "", display_order: "0" });

  useEffect(() => {
    if (category) {
      setFormData({ 
        name: category.name, 
        description: category.description || "", 
        display_order: (category.display_order || 0).toString() 
      });
    } else {
      setFormData({ name: "", description: "", display_order: "0" });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    const catData = {
      restaurant_id: user.restaurant_id,
      name: formData.name,
      description: formData.description,
      display_order: parseInt(formData.display_order),
    };

    if (category) await supabase.from("menu_categories").update(catData).eq("id", category.id);
    else await supabase.from("menu_categories").insert([catData]);

    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? "Optimize Taxonomy" : "Initialize Hierarchy"} size="md">
      <form onSubmit={handleSubmit} className="p-6 space-y-10">
        <Input 
          label="Operational ID" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="e.g. Signature Selection"
          required 
        />
        <Textarea 
          label="Strategic Metadata" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          placeholder="Detailed asset classification..."
          rows={3}
        />
        <Input 
          label="Sequence Priority" 
          type="number"
          value={formData.display_order} 
          onChange={e => setFormData({...formData, display_order: e.target.value})} 
        />
        <Button type="submit" fullWidth loading={loading} className="h-20 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/30 text-xs">
          {category ? "Commit Structural Change" : "Initialize Asset Group"}
        </Button>
      </form>
    </Modal>
  );
};

const CategoryDeleteModal: React.FC<{ isOpen: boolean; category: any; onClose: () => void }> = ({
  isOpen, category, onClose
}) => {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    await supabase.from("menu_categories").delete().eq("id", category.id);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Danger Protocol">
      <div className="p-6 space-y-10">
        <div className="bg-red-50 p-8 rounded-[32px] border-2 border-red-100 flex flex-col items-center text-center gap-6">
           <Trash2 className="w-16 h-16 text-red-500" />
           <p className="text-sm font-bold text-red-800 leading-loose uppercase tracking-widest">
             You are about to purge <span className="font-black underline decoration-red-500 underline-offset-8">{category?.name}</span>. Associated assets will enter an uncategorized state.
           </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" fullWidth onClick={onClose} className="h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200">Abort</Button>
          <Button variant="danger" fullWidth onClick={handleDelete} loading={loading} className="h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/30 bg-red-600">Confirm Purge</Button>
        </div>
      </div>
    </Modal>
  );
};

interface MenuItemModalProps {
  isOpen: boolean;
  item?: MenuItem | null;
  categories: any[];
  onClose: () => void;
  mode: "add" | "edit";
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
  isOpen,
  item,
  categories,
  onClose,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    base_price: "",
    image_url: "",
    is_available: true,
    sizes: [] as { name: string; price: number }[],
    addons: [] as { name: string; price: number }[],
  });

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && item) {
      setFormData({
        name: item.name,
        description: item.description || "",
        category_id: item.category_id || "",
        base_price: item.base_price.toString(),
        image_url: item.image_url || "",
        is_available: item.is_available,
        sizes: item.sizes || [],
        addons: item.addons || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        category_id: "",
        base_price: "",
        image_url: "",
        is_available: true,
        sizes: [],
        addons: [],
      });
    }
  }, [mode, item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const menuItemData = {
      restaurant_id: user.restaurant_id,
      name: formData.name,
      description: formData.description || undefined,
      category_id: formData.category_id || null,
      base_price: parseFloat(formData.base_price),
      image_url: formData.image_url || undefined,
      is_available: formData.is_available,
      sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
      addons: formData.addons.length > 0 ? formData.addons : undefined,
    };

    if (mode === "add") await supabase.from("menu_items").insert([menuItemData]);
    else if (item) await supabase.from("menu_items").update(menuItemData).eq("id", item.id);

    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Design New Asset" : "Refine Culinary Asset"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-12">
        <div className="space-y-10">
           <Input
            label="Culinary Identity"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Platinum Grade Ribeye"
            required
          />

          <Textarea
            label="Market Positioning (Description)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the value proposition..."
            rows={3}
          />

          <div className="grid sm:grid-cols-2 gap-10">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 ml-1">Asset Classification</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full h-16 rounded-[20px] border-2 border-slate-100 bg-white px-6 font-bold text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm"
              >
                <option value="">Unclassified</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Asset Valuation (INR)"
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <ImageUpload
            label="Visual Metadata"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            bucket="menu-items"
            path={user.restaurant_id}
          />

          {/* Availability Switch */}
          <div className="flex items-center gap-6 p-8 bg-slate-50 rounded-[32px] border-2 border-slate-100/50 shadow-inner">
             <div 
               className={`w-16 h-8 rounded-full relative transition-all duration-500 cursor-pointer p-1 shadow-inner ${formData.is_available ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-slate-300'}`} 
               onClick={() => setFormData({...formData, is_available: !formData.is_available})}
             >
                <div className={`w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-lg ${formData.is_available ? 'translate-x-8' : 'translate-x-0'}`} />
             </div>
             <div>
                <p className="font-black text-slate-900 leading-none mb-1.5 uppercase italic text-sm tracking-tight">Active Deployment</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Toggle real-time marketplace presence</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 pt-10 border-t-2 border-slate-50">
          <Button type="button" variant="outline" onClick={onClose} className="h-20 rounded-3xl font-black uppercase tracking-widest text-[10px] border-slate-200">Discard</Button>
          <Button type="submit" loading={loading} className="h-20 rounded-3xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-900/30">
            {mode === "add" ? "Deploy Asset" : "Commit Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const DeleteModal: React.FC<{ isOpen: boolean; item: MenuItem | null; onClose: () => void }> = ({ isOpen, item, onClose }) => {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!item) return;
    setLoading(true);
    await supabase.from("menu_items").delete().eq("id", item.id);
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Asset Liquidation">
      <div className="p-6 space-y-10">
        <div className="bg-red-50 p-8 rounded-[32px] border-2 border-red-100 flex flex-col items-center text-center gap-6">
           <Trash2 className="w-16 h-16 text-red-500" />
           <p className="text-sm font-bold text-red-800 leading-loose uppercase tracking-widest">
             You are initiating the permanent liquidation of <span className="font-black underline decoration-red-500 underline-offset-8">{item?.name}</span>. This procedure is non-reversible.
           </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" fullWidth onClick={onClose} className="h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] border-slate-200">Retain Asset</Button>
          <Button variant="danger" fullWidth onClick={handleDelete} loading={loading} className="h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/30 bg-red-600">Execute Liquidation</Button>
        </div>
      </div>
    </Modal>
  );
};

export default Menu;