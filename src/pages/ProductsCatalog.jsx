import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShieldCheck, ArrowRight, Eye, Send, Layers, CheckCircle2, Factory } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { SEOHead } from '../components/seo/SEOHead';
import { getProducts, getCategories } from '../services/api';
import { FEATURED_PRODUCTS } from '../data/companyData';

export const ProductsCatalog = ({ onOpenQuote, onViewDetails }) => {
  const [products, setProducts] = useState(() => {
    if (typeof window !== 'undefined' && window.__INITIAL_DATA__?.products) {
      return window.__INITIAL_DATA__.products;
    }
    return [];
  });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(() => products.length === 0);

  useEffect(() => {
    let mounted = true;
    const loadCatalog = async () => {
      try {
        if (products.length === 0) setLoading(true);
        const [prodRes, catRes] = await Promise.allSettled([
          getProducts(),
          getCategories(),
        ]);

        if (mounted) {
          if (prodRes.status === 'fulfilled' && prodRes.value.success && Array.isArray(prodRes.value.products)) {
            setProducts(prodRes.value.products);
          } else {
            // Fallback to static catalog if API is offline
            setProducts(
              FEATURED_PRODUCTS.map((p) => ({
                name: p.name,
                slug: p.id,
                category: p.categoryId,
                categoryTitle: p.category,
                shortDesc: p.shortDesc,
                images: [{ url: p.image, alt: p.name }],
                specs: p.specs,
                material: p.material,
              }))
            );
          }

          if (catRes.status === 'fulfilled' && catRes.value.success && Array.isArray(catRes.value.categories)) {
            setCategories(catRes.value.categories);
          } else {
            setCategories([
              { slug: 'supermarket-racks', name: 'Supermarket Racks' },
              { slug: 'warehouse-racking', name: 'Warehouse Racks' },
              { slug: 'shopping-trolleys', name: 'Shopping Trolleys' },
              { slug: 'industrial-storage', name: 'Industrial Storage' },
              { slug: 'checkout-counters', name: 'Checkout Counters' },
            ]);
          }
        }
      } catch (err) {
        console.error('Catalog load error', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCatalog();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.shortDesc?.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryTitle?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title="Industrial Storage & Supermarket Rack Catalog | RP Storage Solution"
        description="Comprehensive manufacturing catalog of heavy duty warehouse racks, pallet storage systems, supermarket display racks, mezzanine floors, and retail checkout counters direct from Delhi NCR factory."
        canonicalUrl="https://www.rpstoragesolution.com/products"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'RP Storage Solution Product Catalog',
          url: 'https://www.rpstoragesolution.com/products',
          description: 'Factory direct industrial storage and supermarket racking systems engineered with IS 2062 prime grade CRCA steel.',
        }}
      />

      <Navbar onOpenQuote={onOpenQuote} />

      <main className="flex-1">
        {/* Page Hero */}
        <section className="bg-gradient-to-b from-[#161616] to-[#222222] text-white pt-32 sm:pt-36 lg:pt-40 pb-16 px-4 sm:px-6 lg:px-8 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/20 border border-brand-orange/40 text-brand-orange text-xs font-bold uppercase tracking-wider mb-3">
                  <Factory className="w-3.5 h-3.5" />
                  <span>Direct Factory Manufacturing</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                  Industrial Storage & Supermarket Racking Systems
                </h1>
                <p className="mt-3 text-neutral-400 text-sm sm:text-base max-w-2xl leading-relaxed">
                  ISO 9001:2015 certified heavy-duty warehouse racks, pallet racking, supermarket display fixtures, mezzanine floors, and customized retail systems manufactured in Najafgarh, New Delhi.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => onOpenQuote && onOpenQuote()}
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-brand-orange hover:bg-brand-orangeHover text-white font-bold text-sm transition-all shadow-lg shadow-orange-950/30 flex items-center justify-center gap-2 text-center"
                >
                  <Send className="w-4 h-4" />
                  <span>Request Custom CAD Layout</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-xl relative">
              <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by model, category, or specifications..."
                className="w-full pl-12 pr-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-neutral-400 text-sm focus:outline-none focus:border-brand-orange focus:bg-white/15 transition-all"
              />
            </div>
          </div>
        </section>

        {/* Categories Bar */}
        <div className="border-b border-neutral-200 bg-neutral-50/80 sticky top-16 z-20 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-[#161616] text-white shadow-sm'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                All Systems ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.slug).length;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      selectedCategory === cat.slug
                        ? 'bg-brand-orange text-white shadow-sm'
                        : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {cat.name} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <section className="py-12 lg:py-16 bg-[#FAFAFC]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-neutral-500 text-sm font-semibold">Loading engineered product catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto">
                <Layers className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-neutral-900 mb-1">No matching storage systems found</h3>
                <p className="text-neutral-500 text-sm mb-6">
                  Try adjusting your search query or selecting a different category filter.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearch('');
                  }}
                  className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-lg transition-colors"
                >
                  Reset Catalog Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => {
                  const imageUrl = product.images?.[0]?.url || '/images/gondola-display-rack-real.jpeg';
                  const specs = product.specs || {};
                  return (
                    <div
                      key={product.slug}
                      className="bg-white rounded-2xl border border-neutral-200 hover:border-brand-orange/60 transition-all duration-300 flex flex-col justify-between group p-5 hover:shadow-xl hover:shadow-neutral-900/5 hover:-translate-y-1"
                    >
                      <div>
                        {/* Image */}
                        <div className="relative aspect-[4/3] rounded-xl bg-gradient-to-b from-neutral-50 to-neutral-100/70 overflow-hidden mb-4 border border-neutral-100 flex items-center justify-center p-4">
                          <img
                            src={imageUrl}
                            alt={product.images?.[0]?.alt || product.name}
                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-108 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = '/images/gondola-display-rack-real.jpeg';
                            }}
                          />
                          <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[10px] font-bold text-neutral-800 uppercase tracking-wider border border-neutral-200 shadow-2xs">
                            {product.categoryTitle || product.category}
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <h3 className="text-base font-bold font-display text-neutral-900 group-hover:text-brand-orange transition-colors mb-1.5 leading-snug line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-4 h-9">
                          {product.shortDesc}
                        </p>

                        {/* Specs Snippet */}
                        <div className="bg-neutral-50/80 rounded-xl p-3 border border-neutral-200/70 text-[11px] space-y-1.5 mb-4">
                          <div className="flex items-center justify-between text-neutral-600">
                            <span className="font-semibold text-neutral-700">Capacity:</span>
                            <span className="font-mono font-medium text-neutral-800">
                              {specs.loadCapacity || 'Heavy Duty Industrial'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-neutral-600">
                            <span className="font-semibold text-neutral-700">Finish:</span>
                            <span className="truncate max-w-[130px] font-medium text-neutral-800">
                              {specs.finish || 'Pure Polyester Powder Coat'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2">
                        <Link
                          to={`/products/${product.slug}`}
                          className="rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-1.5 transition-colors text-center"
                        >
                          <Eye className="w-3.5 h-3.5 text-neutral-600" />
                          <span>Specs</span>
                        </Link>

                        <button
                          onClick={() => onOpenQuote && onOpenQuote(product)}
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
            )}
          </div>
        </section>

        {/* Manufacturing Standards Strip */}
        <section className="bg-white py-12 border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">IS 2062 Prime CRCA Steel</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Precision CNC punched upright columns and load-bearing beams with certified yield strength.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">8-Tank Automated Pre-Treatment</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Hot phosphated and electrostatic pure polyester powder coated for anti-corrosion resilience.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-5 rounded-2xl bg-neutral-50 border border-neutral-200">
                <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shrink-0">
                  <Factory className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-neutral-900 mb-1">Factory Direct Najafgarh Dispatch</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Direct supply eliminates middleman markups with on-site structural installation teams across NCR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer onOpenQuote={onOpenQuote} />
    </div>
  );
};

export default ProductsCatalog;
