import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  X,
  Save,
  Send,
  Eye,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Cities = () => {
  const { user } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingCity, setEditingCity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    state: 'Delhi NCR',
    serviceAvailability: 'verified',
    verificationNotes: '',
    isVerified: true,
    featuredImage: '/images/banner3.jpeg',
    imageAlt: '',
    description: '',
    localRelevance: '',
    h1Heading: '',
    introContent: '',
    serviceDetails: '',
    seoTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    status: 'draft',
    faqs: [{ question: '', answer: '' }],
  });

  const [states, setStates] = useState([
    { name: 'Delhi NCR', code: 'DL' },
    { name: 'Haryana', code: 'HR' },
    { name: 'Uttar Pradesh', code: 'UP' },
  ]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const res = await api.get('/states');
        if (res.data.success && Array.isArray(res.data.states) && res.data.states.length > 0) {
          setStates(res.data.states);
        }
      } catch (err) {
        console.warn('Using default states', err);
      }
    };
    fetchStates();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await api.get('/cities', { params });
      if (res.data.success) {
        setCities(res.data.cities);
      }
    } catch (err) {
      console.error('Failed to fetch cities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [search, statusFilter]);

  const openNewCityModal = () => {
    setEditingCity(null);
    setFormData({
      name: '',
      slug: '',
      state: 'Delhi NCR',
      serviceAvailability: 'verified',
      verificationNotes: 'Direct plant logistics verified. Rapid delivery within 24-48 hours.',
      isVerified: true,
      featuredImage: '/images/banner3.jpeg',
      imageAlt: '',
      description: '',
      localRelevance: '',
      h1Heading: '',
      introContent: '',
      serviceDetails: '',
      seoTitle: '',
      metaDescription: '',
      canonicalUrl: '',
      status: 'draft',
      faqs: [{ question: '', answer: '' }],
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (city) => {
    setEditingCity(city);
    setFormData({
      name: city.name || '',
      slug: city.slug || '',
      state: city.state || 'Delhi NCR',
      serviceAvailability: city.serviceAvailability || 'verified',
      verificationNotes: city.verificationNotes || '',
      isVerified: city.isVerified ?? true,
      featuredImage: city.featuredImage || '/images/banner3.jpeg',
      imageAlt: city.imageAlt || '',
      description: city.description || '',
      localRelevance: city.localRelevance || '',
      h1Heading: city.h1Heading || '',
      introContent: city.introContent || '',
      serviceDetails: city.serviceDetails || '',
      seoTitle: city.seoTitle || '',
      metaDescription: city.metaDescription || '',
      canonicalUrl: city.canonicalUrl || '',
      status: city.status || 'draft',
      faqs: city.faqs?.length > 0 ? city.faqs : [{ question: '', answer: '' }],
    });
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const handleRemoveFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleFaqChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.faqs];
      updated[index][field] = value;
      return { ...prev, faqs: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const matchedState = states.find((s) => s.name.toLowerCase() === (formData.state || '').trim().toLowerCase());
    const payload = {
      ...formData,
      stateRef: matchedState?._id || undefined,
    };

    try {
      if (editingCity) {
        await api.patch(`/cities/${editingCity._id}`, payload);
        setSuccessMsg(`City '${formData.name}' updated successfully!`);
      } else {
        await api.post('/cities', payload);
        setSuccessMsg(`City '${formData.name}' created as draft!`);
      }
      setModalOpen(false);
      fetchCities();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (cityId, cityName) => {
    try {
      const res = await api.post(`/cities/${cityId}/publish`);
      setSuccessMsg(res.data.message || `City '${cityName}' is now published live!`);
      fetchCities();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish city.');
    }
  };

  const handleUnpublish = async (cityId, cityName) => {
    try {
      const res = await api.post(`/cities/${cityId}/unpublish`);
      setSuccessMsg(`City '${cityName}' unpublished.`);
      fetchCities();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unpublish city.');
    }
  };

  const handleDelete = async (cityId, cityName) => {
    if (!window.confirm(`Are you sure you want to delete '${cityName}'? This action cannot be undone.`)) {
      return;
    }
    try {
      const res = await api.delete(`/cities/${cityId}`);
      setSuccessMsg(res.data.message || `City '${cityName}' deleted.`);
      fetchCities();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete city.');
    }
  };

  const statusStyles = {
    published: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    draft: 'bg-neutral-100 text-neutral-700 border-neutral-300',
    review: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    archived: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            City Management & Service Hubs
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure dynamic city landing pages, service verification, local relevance, and technical SEO metadata.
          </p>
        </div>

        <button
          onClick={openNewCityModal}
          className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New City</span>
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
            placeholder="Search by city name, slug, local hub..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published Live</option>
            <option value="draft">Draft</option>
            <option value="review">In Review</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-brand-border rounded shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-brand-border text-neutral-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">City / State</th>
                <th className="py-3 px-4">Public URL Path</th>
                <th className="py-3 px-4">Service Verification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Local Commercial Hubs</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">
                    Loading verified cities...
                  </td>
                </tr>
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-neutral-400">
                    No cities matching the criteria. Click "+ Add New City" to configure one.
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr key={city._id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                        <span>{city.name}</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-normal pl-5 block">
                        {city.state}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      /locations/{city.slug}/
                    </td>

                    <td className="py-3.5 px-4">
                      {city.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Verified Area</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span>Pending Verification</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          statusStyles[city.status] || 'bg-neutral-100 text-neutral-700'
                        }`}
                      >
                        {city.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-600 max-w-xs truncate text-[11px]">
                      {city.localRelevance || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {city.status === 'published' ? (
                        <>
                          <a
                            href={`http://localhost:5173/locations/${city.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-neutral-500 hover:text-brand-orange inline-block"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleUnpublish(city._id, city.name)}
                            className="px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                          >
                            Unpublish
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handlePublish(city._id, city.name)}
                          className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                        >
                          Publish
                        </button>
                      )}

                      <button
                        onClick={() => openEditModal(city)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 inline-block"
                        title="Edit City Details"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {user?.role === 'super_admin' && (
                        <button
                          onClick={() => handleDelete(city._id, city.name)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 inline-block"
                          title="Delete City"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create City Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded shadow-2xl border border-brand-border my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-neutral-900 text-white">
              <h2 className="text-sm font-bold tracking-wider uppercase flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-orange" />
                <span>{editingCity ? `Edit City: ${editingCity.name}` : 'Configure New Service City'}</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Basic Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">City Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Gurugram"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. gurugram"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    list="available-states"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="e.g. Haryana or select below"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
                  />
                  <datalist id="available-states">
                    {states.map((s) => (
                      <option key={s._id || s.name} value={s.name}>
                        {s.code ? `(${s.code}) ${s.name}` : s.name}
                      </option>
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Service Verification Section */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-orange" />
                    <span>Service Area Verification Status</span>
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-neutral-800">
                    <input
                      type="checkbox"
                      checked={formData.isVerified}
                      onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="rounded text-brand-orange focus:ring-brand-orange"
                    />
                    <span>Mark as Verified Delivery Area</span>
                  </label>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                    Internal Verification Notes (Logistics / Delivery Feasibility):
                  </label>
                  <input
                    type="text"
                    value={formData.verificationNotes}
                    onChange={(e) => setFormData({ ...formData, verificationNotes: e.target.value })}
                    placeholder="e.g. Connected via NH-48; daily freight trucks; installation crew on standby."
                    className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded focus:border-brand-orange focus:outline-none text-[11px]"
                  />
                </div>
              </div>

              {/* Local Relevance / Hubs */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  Local Commercial & Industrial Hubs (Substantive Local Detail) *
                </label>
                <input
                  type="text"
                  value={formData.localRelevance}
                  onChange={(e) => setFormData({ ...formData, localRelevance: e.target.value })}
                  placeholder="e.g. Udyog Vihar, IMT Manesar, Cyber Hub retail stores, Sohna Road logistics parks"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
                />
              </div>

              {/* Page Content Headings */}
              <div>
                <label className="block font-bold text-neutral-700 mb-1">Primary H1 Heading *</label>
                <input
                  type="text"
                  required
                  value={formData.h1Heading}
                  onChange={(e) => setFormData({ ...formData, h1Heading: e.target.value })}
                  placeholder="e.g. Supermarket Display & Storage Racks Manufacturer in Gurugram"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">City Introduction Content *</label>
                <textarea
                  rows="3"
                  value={formData.introContent}
                  onChange={(e) => setFormData({ ...formData, introContent: e.target.value })}
                  placeholder="Write genuine city-specific details on how RP Storage Solution services supermarkets, retail outlets, and warehouses in this city..."
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* SEO Parameters */}
              <div className="pt-3 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">SEO Meta Title *</label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="e.g. Best Supermarket Racks in Gurugram | RP Storage Solution"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">Canonical URL</label>
                  <input
                    type="text"
                    value={formData.canonicalUrl}
                    onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                    placeholder="https://www.rpstoragesolution.com/locations/gurugram/"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-bold text-neutral-700 mb-1">Meta Description *</label>
                  <textarea
                    rows="2"
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Compelling, click-worthy 140-160 character description..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* FAQs Builder */}
              <div className="pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-neutral-700">City Specific FAQs</label>
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="text-[11px] font-semibold text-brand-orange hover:underline"
                  >
                    + Add FAQ Item
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.faqs.map((faq, i) => (
                    <div key={i} className="p-3 bg-neutral-50 border border-neutral-200 rounded space-y-2 relative">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFaqChange(i, 'question', e.target.value)}
                        placeholder="e.g. Do you deliver supermarket racks to Sector 18, Gurugram?"
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded focus:border-brand-orange focus:outline-none font-semibold text-[11px]"
                      />
                      <textarea
                        rows="2"
                        value={faq.answer}
                        onChange={(e) => handleFaqChange(i, 'answer', e.target.value)}
                        placeholder="Detailed technical answer..."
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded focus:border-brand-orange focus:outline-none text-[11px] resize-none"
                      />
                      {formData.faqs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveFaq(i)}
                          className="text-[10px] text-red-600 hover:underline pt-1"
                        >
                          Remove FAQ
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-50 font-semibold"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand-orange hover:bg-brand-orangeHover text-white px-5 py-2 rounded font-bold uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Saving...' : 'Save City Details'}</span>
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};
