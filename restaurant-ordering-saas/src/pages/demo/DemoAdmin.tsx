import React, { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";
import { CheckCircle, XCircle, RefreshCw, LayoutGrid } from "lucide-react";
import { Card, Button, Loading } from "../../components/ui";
import { formatCurrency } from "../../utils/helpers";

interface DemoItem {
  id: string;
  name: string;
  price: number;
  category: string;
  is_available: boolean;
  image_url: string;
}

const DemoAdmin: React.FC = () => {
  const [items, setItems] = useState<DemoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("demo_menu_items")
      .select("*")
      .order("category")
      .order("name");

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("demo_menu_items")
      .update({ is_available: !currentStatus })
      .eq("id", id);

    if (!error) {
      setItems(items.map(item => 
        item.id === id ? { ...item, is_available: !currentStatus } : item
      ));
    }
    setUpdatingId(null);
  };

  if (loading && items.length === 0) return <Loading text="Loading Demo Admin..." />;

  return (
    <div className="min-h-screen bg-bg-subtle p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text flex items-center gap-2">
              <LayoutGrid className="w-8 h-8 text-accent" />
              Demo Admin
            </h1>
            <p className="text-text-secondary">Manage item visibility in real-time</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchItems} 
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh List
          </Button>
        </header>

        <Card className="overflow-hidden !p-0 border-none shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-bg border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Menu Item</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Visibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-secondary italic">
                      No items found in 'demo_menu_items' table.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-bg/5 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {item.image_url && (
                            <img src={item.image_url} className="w-10 h-10 rounded object-cover shadow-sm" alt="" />
                          )}
                          <div className="font-bold text-text">{item.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-bg-subtle rounded text-xs font-medium text-text-secondary">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-bold text-accent">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => toggleAvailability(item.id, item.is_available)}
                          disabled={updatingId === item.id}
                          className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            item.is_available 
                              ? "bg-success text-white shadow-success/20 shadow-lg hover:bg-success-hover" 
                              : "bg-error text-white shadow-error/20 shadow-lg hover:bg-error-hover"
                          } ${updatingId === item.id ? "opacity-50 cursor-not-wait" : ""}`}
                        >
                          {item.is_available ? (
                            <><CheckCircle className="w-4 h-4 mr-2" /> Live</>
                          ) : (
                            <><XCircle className="w-4 h-4 mr-2" /> Hidden</>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
        
        <div className="bg-accent/5 border border-accent/10 rounded-2xl p-6 text-sm text-text-secondary flex gap-4 items-start">
          <RefreshCw className="w-5 h-5 text-accent flex-shrink-0" />
          <p>
            <strong>Pro Tip:</strong> Open the <a href="/demo/menu" target="_blank" className="text-accent font-bold underline">Customer View</a> in a split window. Toggling visibility here will instantly update the customer's screen without a page refresh!
          </p>
        </div>
      </div>
    </div>
  );
};

export default DemoAdmin;
