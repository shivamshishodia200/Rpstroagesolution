import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  ShoppingBag,
  Layers,
  Inbox,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  FileText,
  Clock,
  ExternalLink,
} from 'lucide-react';
import api from '../services/api';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/dashboard-stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Products Catalog',
      value: stats?.totalProducts || 0,
      sub: `${stats?.publishedProducts || 0} Published Live`,
      icon: ShoppingBag,
      link: '/products',
      color: 'text-neutral-900',
    },
    {
      label: 'Verified Service Cities',
      value: stats?.verifiedCities || 0,
      sub: `${stats?.publishedCities || 0} Published Landing Pages`,
      icon: MapPin,
      link: '/cities',
      color: 'text-brand-orange',
    },
    {
      label: 'City-Product SEO Pages',
      value: stats?.cityProductsTotal || 0,
      sub: `${stats?.cityProductsPublished || 0} Indexed Combinations`,
      icon: Layers,
      link: '/city-products',
      color: 'text-blue-600',
    },
    {
      label: 'Total Client Enquiries',
      value: stats?.totalEnquiries || 0,
      sub: `${stats?.newEnquiries || 0} New Leads Awaiting Response`,
      icon: Inbox,
      link: '/leads',
      color: 'text-emerald-600',
    },
  ];

  const statusColors = {
    new: 'bg-emerald-100 text-emerald-800',
    contacted: 'bg-blue-100 text-blue-800',
    quotation_sent: 'bg-amber-100 text-amber-800',
    follow_up: 'bg-purple-100 text-purple-800',
    won: 'bg-green-100 text-green-900 font-bold',
    lost: 'bg-neutral-100 text-neutral-600',
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            System Overview & Operations
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time MongoDB data, City-Based SEO pages, and lead pipeline.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/cities"
            className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>+ Add City</span>
          </Link>
          <Link
            to="/city-products"
            className="bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>+ Create SEO Combo</span>
          </Link>
          <Link
            to="/seo"
            className="bg-white hover:bg-neutral-50 border border-neutral-300 text-neutral-800 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors"
          >
            Run SEO Audit
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white p-5 border border-brand-border rounded hover:border-brand-orange/60 transition-all hover:shadow-md flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className="w-8 h-8 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className={`text-3xl font-extrabold ${card.color} block`}>
                  {card.value}
                </span>
                <span className="text-[11px] text-neutral-500 mt-1 block font-medium">
                  {card.sub}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Leads & Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recent Enquiries Table (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-brand-border rounded p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-brand-orange" />
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
                Recent Client Inquiries
              </h2>
            </div>
            <Link
              to="/leads"
              className="text-xs font-bold text-brand-orange hover:underline flex items-center gap-1"
            >
              <span>View All Leads ({stats?.totalEnquiries || 0})</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats?.recentEnquiries?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-mono text-[10px] uppercase">
                    <th className="pb-2.5">Customer</th>
                    <th className="pb-2.5">Phone / Contact</th>
                    <th className="pb-2.5">City</th>
                    <th className="pb-2.5">Product of Interest</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {stats.recentEnquiries.map((enq) => (
                    <tr key={enq._id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3 font-semibold text-neutral-900">
                        {enq.name}
                        {enq.company && <span className="block text-[10px] text-neutral-500">{enq.company}</span>}
                      </td>
                      <td className="py-3 font-mono text-neutral-700">{enq.phone}</td>
                      <td className="py-3 text-neutral-800 font-medium">{enq.city || '—'}</td>
                      <td className="py-3 text-neutral-600 truncate max-w-[160px]">{enq.productOfInterest}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColors[enq.status] || 'bg-neutral-100 text-neutral-700'}`}>
                          {enq.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-neutral-400 text-[11px]">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-neutral-400">
              No inquiries received yet. Submit an enquiry on the public website to test!
            </div>
          )}
        </div>

        {/* Right: Top Enquiry Locations & Quick Status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Top Cities */}
          <div className="bg-white border border-brand-border rounded p-6 shadow-sm">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>Top Enquiry Locations</span>
            </h3>

            {stats?.topCities?.length > 0 ? (
              <div className="space-y-3">
                {stats.topCities.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800">{item.city}</span>
                    <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-700 font-bold">
                      {item.count} leads
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">No city inquiry trends recorded yet.</p>
            )}
          </div>

          {/* Quick System Verification Notice */}
          <div className="bg-brand-orangeLight border border-brand-orange/30 rounded p-5 text-xs text-brand-dark">
            <div className="flex items-center gap-2 font-bold text-brand-orange mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Database Sync Active</span>
            </div>
            <p className="text-neutral-600 leading-relaxed mb-3">
              All city pages, product catalogs, and enquiries are stored in real MongoDB collections with server-side indexes.
            </p>
            <div className="text-[11px] font-mono text-neutral-500">
              MongoDB Port: 27017 | Node API Port: 5001
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
