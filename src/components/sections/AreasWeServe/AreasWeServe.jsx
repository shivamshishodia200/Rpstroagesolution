import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck, Truck, Clock, X } from 'lucide-react';
import { getHomepageData } from '../../../services/api';

export const AreasWeServe = ({ onOpenQuote, isOpen = false, onClose }) => {
  const [config, setConfig] = useState({
    enabled: true,
    title: 'Strategic Delivery & Installation Hubs',
    subtitle: 'Areas We Serve Across Delhi NCR & North India',
    description: 'Direct factory dispatch, on-site structural engineering survey, and rapid professional installation across verified NCR distribution zones.',
  });
  const [cities, setCities] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getHomepageData();
        if (mounted && res.success) {
          if (res.data?.homepage?.areasWeServe) {
            setConfig((prev) => ({ ...prev, ...res.data.homepage.areasWeServe }));
          }
          if (res.data?.verifiedCities) {
            setCities(res.data.verifiedCities);
          }
        }
      } catch (err) {
        console.warn('Using default verified areas data', err);
        if (mounted) {
          setCities([
            { name: 'Delhi', slug: 'delhi', state: 'Delhi', localRelevance: 'Primary Najafgarh Manufacturing Base & NCR Express Dispatch' },
            { name: 'Noida', slug: 'noida', state: 'Uttar Pradesh', localRelevance: 'Heavy Industrial Corridors & Logistical Parks' },
            { name: 'Gurugram', slug: 'gurugram', state: 'Haryana', localRelevance: 'Manesar Auto Hub, Cyber City Retail & Warehouses' },
            { name: 'Ghaziabad', slug: 'ghaziabad', state: 'Uttar Pradesh', localRelevance: 'Loni & Sahibabad Manufacturing Belt' },
            { name: 'Greater Noida', slug: 'greater-noida', state: 'Uttar Pradesh', localRelevance: 'Ecotech Mega Warehouse Zones & Fulfillment Hubs' },
            { name: 'Faridabad', slug: 'faridabad', state: 'Haryana', localRelevance: 'Heavy Engineering & Industrial Manufacturing Units' },
          ]);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Only render if isOpen is true
  if (!isOpen) {
    return null;
  }

  return (
    <section 
      id="areas-we-serve" 
      className="py-16 sm:py-24 bg-[#FAFAFA] border-t border-b border-neutral-200/80 animate-in fade-in duration-300 transition-all"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        
        {/* Section Header with Close Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 pb-6 border-b border-neutral-200">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-200/80 rounded-full text-xs font-bold text-[#FF5200] uppercase tracking-wider mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span>Verified Service Network</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0F172A] tracking-tight leading-tight">
              {config.title || 'Strategic Delivery & Installation Hubs'}
            </h2>
            <p className="mt-3.5 text-base sm:text-lg text-neutral-600 font-normal leading-relaxed">
              {config.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full sm:w-auto">
            <Link
              to="/locations"
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-[#FF5200] hover:text-[#E04800] group px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100/70 border border-orange-200 transition-all text-center"
            >
              <span>Explore All Delivery Hubs</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            {onClose && (
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-100 border border-neutral-300 text-neutral-700 hover:text-neutral-900 text-xs font-bold transition-all shadow-2xs text-center cursor-pointer"
                aria-label="Close Locations Hub"
              >
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

        {/* City Hubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <Link
              key={city.slug}
              to={`/locations/${city.slug}`}
              className="group bg-white rounded-2xl p-7 border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(255,82,0,0.09)] hover:border-[#FF5200]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#FF5200] flex items-center justify-center font-bold text-lg group-hover:bg-[#FF5200] group-hover:text-white transition-colors duration-300 shadow-2xs">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Coverage
                  </span>
                </div>

                <h3 className="text-xl font-bold text-[#0F172A] group-hover:text-[#FF5200] transition-colors font-display">
                  {city.name}
                </h3>
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mt-0.5">
                  {city.state || 'Delhi NCR Region'}
                </p>

                <p className="text-sm text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
                  {city.localRelevance || city.description || 'Full heavy-duty storage, mezzanine floors and supermarket racking available with quick delivery.'}
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-neutral-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-neutral-400" /> Factory Direct
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" /> Fast Turnaround
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-400 group-hover:bg-orange-50 group-hover:text-[#FF5200] transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#0F172A]">Need installation outside listed cities?</h4>
              <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
                We handle turnkey manufacturing & pan-India bulk project dispatches from our Najafgarh facility.
              </p>
            </div>
          </div>
          {onOpenQuote && (
            <button
              onClick={() => onOpenQuote()}
              className="w-full sm:w-auto px-6 py-3 bg-[#0F172A] hover:bg-[#FF5200] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors shrink-0 shadow-sm text-center"
            >
              Request Custom Site Survey
            </button>
          )}
        </div>

      </div>
    </section>
  );
};

export default AreasWeServe;
