import React, { useState, useEffect } from "react";
import { Modal, Button } from "../../ui";
import type { MenuItem } from "../../../config/supabase";

interface ItemCustomizationModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAdd: (item: MenuItem, selectedSize?: any, selectedAddons?: any[]) => void;
}

const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({
  isOpen,
  item,
  onClose,
  onAdd,
}) => {
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
    const addonsTotal = selectedAddons.reduce(
      (sum: number, addon: any) => sum + addon.price,
      0
    );
    return basePrice + addonsTotal;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item.name} size="md">
      <div className="space-y-6">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-48 object-cover rounded-xl"
          />
        )}

        {item.sizes && item.sizes.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3">
              Select Size
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {item.sizes.map((size: any) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                    selectedSize?.name === size.name
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-gray-100"
                  }`}
                >
                  {size.name} • ₹{size.price}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.addons && item.addons.length > 0 && (
          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-400 mb-3">
              Add-ons
            </h4>
            <div className="space-y-2">
              {item.addons.map((addon: any) => (
                <button
                  key={addon.name}
                  onClick={() => toggleAddon(addon)}
                  className={`w-full flex justify-between items-center p-3 rounded-xl border-2 transition-all ${
                    selectedAddons.find((a: any) => a.name === addon.name)
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-100"
                  }`}
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
            <p className="text-[10px] font-black text-gray-400 uppercase">
              Item Total
            </p>
            <p className="text-2xl font-black">₹{calculateTotal()}</p>
          </div>
          <Button
            onClick={() => onAdd(item, selectedSize, selectedAddons)}
            className="bg-orange-600 px-8 h-12 rounded-xl font-black uppercase"
          >
            Add to Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ItemCustomizationModal;
