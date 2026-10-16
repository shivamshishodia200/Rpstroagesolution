import React, { useState, useEffect } from 'react';
import {
  Grid,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckSquare,
  Square,
  Layers,
  MapPin,
  Save,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProductCityMapping = () => {
  const { user } = useAuth();
  const canEdit = user?.role === 'super_admin' || user?.role === 'seo_manager';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [cities, setCities] = useState([]);
  const [matrix, setMatrix] = useState({}); // `${pId}_${cId}`: { isAvailable, _id }
  const [seoPages, setSeoPages] = useState({}); // `${pId}_${cId}`: slug

  // Filter & Search states
  const [productSearch, setProductSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');

  // Lists for dropdown filters
  const [categories, setCategories] = useState([]);
  const [states, setStates] = useState([]);

  // Bulk Selection States
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedCityIds, setSelectedCityIds] = useState([]);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkActionTarget, setBulkActionTarget] = useState(true); // true = enable, false = disable

  // Toast notifications
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };

  const loadMatrixData = async () => {
    setLoading(true);
    try {
      const [matrixRes, catRes, stateRes] = await Promise.all([
        api.get('/product-city-mappings/matrix'),
        api.get('/categories'),
        api.get('/states'),
      ]);

      if (matrixRes.data.success) {
        setProducts(matrixRes.data.products || []);
        setCities(matrixRes.data.cities || []);
        setMatrix(matrixRes.data.matrix || {});
        setSeoPages(matrixRes.data.seoPages || {});
      }

      if (catRes.data.success) {
        setCategories(catRes.data.categories || []);
      }
      if (stateRes.data.success) {
        setStates(stateRes.data.states || []);
      }
    } catch (err) {
      console.error('Failed to load mapping matrix', err);
      showFeedback('error', 'Failed to load availability matrix data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatrixData();
  }, []);

  // Filtered rows (Products)
  const filteredProducts = products.filter((p) => {
    const matchesSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Filtered columns (Cities)
  const filteredCities = cities.filter((c) => {
    const matchesSearch = !citySearch || c.name.toLowerCase().includes(citySearch.toLowerCase());
    const matchesState = selectedState === 'all' || c.state === selectedState;
    return matchesSearch && matchesState;
  });

  // Toggle single mapping
  const handleToggleCell = async (productId, cityId) => {
    if (!canEdit) {
      showFeedback('error', 'Your role has read-only access. Super Admin or SEO Manager required.');
      return;
    }

    const key = `${productId}_${cityId}`;
    const currentStatus = matrix[key]?.isAvailable || false;
    const nextStatus = !currentStatus;

    // Optimistic UI Update
    setMatrix((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        isAvailable: nextStatus,
      },
    }));

    try {
      const res = await api.post('/product-city-mappings', {
        productId,
        cityId,
        isAvailable: nextStatus,
      });

      if (res.data.success) {
        setMatrix((prev) => ({
          ...prev,
          [key]: {
            _id: res.data.mapping._id,
            isAvailable: res.data.mapping.isAvailable,
          },
        }));
      }
    } catch (err) {
      // Revert on error
      setMatrix((prev) => ({
        ...prev,
        [key]: {
          ...(prev[key] || {}),
          isAvailable: currentStatus,
        },
      }));
      showFeedback('error', 'Failed to update mapping. Please retry.');
    }
  };

  // Bulk Update Confirmation
  const executeBulkUpdate = async () => {
    if (selectedProductIds.length === 0 || selectedCityIds.length === 0) {
      showFeedback('error', 'Please select at least one product and one city.');
      return;
    }

    setSaving(true);
    try {
      const res = await api.post('/product-city-mappings/bulk', {
        productIds: selectedProductIds,
        cityIds: selectedCityIds,
        isAvailable: bulkActionTarget,
      });

      if (res.data.success) {
        showFeedback(
          'success',
          `Successfully ${bulkActionTarget ? 'enabled' : 'disabled'} ${selectedProductIds.length * selectedCityIds.length} product-city mapping(s)!`
        );
        // Refresh matrix
        await loadMatrixData();
        setBulkModalOpen(false);
        setSelectedProductIds([]);
        setSelectedCityIds([]);
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Bulk operation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Grid className="w-6 h-6 text-brand-orange" />
            <span>Product × City Availability Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Control physical delivery and warehouse installation availability per region independently of published SEO pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadMatrixData}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-bold rounded-lg border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {canEdit && (
            <button
              onClick={() => {
                if (selectedProductIds.length === 0 || selectedCityIds.length === 0) {
                  showFeedback('error', 'Select products (rows) and cities (columns) using checkboxes first.');
                  return;
                }
                setBulkModalOpen(true);
              }}
              disabled={selectedProductIds.length === 0 || selectedCityIds.length === 0}
              className={`px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all ${
                selectedProductIds.length > 0 && selectedCityIds.length > 0
                  ? 'bg-brand-orange text-white hover:bg-brand-orangeHover'
                  : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>
                Bulk Action ({selectedProductIds.length}P × {selectedCityIds.length}C)
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback.message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-between animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="hover:opacity-75">
            ✕
          </button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Product Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-orange focus:bg-white"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-orange focus:bg-white"
          >
            <option value="all">All Product Categories</option>
            {categories.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Search */}
        <div className="relative">
          <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Search cities..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-orange focus:bg-white"
          />
        </div>

        {/* State Filter */}
        <div>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-brand-orange focus:bg-white"
          >
            <option value="all">All States & Territories</option>
            {states.map((st) => (
              <option key={st.code || st.name} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Legend & Instructions */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-bold flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>Matrix Legend:</span>
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available in City
          </span>
          <span className="inline-flex items-center gap-1 text-neutral-500 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" /> Not Available
          </span>
          <span className="inline-flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
            <ExternalLink className="w-3 h-3" /> Dedicated SEO Page
          </span>
          <span className="inline-flex items-center gap-1 text-neutral-700 font-semibold bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200">
            Master URL Fallback
          </span>
        </div>

        <span className="text-[11px] text-amber-700 italic">
          Click any cell to toggle availability. Changes persist immediately to MongoDB.
        </span>
      </div>

      {/* Matrix Table Container */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-bold text-neutral-500">Loading availability matrix...</p>
          </div>
        ) : filteredProducts.length === 0 || filteredCities.length === 0 ? (
          <div className="py-20 text-center text-neutral-500">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
            <p className="font-bold text-sm">No products or cities matched your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[650px] relative">
            <table className="w-full text-left border-collapse text-xs">
              {/* Table Header: Cities as Columns */}
              <thead className="bg-neutral-100/90 sticky top-0 z-10 border-b border-neutral-200">
                <tr>
                  {/* Row Checkbox & Product Column Sticky Header */}
                  <th className="p-3 sticky left-0 z-20 bg-neutral-100 min-w-[260px] max-w-[300px] border-r border-neutral-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={
                            filteredProducts.length > 0 &&
                            selectedProductIds.length === filteredProducts.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(filteredProducts.map((p) => p._id));
                            } else {
                              setSelectedProductIds([]);
                            }
                          }}
                          className="rounded text-brand-orange focus:ring-brand-orange cursor-pointer"
                        />
                        <span className="font-black text-neutral-800 uppercase tracking-wider text-[11px]">
                          Products ({filteredProducts.length})
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-normal">Select All</span>
                    </div>
                  </th>

                  {/* City Column Headers */}
                  {filteredCities.map((city) => {
                    const isSelected = selectedCityIds.includes(city._id);
                    return (
                      <th
                        key={city._id}
                        className="p-3 min-w-[130px] border-r border-neutral-200 text-center bg-neutral-100 hover:bg-neutral-200/60 transition-colors"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedCityIds((prev) => [...prev, city._id]);
                                } else {
                                  setSelectedCityIds((prev) => prev.filter((id) => id !== city._id));
                                }
                              }}
                              className="rounded text-brand-orange focus:ring-brand-orange cursor-pointer"
                            />
                            <span className="font-bold text-neutral-900 leading-tight">{city.name}</span>
                          </label>
                          <span className="text-[10px] text-neutral-500 font-medium">{city.state}</span>
                          {city.isVerified && (
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200 font-bold">
                              Verified
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              {/* Table Body: Products as Rows */}
              <tbody className="divide-y divide-neutral-200">
                {filteredProducts.map((product) => {
                  const isProductSelected = selectedProductIds.includes(product._id);

                  return (
                    <tr key={product._id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Sticky Product Cell */}
                      <td className="p-3 sticky left-0 z-10 bg-white border-r border-neutral-200 shadow-xs">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={isProductSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds((prev) => [...prev, product._id]);
                              } else {
                                setSelectedProductIds((prev) => prev.filter((id) => id !== product._id));
                              }
                            }}
                            className="rounded text-brand-orange focus:ring-brand-orange cursor-pointer"
                          />
                          <div className="overflow-hidden">
                            <p className="font-bold text-neutral-900 truncate leading-tight">{product.name}</p>
                            <span className="text-[10px] text-neutral-500 font-medium block truncate">
                              {product.categoryTitle || product.category}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Mapping Cells */}
                      {filteredCities.map((city) => {
                        const cellKey = `${product._id}_${city._id}`;
                        const isAvailable = matrix[cellKey]?.isAvailable || false;
                        const seoSlug = seoPages[cellKey];

                        return (
                          <td
                            key={city._id}
                            onClick={() => handleToggleCell(product._id, city._id)}
                            className={`p-3 text-center border-r border-neutral-200 cursor-pointer select-none transition-colors ${
                              isAvailable ? 'bg-emerald-50/40 hover:bg-emerald-100/60' : 'hover:bg-neutral-100'
                            }`}
                          >
                            <div className="flex flex-col items-center justify-center gap-1">
                              {isAvailable ? (
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold shadow-2xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Active</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 text-neutral-400 text-[11px] font-medium">
                                  <XCircle className="w-3.5 h-3.5 text-neutral-300" />
                                  <span>Off</span>
                                </div>
                              )}

                              {/* SEO Page Status Indicator */}
                              {seoSlug ? (
                                <a
                                  href={`/locations/${seoSlug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  title={`Dedicated SEO page published: /locations/${seoSlug}`}
                                  className="text-[9px] text-blue-700 hover:text-blue-900 inline-flex items-center gap-0.5 bg-blue-50 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-300 mt-1 font-bold shadow-2xs"
                                >
                                  <ExternalLink className="w-2.5 h-2.5" />
                                  <span>Dedicated SEO</span>
                                </a>
                              ) : isAvailable ? (
                                <span
                                  title="Available in this city, but no dedicated SEO page is published yet. Navigation falls back to master product URL."
                                  className="text-[9px] text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200 mt-1 font-medium inline-flex items-center gap-0.5"
                                >
                                  <span>Master Fallback</span>
                                </span>
                              ) : null}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Action Modal */}
      {bulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <h3 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-orange" />
              <span>Bulk Availability Update</span>
            </h3>

            <p className="text-xs text-neutral-600 leading-relaxed">
              You are about to modify availability for{' '}
              <strong className="text-neutral-900">{selectedProductIds.length}</strong> selected product(s) across{' '}
              <strong className="text-neutral-900">{selectedCityIds.length}</strong> selected city/cities (
              <strong className="text-brand-orange">{selectedProductIds.length * selectedCityIds.length} total relations</strong>).
            </p>

            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-neutral-700">Choose Action:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBulkActionTarget(true)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    bulkActionTarget
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-400'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Enable Availability</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBulkActionTarget(false)}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    !bulkActionTarget
                      ? 'border-rose-500 bg-rose-50 text-rose-800 ring-2 ring-rose-400'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Disable Availability</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500">
              ℹ This action strictly updates delivery availability. It does NOT create or delete SEO landing pages.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setBulkModalOpen(false)}
                disabled={saving}
                className="px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeBulkUpdate}
                disabled={saving}
                className="px-5 py-2 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orangeHover rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Confirm & Apply</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCityMapping;
