import React from "react";
import { Minus, Plus } from "lucide-react";
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
    <Modal isOpen={isOpen} onClose={onClose} title="Order Summary" size="lg">
      <div className="space-y-6">
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
          {cart.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                <p className="text-[10px] text-gray-500 font-bold">
                  ₹{item.itemTotal}
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => onUpdateQuantity(index, -1)}
                  className="p-1 hover:bg-gray-50 rounded"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-black text-xs">{item.quantity}</span>
                <button
                  onClick={() => onUpdateQuantity(index, 1)}
                  className="p-1 hover:bg-gray-50 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-4">
            <span className="font-black uppercase text-xs text-gray-400">
              Total Bill
            </span>
            <span className="text-2xl font-black text-gray-900">₹{total}</span>
          </div>
          <Button
            onClick={onCheckout}
            fullWidth
            size="lg"
            className="bg-green-600 hover:bg-green-700 h-14 rounded-xl font-black uppercase"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CartModal;
