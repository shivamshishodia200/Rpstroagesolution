import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Eye, Send, CheckCircle2, ShieldCheck, Filter, Sparkles, Layers } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FEATURED_PRODUCTS } from '../../../data/companyData';
import { getProducts } from '../../../services/api';

import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

export const FeaturedProducts = ({
  onViewDetails,
  onEnquireProduct,
  products = null,
  heading,
  subtitle,
  cityContext,
  city = null,
  pageType = 'home',
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [productsList, setProductsList] = useState(() => {
    if (Array.isArray(products) && products.length > 0) {
      return products.map((p) => ({
        id: p.slug || p._id,
        name: p.name,
        category: p.categoryTitle || p.category,
        categoryId: p.category,
        shortDesc: p.shortDesc,
        image: p.images?.[0]?.url || p.image || '/images/gondola-display-rack-real.jpeg',
        specs: {
          loadCapacity: (p.specs && (p.specs.loadCapacity || p.specs['loadCapacity'])) || 'Industrial Heavy Duty',
          finish: (p.specs && (p.specs.finish || p.specs['finish'])) || 'Polyester Epoxy Powder Coated',
          ...(p.specs || {}),
        },
        detailedDesc: p.detailedDesc,
        material: p.material || 'Prime Grade CRCA Steel',
        standardHeight: (p.specs && p.specs.standardHeight) || '1800mm - 4500mm',
        slug: p.slug,
        targetUrl: p.targetUrl || (city?.slug
          ? (p.hasDedicatedSeoPage ? `/locations/${city.slug}/${p.slug}/` : `/products/${p.slug}/`)
          : `/products/${p.slug}/`),
        hasDedicatedSeoPage: p.hasDedicatedSeoPage,
      }));
    }
    return pageType === 'city' || city ? [] : FEATURED_PRODUCTS;
  });
  const sectionRef = useRef(null);

  useEffect(() => {
    // If external products were supplied (e.g. from resolved city homepage), use them directly
    if (Array.isArray(products)) {
      const formatted = products.map((p) => ({
        id: p.slug || p._id,
        name: p.name,
        category: p.categoryTitle || p.category,
        categoryId: p.category,
        shortDesc: p.shortDesc,
        image: p.images?.[0]?.url || p.image || '/images/gondola-display-rack-real.jpeg',
        specs: {
          loadCapacity: (p.specs && (p.specs.loadCapacity || p.specs['loadCapacity'])) || 'Industrial Heavy Duty',
          finish: (p.specs && (p.specs.finish || p.specs['finish'])) || 'Polyester Epoxy Powder Coated',
          ...(p.specs || {}),
        },
        detailedDesc: p.detailedDesc,
        material: p.material || 'Prime Grade CRCA Steel',
        standardHeight: (p.specs && p.specs.standardHeight) || '1800mm - 4500mm',
        slug: p.slug,
        targetUrl: p.targetUrl || (city?.slug
          ? (p.hasDedicatedSeoPage ? `/locations/${city.slug}/${p.slug}/` : `/products/${p.slug}/`)
          : `/products/${p.slug}/`),
        hasDedicatedSeoPage: p.hasDedicatedSeoPage,
      }));
      setProductsList(formatted);
      return;
    }

    // Only load global live products if not on a city-specific page
    if (pageType === 'city' || city) {
      setProductsList([]);
      return;
    }

    let isMounted = true;
    const loadLiveProducts = async () => {
      try {
        const res = await getProducts();
        if (isMounted && res.success && Array.isArray(res.products) && res.products.length > 0) {
          const formatted = res.products.map((p) => ({
            id: p.slug || p._id,
            name: p.name,
            category: p.categoryTitle || p.category,
            categoryId: p.category,
            shortDesc: p.shortDesc,
            image: p.images?.[0]?.url || '/images/gondola-display-rack-real.jpeg',
            specs: {
              loadCapacity: (p.specs && (p.specs.loadCapacity || p.specs['loadCapacity'])) || 'Industrial Heavy Duty',
              finish: (p.specs && (p.specs.finish || p.specs['finish'])) || 'Polyester Epoxy Powder Coated',
              ...(p.specs || {}),
            },
            detailedDesc: p.detailedDesc,
            material: p.material || 'Prime Grade CRCA Steel',
            standardHeight: (p.specs && p.specs.standardHeight) || '1800mm - 4500mm',
            slug: p.slug,
            targetUrl: `/products/${p.slug}/`,
          }));
          setProductsList(formatted);
        }
      } catch (err) {
        console.warn('API products fetch failed, using default showcase catalog', err);
      }
    };
    loadLiveProducts();
    return () => {
      isMounted = false;
    };
  }, [products, city, pageType]);

  const categories = [
    { id: 'all', label: 'All Engineered Systems' },
    { id: 'supermarket-racks', label: 'Supermarket Racks' },
    { id: 'warehouse-racking', label: 'Warehouse Racks' },
    { id: 'shopping-trolleys', label: 'Shopping Trolleys' },
    { id: 'industrial-storage', label: 'Industrial & Cabinets' },
    { id: 'checkout-counters', label: 'Checkout Counters' },
  ];

  const filteredProducts = selectedFilter === 'all'
    ? productsList
    : productsList.filter((p) => p.categoryId === selectedFilter);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.featured-product-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [selectedFilter]);

  return (
    <section 
      id="featured-products" 
      ref={sectionRef}
      className="py-20 sm:py-28 bg-[#FAFAFC] border-b border-neutral-200/80 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 mb-3">
              <span className="w-2 h-2 rounded-full bg-brand-orange" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-orange">
                Product Engineering Catalog
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-[#0F172A] tracking-tight leading-tight">
              {heading ? (
                heading
              ) : (
                <>
                  Featured Storage &{' '}
                  <span className="font-editorial-italic font-normal text-brand-orange">
                    Display Models.
                  </span>
                </>
              )}
            </h2>
          </div>
          <p className="text-neutral-500 text-sm sm:text-base max-w-md leading-relaxed">
            {subtitle || 'Standard manufactured specifications ready for dispatch, custom configurations, and turnkey on-site assembly across India.'}
          </p>
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-full bg-white border border-neutral-200/80 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 shrink-0 ml-1">
              <Filter className="w-3.5 h-3.5" />
            </div>
            {categories.map((cat) => {
              const isActive = selectedFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedFilter(cat.id)}
                  className={`px-4 py-2 text-xs font-bold tracking-wide rounded-full whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-[#0F172A] text-white shadow-sm'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const productHref =
              product.targetUrl ||
              (city?.slug
                ? (product.hasDedicatedSeoPage ? `/locations/${city.slug}/${product.slug}/` : `/products/${product.slug}/`)
                : `/products/${product.slug || product.id}/`);
            return (
              <div
                key={product.id}
                className="featured-product-card bg-white rounded-2xl border border-neutral-200/90 hover:border-brand-orange/60 transition-all duration-300 flex flex-col justify-between group p-5 hover:shadow-xl hover:shadow-neutral-900/5 hover:-translate-y-1 relative"
              >
                <div>
                  {/* Image Box */}
                  <Link to={productHref} className="block relative aspect-[4/3] rounded-xl bg-gradient-to-b from-neutral-50 to-neutral-100/70 overflow-hidden mb-4 border border-neutral-100 flex items-center justify-center p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-neutral-800 uppercase tracking-wider border border-neutral-200 shadow-2xs">
                      {product.category}
                    </div>
                    {product.hasDedicatedSeoPage && (
                      <div className="absolute top-2.5 right-2.5 bg-brand-orange text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                        Local Edition
                      </div>
                    )}
                  </Link>

                  {/* Title & Desc */}
                  <h3 className="text-base font-bold font-display text-[#0F172A] group-hover:text-brand-orange transition-colors mb-1.5 leading-snug line-clamp-1">
                    <Link to={productHref}>{product.name}</Link>
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-4 h-9">
                    {product.shortDesc}
                  </p>

                  {/* Key Spec Snippet */}
                  <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-200/70 text-[11px] space-y-1.5 mb-4">
                    <div className="flex items-center justify-between text-neutral-600">
                      <span className="font-semibold text-neutral-700">Load Capacity:</span>
                      <span className="font-mono font-medium text-neutral-800">{product.specs.loadCapacity || 'Industrial Grade'}</span>
                    </div>
                    <div className="flex items-center justify-between text-neutral-600">
                      <span className="font-semibold text-neutral-700">Surface Finish:</span>
                      <span className="truncate max-w-[130px] font-medium text-neutral-800">{product.specs.finish || 'Powder Coated'}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2">
                  <Link
                    to={productHref}
                    className="rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors text-center"
                  >
                    <Eye className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Specs</span>
                  </Link>

                  <button
                    onClick={() => onEnquireProduct({ ...product, city: cityContext })}
                    className="rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-orange-950/20"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Quote</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Custom Order Notice */}
        <div className="mt-14 text-center">
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl sm:rounded-full bg-white border border-neutral-200/80 shadow-2xs text-xs text-neutral-600 text-left sm:text-center max-w-full">
            <ShieldCheck className="w-4 h-4 text-brand-orange shrink-0" />
            <span>All dimensions and tier heights can be custom-machined to your exact architectural drawing specifications.</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default FeaturedProducts;
