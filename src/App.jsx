import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SmoothScrollProvider } from './components/layout/SmoothScrollProvider';
import { QuoteModal } from './components/ui/QuoteModal';
import { ProductDetailModal } from './components/ui/ProductDetailModal';

import { ScrollToTop } from './components/layout/ScrollToTop';

// Pages
import Home from './pages/Home';
import Locations from './pages/Locations';
import CityPage from './pages/CityPage';
import CityProductPage from './pages/CityProductPage';
import ProductPage from './pages/ProductPage';
import ProductsCatalog from './pages/ProductsCatalog';
import NotFound from './pages/NotFound';

export function App() {
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteProduct, setQuoteProduct] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState(null);

  // Trigger Quote modal with optional prefilled product
  const handleOpenQuote = (product = null) => {
    setQuoteProduct(product);
    setQuoteModalOpen(true);
  };

  // Trigger Product Details modal
  const handleViewDetails = (product) => {
    setDetailProduct(product);
    setDetailModalOpen(true);
  };

  return (
    <HelmetProvider>
      <SmoothScrollProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* 1. Main Homepage with dynamic CMS sections */}
            <Route
              path="/"
              element={
                <Home
                  onOpenQuote={handleOpenQuote}
                  onViewDetails={handleViewDetails}
                />
              }
            />

            {/* 2. Verified Service Hubs & Delivery Locations Index */}
            <Route
              path="/locations"
              element={<Locations onOpenQuote={handleOpenQuote} />}
            />

            {/* 3. Dynamic City Landing Page */}
            <Route
              path="/locations/:citySlug"
              element={<CityPage onOpenQuote={handleOpenQuote} />}
            />

            {/* 4. Dynamic City + Product SEO Landing Page */}
            <Route
              path="/locations/:citySlug/:productSlug"
              element={<CityProductPage onOpenQuote={handleOpenQuote} />}
            />

            {/* 5. Master Product Catalog Page */}
            <Route
              path="/products"
              element={
                <ProductsCatalog
                  onOpenQuote={handleOpenQuote}
                  onViewDetails={handleViewDetails}
                />
              }
            />

            {/* 6. Product Detail Page */}
            <Route
              path="/products/:slug"
              element={<ProductPage onOpenQuote={handleOpenQuote} />}
            />

            {/* 6. Dynamic 404 Route */}
            <Route
              path="*"
              element={<NotFound onOpenQuote={handleOpenQuote} />}
            />
          </Routes>

          {/* Global Modals */}
          <QuoteModal
            isOpen={quoteModalOpen}
            onClose={() => {
              setQuoteModalOpen(false);
              setQuoteProduct(null);
            }}
            preselectedProduct={quoteProduct}
          />

          <ProductDetailModal
            isOpen={detailModalOpen}
            product={detailProduct}
            onClose={() => {
              setDetailModalOpen(false);
              setDetailProduct(null);
            }}
            onEnquire={(prod) => {
              handleOpenQuote(prod);
            }}
          />
        </BrowserRouter>
      </SmoothScrollProvider>
    </HelmetProvider>
  );
}

export default App;
