import React, { useState } from "react";
import { CheckCircle2, ShoppingBag, ShieldCheck, ArrowRight, User, Hash, Phone, Utensils, Package, AlertCircle } from "lucide-react";
import { Modal, Button, Input } from "../../ui";
import { createOrder } from "../../../services/restaurantService";
import { hasFeature } from "../../../utils/helpers";

interface CheckoutModalProps {
  isOpen: boolean;
  cart: any[];
  restaurantId: string;
  restaurantType?: string;
  subscriptionPlan?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  cart,
  restaurantId,
  restaurantType,
  subscriptionPlan,
  onClose,
  onSuccess,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderType, setOrderType] = useState<"dine_in" | "takeaway">("dine_in");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("cash");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const canTakeaway = hasFeature(subscriptionPlan, "takeaway");
  const canUPI = hasFeature(subscriptionPlan, "upi");

  const subtotal = cart.reduce(
    (sum: number, item: any) => sum + item.itemTotal * item.quantity,
    0
  );
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleUPIPayment = () => {
    // In a real scenario, fetch the restaurant's upi_id from a prop or context
    // For now, we'll simulate the intent generation
    const upiLink = `upi://pay?pa=MERCHANT_VPA&pn=RESTAURANT_NAME&am=${total.toFixed(2)}&cu=INR&tn=Order_${Date.now()}`;
    window.location.href = upiLink;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const orderData = {
      restaurant_id: restaurantId,
      order_type: orderType,
      table_number: orderType === "dine_in" ? tableNumber : "Takeaway",
      customer_name: customerName,
      customer_phone: customerPhone,
      payment_method: paymentMethod,
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

    try {
      const { error: submitError } = await createOrder(orderData);
      if (submitError) throw submitError;

      if (paymentMethod === 'upi') {
        handleUPIPayment();
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        setSuccess(false);
        setCustomerName("");
        setCustomerPhone("");
        setTableNumber("");
      }, 2500);
    } catch (err: any) {
      console.error("Order failed:", err);
      setError(err.message || "Failed to transmit order. Please try again.");
    } finally {
      setLoading(false);
    }
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
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600">
             <AlertCircle className="w-5 h-5 flex-shrink-0" />
             <p className="text-xs font-black uppercase tracking-widest">{error}</p>
          </div>
        )}
        <div className="space-y-8">
          {/* Order Type Selection */}
          {canTakeaway && (
            <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setOrderType("dine_in")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  orderType === "dine_in"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Utensils className="w-4 h-4" />
                Dine-in
              </button>
              <button
                type="button"
                onClick={() => setOrderType("takeaway")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  orderType === "takeaway"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Package className="w-4 h-4" />
                Takeaway
              </button>
            </div>
          )}

           <div className="grid grid-cols-2 gap-6">
            {orderType === "dine_in" ? (
              <Input
                label="Table Reference"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                required
                placeholder="Ex: 5"
                icon={<Hash className="w-4 h-4" />}
              />
            ) : (
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center border-2 border-slate-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Service Mode</p>
                <p className="font-black text-slate-900">Takeaway</p>
              </div>
            )}
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

          {/* Payment Method - Premium Feature */}
          {canUPI && (
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Payment Methodology</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'cash' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-100 text-slate-400'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cash' ? 'border-emerald-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'cash' && <div className="w-2 h-2 bg-emerald-600 rounded-full" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Direct Settlement</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-slate-100 text-slate-400'}`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'upi' ? 'border-emerald-600' : 'border-slate-300'}`}>
                    {paymentMethod === 'upi' && <div className="w-2 h-2 bg-emerald-600 rounded-full" />}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Instant UPI</span>
                </button>
              </div>
            </div>
          )}
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
            {restaurantType === "Quick Service" 
              ? "Instant Checkout" 
              : paymentMethod === 'upi' 
                ? "Proceed to Payment" 
                : "Finalize Procurement"}
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