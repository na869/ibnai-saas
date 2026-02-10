import React, { useState } from "react";
import { CheckCircle2, ShoppingBag, ShieldCheck, ArrowRight, User, Hash, Phone } from "lucide-react";
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
      }, 2500);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  if (success)
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Transaction Verified" size="md">
        <div className="text-center py-20 animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-emerald-600 rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-600/30">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Order Transmitted</h3>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            Your request has been successfully <br />logged by the kitchen.
          </p>
        </div>
      </Modal>
    );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Final Procurement" size="lg">
      <form onSubmit={handleSubmit} className="p-4 space-y-10">
        <div className="space-y-8">
           <div className="grid grid-cols-2 gap-6">
            <Input
              label="Table Reference"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              required
              placeholder="Ex: 5"
              icon={<Hash className="w-4 h-4" />}
            />
            <Input
              label="Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              placeholder="John"
              icon={<User className="w-4 h-4" />}
            />
          </div>
          <Input
            label="Phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            placeholder="9876543210"
            icon={<Phone className="w-4 h-4" />}
          />
        </div>

        <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <ShoppingBag className="w-24 h-24 text-white rotate-12" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-slate-500">
              <span>Valuation</span>
              <span className="text-slate-200">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/10 pb-4">
              <span>Taxation (GST 5%)</span>
              <span className="text-slate-200">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-end pt-2">
              <div className="space-y-1">
                <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500">Grand Total</span>
                <span className="text-4xl font-black text-white italic tracking-tighter leading-none">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Secure POS
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="lg"
            className="h-20 rounded-[28px] font-black uppercase tracking-widest text-lg shadow-2xl shadow-emerald-600/30 group"
            icon={<ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />}
          >
            {restaurantType === "Quick Service" ? "Instant Checkout" : "Finalize Procurement"}
          </Button>
          <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6">
            By confirming, you authorize direct kitchen transmission.
          </p>
        </div>
      </form>
    </Modal>
  );
};

export default CheckoutModal;