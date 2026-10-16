import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Layers,
  ShoppingBag,
  Home,
  Inbox,
  Search,
  FileCode2,
  Image,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Grid,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/cities', label: 'City Management', icon: MapPin },
    { to: '/city-homepages', label: 'City Homepages', icon: Globe },
    { to: '/mappings', label: 'Product × City Matrix', icon: Grid },
    { to: '/city-products', label: 'SEO Landing Pages', icon: Layers },
    { to: '/products', label: 'Product Catalog', icon: ShoppingBag },
    { to: '/homepage', label: 'Homepage CMS', icon: Home },
    { to: '/leads', label: 'Leads & Enquiries', icon: Inbox },
    { to: '/seo', label: 'SEO Audit & Tools', icon: Search },
    { to: '/sitemap', label: 'Sitemap Inspector', icon: FileCode2 },
    { to: '/media', label: 'Media Library', icon: Image },
    { to: '/users', label: 'Users & Roles', icon: Users, roleRequired: 'super_admin' },
    { to: '/settings', label: 'Site Settings', icon: Settings },
  ];

  const roleLabels = {
    super_admin: 'Super Administrator',
    seo_manager: 'SEO Lead / Manager',
    content_editor: 'Content Editor',
  };

  const roleColors = {
    super_admin: 'bg-purple-100 text-purple-800 border-purple-200',
    seo_manager: 'bg-blue-100 text-blue-800 border-blue-200',
    content_editor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FA] text-brand-dark">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-brand-border flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Brand Header */}
          <div className="h-16 px-6 border-b border-brand-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-brand-orange text-white flex items-center justify-center font-bold text-sm tracking-wider">
                RP
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-tight text-neutral-900 block leading-tight">
                  RP Storage
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                  Admin CMS & SEO
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 lg:hidden text-neutral-500 hover:text-neutral-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navLinks.map((item) => {
              if (item.roleRequired && user?.role !== item.roleRequired) {
                return null;
              }
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-semibold tracking-wide transition-all ${
                      isActive
                        ? 'bg-brand-orange text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout at Bottom */}
        <div className="p-4 border-t border-brand-border bg-neutral-50/60">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-neutral-200 text-neutral-800 flex items-center justify-center font-bold text-xs uppercase">
              {user?.name?.slice(0, 2) || 'AD'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-neutral-900 block truncate">
                {user?.name}
              </span>
              <span
                className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border inline-block mt-0.5 ${
                  roleColors[user?.role] || 'bg-neutral-100 text-neutral-700'
                }`}
              >
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-red-600 hover:bg-red-50 border border-neutral-200 rounded transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-brand-border px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 lg:hidden text-neutral-600 hover:text-neutral-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">RP Storage Solution</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-brand-orange font-bold">Dynamic SEO & CMS</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-brand-orange border border-neutral-200 hover:border-brand-orange px-3 py-1.5 rounded transition-colors"
            >
              <span>View Public Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
