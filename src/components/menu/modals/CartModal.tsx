import React from "react";
import { Minus, Plus, ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import { Modal, Button } from "../../ui";

interface CartModalProps {
  isOpen: boolean;
  cart: any[];
  onClose: () => void;
  onUpdateQuantity: (index: number, delta: number) => void;
  onCheckout: () => void;
}

const CartModal: React.FC<CartModalProps> = ({
  isOpen,
  cart,
  onClose,
  onUpdateQuantity,
  onCheckout,
}) => {
  const total = cart.reduce(
    (sum: number, item: any) => sum + item.itemTotal * item.quantity,
    0
  );

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inventory Review" size="lg">
      <div className="p-4 space-y-10">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 no-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-20">
               <ShoppingBag className="w-16 h-16 text-slate-100 mx-auto mb-6" />
               <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Your basket is currently empty.</p>
            </div>
          ) : (
            cart.map((item: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border border-slate-100/50 group hover:border-emerald-600/20 transition-all"
              >
                <div className="flex-1 pr-6">
                  <h4 className="font-black text-slate-900 text-lg leading-tight mb-1 group-hover:text-emerald-600 transition-colors">{item.name}</h4>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Unit Value: ₹{item.itemTotal.toFixed(2)}
                  </p>
                  {item.selectedSize && (
                    <span className="inline-block mt-2 px-2 py-0.5 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-500">
                      Size: {item.selectedSize.name}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                  <button
                    onClick={() => onUpdateQuantity(index, -1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-red-500"
                  >
                    {item.quantity === 1 ? <Trash2 className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </button>
                  <span className="font-black text-lg text-slate-900 min-w-[20px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(index, 1)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-emerald-600"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="pt-8 border-t border-slate-100 space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Total Valuation</p>
                <p className="text-4xl font-black text-slate-900 tracking-tighter italic">₹{total.toFixed(2)}</p>
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Excl. applicable taxes</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <Button
                onClick={onCheckout}
                fullWidth
                size="lg"
                className="h-20 rounded-[28px] font-black uppercase tracking-widest text-lg shadow-2xl shadow-emerald-600/30 group"
                icon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
              >
                Continue to Payment
              </Button>
              <Button variant="ghost" onClick={onClose} className="font-black uppercase tracking-widest text-[10px] text-slate-400">
                Continue Selection
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default CartModal;