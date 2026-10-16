import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Truck,
  ArrowRight,
  Phone,
  CheckCircle2,
  Layers,
  Wrench,
  Download,
  Share2,
  AlertCircle,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { SEOHead } from '../components/seo/SEOHead';
import { NotFound } from './NotFound';
import { getProductBySlug } from '../services/api';
import { ProductEnquiryCard } from '../components/ui/ProductEnquiryCard';

export const ProductPage = ({ onOpenQuote }) => {
  const { slug } = useParams();
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.product) {
      if (window.__INITIAL_DATA__.product.slug === slug) {
        return window.__INITIAL_DATA__;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !data);
  const [notFound, setNotFound] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    // Skip redundant network request if already pre-hydrated and not reloaded
    if (data?.product?.slug === slug && reloadKey === 0) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setErrorState(null);
        const res = await getProductBySlug(slug);
        if (mounted && res.success && res.product) {
          setData(res);
          setActiveImgIndex(0);
        } else {
          if (mounted) setNotFound(true);
        }
      } catch (err) {
        if (!mounted) return;

        // 1. Genuine 404
        if (err.response && err.response.status === 404) {
          setNotFound(true);
          return;
        }

        // 2. Auth issue (401 / 403)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setErrorState({
            type: 'auth',
            title: 'Access Restricted',
            message: err.response.data?.message || 'You do not have permission to view this product.',
          });
          return;
        }

        // 3. Server error (500)
        if (err.response && err.response.status >= 500) {
          setErrorState({
            type: 'server',
            title: 'Server Error',
            message: 'Our service encountered a temporary error loading product details. Please try again shortly.',
          });
          return;
        }

        // 4. Network or CORS error
        if (!err.response) {
          setErrorState({
            type: 'network',
            title: 'Unable to Connect to Server',
            message: 'A network connectivity or cross-origin communication issue occurred while reaching the API. Please ensure your connection is active and retry.',
          });
          return;
        }

        setErrorState({
          type: 'general',
          title: 'Error Loading Product',
          message: err.response?.data?.message || err.message || 'An unexpected error occurred.',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadProduct();
    return () => {
      mounted = false;
    };
  }, [slug, reloadKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar onOpenQuote={onOpenQuote} />
        <main className="flex-1 flex items-center justify-center py-28">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#E85B12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">Loading product specifications...</p>
          </div>
        </main>
        <Footer onOpenQuote={onOpenQuote} />
      </div>
    );
  }

  if (errorState) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <SEOHead
          title={`${errorState.title} | RP Storage Solution`}
          description={errorState.message}
          noindex={true}
        />
        <Navbar onOpenQuote={onOpenQuote} />
        <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-200">
              {errorState.type === 'network' ? (
                <WifiOff className="w-8 h-8" />
              ) : (
                <AlertCircle className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-semibold uppercase tracking-wider">
                {errorState.type === 'network' ? 'Network Connectivity' : 'Service Notice'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {errorState.title}
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                {errorState.message}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setReloadKey((prev) => prev + 1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E85B12] text-white rounded-xl text-xs font-bold hover:bg-[#c4490b] transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>

              <Link
                to="/products"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-[#E85B12]" /> View All Products
              </Link>
            </div>

            <div className="pt-4 border-t border-gray-100 text-xs text-gray-500">
              Need immediate assistance? Call our technical desk:{' '}
              <a href="tel:+919990023436" className="text-[#E85B12] font-semibold hover:underline">
                +91 99900 23436
              </a>
            </div>
          </div>
        </main>
        <Footer onOpenQuote={onOpenQuote} />
      </div>
    );
  }

  if (notFound || !data?.product) {
    return <NotFound onOpenQuote={onOpenQuote} />;
  }

  const { product, related = [] } = data;
  const images = (product.images && product.images.length > 0) ? product.images : [{ url: '/images/gondola-display-rack-real.jpeg', alt: product.name }];
  const currentImg = images[activeImgIndex] || images[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title={product.seoTitle || `${product.name} Manufacturer | RP Storage Solution`}
        description={product.metaDescription || product.shortDesc || `Heavy duty industrial ${product.name} direct from manufacturer in Delhi NCR.`}
        canonicalUrl={product.canonicalUrl || `https://www.rpstoragesolution.com/products/${product.slug}`}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.shortDesc,
          image: currentImg.url.startsWith('http') ? currentImg.url : `https://www.rpstoragesolution.com${currentImg.url}`,
          brand: {
            '@type': 'Brand',
            name: 'RP Storage Solution',
          },
        }}
      />

      <Navbar onOpenQuote={onOpenQuote} />

      <main className="flex-1">
        {/* Hero / Banner Section with Light-Blue Background (#AED2EC) */}
        <section className="bg-[#AED2EC] border-b border-[#9bc4e2] relative overflow-hidden pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-10 lg:pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center lg:items-start">
              {/* Left/Main Area: Breadcrumb + H1 + Subtitle + Trust Markers */}
              <div className="lg:col-span-7 xl:col-span-8 flex flex-col justify-center">
                {/* Breadcrumb: Home / Our Products / Product Name */}
                <nav className="flex items-center flex-wrap gap-2 text-xs text-gray-700 font-medium mb-4">
                  <Link to="/" className="hover:text-[#E85B12] transition-colors">Home</Link>
                  <span className="text-gray-400">/</span>
                  <Link to="/products" className="hover:text-[#E85B12] transition-colors">Our Products</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-bold">{product.name}</span>
                </nav>

                {/* Category & Engineering Badges */}
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm border border-blue-200/80 rounded-full text-xs font-bold text-[#E85B12] uppercase tracking-wider shadow-2xs">
                    <Layers className="w-3.5 h-3.5" />
                    {product.categoryTitle || product.category}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 bg-white/70 border border-blue-200/60 rounded-full text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                    Prime CRCA Steel
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 bg-white/70 border border-blue-200/60 rounded-full text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                    IS 2062 Certified
                  </span>
                </div>

                {/* H1 Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#161616] tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Short Description */}
                {product.shortDesc && (
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl">
                    {product.shortDesc}
                  </p>
                )}

                {/* Highlights / Trust Points */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-gray-800">
                  <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#E85B12]" />
                    <span>Heavy-Duty Load Tested</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#E85B12]" />
                    <span>7-Tank Anti-Rust Pretreatment</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#E85B12]" />
                    <span>Direct Factory Supply</span>
                  </div>
                </div>
              </div>

              {/* Right Area: Quick Enquiry Form Card */}
              <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end">
                <ProductEnquiryCard
                  productId={product._id}
                  productName={product.name}
                  className="shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Below Hero: Two-Column Product Content Layout */}
        <section className="py-12 lg:py-16 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
              {/* LEFT: Product Image & Gallery */}
              <div className="lg:col-span-6 space-y-4">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative">
                  <img
                    src={currentImg.url}
                    alt={currentImg.alt || product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/gondola-display-rack-real.jpeg';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-gray-800 uppercase tracking-wider border border-gray-200 shadow-sm">
                    Direct Factory Fabricated
                  </div>
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImgIndex(idx)}
                        className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImgIndex === idx
                            ? 'border-[#E85B12] ring-2 ring-orange-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img.url}
                          alt={img.alt || ''}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/gondola-display-rack-real.jpeg';
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quality Badges */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200 text-center text-xs">
                  <div>
                    <span className="font-bold text-gray-900 block text-[11px] sm:text-xs">Prime CRCA</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500">IS 2062 Grade A</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block text-[11px] sm:text-xs">7-Tank Treated</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500">Anti-Corrosion</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 block text-[11px] sm:text-xs">ISO 9001:2015</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500">Verified Quality</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Product Introduction, Description & Specifications */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-[#E85B12] uppercase tracking-wider mb-3">
                    <Layers className="w-3.5 h-3.5" />
                    Engineering Specifications
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    Structural Design & Technical Overview
                  </h2>

                  <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                    {product.description || product.shortDesc}
                  </p>

                  {/* Detailed Specs Table */}
                  {product.specs && (
                    <div className="mt-6 border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Engineered Load & Dimensional Parameters</span>
                        <span className="text-[10px] text-gray-500 font-normal">IS 2062 Verified</span>
                      </div>
                      <dl className="divide-y divide-gray-100 text-xs">
                        {Object.entries(product.specs).map(([label, val]) => (
                          <div key={label} className="grid grid-cols-1 sm:grid-cols-3 gap-0.5 sm:gap-2 px-4 py-2.5">
                            <dt className="text-gray-500 font-medium capitalize text-[11px] sm:text-xs">
                              {label.replace(/([A-Z])/g, ' $1')}
                            </dt>
                            <dd className="sm:col-span-2 text-gray-900 font-semibold text-xs break-words">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  )}

                  {/* Applications */}
                  {product.applications && product.applications.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Common Facility Applications
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {product.applications.map((app, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                          >
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Call to Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  <button
                    onClick={() => onOpenQuote && onOpenQuote(product)}
                    className="w-full sm:flex-1 py-3.5 px-6 bg-[#E85B12] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#c4490b] transition-colors shadow-sm text-center cursor-pointer"
                  >
                    Request Technical Drawing & Factory Quote
                  </button>

                  <a
                    href="tel:+919990023436"
                    className="w-full sm:w-auto py-3.5 px-5 border border-gray-300 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#E85B12]" />
                    Call Sales Desk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="py-16 bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-xl font-bold text-gray-900 mb-8">
                Related Industrial Storage Systems
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((rp) => (
                  <Link
                    key={rp.slug}
                    to={`/products/${rp.slug}`}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col justify-between"
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
                      <img
                        src={rp.images?.[0]?.url || '/images/gondola-display-rack-real.jpeg'}
                        alt={rp.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/images/gondola-display-rack-real.jpeg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#E85B12] transition-colors">
                        {rp.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {rp.shortDesc}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer onOpenQuote={onOpenQuote} />
    </div>
  );
};

export default ProductPage;
