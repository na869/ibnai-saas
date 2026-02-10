import React from "react";
import { Plus, Minus, Star, Package, TrendingUp } from "lucide-react";
import type { MenuItem } from "../../config/supabase";

interface MenuItemCardProps {
  item: MenuItem;
  quantity: number;
  onAdd: (item: MenuItem) => void;
  onRemove: (itemId: string) => void;
  isVeg: boolean;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  quantity,
  onAdd,
  onRemove,
  isVeg,
}) => {
  const hasVariations = (item.sizes && item.sizes.length > 0) || (item.addons && item.addons.length > 0);
  const isBestseller = item.name.toLowerCase().includes("special") || item.name.toLowerCase().includes("signature");

  return (
    <div className="flex gap-6 relative group pb-10 border-b border-slate-50 last:border-0 last:pb-0">
      {/* Visual Identity Marker */}
      <div className={`absolute top-0 -left-4 w-1 h-12 rounded-full transition-all duration-500 opacity-0 group-hover:opacity-100 ${isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />

      {/* Product Intelligence Section */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-3">
          {/* Regulatory Dietary Markers */}
          <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center flex-shrink-0 ${isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
            <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
          </div>
          
          {isBestseller && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <TrendingUp className="w-3 h-3 text-amber-600" />
              <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">High Volume Asset</span>
            </div>
          )}
        </div>

        <h3 className="font-black text-slate-900 text-xl md:text-2xl tracking-tighter mb-2 group-hover:text-emerald-600 transition-colors duration-300">
          {item.name}
        </h3>

        <div className="flex items-center gap-4 mb-4">
          <span className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{item.base_price}</span>
          <div className="flex items-center gap-1 bg-emerald-600/10 px-2 py-1 rounded-xl text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <Star className="w-3 h-3 fill-emerald-600" />
            <span>4.9 Impact</span>
          </div>
        </div>

        <p className="text-slate-400 text-sm leading-relaxed font-medium line-clamp-3 pr-8">
          {item.description || "Synthesized with the finest ingredients to ensure maximum customer yield and culinary satisfaction."}
        </p>
      </div>

      {/* Media & Transaction Vector */}
      <div className="relative w-36 h-36 md:w-44 md:h-44 flex-shrink-0">
        <div className="w-full h-full rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 border-4 border-white group-hover:scale-[1.02] transition-transform duration-500">
          {item.image_url ? (
            <img 
              src={item.image_url} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
          ) : (
            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
              <Package className="w-12 h-12 text-slate-200" />
            </div>
          )}
        </div>

        {/* Transaction Action Overlay */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[85%]">
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="w-full bg-emerald-600 text-white font-black text-xs h-12 rounded-2xl shadow-xl shadow-emerald-600/30 border-none uppercase tracking-widest hover:bg-emerald-700 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
            >
              ADD ITEM
              {hasVariations && <span className="w-4 h-4 rounded-full bg-white/20 text-[10px] flex items-center justify-center">+</span>}
              <Plus className="w-4 h-4 transition-transform group-hover/btn:rotate-90" />
            </button>
          ) : (
            <div className="w-full flex items-center justify-between bg-slate-900 text-white font-black text-sm h-12 px-2 rounded-2xl shadow-2xl shadow-slate-900/30 border border-white/10">
              <button onClick={() => onRemove(item.id)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors">
                <Minus className="w-4 h-4 stroke-[3px]" />
              </button>
              <span className="text-emerald-400">{quantity}</span>
              <button onClick={() => onAdd(item)} className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl transition-colors">
                <Plus className="w-4 h-4 stroke-[3px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;