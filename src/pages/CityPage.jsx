import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { AlertCircle, RefreshCw, WifiOff, MapPin } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { SEOHead } from '../components/seo/SEOHead';
import { NotFound } from './NotFound';
import { HomepageTemplate } from '../components/homepage/HomepageTemplate';
import { getCityLanding } from '../services/api';

/**
 * CityPage Component — Phase 8
 * Dynamically inherits the entire master homepage structure, styling, and animations,
 * while applying resolved field-level overrides, mapped product availability, and local SEO metadata.
 */
export const CityPage = ({ onOpenQuote, onViewDetails }) => {
  const { citySlug } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isPreview = queryParams.get('preview') === 'true';
  const previewToken = queryParams.get('token');

  const [data, setData] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.city) {
      if (window.__INITIAL_DATA__.city.slug === citySlug) {
        return window.__INITIAL_DATA__;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(() => !data);
  const [notFound, setNotFound] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    // Skip redundant network request if already pre-hydrated and not preview/reloaded
    if (data?.city?.slug === citySlug && reloadKey === 0 && !isPreview) {
      return;
    }

    const loadCity = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setErrorState(null);
        const params = {};
        if (isPreview && previewToken) {
          params.preview = true;
          params.token = previewToken;
        }
        const res = await getCityLanding(citySlug, params);
        if (mounted && res.success && res.city) {
          setData(res);
        } else {
          if (mounted) setNotFound(true);
        }
      } catch (err) {
        if (!mounted) return;

        // 1. Genuine 404: City not found or unpublished/unverified
        if (err.response && err.response.status === 404) {
          setNotFound(true);
          return;
        }

        // 2. Authorization issue (401 / 403)
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setErrorState({
            type: 'auth',
            title: 'Access Restricted',
            message:
              err.response.data?.message ||
              'You do not have permission to access this location record or preview token has expired.',
          });
          return;
        }

        // 3. Backend internal failure (500 / 5xx)
        if (err.response && err.response.status >= 500) {
          setErrorState({
            type: 'server',
            title: 'Server Error',
            message:
              'Our service encountered a temporary error loading location information. Please try again in a few moments.',
          });
          return;
        }

        // 4. Network error or CORS rejection (Axios ERR_NETWORK / ERR_FAILED without response)
        if (!err.response) {
          setErrorState({
            type: 'network',
            title: 'Unable to Connect to Server',
            message:
              'A network connectivity or cross-origin communication issue occurred while reaching the API. Please ensure your connection is active and retry.',
          });
          return;
        }

        // Fallback general error
        setErrorState({
          type: 'general',
          title: 'Error Loading Location',
          message:
            err.response?.data?.message ||
            err.message ||
            'An unexpected error occurred while loading this page.',
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadCity();
    return () => {
      mounted = false;
    };
  }, [citySlug, reloadKey, isPreview, previewToken]);

  const handleOpenQuote = (customData = {}) => {
    if (onOpenQuote) {
      onOpenQuote({
        city: data?.city?.name || citySlug,
        sourceUrl: window.location.pathname,
        ...customData,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar onOpenQuote={() => handleOpenQuote()} />
        <main className="flex-1 flex items-center justify-center py-28">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-[#E85B12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">Loading location details...</p>
          </div>
        </main>
        <Footer onOpenQuote={() => handleOpenQuote()} />
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
        <Navbar onOpenQuote={() => handleOpenQuote()} />
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
                to="/locations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#E85B12]" /> View Locations
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
        <Footer onOpenQuote={() => handleOpenQuote()} />
      </div>
    );
  }

  if (notFound || !data?.city) {
    return <NotFound onOpenQuote={() => handleOpenQuote()} />;
  }

  return (
    <>
      {isPreview && (
        <div className="bg-amber-500 text-black text-xs font-bold py-1.5 px-4 text-center sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2">
          <span>⚠️ Secure CMS Draft Preview Mode (Version {data?.cityHomepageVersion || 'Draft'})</span>
          <span className="text-[10px] bg-black/20 px-2 py-0.5 rounded">Changes Not Live</span>
        </div>
      )}
      <HomepageTemplate
        pageType="city"
        city={data?.city}
        content={data}
        onOpenQuote={handleOpenQuote}
        onViewDetails={onViewDetails}
      />
    </>
  );
};

export default CityPage;
