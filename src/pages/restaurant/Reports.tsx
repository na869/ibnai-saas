import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  Package,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Activity
} from "lucide-react";
import { Card, Button, Loading, Badge } from "../../components/ui";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { supabase } from "../../config/supabase";
import { formatCurrency, hasFeature } from "../../utils/helpers";
import { Lock, Store } from "lucide-react";
import { Link } from "react-router-dom";

interface ReportData {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  topItems: { name: string; count: number; revenue: number }[];
  dailyRevenue: { date: string; revenue: number; orders: number }[];
  orderTypeDistribution: { type: string; count: number }[];
}

const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [dateRange, setDateRange] = useState<"7" | "30" | "90">("30");
  const [restaurant, setRestaurant] = useState<any>(null);

  useEffect(() => {
    const fetchRestaurant = async () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.restaurant_id) return;
      const { data } = await supabase.from("restaurants").select("*").eq("id", user.restaurant_id).single();
      setRestaurant(data);
    };
    fetchRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant && hasFeature(restaurant.subscription_plan, "analytics")) {
      fetchReportData();
    } else if (restaurant) {
      setLoading(false);
    }
  }, [dateRange, restaurant]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.restaurant_id) return;

      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("restaurant_id", user.restaurant_id)
        .gte("created_at", startDate.toISOString())
        .in("status", ["completed", "ready", "preparing", "accepted"]);

      if (error) throw error;

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const itemCounts: Record<string, { count: number; revenue: number }> = {};
      orders?.forEach((order) => {
        order.items?.forEach((item: any) => {
          if (!itemCounts[item.name]) itemCounts[item.name] = { count: 0, revenue: 0 };
          itemCounts[item.name].count += item.quantity;
          itemCounts[item.name].revenue += item.item_total;
        });
      });

      const topItems = Object.entries(itemCounts)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const dailyData: Record<string, { revenue: number; orders: number }> = {};
      orders?.forEach((order) => {
        const date = new Date(order.created_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        if (!dailyData[date]) dailyData[date] = { revenue: 0, orders: 0 };
        dailyData[date].revenue += Number(order.total || 0);
        dailyData[date].orders += 1;
      });

      const dailyRevenue = Object.entries(dailyData)
        .map(([date, data]) => ({ date, ...data }))
        .slice(-14);

      const typeCounts: Record<string, number> = {};
      orders?.forEach((order) => {
        const type = order.order_type || "unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const orderTypeDistribution = Object.entries(typeCounts).map(
        ([type, count]) => ({ type, count })
      );

      setReportData({
        totalRevenue,
        totalOrders,
        avgOrderValue,
        topItems,
        dailyRevenue,
        orderTypeDistribution,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    const csvContent = [
      ["Metric", "Value"],
      ["Total Revenue", reportData.totalRevenue],
      ["Total Orders", reportData.totalOrders],
      ["Average Order Value", reportData.avgOrderValue],
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IBNai-Report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loading text="Synthesizing sales intelligence..." />
    </div>
  );

  if (restaurant && !hasFeature(restaurant.subscription_plan, "analytics")) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="relative mb-12">
          <div className="w-32 h-32 bg-slate-900 rounded-[40px] flex items-center justify-center shadow-2xl relative z-10">
            <TrendingUp className="w-16 h-16 text-emerald-500" />
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl z-20 animate-bounce">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div className="absolute inset-0 bg-emerald-600/20 blur-3xl rounded-full scale-150 animate-pulse" />
        </div>

        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">Sales Intelligence Locked</h2>
        <p className="text-slate-500 font-medium text-lg max-w-md mx-auto mb-10 leading-relaxed">
          Advanced analytics and performance insights are exclusive to <span className="text-slate-900 font-black underline decoration-emerald-500 underline-offset-4">Growth</span> and <span className="text-slate-900 font-black underline decoration-emerald-500 underline-offset-4">Customizable</span> plans.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <Link to="/restaurant/settings" className="flex-1">
            <Button fullWidth size="lg" className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/20">
              Upgrade My Plan
            </Button>
          </Link>
          <Link to="/restaurant" className="flex-1">
            <Button fullWidth variant="outline" size="lg" className="h-16 rounded-2xl font-black uppercase tracking-widest text-xs border-slate-200">
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 w-full max-w-2xl opacity-40 grayscale">
           <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
           <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
           <div className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  const CHART_COLORS = ["#059669", "#6366F1", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Intelligence */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600/10 text-emerald-600 text-xs font-black uppercase tracking-widest mb-3">
             <Activity className="w-3 h-3" /> Data Intelligence Active
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Business Insights</h1>
          <p className="text-slate-500 font-medium mt-1">Deep dive into your restaurant's financial DNA.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="appearance-none bg-white border-2 border-slate-100 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-900 focus:border-emerald-600 outline-none pr-12 shadow-sm"
            >
              <option value="7">Past Week</option>
              <option value="30">Past Month</option>
              <option value="90">Past Quarter</option>
            </select>
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={exportReport}
            variant="outline"
            className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest"
          >
            Export Data
          </Button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Gross Revenue", value: formatCurrency(reportData?.totalRevenue || 0), icon: IndianRupee, trend: "+14.2%", up: true },
          { label: "Transaction Volume", value: reportData?.totalOrders || 0, icon: ShoppingBag, trend: "+5.1%", up: true },
          { label: "Avg Ticket Size", value: formatCurrency(reportData?.avgOrderValue || 0), icon: TrendingUp, trend: "-2.4%", up: false },
          { label: "Retention Window", value: `${dateRange} Days`, icon: Calendar, trend: "Stable", up: true },
        ].map((kpi, i) => (
          <Card key={i} hover className="border-none shadow-xl shadow-slate-200/50 p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <kpi.icon className="w-6 h-6 text-slate-900" />
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>
                {kpi.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{kpi.value}</h3>
          </Card>
        ))}
      </div>

      {/* Visual Analytics Layer */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl shadow-slate-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <BarChartIcon className="w-5 h-5 text-emerald-600" /> Revenue Trajectory
             </h3>
             <Badge className="bg-emerald-50 text-emerald-600 border-none font-black uppercase text-[10px] tracking-widest">Real-time Data</Badge>
          </div>
          <div className="h-[350px] w-full min-h-[350px]">
            {reportData && (
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
                <AreaChart data={reportData.dailyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900 }}
                    cursor={{ stroke: '#059669', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#059669" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="border-none shadow-xl shadow-slate-200/50 p-8">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <PieChartIcon className="w-5 h-5 text-emerald-600" /> Channel Mix
             </h3>
          </div>
          <div className="h-[350px] w-full min-h-[350px]">
            {reportData && (
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={300}>
                <PieChart>
                  <Pie
                    data={reportData.orderTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={8}
                    dataKey="count"
                  >
                    {reportData.orderTypeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center" 
                    iconType="circle"
                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Inventory Performance Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Card className="border-none shadow-xl shadow-slate-200/50 p-8">
              <div className="flex items-center justify-between mb-10">
                 <div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">Top Performing Assets</h3>
                   <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">High-Volume Menu Items</p>
                 </div>
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                    <Package className="w-6 h-6 text-slate-900" />
                 </div>
              </div>

              <div className="space-y-6">
                {reportData?.topItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center font-black text-white shadow-lg group-hover:scale-110 transition-transform">
                          {index + 1}
                       </div>
                       <div>
                         <p className="font-black text-slate-900 text-lg leading-none mb-1 group-hover:text-emerald-600 transition-colors">{item.name}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.count} Strategic Deliveries</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="font-black text-slate-900 text-lg leading-none mb-1">{formatCurrency(item.revenue)}</p>
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Yield generated</p>
                    </div>
                  </div>
                ))}
              </div>
           </Card>
        </div>

        <div className="space-y-8">
           <Card className="bg-slate-900 text-white border-none shadow-2xl shadow-emerald-600/10 p-10">
              <TrendingUp className="w-10 h-10 text-emerald-400 mb-8" />
              <h4 className="text-2xl font-black mb-4 leading-tight">Growth Strategy Recommendation</h4>
              <p className="text-slate-400 font-medium mb-10 leading-relaxed text-sm">
                Based on your <span className="text-white font-bold">Avg Ticket Size</span> of {formatCurrency(reportData?.avgOrderValue || 0)}, introducing a "Family Pack" bundle could increase revenue by <span className="text-emerald-400 font-black">18.5%</span>.
              </p>
              <Button fullWidth className="h-16 bg-emerald-600 hover:bg-emerald-700 border-none font-black uppercase tracking-widest text-xs">Execute Plan</Button>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;