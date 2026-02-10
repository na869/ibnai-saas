import React, { useEffect, useState } from "react";
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
  CheckCircle2
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
import { formatCurrency } from "../../utils/helpers";

const Menu: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"items" | "categories">("items");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<any[]>([]);
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
      <Loading text="Building your digital catalog..." />
    </div>
  );

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantType = user?.restaurant?.type || "Restaurant";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest mb-3">
             <TrendingUp className="w-3 h-3" /> Inventory Live
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Menu Manager</h1>
          <p className="text-slate-500 font-medium mt-1">Design, edit, and organize your digital catalog.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTab === "categories" ? (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setSelectedCategory(null);
                setShowCatModal(true);
              }}
            >
              Add Category
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add New Item
            </Button>
          )}
        </div>
      </div>

      {/* Modern Tab System */}
      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === "items" 
              ? "bg-white text-slate-900 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <Utensils className="w-4 h-4" />
          Menu Items
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
            activeTab === "categories" 
              ? "bg-white text-slate-900 shadow-sm" 
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <ListTree className="w-4 h-4" />
          Categories
        </button>
      </div>

      {activeTab === "items" ? (
        <div className="space-y-10">
          {/* Search & Intelligence Bar */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Input
                placeholder="Search items, ingredients, or descriptions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
                className="border-none shadow-xl shadow-slate-200/50"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {categoryNames.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category || "all")}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                    categoryFilter === category
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-400 border-slate-50 hover:border-slate-200"
                  }`}
                >
                  {category === "all" ? "All Items" : category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Grid */}
          {filteredItems.length === 0 ? (
            <Card className="text-center py-32 border-none shadow-inner bg-slate-50/50">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-lg mx-auto mb-6 flex items-center justify-center text-slate-200">
                <Package className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No items match your search</h3>
              <p className="text-slate-400 font-medium mb-8">Adjust your filters or add a new dish to your menu.</p>
              <Button onClick={() => setShowAddModal(true)} variant="outline">Create New Item</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredItems.map((item) => {
                const itemCategory = item.category_id 
                  ? menuCategories.find(c => c.id === item.category_id)?.name 
                  : item.category;

                return (
                  <Card
                    key={item.id}
                    hover
                    className={`flex flex-col h-full border-none shadow-xl shadow-slate-200/50 overflow-hidden group ${
                      !item.is_available ? "opacity-60 grayscale" : ""
                    }`}
                  >
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                           <ImageIcon className="w-12 h-12" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Badge variant={item.is_available ? "success" : "neutral"} className="shadow-lg backdrop-blur-md font-black uppercase text-[10px]">
                          {item.is_available ? "Active" : "Hidden"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col">
                      <div className="mb-4">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">{itemCategory || "General"}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-emerald-600 transition-colors">
                          {item.name}
                        </h3>
                      </div>

                      <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 flex-1">
                        {item.description || "No description provided for this item."}
                      </p>

                      <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-auto">
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">
                          {formatCurrency(item.base_price)}
                        </span>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-10 h-10 p-0 rounded-xl"
                            onClick={() => handleToggleAvailability(item)}
                            title={item.is_available ? "Hide Item" : "Show Item"}
                          >
                            {item.is_available ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-10 h-10 p-0 rounded-xl"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-10 h-10 p-0 rounded-xl text-red-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleDelete(item)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
          <div className="bg-slate-900 text-white p-8 rounded-[32px] border-none shadow-2xl shadow-emerald-600/10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-emerald-600 rounded-[28px] flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-600/20">
              <ListTree className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2 tracking-tight">Taxonomy Architecture</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                Clean organization increases average order value by <span className="text-emerald-400 font-black">15%</span>. Group items logically to help customers navigate your menu faster.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {menuCategories.length === 0 ? (
              <Card className="text-center py-20 border-none shadow-inner bg-slate-50/50">
                <ListTree className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-6 tracking-tight">No categories defined</h3>
                <Button onClick={() => setShowCatModal(true)}>Add Your First Category</Button>
              </Card>
            ) : (
              menuCategories.sort((a,b) => (a.display_order || 0) - (b.display_order || 0)).map((cat) => (
                <Card key={cat.id} className="flex items-center justify-between p-6 hover:border-emerald-600/20 transition-all border-2 border-transparent shadow-xl shadow-slate-200/40">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-400 text-xl border border-slate-100">
                      {cat.display_order || 0}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900 tracking-tight">{cat.name}</h4>
                      <p className="text-sm text-slate-400 font-medium">{cat.description || "No description provided."}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl font-black text-[10px] tracking-widest uppercase"
                      icon={<Edit className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCatModal(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-xl font-black text-[10px] tracking-widest uppercase text-red-500 hover:bg-red-50 border-red-100"
                      icon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setShowCatDeleteModal(true);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
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
    <Modal isOpen={isOpen} onClose={onClose} title={category ? "Edit Structure" : "New Category"} size="md">
      <form onSubmit={handleSubmit} className="p-4 space-y-8">
        <Input 
          label="Category Identity" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="e.g. Signature Starters"
          required 
        />
        <Textarea 
          label="Contextual Description" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          placeholder="How should customers perceive this section?"
          rows={3}
        />
        <Input 
          label="Sequence Priority" 
          type="number"
          value={formData.display_order} 
          onChange={e => setFormData({...formData, display_order: e.target.value})} 
        />
        <Button type="submit" fullWidth loading={loading} className="h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20">
          {category ? "Commit Changes" : "Create Category"}
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
    <Modal isOpen={isOpen} onClose={onClose} title="Danger Zone">
      <div className="p-4 space-y-8">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4">
           <Trash2 className="w-8 h-8 text-red-500 flex-shrink-0" />
           <p className="text-sm font-bold text-red-800 leading-relaxed">
             You are about to delete <span className="font-black underline">{category?.name}</span>. All items associated with this category will become uncategorized.
           </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" fullWidth onClick={onClose} className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs">Retreat</Button>
          <Button variant="danger" fullWidth onClick={handleDelete} loading={loading} className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20">Confirm Delete</Button>
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

  const [newSize, setNewSize] = useState({ name: "", price: "" });
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });

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
      title={mode === "add" ? "Design New Menu Item" : "Refine Menu Item"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-10">
        <div className="space-y-8">
           <Input
            label="Item Title"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Premium Signature Burger"
            required
          />

          <Textarea
            label="Persuasive Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Use adjectives that trigger hunger..."
            rows={3}
          />

          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Classification</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full h-14 rounded-2xl border-2 border-slate-100 bg-white px-6 font-bold text-slate-900 focus:border-emerald-600 focus:outline-none transition-all"
              >
                <option value="">Uncategorized</option>
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Standard Valuation (INR)"
              type="number"
              step="0.01"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <ImageUpload
            label="Visual Asset"
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            bucket="menu-items"
            path={user.restaurant_id}
          />

          {/* Availability Logic */}
          <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[28px] border border-slate-100">
             <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${formData.is_available ? 'bg-emerald-600' : 'bg-slate-300'}`} onClick={() => setFormData({...formData, is_available: !formData.is_available})}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_available ? 'left-7' : 'left-1'}`} />
             </div>
             <div>
                <p className="font-black text-slate-900 leading-none mb-1">Live Availability</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enable or disable ordering instantly</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs">Discard</Button>
          <Button type="submit" loading={loading} className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20">
            {mode === "add" ? "Create Asset" : "Commit Changes"}
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
      <div className="p-4 space-y-8">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 flex gap-4">
           <Trash2 className="w-8 h-8 text-red-500 flex-shrink-0" />
           <p className="text-sm font-bold text-red-800 leading-relaxed">
             You are about to permanently delete <span className="font-black underline">{item?.name}</span>. This action is irreversible and will remove the item from all customer menus.
           </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" fullWidth onClick={onClose} className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs">Retreat</Button>
          <Button variant="danger" fullWidth onClick={handleDelete} loading={loading} className="h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-red-500/20">Execute Deletion</Button>
        </div>
      </div>
    </Modal>
  );
};

export default Menu;
