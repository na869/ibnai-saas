import React, { useState, useEffect } from "react";
import { Modal, Button } from "../../ui";
import type { MenuItem } from "../../../config/supabase";
import { CheckCircle2, IndianRupee, ArrowRight } from "lucide-react";

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
    <Modal isOpen={isOpen} onClose={onClose} title="Item Configuration" size="md">
      <div className="p-4 space-y-10">
        {item.image_url && (
          <div className="relative h-56 md:h-64 rounded-[32px] overflow-hidden shadow-2xl">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
               <h3 className="text-2xl font-black text-white tracking-tight">{item.name}</h3>
            </div>
          </div>
        )}

        {!item.image_url && (
           <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{item.name}</h3>
              <p className="text-slate-400 font-medium mt-2 leading-relaxed">{item.description}</p>
           </div>
        )}

        {item.sizes && item.sizes.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Select Dimension
            </h4>
            <div className="grid grid-cols-2 gap-4">
              {item.sizes.map((size: any) => (
                <button
                  key={size.name}
                  onClick={() => setSelectedSize(size)}
                  className={`
                    group p-5 rounded-2xl border-2 transition-all text-left relative overflow-hidden
                    ${selectedSize?.name === size.name
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                      : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                    }
                  `}
                >
                  <p className="font-black text-sm uppercase tracking-widest mb-1">{size.name}</p>
                  <p className="font-black text-lg italic tracking-tighter">₹{size.price}</p>
                  {selectedSize?.name === size.name && (
                    <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-600 animate-in zoom-in" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.addons && item.addons.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
              Enhancements
            </h4>
            <div className="space-y-3">
              {item.addons.map((addon: any) => {
                const isActive = selectedAddons.find((a: any) => a.name === addon.name);
                return (
                  <button
                    key={addon.name}
                    onClick={() => toggleAddon(addon)}
                    className={`
                      w-full flex justify-between items-center p-5 rounded-2xl border-2 transition-all
                      ${isActive
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                        : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-600 border-emerald-600' : 'border-slate-200'}`}>
                          {isActive && <CheckCircle2 className="w-3 h-3 text-white" />}
                       </div>
                       <span className="font-bold text-sm">{addon.name}</span>
                    </div>
                    <span className="font-black text-sm tracking-tighter">+ ₹{addon.price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
              Aggregated Valuation
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2">
               <IndianRupee className="w-5 h-5 text-emerald-600" />
               <p className="text-4xl font-black text-slate-900 tracking-tighter italic">
                 {calculateTotal().toFixed(2)}
               </p>
            </div>
          </div>
          <Button
            onClick={() => onAdd(item, selectedSize, selectedAddons)}
            className="h-20 px-12 rounded-[28px] font-black uppercase tracking-widest text-sm shadow-2xl shadow-emerald-600/30 w-full md:w-auto group"
            icon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
          >
            Incorporate to Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ItemCustomizationModal;