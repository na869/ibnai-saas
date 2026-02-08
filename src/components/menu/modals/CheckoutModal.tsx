import React, { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Modal, Button, Input } from "../../ui";
import { createOrder } from "../../../services/restaurantService";

interface CheckoutModalProps {
  isOpen: boolean;
  cart: any[];
  restaurantId: string;
  restaurantType?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  restaurantId,
  restaurantType,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subtotal = cart.reduce(
    (sum: number, item: any) => sum + item.itemTotal * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const orderData = {
      restaurant_id: restaurantId,
      order_type: "qr" as const,
      table_number: tableNumber,
      customer_name: customerName,
      customer_phone: customerPhone,
      items: cart.map((item: any) => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        base_price: item.base_price,
        selected_size: item.selectedSize,
        selected_addons: item.selectedAddons,
        item_total: item.itemTotal,
      })),
      subtotal,
      tax,
      total,
    };

    const { error } = await createOrder(orderData);
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setCustomerName("");
        setCustomerPhone("");
        setTableNumber("");
      }, 2000);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  if (success)
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Success!" size="md">
        <div className="text-center py-10">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-black">Order Placed!</h3>
          <p className="text-gray-500 font-bold">Your food is on the way.</p>
        </div>
      </Modal>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Checkout" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Table No"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
            placeholder="Ex: 5"
          />
          <Input
            label="Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            placeholder="John"
          />
        </div>
        <Input
          label="Phone"
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          required
          placeholder="9876543210"
        />

        <div className="bg-gray-900 text-white rounded-2xl p-5">
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-2">
            <span>Bill Amount</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-gray-400 mb-4 pb-4 border-b border-white/10">
            <span>GST (5%)</span>
            <span>₹{tax}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-black uppercase tracking-widest text-xs">
              To Pay
            </span>
            <span className="text-2xl font-black">₹{total}</span>
          </div>
        </div>

        <Button
          type="submit"
          loading={loading}
          fullWidth
          className="bg-green-600 h-14 rounded-xl font-black uppercase"
        >
          {restaurantType === "Quick Service"
            ? "Quick Checkout"
            : "Confirm Order"}
        </Button>
      </form>
    </Modal>
  );
};

export default CheckoutModal;
