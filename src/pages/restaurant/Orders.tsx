import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Phone,
  User,
  Bell,
  Printer,
  ChefHat,
  CreditCard,
  Filter,
  AlertCircle,
  Utensils
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Modal,
  Loading,
} from "../../components/ui";
import {
  subscribeToOrders,
  updateOrderStatus,
} from "../../services/restaurantService";
import type { Order } from "../../config/supabase";
import { formatCurrency, playSound } from "../../utils/helpers";
import { supabase } from "../../config/supabase";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.restaurant_id) return;

    const loadRestaurant = async () => {
      const { data } = await supabase.from("restaurants").select("*").eq("id", user.restaurant_id).single();
      setRestaurant(data);
    };
    loadRestaurant();

    const subscription = subscribeToOrders(user.restaurant_id, (payload) => {
      if (payload.event === "INITIAL" && payload.orders) {
        setOrders(payload.orders);
        setLoading(false);
      } else if (payload.event === "INSERT" && payload.newOrder) {
        setOrders((prev) => [payload.newOrder!, ...prev]);
        playSound("notification");
        setNotification(`New Order #${payload.newOrder.order_number.toString().slice(-4)}`);
        setTimeout(() => setNotification(null), 5000);
      } else if (payload.event === "UPDATE" && payload.newOrder) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === payload.newOrder!.id ? payload.newOrder! : order
          )
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const getStatusPriority = (status: string) => {
    switch (status) {
      case "pending": return 1;
      case "preparing": return 2;
      case "ready": return 3;
      case "accepted": return 4;
      case "completed": return 5;
      default: return 6;
    }
  };

  const filteredOrders = orders
    .filter((order) => statusFilter === "all" || order.status === statusFilter)
    .sort((a, b) => {
      const priorityA = getStatusPriority(a.status);
      const priorityB = getStatusPriority(b.status);
      if (priorityA !== priorityB) return priorityA - priorityB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"], extraData?: any) => {
    let internalNotes = extraData?.internalNotes || "";
    
    if (newStatus === "rejected") {
      const reason = prompt("Please enter a reason for rejection:");
      if (reason === null) return; // Cancelled prompt
      internalNotes = reason;
    }

    const success = await updateOrderStatus(orderId, newStatus, { ...extraData, internalNotes });
    if (!success) {
      alert("Failed to update status");
    }
  };

  const handleViewBill = (order: Order) => {
    setSelectedOrder(order);
    setShowBillModal(true);
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading text="Syncing live orders..." />
    </div>
  );

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Real-time notification toast */}
      {notification && (
        <div className="fixed bottom-10 right-10 z-[60] animate-in slide-in-from-right-full duration-500">
           <Card className="bg-slate-900/90 backdrop-blur-xl border border-emerald-500/30 shadow-2xl p-6 flex items-center gap-6 rounded-[24px]">
              <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center animate-bounce shadow-lg shadow-emerald-600/40">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Live POS Alert</p>
                <p className="text-white font-black text-xl tracking-tight">{notification}</p>
              </div>
           </Card>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
             <div className="relative">
               <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute inset-0 opacity-75"></div>
               <div className="w-3 h-3 bg-emerald-500 rounded-full relative shadow-[0_0_15px_rgba(16,185,129,0.6)]"></div>
             </div>
             <p className="text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">Live Kitchen Connection</p>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Order Management</h1>
          <p className="text-slate-500 font-medium text-lg">Accept, track, and complete orders in real-time.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {pendingCount > 0 && (
             <div className="bg-red-50 text-red-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 border-2 border-red-100 shadow-xl shadow-red-500/10 animate-pulse">
                <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                {pendingCount} Pending Action
             </div>
           )}
           <Button variant="outline" icon={<Printer className="w-4 h-4" />} className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest border-slate-200 hover:border-slate-300">
             Batch Print
           </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-4 pb-2 no-scrollbar">
        {[
          { id: "all", label: "All Activity", icon: Filter },
          { id: "pending", label: "Incoming", icon: Bell, color: "text-red-500", countBg: "bg-red-50 text-red-600" },
          { id: "preparing", label: "In Kitchen", icon: ChefHat, color: "text-amber-500", countBg: "bg-amber-50 text-amber-600" },
          { id: "ready", label: "Ready", icon: CheckCircle, color: "text-emerald-500", countBg: "bg-emerald-50 text-emerald-600" },
          { id: "completed", label: "History", icon: Package, color: "text-slate-400", countBg: "bg-slate-100 text-slate-500" },
          { id: "rejected", label: "Rejected", icon: XCircle, color: "text-red-400", countBg: "bg-red-50 text-red-500" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`
              flex items-center gap-3 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 group
              ${statusFilter === tab.id 
                ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20 scale-105" 
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600"}
            `}
          >
            <tab.icon className={`w-4 h-4 ${statusFilter === tab.id ? 'text-emerald-400' : tab.color}`} />
            {tab.label}
            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black ${statusFilter === tab.id ? 'bg-white/20 text-white' : (tab.countBg || 'bg-slate-50')}`}>
              {orders.filter(o => o.status === tab.id || tab.id === "all").length}
            </span>
          </button>
        ))}
      </div>

      {/* Order Grid */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100">
           <div className="w-24 h-24 bg-slate-50 rounded-[32px] mb-8 flex items-center justify-center text-slate-300">
              <Package className="w-10 h-10" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Everything is quiet</h3>
           <p className="text-slate-400 font-medium max-w-xs mx-auto">New orders will automatically appear here when they arrive.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className={`flex flex-col h-full border-none shadow-xl shadow-slate-200/40 overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 ${
                order.status === "pending" ? "ring-4 ring-red-500/20" : ""
              }`}
              noPadding
            >
              {/* Status Header */}
              <div className={`p-1.5 ${
                order.status === "pending" ? "bg-red-500" : 
                order.status === "preparing" ? "bg-amber-500" : 
                order.status === "ready" ? "bg-emerald-500" : 
                "bg-slate-100"
              }`}>
                {order.status === "pending" && (
                  <div className="text-white text-[10px] font-black uppercase tracking-widest text-center py-1 flex items-center justify-center gap-2 animate-pulse">
                    <Clock className="w-3 h-3" /> Action Required
                  </div>
                )}
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                      #{order.order_number.toString().slice(-4)}
                    </h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Clock className="w-3 h-3 text-emerald-600" /> {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 ${
                    order.order_type === 'takeaway' 
                      ? 'bg-amber-50 border-amber-100 text-amber-600' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    {order.order_type === 'takeaway' ? <Package className="w-6 h-6" /> : <Utensils className="w-6 h-6" />}
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center justify-between mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-xl bg-white border-2 border-slate-100 flex items-center justify-center font-black text-slate-400 shadow-sm">
                        {order.customer_name?.charAt(0) || "G"}
                     </div>
                     <div>
                       <p className="font-black text-slate-900 text-sm leading-none mb-1">{order.customer_name || "GUEST"}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className={`font-black text-sm leading-none mb-1 uppercase ${order.order_type === 'takeaway' ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {order.order_type === 'takeaway' ? 'Takeaway' : `Table ${order.table_number || "NA"}`}
                     </p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                   </div>
                </div>

                {/* Item List */}
                <div className="space-y-4 mb-8 flex-1">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center group/item border-b border-dashed border-slate-100 pb-2 last:border-0 last:pb-0">
                       <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-slate-900/20">
                            {item.quantity}
                          </span>
                          <span className="text-sm font-bold text-slate-700 group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">
                            {item.name}
                          </span>
                       </div>
                       <span className="text-xs font-black text-slate-900">₹{item.item_total}</span>
                    </div>
                  ))}
                </div>

                {order.customer_notes && (
                  <div className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 shadow-inner">
                     <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                     <p className="text-xs text-amber-900 font-bold leading-relaxed italic">"{order.customer_notes}"</p>
                  </div>
                )}
                
                {order.status === "rejected" && order.internal_notes && (
                  <div className="mb-8 p-4 bg-red-50 rounded-2xl border border-red-100 flex gap-3 shadow-inner">
                     <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                     <p className="text-xs text-red-900 font-bold leading-relaxed">Reason: "{order.internal_notes}"</p>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-auto space-y-6">
                  <div className="flex justify-between items-end border-t-2 border-slate-100 pt-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</span>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{formatCurrency(order.total)}</span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="rounded-2xl border-2 border-slate-100 font-black uppercase text-[10px] tracking-widest h-14 hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => handleViewBill(order)}
                      >
                        <Printer className="w-4 h-4 mr-2" /> Bill
                      </Button>
                      
                      {order.status === "pending" && (
                        <Button
                          className="rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleStatusUpdate(order.id, "preparing")}
                          icon={<ChefHat className="w-4 h-4" />}
                        >
                          Accept
                        </Button>
                      )}

                      {order.status === "preparing" && (
                        <Button
                          className="rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-amber-600/20 bg-amber-500 hover:bg-amber-600 text-white"
                          onClick={() => handleStatusUpdate(order.id, "ready")}
                          icon={<CheckCircle className="w-4 h-4" />}
                        >
                          Ready
                        </Button>
                      )}

                      {order.status === "ready" && (
                        <Button
                          className="rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleStatusUpdate(order.id, "completed")}
                          icon={<Package className="w-4 h-4" />}
                        >
                          Deliver
                        </Button>
                      )}

                      {order.status === "completed" && order.payment_status !== "paid" && (
                        <Button
                          className="rounded-2xl h-14 font-black uppercase text-[10px] tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
                          onClick={() => handleStatusUpdate(order.id, "completed", { paymentStatus: "paid", paymentMethod: "Cash" })}
                          icon={<CreditCard className="w-4 h-4" />}
                        >
                          Pay
                        </Button>
                      )}
                    </div>

                    {order.status === "pending" && (
                      <Button
                        variant="ghost"
                        className="rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={() => handleStatusUpdate(order.id, "rejected")}
                        icon={<XCircle className="w-4 h-4" />}
                      >
                        Reject Order
                      </Button>
                    )}

                    {(order.status === "completed" && order.payment_status === "paid") && (
                      <div className="w-full bg-emerald-50 rounded-2xl h-14 flex items-center justify-center text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                        <CheckCircle className="w-4 h-4 mr-2" /> Fulfilled & Paid
                      </div>
                    )}
                    {order.status === "rejected" && (
                      <div className="w-full bg-red-50 rounded-2xl h-14 flex items-center justify-center text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-100">
                        <XCircle className="w-4 h-4 mr-2" /> Rejected
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bill Printing Modal - Styled to Billion Dollar Standards */}
      <BillModal
        isOpen={showBillModal}
        order={selectedOrder}
        restaurant={restaurant}
        onClose={() => setShowBillModal(false)}
      />
    </div>
  );
};

// Internal Bill Modal Component
const BillModal: React.FC<{ isOpen: boolean; order: Order | null; restaurant: any; onClose: () => void }> = ({
  isOpen, order, restaurant, onClose
}) => {
  if (!order || !isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Commercial Invoice" size="md">
      <div className="bg-white p-8 space-y-10">
        <div id="printable-bill" className="font-mono text-slate-900 border-2 border-slate-100 p-8 rounded-[32px] bg-slate-50/50">
          {/* Header */}
          <div className="text-center pb-8 border-b-2 border-dashed border-slate-300">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">{restaurant?.name || "IBNAI PARTNER"}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{restaurant?.address || "Operational Location Unset"}</p>
            <p className="text-[10px] font-black text-slate-900 mt-2 bg-slate-200 inline-block px-2 py-1 rounded">GSTIN: {restaurant?.gstin || "NOT PROVIDED"}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 py-8 text-[10px] font-black uppercase tracking-widest border-b-2 border-dashed border-slate-300">
            <div>
              <p className="text-slate-400 mb-1">Invoice ID</p>
              <p className="text-slate-900 text-sm">#ORD-{order.order_number.toString().slice(-4)}</p>
              <p className="mt-4 text-slate-400 mb-1">Service Type</p>
              <p className="text-slate-900 text-sm">{order.order_type}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 mb-1">Issue Date</p>
              <p className="text-slate-900 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
              <p className="mt-4 text-slate-400 mb-1">Reference</p>
              <p className="text-slate-900 text-sm">T-{order.table_number || "NA"}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="py-8 space-y-4">
             <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-200">
               <span>Item Detail</span>
               <span>Price</span>
             </div>
             {order.items?.map((item: any, idx: number) => (
               <div key={idx} className="flex justify-between items-start text-xs font-bold">
                 <span className="uppercase max-w-[70%] leading-relaxed">{item.quantity} x {item.name}</span>
                 <span className="text-slate-900">₹{Number(item.item_total).toFixed(2)}</span>
               </div>
             ))}
          </div>

          {/* Calculations */}
          <div className="pt-8 border-t-2 border-slate-900 space-y-3">
             <div className="flex justify-between text-xs font-bold text-slate-500">
               <span className="uppercase tracking-widest">Net Amount</span>
               <span>₹{Number(order.subtotal).toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-xs font-bold text-slate-500">
               <span className="uppercase tracking-widest">Tax (GST 5%)</span>
               <span>₹{Number(order.tax).toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-3xl font-black text-slate-900 pt-4 tracking-tighter">
               <span className="uppercase">Total</span>
               <span>₹{Number(order.total).toFixed(2)}</span>
             </div>
          </div>

          <div className="mt-12 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">
             Thank you for dining with us.
          </div>
        </div>

        <div className="flex gap-4 no-print pt-4">
           <Button variant="outline" fullWidth onClick={onClose} className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200">Dismiss</Button>
           <Button fullWidth onClick={() => window.print()} className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-900/20 bg-slate-900 text-white hover:bg-black" icon={<Printer className="w-5 h-5" />}>Print Invoice</Button>
        </div>
      </div>
      
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-bill, #printable-bill * { visibility: visible; }
          #printable-bill { 
            position: fixed; 
            left: 0; 
            top: 0; 
            width: 100%;
            margin: 0;
            padding: 40px;
            border: none;
            background: white;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </Modal>
  );
};

export default Orders;