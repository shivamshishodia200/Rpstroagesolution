import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Truck,
  ArrowRight,
  Phone,
  CheckCircle2,
  ChevronDown,
  Layers,
  Wrench,
  FileCheck,
  PackageCheck,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  Building,
  Clock,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { SEOHead } from '../components/seo/SEOHead';
import { NotFound } from './NotFound';
import { getCityProductLanding } from '../services/api';
import { ProductEnquiryCard } from '../components/ui/ProductEnquiryCard';

export const CityProductPage = ({ onOpenQuote }) => {
  const { citySlug, productSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const previewToken = searchParams.get('token');

  // Pre-hydrated state initialization from SSR
  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.cityProduct) {
      const initCp = window.__INITIAL_DATA__.cityProduct;
      const expectedCombined = `${citySlug}/${productSlug}`;
      if (initCp.slug === expectedCombined) {
        return window.__INITIAL_DATA__;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !data);
  const [notFound, setNotFound] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    let mounted = true;

    // If pre-hydrated state matches current route parameters and not reloaded, skip redundant network call
    if (data?.cityProduct?.slug === `${citySlug}/${productSlug}` && !isPreview && reloadKey === 0) {
      return;
    }

    const loadCityProduct = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setErrorState(null);
        const queryParams = {};
        if (isPreview) queryParams.preview = 'true';
        if (previewToken) queryParams.token = previewToken;

        const res = await getCityProductLanding(citySlug, productSlug, queryParams);
        if (mounted && res.success && res.cityProduct) {
          setData(res);
        } else {
          if (mounted) setNotFound(true);
        }
      } catch (err) {
        if (!mounted) return;

        // 1. Genuine 404: Not found or unpublished
        if (err.response && err.response.status === 404) {
          setNotFound(true);
          return;
        }

        // 2. Authorization issue (401 / 403)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setErrorState({
            type: 'auth',
            title: 'Access Restricted',
            message: err.response.data?.message || 'You do not have permission to view this landing page.',
          });
          return;
        }

        // 3. Backend internal failure (500 / 5xx)
        if (err.response && err.response.status >= 500) {
          setErrorState({
            type: 'server',
            title: 'Server Error',
            message: 'Our service encountered a temporary error loading specifications. Please try again shortly.',
          });
          return;
        }

        // 4. Network error or CORS rejection
        if (!err.response) {
          setErrorState({
            type: 'network',
            title: 'Unable to Connect to Server',
            message: 'A network connectivity or cross-origin communication issue occurred while reaching the API. Please ensure your connection is active and retry.',
          });
          return;
        }

        // Fallback general error
        setErrorState({
          type: 'general',
          title: 'Error Loading Page',
          message: err.response?.data?.message || err.message || 'An unexpected error occurred.',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCityProduct();
    return () => {
      mounted = false;
    };
  }, [citySlug, productSlug, isPreview, previewToken, reloadKey]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar onOpenQuote={onOpenQuote} />
        <main className="flex-1 flex items-center justify-center py-28">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#E85B12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">Loading targeted technical specifications...</p>
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
                to={`/locations/${citySlug}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#E85B12]" /> View City Hub
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

  if (notFound || !data?.cityProduct) {
    return <NotFound onOpenQuote={onOpenQuote} />;
  }

  const { cityProduct, otherCityProducts = [] } = data;
  const product = cityProduct.product || {};
  const city = cityProduct.city || {};
  const images = (product?.images && product.images.length > 0)
    ? product.images
    : (cityProduct.images && cityProduct.images.length > 0)
      ? cityProduct.images
      : [{ url: '/images/gondola-display-rack-real.jpeg', alt: cityProduct.productName }];
  const currentImg = images[activeImgIndex] || images[0];

  const defaultFaqs = [
    {
      q: `What is the load-bearing rating for ${cityProduct.productName} supplied in ${cityProduct.cityName}?`,
      a: `All our ${cityProduct.productName} units are structurally engineered to support standard warehouse capacities ranging from 500 kg UDL up to 4,000 kg per pallet level, verified using finite element analysis (FEA) compliant with IS 2062 steel specifications.`,
    },
    {
      q: `How quickly can installation be completed on-site in ${cityProduct.cityName}?`,
      a: `Following layout approval, factory-direct shipments arrive in ${cityProduct.cityName} within 48–72 hours. Our certified installation crew completes leveling, base anchoring, and load-rating certification within 1 to 3 days depending on floor area.`,
    },
    {
      q: `Can upright frames and beam levels be reconfigured later as our inventory expands?`,
      a: `Yes. All beams feature 50mm pitch adjustable slotted hook connectors with safety locking pins. You can easily adjust shelf levels or add bays as storage demand grows.`,
    },
  ];

  const faqs = (cityProduct.faqs && cityProduct.faqs.length > 0) ? cityProduct.faqs : defaultFaqs;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {isPreview && (
        <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 tracking-wide sticky top-0 z-50 shadow-md">
          <AlertTriangle className="w-4 h-4" />
          <span>DRAFT PREVIEW MODE — UNPUBLISHED CONTENT (ROBOTS NOINDEX ACTIVE)</span>
        </div>
      )}

      <SEOHead
        title={cityProduct.seoTitle || `${cityProduct.productName} Manufacturer in ${cityProduct.cityName} | RP Storage Solution`}
        description={cityProduct.metaDescription || `Heavy-duty ${cityProduct.productName} in ${cityProduct.cityName}. Direct factory supply, custom load capacity & site survey from Najafgarh.`}
        canonicalUrl={cityProduct.canonicalUrl || `https://www.rpstoragesolution.com/locations/${citySlug}/${productSlug}`}
        noindex={isPreview || cityProduct.robotsDirective?.includes('noindex')}
        schema={{
          '@context': 'https://schema.org',
          '@type': cityProduct.schemaType || 'Product',
          name: `${cityProduct.productName} - ${cityProduct.cityName}`,
          description: cityProduct.customContent ? cityProduct.customContent.replace(/<[^>]*>/g, ' ') : cityProduct.metaDescription,
          brand: {
            '@type': 'Brand',
            name: 'RP Storage Solution',
          },
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'INR',
            lowPrice: '1500',
            offerCount: '100',
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
                {/* Breadcrumb: Home / City / Product Name in City */}
                <nav className="flex items-center flex-wrap gap-2 text-xs text-gray-700 font-medium mb-4">
                  <Link to="/" className="hover:text-[#E85B12] transition-colors">Home</Link>
                  <span className="text-gray-400">/</span>
                  <Link to={`/locations/${citySlug}`} className="hover:text-[#E85B12] transition-colors">{cityProduct.cityName}</Link>
                  <span className="text-gray-400">/</span>
                  <span className="text-gray-900 font-bold">
                    {cityProduct.productName ? `${cityProduct.productName} in ${cityProduct.cityName}` : cityProduct.h1Heading}
                  </span>
                </nav>

                {/* Location & Material Badges */}
                <div className="flex items-center flex-wrap gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/90 backdrop-blur-sm border border-blue-200/80 rounded-full text-xs font-bold text-[#E85B12] uppercase tracking-wider shadow-2xs">
                    <MapPin className="w-3.5 h-3.5" />
                    {cityProduct.cityName} Industrial Corridors
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 bg-white/70 border border-blue-200/60 rounded-full text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                    Direct Factory Supply
                  </span>
                  <span className="inline-flex items-center px-2.5 py-1 bg-white/70 border border-blue-200/60 rounded-full text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                    CRCA IS 2062
                  </span>
                </div>

                {/* H1 Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#161616] tracking-tight leading-tight break-words">
                  {cityProduct.h1Heading || `${cityProduct.productName} in ${cityProduct.cityName}`}
                </h1>

                {/* Local Technical Introduction */}
                {cityProduct.introContent ? (
                  <div
                    className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl font-medium"
                    dangerouslySetInnerHTML={{ __html: cityProduct.introContent }}
                  />
                ) : (
                  <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 leading-relaxed max-w-3xl font-medium">
                    {product?.shortDesc
                      ? `${product.shortDesc} Direct factory supply and verified on-site installation across ${cityProduct.cityName}.`
                      : `Direct factory supply of certified ${cityProduct.productName} with prompt delivery and professional installation across ${cityProduct.cityName}.`}
                  </p>
                )}

                {/* Highlights / Trust Points */}
                <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold text-gray-800">
                  <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#E85B12]" />
                    <span>{cityProduct.cityName} Regional Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#E85B12]" />
                    <span>IS 2062 Load Rated</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                    <CheckCircle2 className="w-4 h-4 text-[#E85B12]" />
                    <span>Free Layout Feasibility</span>
                  </div>
                </div>
              </div>

              {/* Right Area: Quick Enquiry Form Card */}
              <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end">
                <ProductEnquiryCard
                  productId={product?._id}
                  productName={cityProduct.productName}
                  cityId={city?._id}
                  cityName={cityProduct.cityName}
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
                    alt={currentImg.alt || cityProduct.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/gondola-display-rack-real.jpeg';
                    }}
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-gray-800 uppercase tracking-wider border border-gray-200 shadow-sm flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#E85B12]" />
                    <span>Direct Factory Supply to {cityProduct.cityName}</span>
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
                    <span className="font-bold text-gray-900 block text-[11px] sm:text-xs">5-Year Structural</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-500">Verified Quality</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Product Introduction, Description & Specifications */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-[#E85B12] uppercase tracking-wider mb-3">
                    <Layers className="w-3.5 h-3.5" />
                    Engineering Specifications — {cityProduct.cityName}
                  </span>

                  <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                    Structural Design & Local Engineering Overview
                  </h2>

                  {/* Custom Rich Content */}
                  <div
                    className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html:
                        cityProduct.customContent ||
                        (product?.detailedDesc
                          ? `<p>${product.detailedDesc}</p><p class="mt-2">Supplied directly from our Najafgarh manufacturing facility with full load certification and turnkey installation support throughout ${cityProduct.cityName}.</p>`
                          : `<p>RP Storage Solution provides certified ${cityProduct.productName} engineered for optimal durability and space efficiency in ${cityProduct.cityName}.</p>`),
                    }}
                  />

                  {/* Benefits List */}
                  {cityProduct.benefits && cityProduct.benefits.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <span className="text-xs font-bold text-[#E85B12] uppercase tracking-wider block mb-3">
                        Key Technical Advantages in {cityProduct.cityName}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-800">
                        {cityProduct.benefits.map((b, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-[#E85B12] shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Specs Table */}
                  {product?.specs && (
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

                  {/* Contextual Internal Links */}
                  {cityProduct.internalLinks && cityProduct.internalLinks.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
                      <span className="text-gray-400 font-bold uppercase text-[10px] mr-1">Related Pages:</span>
                      {cityProduct.internalLinks.map((link, idx) => (
                        <Link key={idx} to={link.targetUrl} className="text-[#E85B12] hover:underline font-semibold">
                          {link.anchorText}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Call to Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
                  <button
                    onClick={() => onOpenQuote && onOpenQuote({ name: `${cityProduct.productName} (${cityProduct.cityName})` })}
                    className="w-full sm:flex-1 py-3.5 px-6 bg-[#E85B12] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#c4490b] transition-colors shadow-sm text-center cursor-pointer"
                  >
                    {cityProduct.enquiryCta?.buttonText || 'Request Technical Drawing & Quote'}
                  </button>

                  <a
                    href={`tel:${cityProduct.enquiryCta?.phone || '+919990023436'}`}
                    className="w-full sm:w-auto py-3.5 px-5 border border-gray-300 text-gray-700 rounded-xl text-xs sm:text-sm font-bold hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#E85B12]" />
                    Call Sales: {cityProduct.enquiryCta?.phone || '+91 99900 23436'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommended Applications */}
        {cityProduct.applications && cityProduct.applications.length > 0 && (
          <section className="py-16 bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl mb-8">
                <span className="text-xs font-bold text-[#E85B12] uppercase tracking-wider">
                  Target Industries
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                  Applications in {cityProduct.cityName}
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {cityProduct.applications.map((app, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 flex items-center gap-2.5 shadow-2xs">
                    <Building className="w-4 h-4 text-[#E85B12] shrink-0" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Genuine Local Service Information */}
        {cityProduct.localBusinessInfo && (cityProduct.localBusinessInfo.hubName || cityProduct.localBusinessInfo.warehouseAddress) && (
          <section className="py-16 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-orange-50/40 border border-orange-200 rounded-2xl p-6 sm:p-8">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E85B12] uppercase tracking-wider mb-2">
                  <Truck className="w-4 h-4" />
                  <span>Genuine Local Service Information</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {cityProduct.localBusinessInfo.hubName || `${cityProduct.cityName} Logistics & Distribution`}
                </h3>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-700">
                  {cityProduct.localBusinessInfo.warehouseAddress && (
                    <div className="bg-white p-4 rounded-xl border border-orange-100">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                        <MapPin className="w-3.5 h-3.5 text-[#E85B12]" />
                        Hub / Facility Address:
                      </span>
                      <p className="text-gray-600">{cityProduct.localBusinessInfo.warehouseAddress}</p>
                    </div>
                  )}
                  {cityProduct.localBusinessInfo.deliveryTimelines && (
                    <div className="bg-white p-4 rounded-xl border border-orange-100">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                        <Clock className="w-3.5 h-3.5 text-[#E85B12]" />
                        Delivery Timelines:
                      </span>
                      <p className="text-gray-600">{cityProduct.localBusinessInfo.deliveryTimelines}</p>
                    </div>
                  )}
                  {cityProduct.localBusinessInfo.servicePhone && (
                    <div className="bg-white p-4 rounded-xl border border-orange-100">
                      <span className="font-bold text-gray-900 flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-[#E85B12]" />
                        Direct Helpline:
                      </span>
                      <p className="text-gray-600 font-mono font-bold">{cityProduct.localBusinessInfo.servicePhone}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* City Product FAQs */}
        <section className="py-16 bg-gray-50 border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-bold text-[#E85B12] uppercase tracking-wider">
                Technical FAQ
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-2">
                Questions About {cityProduct.productName} in {cityProduct.cityName}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-200 bg-white rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-gray-900 hover:text-[#E85B12]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        openFaq === idx ? 'rotate-180 text-[#E85B12]' : 'text-gray-400'
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other City Solutions in this location */}
        {otherCityProducts.length > 0 && (
          <section className="py-12 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Other Storage Configurations Available in {cityProduct.cityName}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {otherCityProducts.map((ocp) => (
                  <Link
                    key={ocp.slug}
                    to={`/locations/${ocp.slug}`}
                    className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 text-xs font-bold text-gray-700 hover:border-[#E85B12] hover:text-[#E85B12] transition-colors inline-flex items-center gap-1.5"
                  >
                    <Layers className="w-3.5 h-3.5 text-gray-400" />
                    <span>{ocp.h1Heading || ocp.productName}</span>
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

export default CityProductPage;
