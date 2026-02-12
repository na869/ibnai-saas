import React, { useEffect, useState, useCallback } from "react";
import {
  Store as StoreIcon,
  FileText,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Card, Loading, Button } from "../../components/ui";
import { getPlatformStats } from "../../services/adminService";
import { formatCurrency } from "../../utils/helpers";
import { Link } from "react-router-dom";

import { APP_CONFIG } from "../../config/config";

const DashboardHome: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeRestaurants: 0,
    pendingRequests: 0,
    totalOrders: 0,
    todayRevenue: 0,
    planDistribution: {} as Record<string, number>
  });

  const loadStats = useCallback(async () => {
    setLoading(true);
    const data = await getPlatformStats();
    setStats(data as any);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-text mb-2">Platform Overview</h2>
        <p className="text-text-secondary">
          Monitor your restaurant network performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">
                Active Restaurants
              </p>
              <p className="text-3xl font-bold text-text">
                {stats.activeRestaurants}
              </p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <StoreIcon className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">
                Pending Requests
              </p>
              <p className="text-3xl font-bold text-text">
                {stats.pendingRequests}
              </p>
              {stats.pendingRequests > 0 && (
                <Link
                  to="/admin/requests"
                  className="text-sm text-accent hover:underline mt-2 inline-block"
                >
                  Review now →
                </Link>
              )}
            </div>
            <div className="p-3 bg-warning/10 rounded-lg">
              <FileText className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-bold text-text">
                {stats.totalOrders}
              </p>
              <p className="text-sm text-success flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                All time
              </p>
            </div>
            <div className="p-3 bg-accent-secondary/10 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-accent-secondary" />
            </div>
          </div>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm mb-1">
                Today's Revenue
              </p>
              <p className="text-3xl font-bold text-text">
                {formatCurrency(stats.todayRevenue)}
              </p>
              <p className="text-sm text-text-secondary mt-1">Platform-wide</p>
            </div>
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
          </div>
        </Card>
      </div>

      {/* Network Intelligence */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Network Distribution
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            {Object.keys(APP_CONFIG.plans).map(planId => (
              <div key={planId} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col items-center text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{APP_CONFIG.plans[planId as keyof typeof APP_CONFIG.plans].name}</p>
                <p className="text-4xl font-black text-slate-900 mb-1">{(stats.planDistribution && stats.planDistribution[planId]) || 0}</p>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">Active Nodes</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-900 text-white border-none p-8 flex flex-col justify-center">
           <h4 className="text-xl font-black mb-2 tracking-tight">Yield Multiplier</h4>
           <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
             Your customizable pack adoption is at <span className="text-emerald-400 font-black">
               {stats.activeRestaurants > 0 ? (((stats.planDistribution && stats.planDistribution['customizeble_pack']) || 0) / stats.activeRestaurants * 100).toFixed(1) : 0}%
             </span>. Focus on upselling Growth features to increase MRR.
           </p>
           <Button variant="primary" className="bg-emerald-600 hover:bg-emerald-700 border-none font-black uppercase tracking-widest text-[10px]">Generate Strategy Report</Button>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/requests"
            className="p-4 border border-border rounded-lg hover:border-accent hover:bg-bg-subtle transition-all"
          >
            <FileText className="w-8 h-8 text-accent mb-2" />
            <h4 className="font-semibold text-text mb-1">Review Requests</h4>
            <p className="text-sm text-text-secondary">
              {stats.pendingRequests} pending verification
            </p>
          </Link>

          <Link
            to="/admin/restaurants"
            className="p-4 border border-border rounded-lg hover:border-accent hover:bg-bg-subtle transition-all"
          >
            <StoreIcon className="w-8 h-8 text-accent mb-2" />
            <h4 className="font-semibold text-text mb-1">Manage Restaurants</h4>
            <p className="text-sm text-text-secondary">
              {stats.activeRestaurants} active restaurants
            </p>
          </Link>

          <Link
            to="/admin/analytics"
            className="p-4 border border-border rounded-lg hover:border-accent hover:bg-bg-subtle transition-all"
          >
            <TrendingUp className="w-8 h-8 text-accent mb-2" />
            <h4 className="font-semibold text-text mb-1">View Analytics</h4>
            <p className="text-sm text-text-secondary">
              Platform performance metrics
            </p>
          </Link>
        </div>
      </Card>

      {/* Alert if pending requests */}
      {stats.pendingRequests > 0 && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-warning mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-text mb-1">Action Required</h4>
            <p className="text-text-secondary text-sm">
              You have {stats.pendingRequests} pending registration request
              {stats.pendingRequests > 1 ? "s" : ""} waiting for review.{" "}
              <Link
                to="/admin/requests"
                className="text-accent hover:underline font-medium"
              >
                Review now
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
