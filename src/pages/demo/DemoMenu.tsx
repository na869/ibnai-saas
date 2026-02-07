import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";
import { Package } from "lucide-react";
import { Card, Loading, Badge } from "../../components/ui";
import { formatCurrency } from "../../utils/helpers";

interface DemoItem {
  id: string;
  name: string;
  price: number;
  category: string;
  is_available: boolean;
  image_url: string;
}

const DemoMenu: React.FC = () => {
  const [items, setItems] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("demo_menu_items")
      .select("*")
      .eq("is_available", true)
      .order("category");

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();

    // Real-time subscription to demo_menu_items table
    const subscription = supabase
      .channel("demo-menu-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "demo_menu_items" },
        () => {
          fetchItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <Loading text="Loading Demo Menu..." />;

  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <div className="min-h-screen bg-bg-subtle p-4 pb-20">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
            <ShoppingBag className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-2">Demo Menu</h1>
          <p className="text-text-secondary">Real-time Customer View</p>
        </header>

        {items.length === 0 ? (
          <Card className="text-center py-12">
            <Package className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-50" />
            <p className="text-text-secondary">No items available right now.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category} className="space-y-4">
                <h2 className="text-lg font-bold text-text border-b border-border pb-2">
                  {category || "Uncategorized"}
                </h2>
                <div className="grid gap-4">
                  {items
                    .filter((item) => item.category === category)
                    .map((item) => (
                      <Card key={item.id} className="flex gap-4 p-3 hover:shadow-md transition-shadow">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-bg flex items-center justify-center rounded-xl border border-dashed border-border">
                            <Package className="w-8 h-8 text-text-secondary opacity-20" />
                          </div>
                        )}
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <h3 className="font-bold text-text text-lg">{item.name}</h3>
                            <p className="text-sm text-text-secondary line-clamp-1">
                              Delicious {item.category.toLowerCase()} selection
                            </p>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-accent font-bold text-xl">
                              {formatCurrency(item.price)}
                            </span>
                            <Badge variant="success">Available</Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import { ShoppingBag } from "lucide-react";
export default DemoMenu;
