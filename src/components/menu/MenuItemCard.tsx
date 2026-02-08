import React from "react";
import { Plus, Minus, Star, Package } from "lucide-react";
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
  const isBestseller = item.name.toLowerCase().includes("special");

  return (
    <div className="pt-8 first:pt-0 flex gap-4 relative group">
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
              onClick={() => onAdd(item)}
              className="w-full bg-white text-green-600 font-black text-sm py-1.5 rounded-lg shadow-lg border border-gray-100 uppercase tracking-wider hover:bg-gray-50 transition-all active:scale-95"
            >
              ADD
              {hasVariations && <span className="absolute -top-1 -right-1 text-[8px] text-gray-400">+</span>}
            </button>
          ) : (
            <div className="w-full flex items-center justify-between bg-white text-green-600 font-black text-sm py-1.5 px-1 rounded-lg shadow-lg border border-gray-100">
              <button onClick={() => onRemove(item.id)} className="w-6 h-6 flex items-center justify-center hover:bg-green-50 rounded">
                <Minus className="w-3 h-3 stroke-[3px]" />
              </button>
              <span>{quantity}</span>
              <button onClick={() => onAdd(item)} className="w-6 h-6 flex items-center justify-center hover:bg-green-50 rounded">
                <Plus className="w-3 h-3 stroke-[3px]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
