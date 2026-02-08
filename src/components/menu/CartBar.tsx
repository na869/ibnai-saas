import React from "react";
import { ShoppingCart } from "lucide-react";

interface CartBarProps {
  cartCount: number;
  cartTotal: number;
  onClick: () => void;
}

const CartBar: React.FC<CartBarProps> = ({ cartCount, cartTotal, onClick }) => {
  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50">
      <button
        onClick={onClick}
        className="w-full max-w-screen-md mx-auto bg-green-700 text-white shadow-2xl rounded-xl p-3.5 flex items-center justify-between transform transition-all active:scale-[0.98]"
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/70">
            {cartCount} Item{cartCount > 1 ? 's' : ''} | ₹{cartTotal}
          </span>
          <span className="text-xs font-bold">Extra charges may apply</span>
        </div>
        <div className="flex items-center gap-1 font-black text-sm uppercase tracking-widest">
          <span>View Cart</span>
          <ShoppingCart className="w-4 h-4" />
        </div>
      </button>
    </div>
  );
};

export default CartBar;
