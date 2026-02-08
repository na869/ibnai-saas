import React, { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Phone,
  User,
  MessageSquare,
  Bell,
  Printer,
  ChefHat,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Modal,
  Textarea,
  Loading,
  Alert,
} from "../../components/ui";
import {
  subscribeToOrders,
  updateOrderStatus,
} from "../../services/restaurantService";
import type { Order } from "../../config/supabase";
import { formatDateTime, formatCurrency, playSound } from "../../utils/helpers";
import { supabase } from "../../config/supabase";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.restaurant_id) return;

    // Load restaurant info for billing
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
        setNotification(`New Order Received! #${payload.newOrder.order_number}`);
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
      case "cancelled":
      case "rejected": return 6;
      default: return 7;
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

  const handleStatusUpdate = async (orderId: string, newStatus: Order["status"], paymentData?: any) => {
    const success = await updateOrderStatus(orderId, newStatus, paymentData);
    if (!success) {
      alert("Failed to update order status");
    }
  };

  const handleViewBill = (order: Order) => {
    setSelectedOrder(order);
    setShowBillModal(true);
  };

  const getStatusBadge = (order: Order) => {
    const status = order.status;
    const paymentStatus = order.payment_status;

    if (paymentStatus === "paid") return <Badge variant="success" className="px-3 py-1 rounded-lg font-black uppercase text-[10px]">PAID</Badge>;
    
    switch (status) {
      case "pending": return <Badge variant="error" className="px-3 py-1 rounded-lg font-black uppercase text-[10px]">PENDING</Badge>;
      case "preparing": return <Badge variant="warning" className="px-3 py-1 rounded-lg font-black uppercase text-[10px]">COOKING</Badge>;
      case "ready": return <Badge variant="accent-secondary" className="px-3 py-1 rounded-lg font-black uppercase text-[10px]">READY</Badge>;
      case "completed": return <Badge variant="success" className="px-3 py-1 rounded-lg font-black uppercase text-[10px]">COMPLETED</Badge>;
      default: return <Badge variant="neutral" className="px-3 py-1 rounded-lg font-black uppercase text-[10px]">{status}</Badge>;
    }
  };

  if (loading) return <Loading text="Initializing POS System..." />;

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="space-y-6 relative pb-10">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-full">
          <div className="bg-gray-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <div className="bg-orange-600 p-2 rounded-xl">
              <Bell className="w-5 h-5 text-white animate-bounce" />
            </div>
            <div>
              <p className="font-black uppercase tracking-widest text-[10px] text-gray-400">POS Alert</p>
              <p className="font-bold text-sm">{notification}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-1 uppercase tracking-tight">Order Management</h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">
              POS Terminal • Live Sync Active
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 border border-red-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              {pendingCount} NEW ORDERS
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide no-scrollbar">
        {["all", "pending", "preparing", "ready", "completed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              statusFilter === status
                ? "bg-gray-900 text-white shadow-xl"
                : "bg-white text-gray-500 border border-gray-100 hover:border-gray-300"
            }`}
          >
            {status}
            {status !== "all" && (
              <span className={`ml-2 px-1.5 py-0.5 rounded ${statusFilter === status ? 'bg-white/20' : 'bg-gray-100'}`}>
                {orders.filter(o => o.status === status).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Kanban Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-20 bg-gray-50/30 border-2 border-dashed border-gray-200">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest">No Active Orders</h3>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Card
              key={order.id}
              className={`flex flex-col h-full transition-all border-2 ${
                order.status === "pending" ? "border-red-500/20 bg-red-50/5" : "border-white"
              } hover:shadow-2xl hover:shadow-gray-200`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none mb-1">
                    #{order.order_number.split('-').pop() || order.order_number}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    {formatDateTime(order.created_at).split(',')[1]}
                  </p>
                </div>
                {getStatusBadge(order)}
              </div>

              {/* Order Content */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between py-2 border-y border-gray-50">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-black text-gray-700 truncate max-w-[120px]">
                      {order.customer_name || "GUEST"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                    <Package className="w-3 h-3 text-gray-500" />
                    <span className="text-[10px] font-black text-gray-700 uppercase">
                      {order.table_number ? `T-${order.table_number}` : "T/A"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-xs font-bold text-gray-600">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="text-gray-400 font-medium">₹{item.item_total}</span>
                    </div>
                  ))}
                </div>

                {order.customer_notes && (
                  <div className="bg-orange-50 p-2.5 rounded-xl border border-orange-100">
                    <p className="text-[9px] font-black text-orange-800 uppercase mb-1">Note</p>
                    <p className="text-[11px] text-orange-900 font-medium italic leading-snug">
                      "{order.customer_notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Footer / Actions */}
              <div className="mt-6 pt-4 border-t border-gray-50 space-y-3">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-black text-gray-900">₹{Number(order.total).toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl h-11 text-[10px] font-black uppercase tracking-widest border-gray-100"
                    onClick={() => handleViewBill(order)}
                  >
                    <Printer className="w-3.5 h-3.5 mr-2" />
                    Bill
                  </Button>
                  
                  {order.status === "pending" && (
                    <Button
                      className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-600/20"
                      onClick={() => handleStatusUpdate(order.id, "preparing")}
                    >
                      <ChefHat className="w-3.5 h-3.5 mr-2" />
                      Cook
                    </Button>
                  )}

                  {order.status === "preparing" && (
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20"
                      onClick={() => handleStatusUpdate(order.id, "ready")}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-2" />
                      Ready
                    </Button>
                  )}

                  {order.status === "ready" && (
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20"
                      onClick={() => handleStatusUpdate(order.id, "completed")}
                    >
                      <Package className="w-3.5 h-3.5 mr-2" />
                      Complete
                    </Button>
                  )}

                  {order.status === "completed" && order.payment_status !== "paid" && (
                    <Button
                      className="bg-gray-900 hover:bg-black text-white rounded-xl h-11 text-[10px] font-black uppercase tracking-widest shadow-lg"
                      onClick={() => handleStatusUpdate(order.id, "completed", { paymentStatus: "paid", paymentMethod: "Cash" })}
                    >
                      <CreditCard className="w-3.5 h-3.5 mr-2" />
                      Pay
                    </Button>
                  )}

                  {(order.status === "completed" && order.payment_status === "paid") || (order.status === "cancelled") ? (
                    <div className="col-span-1 bg-gray-50 rounded-xl h-11 flex items-center justify-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      Closed
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Bill Printing Modal */}
      <BillModal
        isOpen={showBillModal}
        order={selectedOrder}
        restaurant={restaurant}
        onClose={() => setShowBillModal(false)}
      />
    </div>
  );
};

// Bill Printing Component
const BillModal: React.FC<{ isOpen: boolean; order: Order | null; restaurant: any; onClose: () => void }> = ({
  isOpen, order, restaurant, onClose
}) => {
  if (!order || !isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tax Invoice" size="md">
      <div className="bg-white p-6 rounded-2xl">
        <div id="printable-bill" className="font-mono text-gray-900 p-4 border border-gray-100 rounded-xl bg-gray-50/30">
          {/* Bill Header */}
          <div className="text-center mb-6 pb-6 border-b border-dashed border-gray-300">
            <h2 className="text-xl font-black uppercase mb-1">{restaurant?.name || "RESTAURANT"}</h2>
            <p className="text-[10px] font-bold text-gray-500 uppercase">{restaurant?.address || "Address Location"}</p>
            <p className="text-[10px] font-bold text-gray-500">PH: {restaurant?.phone || "0000000000"}</p>
          </div>

          {/* Bill Details */}
          <div className="flex justify-between text-[10px] font-bold mb-6">
            <div>
              <p>ORDER: #{order.order_number}</p>
              <p>TYPE: {order.order_type.toUpperCase()}</p>
              {order.table_number && <p>TABLE: {order.table_number}</p>}
            </div>
            <div className="text-right">
              <p>DATE: {new Date(order.created_at).toLocaleDateString()}</p>
              <p>TIME: {new Date(order.created_at).toLocaleTimeString()}</p>
              <p>POS ID: {order.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-2 mb-6 border-b border-dashed border-gray-300 pb-6">
            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
              <span className="w-1/2">Item Description</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/3 text-right">Price</span>
            </div>
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-xs font-bold py-1">
                <span className="w-1/2 uppercase">{item.name}</span>
                <span className="w-1/6 text-center">{item.quantity}</span>
                <span className="w-1/3 text-right">₹{Number(item.item_total || 0).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Subtotal</span>
              <span>₹{Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span>GST (5%)</span>
              <span>₹{Number(order.tax).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-4 border-t-2 border-double border-gray-900 mt-4">
              <span className="uppercase">Grand Total</span>
              <span>₹{Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-8 border-t border-dashed border-gray-300">
            <p className="text-[10px] font-black uppercase">Thank You! Visit Again</p>
            <p className="text-[8px] font-bold text-gray-400 mt-2 italic">Digital Invoice Generated by FoodOrder POS</p>
          </div>
        </div>

        <div className="flex gap-4 mt-8 no-print">
          <Button variant="outline" onClick={onClose} fullWidth className="rounded-2xl h-14 font-black uppercase tracking-widest border-gray-100">
            Close
          </Button>
          <Button onClick={handlePrint} fullWidth className="bg-gray-900 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl">
            <Printer className="w-5 h-5 mr-2" />
            Print Bill
          </Button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-bill, #printable-bill * { visibility: visible; }
          #printable-bill { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
            padding: 0;
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
