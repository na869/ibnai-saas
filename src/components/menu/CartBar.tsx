import React from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";

interface CartBarProps {
  cartCount: number;
  cartTotal: number;
  onClick: () => void;
}

const CartBar: React.FC<CartBarProps> = ({ cartCount, cartTotal, onClick }) => {
  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 px-6 pointer-events-none">
      <button
        onClick={onClick}
        className="w-full max-w-screen-md mx-auto bg-slate-900 text-white shadow-[0_25px_50px_-12px_rgba(5,150,105,0.4)] rounded-[28px] p-5 flex items-center justify-between transform transition-all active:scale-[0.98] pointer-events-auto group border border-white/10 relative overflow-hidden"
      >
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
               <span className="text-xl font-black italic tracking-tighter">₹{cartTotal}</span>
               <span className="w-1 h-1 rounded-full bg-slate-700"></span>
               <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                 {cartCount} Item{cartCount > 1 ? 's' : ''}
               </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Ready for procurement</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-black text-xs uppercase tracking-widest bg-emerald-600 px-6 h-12 rounded-2xl group-hover:bg-emerald-700 transition-colors relative z-10">
          <span>Finalize Order</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </button>
    </div>
  );
};

export default CartBar;