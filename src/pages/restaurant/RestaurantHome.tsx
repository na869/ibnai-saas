import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  IndianRupee, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  PlusCircle,
  FileText,
  AlertCircle
} from "lucide-react";
import { Card, Badge, Loading, Button } from "../../components/ui";
import { getRestaurantStats } from "../../services/restaurantService";
import { formatCurrency } from "../../utils/helpers";

const RestaurantHome: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user] = useState<any>(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const restaurantType = user?.restaurant?.type || "Restaurant";

  const loadStats = React.useCallback(async () => {
    if (!user?.restaurant_id) return;

    try {
      const data = await getRestaurantStats(user.restaurant_id);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading text="Analyzing your profit engine..." />
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Profit",
      value: formatCurrency(stats?.todayRevenue || 0),
      icon: IndianRupee,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "+12% vs yesterday",
      trendColor: "text-emerald-600"
    },
    {
      title: "Active Orders",
      value: stats?.pendingOrders || 0,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      trend: "4 orders in kitchen",
      trendColor: "text-amber-600"
    },
    {
      title: "Total Orders",
      value: stats?.todayOrders || 0,
      icon: ShoppingBag,
      color: "text-slate-900",
      bgColor: "bg-slate-50",
      trend: "Peak: 1:00 PM - 2:00 PM",
      trendColor: "text-slate-500"
    },
    {
      title: "Menu Items",
      value: stats?.totalMenuItems || 0,
      icon: UtensilsCrossed,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "5 out of stock",
      trendColor: "text-red-500"
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest mb-3">
             <TrendingUp className="w-3 h-3" /> System Live
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Performance Overview
          </h1>
          <p className="text-slate-500 font-medium text-lg mt-1">
            Welcome back, <span className="text-slate-900 font-bold">{user?.name || "Partner"}</span>. Here is how your {restaurantType.toLowerCase()} is performing today.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Link to="/restaurant/menu">
             <Button variant="outline" icon={<PlusCircle className="w-4 h-4" />}>Add Item</Button>
           </Link>
           <Link to="/restaurant/orders">
             <Button icon={<ArrowRight className="w-4 h-4" />}>Live Orders</Button>
           </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} hover className="border-none shadow-xl shadow-slate-200/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.bgColor} p-4 rounded-2xl`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className={`text-[10px] font-black uppercase tracking-widest ${stat.trendColor} bg-white px-2 py-1 rounded-lg border border-slate-100`}>
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-1">{stat.title}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                <p className="text-slate-400 text-sm font-medium">Your latest customers and their choices.</p>
              </div>
              <Link to="/restaurant/orders">
                <Button variant="ghost" size="sm" className="text-emerald-600 font-bold">View All Activity</Button>
              </Link>
            </div>
            
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.slice(0, 5).map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100/50 hover:bg-white hover:border-emerald-600/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:text-emerald-600 group-hover:border-emerald-600/30 transition-colors">
                        #{order.order_number.toString().slice(-3)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900">
                          {order.order_type} Order
                        </p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                          {order.items?.length || 0} items • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900 mb-1">
                        {formatCurrency(order.total)}
                      </p>
                      <Badge
                        variant={
                          order.status === "completed"
                            ? "success"
                            : order.status === "pending"
                            ? "warning"
                            : "neutral"
                        }
                        className="font-black uppercase tracking-tighter text-[10px]"
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="w-10 h-10 text-slate-200" />
                 </div>
                 <h4 className="text-lg font-bold text-slate-900">No orders yet today</h4>
                 <p className="text-slate-400 text-sm">Once you receive orders, they will appear here.</p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Insights / Help */}
        <div className="space-y-8">
           <Card className="bg-slate-900 text-white border-none shadow-2xl shadow-emerald-600/10 p-8">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-600/20">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-black mb-4 tracking-tight">Boost Your Sales</h3>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed text-sm">
                Adding high-quality photos to your menu items can increase order volume by up to <span className="text-emerald-400 font-black">25%</span>.
              </p>
              <Link to="/restaurant/menu">
                <Button variant="secondary" fullWidth className="bg-white text-slate-900 hover:bg-slate-100 border-none font-black uppercase tracking-widest text-xs py-4">
                  Improve My Menu
                </Button>
              </Link>
           </Card>

           <Card className="border-2 border-slate-100 p-8">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-emerald-600" /> Need Assistance?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Knowledge Base</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Learn how to master IBNai.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900">Support Chat</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">Average response time: 2 mins.</p>
                  </div>
                </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantHome;