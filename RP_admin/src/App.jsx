import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLayout from './layouts/AdminLayout';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Cities } from './pages/Cities';
import { CityProducts } from './pages/CityProducts';
import { Products } from './pages/Products';
import { HomepageCMS } from './pages/HomepageCMS';
import { CityHomepages } from './pages/CityHomepages';
import { Leads } from './pages/Leads';
import SEOAudit from './pages/SEOAudit';
import SitemapInspector from './pages/SitemapInspector';
import MediaLibrary from './pages/MediaLibrary';
import Users from './pages/Users';
import Settings from './pages/Settings';
import { ProductCityMapping } from './pages/ProductCityMapping';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#E85B12] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'super_admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="cities" element={<Cities />} />
            <Route path="city-homepages" element={<CityHomepages />} />
            <Route path="mappings" element={<ProductCityMapping />} />
            <Route path="city-products" element={<CityProducts />} />
            <Route path="products" element={<Products />} />
            <Route path="homepage" element={<HomepageCMS />} />
            <Route path="leads" element={<Leads />} />
            <Route path="seo" element={<SEOAudit />} />
            <Route path="sitemap" element={<SitemapInspector />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRole="super_admin">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
