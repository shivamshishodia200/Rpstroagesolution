import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import gsap from 'gsap';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { SEOHead } from '../components/seo/SEOHead';
import { getLocations } from '../services/api';

/**
 * Locations Directory Page — RP Storage Solution
 * 
 * Contains exactly three main sections:
 * 1. Existing Common Navbar
 * 2. Dynamic Locations Section (3-column desktop, 2-column tablet, 1-column mobile)
 * 3. Existing Common Footer
 */
export const Locations = ({ onOpenQuote }) => {
  const containerRef = useRef(null);

  // Pre-hydrated SSR data fallback or empty array
  const [cities, setCities] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.cities) {
      return window.__INITIAL_DATA__.cities;
    }
    return [];
  });
  const [loading, setLoading] = useState(() => cities.length === 0);
  const [error, setError] = useState(null);

  const fetchCities = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getLocations();
      if (res && res.success && Array.isArray(res.cities)) {
        setCities(res.cities);
      } else {
        setError('Failed to load verified locations. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Unable to connect to the service network. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If pre-hydrated data was not provided, fetch from backend API
    if (cities.length === 0) {
      fetchCities();
    }
  }, []);

  // Subtle GSAP scroll-reveal animation on location cards
  useEffect(() => {
    if (loading || cities.length === 0 || !containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.location-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading, cities.length]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. SEO Head & Structured Data */}
      <SEOHead
        title="Our Service Locations | RP Storage Solution"
        description="Explore RP Storage Solution's verified service areas and discover relevant storage solutions for your business."
        canonicalUrl="https://www.rpstoragesolution.com/locations/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'RP Storage Solution Service Locations',
          description: "Explore RP Storage Solution's verified service areas and discover relevant storage solutions for your business.",
          itemListElement: cities.map((c, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: `${c.name}, ${c.state || 'India'}`,
            url: `https://www.rpstoragesolution.com/locations/${c.slug}/`,
          })),
        }}
      />

      {/* Section 1: Existing Common Navbar */}
      <Navbar onOpenQuote={onOpenQuote} />

      {/* Section 2: Dynamic Locations Section */}
      <main className="flex-1 bg-white pt-32 sm:pt-36 lg:pt-40 pb-20 lg:pb-28" ref={containerRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-xs font-bold text-[#E85B12] uppercase tracking-wider mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span>Verified Service Areas</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#161616] tracking-tight leading-tight">
              Our Service Locations
            </h1>

            <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed font-normal">
              Explore RP Storage Solution's verified service areas and discover relevant storage solutions for your business.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-4 border-[#E85B12] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-semibold text-neutral-600">
                Loading verified service locations...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="mt-12 p-8 text-center bg-red-50 rounded-2xl border border-red-200 max-w-xl mx-auto">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900">Unable to Load Locations</h3>
              <p className="text-xs text-neutral-600 mt-1 mb-4">{error}</p>
              <button
                onClick={fetchCities}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E85B12] text-white rounded-xl text-xs font-bold hover:bg-[#c4490b] transition-colors shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && cities.length === 0 && (
            <div className="mt-12 py-16 text-center bg-[#F7F7F7] rounded-2xl border border-neutral-200 max-w-xl mx-auto p-8">
              <MapPin className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900">No Service Locations Available</h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-md mx-auto">
                We routinely fulfill custom industrial storage and supermarket racking installations across India. Contact our sales team for direct factory dispatch.
              </p>
              <button
                onClick={() => onOpenQuote && onOpenQuote()}
                className="mt-5 px-6 py-2.5 bg-[#E85B12] text-white rounded-xl text-xs font-bold hover:bg-[#c4490b] transition-colors shadow-sm"
              >
                Request Custom Survey
              </button>
            </div>
          )}

          {/* Polished Location Cards Grid (3-col Desktop, 2-col Tablet, 1-col Mobile) */}
          {!loading && !error && cities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12">
              {cities.map((city) => (
                <div
                  key={city.slug || city._id}
                  className="location-card group bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200 hover:border-[#E85B12] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    {/* Top Header: Location Icon + State */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E85B12] group-hover:bg-[#E85B12] group-hover:text-white transition-colors duration-300">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {city.state || 'India'}
                      </span>
                    </div>

                    {/* City Name */}
                    <h2 className="text-2xl font-black text-[#161616] group-hover:text-[#E85B12] transition-colors tracking-tight">
                      {city.name}
                    </h2>

                    {/* Short Verified Description */}
                    <p className="text-sm text-neutral-600 mt-3 line-clamp-3 leading-relaxed">
                      {city.description || (city.localRelevance ? `${city.localRelevance} - Direct factory storage solutions in ${city.name}.` : `Verified industrial storage systems, heavy-duty racking, and retail display racks in ${city.name}.`)}
                    </p>
                  </div>

                  {/* Explore Location Link */}
                  <div className="mt-6 pt-5 border-t border-neutral-100">
                    <Link
                      to={`/locations/${city.slug}/`}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#161616] group-hover:text-[#E85B12] transition-colors"
                    >
                      <span>Explore Location</span>
                      <ArrowRight className="w-4 h-4 text-[#E85B12] group-hover:translate-x-1.5 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Section 3: Existing Common Footer */}
      <Footer onOpenQuote={onOpenQuote} />
    </div>
  );
};

export default Locations;
