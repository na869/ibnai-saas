import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Package, ListTree, Utensils } from "lucide-react";
import {
  Card,
  Button,
  Input,
  Badge,
  Modal,
  Loading,
  Alert,
  Textarea,
  ImageUpload,
} from "../../components/ui";
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
  subscribeToMenuData,
} from "../../services/restaurantService";
import { supabase } from "../../config/supabase";
import type { MenuItem } from "../../config/supabase";
import { formatCurrency } from "../../utils/helpers";

import { APP_CONFIG } from "../../config/config";

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
    
    // Find category name from ID if needed
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

  if (loading) {
    return <Loading text="Loading menu..." />;
  }

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantType = user?.restaurant?.type || "Restaurant";

  const getCustomTitle = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower === "bakery") return "Bake Items Management";
    if (typeLower === "cafe") return "Cafe Menu Management";
    return "Menu Management";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">
            {getCustomTitle(restaurantType)}
          </h2>
          <p className="text-text-secondary">
            Manage your {restaurantType.toLowerCase()} categories and items
          </p>
        </div>
        
        <div className="flex gap-2">
          {activeTab === "categories" ? (
            <Button
              icon={<Plus className="w-5 h-5" />}
              onClick={() => {
                setSelectedCategory(null);
                setShowCatModal(true);
              }}
            >
              Add Type
            </Button>
          ) : (
            <Button
              icon={<Plus className="w-5 h-5" />}
              onClick={() => setShowAddModal(true)}
            >
              {restaurantType === "Bakery" ? "Add Bake Item" : "Add Item"}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-6 py-3 font-bold text-sm transition-colors flex items-center gap-2 ${
            activeTab === "items" 
              ? "border-b-2 border-accent text-accent" 
              : "text-text-secondary hover:text-text"
          }`}
        >
          <Utensils className="w-4 h-4" />
          Menu Items
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-3 font-bold text-sm transition-colors flex items-center gap-2 ${
            activeTab === "categories" 
              ? "border-b-2 border-accent text-accent" 
              : "text-text-secondary hover:text-text"
          }`}
        >
          <ListTree className="w-4 h-4" />
          Item Types (Categories)
        </button>
      </div>

      {activeTab === "items" ? (
        <div className="space-y-6">
          {/* Real-time indicator */}
          <div className="flex items-center space-x-2 text-sm text-success">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span>
              Live updates • Availability changes update customers in real-time
            </span>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryNames.map((category) => (
                <button
                  key={category}
                  onClick={() => setCategoryFilter(category || "all")}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === category
                      ? "bg-accent text-white"
                      : "bg-white border border-border text-text-secondary hover:bg-bg-subtle"
                  }`}
                >
                  {category === "all" ? "All Items" : category}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items List */}
          {filteredItems.length === 0 ? (
            <Card className="text-center py-12">
              <Package className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-text mb-2">
                No Menu Items Found
              </h3>
              <p className="text-text-secondary mb-4">
                {searchTerm || categoryFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start by adding your first menu item"}
              </p>
              <Button
                icon={<Plus className="w-5 h-5" />}
                onClick={() => setShowAddModal(true)}
              >
                Add First Item
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredItems.map((item) => {
                const itemCategory = item.category_id 
                  ? menuCategories.find(c => c.id === item.category_id)?.name 
                  : item.category;

                return (
                  <Card
                    key={item.id}
                    className={`hover:shadow-lg transition-shadow ${
                      !item.is_available ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      {/* Image */}
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full lg:w-32 h-32 object-cover rounded-lg"
                        />
                      )}

                      {/* Details */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-lg font-bold text-text">
                                {item.name}
                              </h3>
                              <Badge
                                variant={item.is_available ? "success" : "neutral"}
                              >
                                {item.is_available ? "Available" : "Unavailable"}
                              </Badge>
                            </div>
                            {itemCategory && (
                              <Badge variant="neutral" className="text-xs">
                                {itemCategory}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {item.description && (
                          <p className="text-text-secondary text-sm">
                            {item.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div>
                            <span className="text-text-secondary">Base Price: </span>
                            <span className="text-accent font-semibold text-lg">
                              {formatCurrency(item.base_price)}
                            </span>
                          </div>

                          {item.sizes && item.sizes.length > 0 && (
                            <div>
                              <span className="text-text-secondary">Sizes: </span>
                              <span className="text-text">
                                {item.sizes.map((s) => s.name).join(", ")}
                              </span>
                            </div>
                          )}

                          {item.addons && item.addons.length > 0 && (
                            <div>
                              <span className="text-text-secondary">Add-ons: </span>
                              <span className="text-text">
                                {item.addons.length} available
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
                        <Button
                          size="sm"
                          variant={item.is_available ? "outline" : "secondary"}
                          icon={
                            item.is_available ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )
                          }
                          onClick={() => handleToggleAvailability(item)}
                          fullWidth
                        >
                          {item.is_available ? "Mark Unavailable" : "Mark Available"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Edit className="w-4 h-4" />}
                          onClick={() => handleEdit(item)}
                          fullWidth
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDelete(item)}
                          fullWidth
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Category Management Tab */}
          <div className="bg-accent/5 p-4 rounded-xl border border-accent/10 mb-6">
            <h3 className="font-bold text-accent mb-1 flex items-center gap-2">
              <ListTree className="w-4 h-4" /> Professional Tip
            </h3>
            <p className="text-sm text-text-secondary">
              Organizing your menu into clear types (like Starters, Drinks, Main Course) makes it easier for customers to find what they want.
            </p>
          </div>

          <div className="grid gap-4">
            {menuCategories.length === 0 ? (
              <Card className="text-center py-12">
                <ListTree className="w-16 h-16 text-text-secondary mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold text-text mb-2">No Item Types Defined</h3>
                <p className="text-text-secondary mb-6">Create your first category to start organizing your menu professionally.</p>
                <Button onClick={() => setShowCatModal(true)}>Add First Category</Button>
              </Card>
            ) : (
              menuCategories.sort((a,b) => (a.display_order || 0) - (b.display_order || 0)).map((cat) => (
                <Card key={cat.id} className="flex items-center justify-between p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-bg-subtle rounded-lg flex items-center justify-center font-bold text-text">
                      {cat.display_order || 0}
                    </div>
                    <div>
                      <h4 className="font-bold text-text">{cat.name}</h4>
                      <p className="text-xs text-text-secondary">{cat.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
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
                      size="sm" 
                      className="text-error border-error/20 hover:bg-error/5"
                      icon={<Trash2 className="w-4 h-4" />}
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

      {/* Add/Edit Menu Item Modals */}
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

      {/* Category Modal */}
      <CategoryModal 
        isOpen={showCatModal}
        category={selectedCategory}
        onClose={() => {
          setShowCatModal(false);
          setSelectedCategory(null);
        }}
      />

      {/* Delete Item Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        item={selectedItem}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedItem(null);
        }}
      />

      {/* Delete Category Modal */}
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

// Category Modal Component
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

    let error;
    if (category) {
      const { error: err } = await supabase.from("menu_categories").update(catData).eq("id", category.id);
      error = err;
    } else {
      const { error: err } = await supabase.from("menu_categories").insert([catData]);
      error = err;
    }

    setLoading(false);
    if (!error) onClose();
    else alert(error.message);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={category ? "Edit Category" : "Add New Category"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input 
          label="Category Name" 
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="e.g. Starters, Non-Veg Main Course"
          required 
        />
        <Textarea 
          label="Description (Optional)" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          placeholder="Briefly describe this category..."
        />
        <Input 
          label="Display Order (Sort)" 
          type="number"
          value={formData.display_order} 
          onChange={e => setFormData({...formData, display_order: e.target.value})} 
        />
        <Button type="submit" fullWidth loading={loading}>
          {category ? "Update Category" : "Create Category"}
        </Button>
      </form>
    </Modal>
  );
};

// Category Delete Modal
const CategoryDeleteModal: React.FC<{ isOpen: boolean; category: any; onClose: () => void }> = ({
  isOpen, category, onClose
}) => {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    setLoading(true);
    const { error } = await supabase.from("menu_categories").delete().eq("id", category.id);
    setLoading(false);
    if (!error) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Category">
      <div className="space-y-4">
        <Alert type="warning" message={`Are you sure you want to delete "${category?.name}"? Items in this category will be moved to 'Others'.`} />
        <div className="flex gap-2">
          <Button variant="outline" fullWidth onClick={onClose}>Cancel</Button>
          <Button variant="danger" fullWidth onClick={handleDelete} loading={loading}>Delete</Button>
        </div>
      </div>
    </Modal>
  );
};

// Menu Item Modal (Add/Edit)
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
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const restaurantType = user?.restaurant?.type || "Restaurant";
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
    setError("");

    if (!formData.name || !formData.base_price) {
      setError("Name and base price are required");
      return;
    }

    if (!user.restaurant_id) {
      setError("Restaurant ID not found");
      return;
    }

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

    let success = false;
    if (mode === "add") {
      const { error: err } = await supabase.from("menu_items").insert([menuItemData]);
      success = !err;
    } else if (item) {
      const { error: err } = await supabase.from("menu_items").update(menuItemData).eq("id", item.id);
      success = !err;
    }

    setLoading(false);

    if (success) {
      onClose();
    } else {
      setError(`Failed to ${mode} menu item`);
    }
  };

  const addSize = () => {
    if (newSize.name && newSize.price) {
      setFormData({
        ...formData,
        sizes: [
          ...formData.sizes,
          { name: newSize.name, price: parseFloat(newSize.price) },
        ],
      });
      setNewSize({ name: "", price: "" });
    }
  };

  const removeSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index),
    });
  };

  const addAddon = () => {
    if (newAddon.name && newAddon.price) {
      setFormData({
        ...formData,
        addons: [
          ...formData.addons,
          { name: newAddon.name, price: parseFloat(newAddon.price) },
        ],
      });
      setNewAddon({ name: "", price: "" });
    }
  };

  const removeAddon = (index: number) => {
    setFormData({
      ...formData,
      addons: formData.addons.filter((_, i) => i !== index),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "add" ? "Add Menu Item" : "Edit Menu Item"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <Alert type="error" message={error} />}

        <Input
          label="Item Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Margherita Pizza"
          required
        />

        <Textarea
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe your item..."
          rows={2}
        />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label mb-1 font-semibold text-text">Item Type (Category)</label>
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full rounded-lg border border-border bg-white px-4 py-2 text-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all"
            >
              <option value="">Uncategorized</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-text-secondary mt-1">
              Select from your defined types or create new ones in the Categories tab.
            </p>
          </div>

          <Input
            label="Base Price"
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) =>
              setFormData({ ...formData, base_price: e.target.value })
            }
            placeholder="0.00"
            required
          />
        </div>

        <ImageUpload
          label="Item Image"
          value={formData.image_url}
          onChange={(url) => setFormData({ ...formData, image_url: url })}
          bucket="menu-items"
          path={user.restaurant_id}
          helperText="Upload a high-quality photo of your dish"
        />

        {/* Sizes */}
        <div>
          <label className="label mb-3">Sizes (Optional)</label>
          <div className="space-y-2 mb-3">
            {formData.sizes.map((size, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-bg-subtle rounded-lg"
              >
                <span className="text-text">
                  {size.name} - {formatCurrency(size.price)}
                </span>
                <button
                  type="button"
                  onClick={() => removeSize(index)}
                  className="text-error hover:bg-error/10 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Size name"
              value={newSize.name}
              onChange={(e) => setNewSize({ ...newSize, name: e.target.value })}
            />
            <Input
              placeholder="Price"
              type="number"
              step="0.01"
              value={newSize.price}
              onChange={(e) =>
                setNewSize({ ...newSize, price: e.target.value })
              }
            />
            <Button type="button" onClick={addSize} variant="outline">
              Add
            </Button>
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <label className="label mb-3">Add-ons (Optional)</label>
          <div className="space-y-2 mb-3">
            {formData.addons.map((addon, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-bg-subtle rounded-lg"
              >
                <span className="text-text">
                  {addon.name} - +{formatCurrency(addon.price)}
                </span>
                <button
                  type="button"
                  onClick={() => removeAddon(index)}
                  className="text-error hover:bg-error/10 p-1 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Add-on name"
              value={newAddon.name}
              onChange={(e) =>
                setNewAddon({ ...newAddon, name: e.target.value })
              }
            />
            <Input
              placeholder="Price"
              type="number"
              step="0.01"
              value={newAddon.price}
              onChange={(e) =>
                setNewAddon({ ...newAddon, price: e.target.value })
              }
            />
            <Button type="button" onClick={addAddon} variant="outline">
              Add
            </Button>
          </div>
        </div>

        {/* Availability */}
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_available}
            onChange={(e) =>
              setFormData({ ...formData, is_available: e.target.checked })
            }
            className="rounded border-border"
          />
          <span className="text-text">Available for ordering</span>
        </label>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" loading={loading} fullWidth>
            {mode === "add" ? "Add Item" : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Delete Modal
interface DeleteModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, item, onClose }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!item) return;

    setLoading(true);
    const success = await deleteMenuItem(item.id);
    setLoading(false);

    if (success) {
      onClose();
    }
  };

  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Menu Item" size="md">
      <div className="space-y-4">
        <Alert
          type="warning"
          message={`Are you sure you want to delete "${item.name}"? This action cannot be undone.`}
        />

        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} fullWidth>Cancel</Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={loading}
            fullWidth
          >
            Delete Item
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default Menu;