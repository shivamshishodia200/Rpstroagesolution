import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Star,
  CheckCircle,
  X,
  Save,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

export const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'supermarket-racks',
    categoryTitle: 'Supermarket Racks',
    shortDesc: '',
    detailedDesc: '',
    imageUrl: '/images/gondola-rack.jpg',
    material: 'Prime Grade CRCA Steel',
    loadCapacity: '150 kg per tier',
    finish: 'Pure Polyester Epoxy Powder Coating',
    standardHeight: '1800mm',
    dimensions: '',
    isFeatured: true,
    isActive: true,
    status: 'published',
  });

  const defaultCategories = [
    { id: 'supermarket-racks', title: 'Supermarket Racks' },
    { id: 'retail-display-racks', title: 'Retail Display Racks' },
    { id: 'warehouse-racking', title: 'Warehouse Racking Systems' },
    { id: 'industrial-storage', title: 'Industrial Storage Racks' },
    { id: 'shopping-trolleys', title: 'Shopping Trolleys' },
    { id: 'checkout-counters', title: 'Checkout Counters' },
  ];
  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success && Array.isArray(res.data.categories) && res.data.categories.length > 0) {
          setCategories(
            res.data.categories.map((c) => ({
              id: c.slug,
              title: c.name,
              _id: c._id,
            }))
          );
        }
      } catch (err) {
        console.warn('Using default categories', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/products', { params });
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter]);

  const openNewModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      category: 'supermarket-racks',
      categoryTitle: 'Supermarket Racks',
      shortDesc: '',
      detailedDesc: '',
      imageUrl: '/images/gondola-rack.jpg',
      material: 'Prime Grade CRCA Steel',
      loadCapacity: '150 kg per tier',
      finish: 'Pure Polyester Epoxy Powder Coating',
      standardHeight: '1800mm',
      dimensions: '',
      isFeatured: true,
      isActive: true,
      status: 'published',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      slug: p.slug || '',
      category: p.category || 'supermarket-racks',
      categoryTitle: p.categoryTitle || 'Supermarket Racks',
      shortDesc: p.shortDesc || '',
      detailedDesc: p.detailedDesc || '',
      imageUrl: p.images?.[0]?.url || '/images/gondola-rack.jpg',
      material: p.specs?.material || p.material || 'Prime Grade CRCA Steel',
      loadCapacity: p.specs?.loadCapacity || '',
      finish: p.specs?.finish || '',
      standardHeight: p.specs?.standardHeight || '',
      dimensions: p.dimensions || '',
      isFeatured: p.isFeatured ?? true,
      isActive: p.isActive ?? true,
      status: p.status || 'published',
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const matchedCat = categories.find((c) => c.id === formData.category);
    const payload = {
      ...formData,
      categoryTitle: matchedCat?.title || formData.category,
      categoryRef: matchedCat?._id || undefined,
      images: [{ url: formData.imageUrl, alt: formData.name, isPrimary: true }],
      specs: {
        material: formData.material,
        loadCapacity: formData.loadCapacity,
        finish: formData.finish,
        standardHeight: formData.standardHeight,
      },
    };

    try {
      if (editingProduct) {
        await api.patch(`/products/${editingProduct._id}`, payload);
        setSuccessMsg(`Product '${formData.name}' updated!`);
      } else {
        await api.post('/products', payload);
        setSuccessMsg(`Product '${formData.name}' created!`);
      }
      setModalOpen(false);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicate = async (id, name) => {
    try {
      await api.post(`/products/${id}/duplicate`);
      setSuccessMsg(`Created draft copy of '${name}'`);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Duplication failed.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete product '${name}'?`)) return;
    try {
      await api.delete(`/products/${id}`);
      setSuccessMsg(`Product '${name}' deleted.`);
      fetchProducts();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage all storage solutions, specifications, featured status, and public product routes.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 border border-brand-border rounded flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-brand-border text-neutral-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Load Capacity</th>
                <th className="py-3 px-4">Homepage</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">Loading products...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">No products found.</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || '/images/gondola-rack.jpg'}
                          alt={p.name}
                          className="w-10 h-10 object-contain rounded border border-neutral-200 bg-neutral-50 p-1"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 block">{p.name}</span>
                          <span className="text-[10px] font-mono text-neutral-400">/products/{p.slug}/</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-semibold text-neutral-700">
                      {p.categoryTitle || p.category}
                    </td>

                    <td className="py-3 px-4 font-mono text-neutral-600">
                      {p.specs?.loadCapacity || 'Industrial Rating'}
                    </td>

                    <td className="py-3 px-4">
                      {p.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>Featured</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${p.status === 'published' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-neutral-100 text-neutral-700 border-neutral-300'}`}>
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <a
                        href={`http://localhost:5173/products/${p.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-500 hover:text-brand-orange inline-block"
                        title="View Live Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => handleDuplicate(p._id, p.name)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 inline-block"
                        title="Duplicate as Draft"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 inline-block"
                        title="Edit Product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 inline-block"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded shadow-2xl border border-brand-border my-8 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-neutral-900 text-white">
              <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-orange" />
                <span>{editingProduct ? `Edit: ${editingProduct.name}` : 'Add New Storage System'}</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Center Gondola Display Rack"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="Concise overview displayed in catalog cards..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Detailed Technical Description</label>
                <textarea
                  rows="3"
                  value={formData.detailedDesc}
                  onChange={(e) => setFormData({ ...formData, detailedDesc: e.target.value })}
                  placeholder="In-depth manufacturing details, load ratings, steel grade..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none resize-none"
                />
              </div>

              {/* Technical Specifications */}
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded space-y-3">
                <span className="font-bold text-neutral-900 block">Engineering Specifications</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Material Alloy</label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="e.g. Prime Grade CRCA Steel"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Load Bearing Rating</label>
                    <input
                      type="text"
                      value={formData.loadCapacity}
                      onChange={(e) => setFormData({ ...formData, loadCapacity: e.target.value })}
                      placeholder="e.g. 150 kg per tier"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Surface Finish</label>
                    <input
                      type="text"
                      value={formData.finish}
                      onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                      placeholder="e.g. Pure Polyester Epoxy Powder Coating"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Standard Heights</label>
                    <input
                      type="text"
                      value={formData.standardHeight}
                      onChange={(e) => setFormData({ ...formData, standardHeight: e.target.value })}
                      placeholder="e.g. 1500mm / 1800mm / 2100mm"
                      className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">Primary Image Path / URL</label>
                <input
                  type="text"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="/images/gondola-rack.jpg"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-brand-orange"
                  />
                  <span>Feature on Public Homepage</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded text-brand-orange"
                  />
                  <span>Active & Available for Dispatch</span>
                </label>
              </div>

              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-brand-orange hover:bg-brand-orangeHover text-white px-5 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Saving...' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
