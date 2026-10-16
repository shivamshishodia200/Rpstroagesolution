import React, { useState, useEffect } from 'react';
import {
  Globe,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Save,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  X,
  Send,
  History,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Tablet,
  Monitor,
  Trash2,
  Sliders,
  Check,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const CityHomepages = () => {
  const { user } = useAuth();
  const [homepages, setHomepages] = useState([]);
  const [verifiedCities, setVerifiedCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Editor State
  const [activeHp, setActiveHp] = useState(null); // When editing, holds full HP object
  const [activeTab, setActiveTab] = useState('hero'); // hero | about | featuredProducts | faqs | enquiryCta | seo | settings
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop | tablet | mobile
  const [saving, setSaving] = useState(false);
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);

  // New Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCityForCreate, setSelectedCityForCreate] = useState('');

  // Revisions Modal State
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);
  const [revisions, setRevisions] = useState([]);
  const [loadingRevisions, setLoadingRevisions] = useState(false);

  // Impact Analysis State
  const [impactModalOpen, setImpactModalOpen] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactSection, setImpactSection] = useState('all');

  // Load List
  const loadHomepages = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/city-homepages', { params });
      if (res.data.success) {
        setHomepages(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load city homepages:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to load city homepages.');
    } finally {
      setLoading(false);
    }
  };

  // Load Verified Cities for creation
  const loadVerifiedCities = async () => {
    try {
      const res = await api.get('/cities', { params: { isVerified: 'true' } });
      if (res.data.success) {
        setVerifiedCities(res.data.cities || []);
      }
    } catch (err) {
      console.error('Failed to load cities:', err);
    }
  };

  useEffect(() => {
    loadHomepages();
    loadVerifiedCities();
  }, [search, statusFilter]);

  // Open Full Editor for a City Homepage
  const openEditor = async (hpId) => {
    try {
      setSaving(true);
      const res = await api.get(`/city-homepages/${hpId}`);
      if (res.data.success) {
        setActiveHp(res.data.data);
        setActiveTab('hero');
      }
    } catch (err) {
      setErrorMsg('Failed to open editor.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Save
  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!activeHp) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        inheritHomepage: activeHp.inheritHomepage,
        enabled: activeHp.enabled,
        sectionOverrides: activeHp.sectionOverrides,
        seo: activeHp.seo,
      };

      const res = await api.patch(`/city-homepages/${activeHp._id}`, payload);
      if (res.data.success) {
        setActiveHp(res.data.data);
        setSuccessMsg(`City homepage overrides saved successfully! (Version ${res.data.data.version})`);
        setTimeout(() => setSuccessMsg(''), 4000);
        loadHomepages();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Creation
  const handleCreate = async () => {
    if (!selectedCityForCreate) return;
    try {
      setSaving(true);
      const res = await api.post('/city-homepages', { cityId: selectedCityForCreate });
      if (res.data.success) {
        setCreateModalOpen(false);
        setSelectedCityForCreate('');
        setSuccessMsg('City homepage configuration created with default inheritance!');
        setTimeout(() => setSuccessMsg(''), 4000);
        loadHomepages();
        openEditor(res.data.data._id);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create configuration.');
    } finally {
      setSaving(false);
    }
  };

  // Workflow Actions
  const handleWorkflowAction = async (action, reason = '') => {
    if (!activeHp) return;
    setWorkflowActionLoading(true);
    setErrorMsg('');
    try {
      let endpoint = `/city-homepages/${activeHp._id}/${action}`;
      let payload = {};
      if (action === 'request-changes') payload = { reason };

      const res = await api.post(endpoint, payload);
      if (res.data.success) {
        setActiveHp(res.data.data);
        setSuccessMsg(`City homepage ${action.replace('-', ' ')} successful!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        loadHomepages();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || `Failed to ${action}.`);
    } finally {
      setWorkflowActionLoading(false);
    }
  };

  // Generate Draft Preview
  const handlePreview = async () => {
    if (!activeHp) return;
    try {
      const res = await api.get(`/city-homepages/${activeHp._id}/preview`);
      if (res.data.success && res.data.previewUrl) {
        window.open(res.data.previewUrl, '_blank');
      }
    } catch (err) {
      setErrorMsg('Failed to generate preview URL.');
    }
  };

  // Load Revisions
  const openRevisions = async () => {
    if (!activeHp) return;
    try {
      setLoadingRevisions(true);
      setRevisionsModalOpen(true);
      const res = await api.get(`/city-homepages/${activeHp._id}/revisions`);
      if (res.data.success) {
        setRevisions(res.data.revisions || []);
      }
    } catch (err) {
      setErrorMsg('Failed to load revisions.');
    } finally {
      setLoadingRevisions(false);
    }
  };

  // Restore Revision
  const handleRestoreRevision = async (version) => {
    if (!activeHp) return;
    if (!window.confirm(`Are you sure you want to rollback to Version ${version}? Current draft edits will be preserved as a prior revision.`)) {
      return;
    }

    try {
      setSaving(true);
      const res = await api.post(`/city-homepages/${activeHp._id}/revisions/${version}/restore`);
      if (res.data.success) {
        setActiveHp(res.data.data);
        setRevisionsModalOpen(false);
        setSuccessMsg(`Restored successfully to Version ${version}!`);
        setTimeout(() => setSuccessMsg(''), 4000);
        loadHomepages();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to restore revision.');
    } finally {
      setSaving(false);
    }
  };

  // Run Impact Analysis
  const runImpactAnalysis = async (section = 'all') => {
    try {
      setImpactLoading(true);
      setImpactSection(section);
      setImpactModalOpen(true);
      const res = await api.get('/city-homepages/impact-analysis', { params: { section } });
      if (res.data.success) {
        setImpactData(res.data.impact);
      }
    } catch (err) {
      setErrorMsg('Failed to run impact analysis.');
    } finally {
      setImpactLoading(false);
    }
  };

  // Update Active HP Section Mode
  const setSectionMode = (sectionKey, mode) => {
    setActiveHp((prev) => ({
      ...prev,
      sectionOverrides: {
        ...prev.sectionOverrides,
        [sectionKey]: {
          ...prev.sectionOverrides?.[sectionKey],
          mode,
        },
      },
    }));
  };

  // Update Active HP Section Field
  const setSectionField = (sectionKey, field, value) => {
    setActiveHp((prev) => ({
      ...prev,
      sectionOverrides: {
        ...prev.sectionOverrides,
        [sectionKey]: {
          ...prev.sectionOverrides?.[sectionKey],
          [field]: value,
        },
      },
    }));
  };

  // Reset Section to Common
  const resetSectionToCommon = (sectionKey) => {
    setActiveHp((prev) => {
      const copy = { ...prev.sectionOverrides };
      delete copy[sectionKey];
      return {
        ...prev,
        sectionOverrides: copy,
      };
    });
  };

  // Cities not yet configured
  const configuredCityIds = new Set(homepages.map((h) => (typeof h.city === 'object' ? h.city?._id : h.city)));
  const unconfiguredCities = verifiedCities.filter((c) => !configuredCityIds.has(c._id));

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-semibold">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-semibold">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW A: LIST OVERVIEW (When activeHp is null) */}
      {!activeHp && (
        <div className="space-y-6">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-[#E85B12]" />
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  City Homepage Manager
                </h1>
              </div>
              <p className="text-sm text-neutral-500 mt-1">
                Admin-controlled homepage cloning, content inheritance, and field-level city overrides.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => runImpactAnalysis('all')}
                className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 text-neutral-700 bg-white rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" /> Impact Analysis
              </button>

              <button
                onClick={() => setCreateModalOpen(true)}
                disabled={unconfiguredCities.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#E85B12] text-white rounded-xl text-xs font-bold hover:bg-[#c4490b] transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add City Configuration
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs font-medium text-neutral-500 block">Total Configured</span>
              <span className="text-2xl font-extrabold text-neutral-900">{homepages.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs font-medium text-emerald-600 block">Published</span>
              <span className="text-2xl font-extrabold text-emerald-700">
                {homepages.filter((h) => h.status === 'published').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs font-medium text-amber-600 block">In Review / Draft</span>
              <span className="text-2xl font-extrabold text-amber-700">
                {homepages.filter((h) => h.status === 'review' || h.status === 'draft').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm">
              <span className="text-xs font-medium text-blue-600 block">Available Verified Hubs</span>
              <span className="text-2xl font-extrabold text-blue-700">{verifiedCities.length}</span>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search city or state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E85B12]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#E85B12]"
              >
                <option value="">All Publication Statuses</option>
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </div>
          </div>

          {/* Homepages Table */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4">City / Region</th>
                    <th className="py-3 px-4">Inheritance Mode</th>
                    <th className="py-3 px-4">Overrides Count</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Version</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-neutral-400">
                        <div className="w-6 h-6 border-2 border-[#E85B12] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        Loading city homepage configurations...
                      </td>
                    </tr>
                  ) : homepages.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-neutral-400">
                        No city homepage configurations found matching your search.
                      </td>
                    </tr>
                  ) : (
                    homepages.map((hp) => {
                      const cityName = hp.city?.name || 'Unknown City';
                      const cityState = hp.city?.state || '';
                      const overridesCount = Object.keys(hp.sectionOverrides || {}).filter(
                        (k) => hp.sectionOverrides[k]?.mode === 'OVERRIDE' || hp.sectionOverrides[k]?.mode === 'HIDE'
                      ).length;

                      const statusColors = {
                        published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        approved: 'bg-blue-50 text-blue-700 border-blue-200',
                        review: 'bg-amber-50 text-amber-700 border-amber-200',
                        draft: 'bg-neutral-100 text-neutral-700 border-neutral-300',
                        unpublished: 'bg-rose-50 text-rose-700 border-rose-200',
                      };

                      return (
                        <tr key={hp._id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#E85B12]" />
                              <div>
                                <span className="font-bold text-neutral-900 block">{cityName}</span>
                                <span className="text-[10px] text-neutral-400">{cityState} • /locations/{hp.city?.slug}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {hp.inheritHomepage ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                <Check className="w-3.5 h-3.5" /> Inherits Common
                              </span>
                            ) : (
                              <span className="text-neutral-500 text-[11px]">Independent</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded text-[11px] font-bold">
                              {overridesCount} Section Overrides
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[hp.status] || ''}`}>
                              {hp.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-600">v{hp.version}</td>
                          <td className="py-3 px-4 text-neutral-500">
                            {new Date(hp.updatedAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditor(hp._id)}
                                className="px-3 py-1 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                              >
                                Edit Overrides
                              </button>
                              <a
                                href={`http://localhost:5175/locations/${hp.city?.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-neutral-500 hover:text-[#E85B12] rounded-lg hover:bg-neutral-100 transition-colors"
                                title="View Public Page"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: SPLIT EDITOR SCREEN (When activeHp is loaded) */}
      {activeHp && (
        <div className="space-y-6">
          {/* Editor Header Bar */}
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-16 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveHp(null)}
                className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded-lg text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                &larr; Back to List
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-neutral-900">
                    {activeHp.city?.name} City Homepage
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-[#E85B12] border border-orange-200">
                    v{activeHp.version}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-neutral-100 text-neutral-800 border border-neutral-300">
                    {activeHp.status}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  Target Route: /locations/{activeHp.city?.slug}/
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openRevisions}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-700 bg-white rounded-lg text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <History className="w-3.5 h-3.5" /> Revisions
              </button>

              <button
                onClick={handlePreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-neutral-300 text-neutral-700 bg-white rounded-lg text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-purple-600" /> Draft Preview
              </button>

              {/* Workflow Transitions */}
              {activeHp.status === 'draft' && (
                <button
                  onClick={() => handleWorkflowAction('submit-review')}
                  disabled={workflowActionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Review
                </button>
              )}

              {activeHp.status === 'review' && (
                <>
                  <button
                    onClick={() => handleWorkflowAction('approve')}
                    disabled={workflowActionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = window.prompt('Enter reason for requesting changes:');
                      if (reason) handleWorkflowAction('request-changes', reason);
                    }}
                    disabled={workflowActionLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 text-rose-700 bg-rose-50 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    Request Changes
                  </button>
                </>
              )}

              {(activeHp.status === 'approved' || activeHp.status === 'unpublished') && (
                <button
                  onClick={() => handleWorkflowAction('publish')}
                  disabled={workflowActionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" /> Publish Live
                </button>
              )}

              {activeHp.status === 'published' && (
                <button
                  onClick={() => handleWorkflowAction('unpublish')}
                  disabled={workflowActionLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-rose-300 text-rose-700 bg-rose-50 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  Unpublish
                </button>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#E85B12] text-white rounded-lg text-xs font-bold hover:bg-[#c4490b] transition-colors shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Draft'}
              </button>
            </div>
          </div>

          {/* Split Screen Layout: Left Controls, Right Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: Section Tabs & Form Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Section Tabs */}
              <div className="bg-white p-2 rounded-xl border border-neutral-200 shadow-sm flex items-center gap-1 overflow-x-auto text-xs font-bold">
                {[
                  { id: 'hero', label: 'Hero' },
                  { id: 'about', label: 'About & Local Hub' },
                  { id: 'featuredProducts', label: 'Featured Products' },
                  { id: 'faqs', label: 'Local FAQs' },
                  { id: 'enquiryCta', label: 'Enquiry CTA' },
                  { id: 'seo', label: 'SEO Metadata' },
                  { id: 'settings', label: 'Settings' },
                ].map((t) => {
                  const isCurrent = activeTab === t.id;
                  const mode = activeHp.sectionOverrides?.[t.id]?.mode || 'INHERIT';
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-3 py-2 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isCurrent
                          ? 'bg-neutral-900 text-white'
                          : 'text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      <span>{t.label}</span>
                      {mode === 'OVERRIDE' && (
                        <span className="w-2 h-2 rounded-full bg-[#E85B12]" title="Overridden" />
                      )}
                      {mode === 'HIDE' && (
                        <span className="w-2 h-2 rounded-full bg-neutral-400" title="Hidden" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* SECTION 1: HERO CONTROLS */}
              {activeTab === 'hero' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Hero Section Override</h3>
                      <p className="text-xs text-neutral-500">Configure banner headlines, eyebrow, and CTAs.</p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex items-center gap-2">
                      <select
                        value={activeHp.sectionOverrides?.hero?.mode || 'INHERIT'}
                        onChange={(e) => setSectionMode('hero', e.target.value)}
                        className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:border-[#E85B12]"
                      >
                        <option value="INHERIT">INHERIT (Common)</option>
                        <option value="OVERRIDE">OVERRIDE (City)</option>
                        <option value="HIDE">HIDE Section</option>
                      </select>
                      {activeHp.sectionOverrides?.hero?.mode === 'OVERRIDE' && (
                        <button
                          type="button"
                          onClick={() => resetSectionToCommon('hero')}
                          className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-800 underline"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {activeHp.sectionOverrides?.hero?.mode === 'OVERRIDE' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Eyebrow Tagline</label>
                        <input
                          type="text"
                          value={activeHp.sectionOverrides?.hero?.eyebrow || ''}
                          onChange={(e) => setSectionField('hero', 'eyebrow', e.target.value)}
                          placeholder="e.g. Atelier Industrial Racking & Shelving — Delhi Corridor"
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Main Heading</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.hero?.headline || ''}
                            onChange={(e) => setSectionField('hero', 'headline', e.target.value)}
                            placeholder="e.g. Smart Storage."
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Italic / Accent Heading</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.hero?.italicHeadline || ''}
                            onChange={(e) => setSectionField('hero', 'italicHeadline', e.target.value)}
                            placeholder={`e.g. In ${activeHp.city?.name}.`}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Hero Subtitle</label>
                        <textarea
                          rows="3"
                          value={activeHp.sectionOverrides?.hero?.subtitle || ''}
                          onChange={(e) => setSectionField('hero', 'subtitle', e.target.value)}
                          placeholder="Localized descriptive narrative..."
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Primary CTA Text</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.hero?.primaryCtaText || ''}
                            onChange={(e) => setSectionField('hero', 'primaryCtaText', e.target.value)}
                            placeholder="e.g. Request Factory Quote"
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Banner Image URL</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.hero?.image || ''}
                            onChange={(e) => setSectionField('hero', 'image', e.target.value)}
                            placeholder="e.g. /images/banner3.jpeg"
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : activeHp.sectionOverrides?.hero?.mode === 'HIDE' ? (
                    <div className="p-4 bg-neutral-100 rounded-lg text-xs text-neutral-600 text-center font-medium">
                      Hero section is set to <strong>HIDE</strong>. It will not render on this city page.
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Inheriting Common Homepage Hero
                      </div>
                      <p className="text-[11px] text-emerald-700">
                        Default heading: "Smart Storage. Exceptional Spaces." City context is automatically merged into subtitle.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 2: ABOUT & LOCAL HUB */}
              {activeTab === 'about' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">About & Regional Hub Section</h3>
                      <p className="text-xs text-neutral-500">Configure company story & local delivery facility details.</p>
                    </div>

                    <select
                      value={activeHp.sectionOverrides?.about?.mode || 'INHERIT'}
                      onChange={(e) => setSectionMode('about', e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:border-[#E85B12]"
                    >
                      <option value="INHERIT">INHERIT (Common)</option>
                      <option value="OVERRIDE">OVERRIDE (City)</option>
                      <option value="HIDE">HIDE Section</option>
                    </select>
                  </div>

                  {activeHp.sectionOverrides?.about?.mode === 'OVERRIDE' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Headline</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.about?.headline || ''}
                            onChange={(e) => setSectionField('about', 'headline', e.target.value)}
                            placeholder="e.g. Engineering Superior Storage Systems"
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Accent Headline</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.about?.italicHeadline || ''}
                            onChange={(e) => setSectionField('about', 'italicHeadline', e.target.value)}
                            placeholder={`e.g. Serving ${activeHp.city?.name}`}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Paragraph 1 (Narrative)</label>
                        <textarea
                          rows="3"
                          value={activeHp.sectionOverrides?.about?.paragraph1 || ''}
                          onChange={(e) => setSectionField('about', 'paragraph1', e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Local Presence Details</label>
                        <textarea
                          rows="2"
                          value={activeHp.sectionOverrides?.about?.localPresenceDetails || ''}
                          onChange={(e) => setSectionField('about', 'localPresenceDetails', e.target.value)}
                          placeholder={`Specific delivery corridor notes, dispatch facility, or survey availability in ${activeHp.city?.name}.`}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                      Inheriting master company story with verified {activeHp.city?.name} logistics corridor context.
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 3: FEATURED PRODUCTS */}
              {activeTab === 'featuredProducts' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Featured Products Catalog</h3>
                      <p className="text-xs text-neutral-500">Products are automatically filtered by Product × City Matrix.</p>
                    </div>

                    <select
                      value={activeHp.sectionOverrides?.featuredProducts?.mode || 'INHERIT'}
                      onChange={(e) => setSectionMode('featuredProducts', e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:border-[#E85B12]"
                    >
                      <option value="INHERIT">INHERIT (Common Catalog)</option>
                      <option value="OVERRIDE">OVERRIDE (Custom Headers)</option>
                      <option value="HIDE">HIDE Section</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-xs text-neutral-600">
                      💡 <strong>Context-Aware Navigation Active:</strong> When visitors click a product, if a dedicated published SEO page exists for {activeHp.city?.name}, it opens <code>/locations/{activeHp.city?.slug}/[product]</code>. If unmapped or unavailable in {activeHp.city?.name}, it will not be displayed.
                    </div>

                    {activeHp.sectionOverrides?.featuredProducts?.mode === 'OVERRIDE' && (
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Catalog Section Heading</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.featuredProducts?.heading || ''}
                            onChange={(e) => setSectionField('featuredProducts', 'heading', e.target.value)}
                            placeholder={`e.g. Storage & Shelving Solutions Available in ${activeHp.city?.name}`}
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Catalog Subtitle</label>
                          <textarea
                            rows="2"
                            value={activeHp.sectionOverrides?.featuredProducts?.subtitle || ''}
                            onChange={(e) => setSectionField('featuredProducts', 'subtitle', e.target.value)}
                            placeholder="Direct factory dispatch to warehouses and commercial retail centers."
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 4: LOCAL FAQS */}
              {activeTab === 'faqs' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">City FAQs & Technical Questions</h3>
                      <p className="text-xs text-neutral-500">Provide localized answers for delivery, steel grade, and survey.</p>
                    </div>

                    <select
                      value={activeHp.sectionOverrides?.faqs?.mode || 'INHERIT'}
                      onChange={(e) => setSectionMode('faqs', e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:border-[#E85B12]"
                    >
                      <option value="INHERIT">INHERIT (Common FAQs)</option>
                      <option value="APPEND">APPEND (Common + City)</option>
                      <option value="REPLACE">REPLACE (Only City FAQs)</option>
                      <option value="HIDE">HIDE FAQs</option>
                    </select>
                  </div>

                  {(activeHp.sectionOverrides?.faqs?.mode === 'APPEND' || activeHp.sectionOverrides?.faqs?.mode === 'REPLACE') && (
                    <div className="space-y-4">
                      {(activeHp.sectionOverrides?.faqs?.items || []).map((faq, idx) => (
                        <div key={idx} className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...(activeHp.sectionOverrides?.faqs?.items || [])];
                              updated.splice(idx, 1);
                              setSectionField('faqs', 'items', updated);
                            }}
                            className="absolute top-3 right-3 text-neutral-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Question {idx + 1}</label>
                            <input
                              type="text"
                              value={faq.q || ''}
                              onChange={(e) => {
                                const updated = [...(activeHp.sectionOverrides?.faqs?.items || [])];
                                updated[idx] = { ...updated[idx], q: e.target.value };
                                setSectionField('faqs', 'items', updated);
                              }}
                              placeholder={`e.g. What is the delivery timeframe for pallet racks in ${activeHp.city?.name}?`}
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#E85B12]"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-neutral-700 block mb-1">Answer</label>
                            <textarea
                              rows="2"
                              value={faq.a || ''}
                              onChange={(e) => {
                                const updated = [...(activeHp.sectionOverrides?.faqs?.items || [])];
                                updated[idx] = { ...updated[idx], a: e.target.value };
                                setSectionField('faqs', 'items', updated);
                              }}
                              placeholder="Factual response regarding logistics, scheduling, or technical specifications..."
                              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs bg-white focus:outline-none focus:border-[#E85B12]"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...(activeHp.sectionOverrides?.faqs?.items || []), { q: '', a: '' }];
                          setSectionField('faqs', 'items', updated);
                        }}
                        className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded-lg text-xs font-bold hover:bg-neutral-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                      </button>
                    </div>
                  )}

                  {activeHp.sectionOverrides?.faqs?.mode === 'INHERIT' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                      Inheriting standard enterprise FAQs from Common Homepage.
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 5: ENQUIRY CTA */}
              {activeTab === 'enquiryCta' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                    <div>
                      <h3 className="text-base font-bold text-neutral-900">Enquiry Call-to-Action</h3>
                      <p className="text-xs text-neutral-500">Configure banner heading, telephone desk, and quote CTA.</p>
                    </div>

                    <select
                      value={activeHp.sectionOverrides?.enquiryCta?.mode || 'INHERIT'}
                      onChange={(e) => setSectionMode('enquiryCta', e.target.value)}
                      className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:border-[#E85B12]"
                    >
                      <option value="INHERIT">INHERIT (Common CTA)</option>
                      <option value="OVERRIDE">OVERRIDE (City CTA)</option>
                      <option value="HIDE">HIDE CTA</option>
                    </select>
                  </div>

                  {activeHp.sectionOverrides?.enquiryCta?.mode === 'OVERRIDE' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Banner Heading</label>
                        <input
                          type="text"
                          value={activeHp.sectionOverrides?.enquiryCta?.heading || ''}
                          onChange={(e) => setSectionField('enquiryCta', 'heading', e.target.value)}
                          placeholder={`e.g. Ready to Optimize Your Warehouse in ${activeHp.city?.name}?`}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Banner Subtitle</label>
                        <textarea
                          rows="2"
                          value={activeHp.sectionOverrides?.enquiryCta?.subtitle || ''}
                          onChange={(e) => setSectionField('enquiryCta', 'subtitle', e.target.value)}
                          placeholder="Direct factory dispatch, CAD floor surveys, and installation engineers."
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.enquiryCta?.phone || ''}
                            onChange={(e) => setSectionField('enquiryCta', 'phone', e.target.value)}
                            placeholder="+91 99900 23436"
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-neutral-700 block mb-1">Button Text</label>
                          <input
                            type="text"
                            value={activeHp.sectionOverrides?.enquiryCta?.buttonText || ''}
                            onChange={(e) => setSectionField('enquiryCta', 'buttonText', e.target.value)}
                            placeholder="Request Factory Quotation"
                            className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium">
                      Inheriting standard enterprise CTA banner.
                    </div>
                  )}
                </div>
              )}

              {/* SECTION 6: SEO METADATA */}
              {activeTab === 'seo' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h3 className="text-base font-bold text-neutral-900">City Homepage SEO & Metadata</h3>
                    <p className="text-xs text-neutral-500">Fine-tune canonical URL, robots tags, and local search snippet.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">SEO Page Title</label>
                      <input
                        type="text"
                        value={activeHp.seo?.title || ''}
                        onChange={(e) =>
                          setActiveHp((prev) => ({
                            ...prev,
                            seo: { ...prev.seo, title: e.target.value },
                          }))
                        }
                        placeholder={`Industrial Storage & Supermarket Racks Manufacturer in ${activeHp.city?.name} | RP Storage`}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Meta Description</label>
                      <textarea
                        rows="3"
                        value={activeHp.seo?.description || ''}
                        onChange={(e) =>
                          setActiveHp((prev) => ({
                            ...prev,
                            seo: { ...prev.seo, description: e.target.value },
                          }))
                        }
                        placeholder={`Direct factory manufacturer of heavy duty warehouse racks and supermarket display shelving in ${activeHp.city?.name}.`}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">H1 Heading Override</label>
                        <input
                          type="text"
                          value={activeHp.seo?.h1 || ''}
                          onChange={(e) =>
                            setActiveHp((prev) => ({
                              ...prev,
                              seo: { ...prev.seo, h1: e.target.value },
                            }))
                          }
                          placeholder={`Industrial Storage & Supermarket Racks in ${activeHp.city?.name}`}
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-neutral-700 block mb-1">Robots Directive</label>
                        <select
                          value={activeHp.seo?.robotsDirective || 'index, follow'}
                          onChange={(e) =>
                            setActiveHp((prev) => ({
                              ...prev,
                              seo: { ...prev.seo, robotsDirective: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                        >
                          <option value="index, follow">index, follow (Standard Indexing)</option>
                          <option value="noindex, follow">noindex, follow (Internal Navigation Only)</option>
                          <option value="noindex, nofollow">noindex, nofollow (Draft / Protected)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-700 block mb-1">Canonical URL</label>
                      <input
                        type="text"
                        value={activeHp.seo?.canonicalUrl || ''}
                        onChange={(e) =>
                          setActiveHp((prev) => ({
                            ...prev,
                            seo: { ...prev.seo, canonicalUrl: e.target.value },
                          }))
                        }
                        placeholder={`https://www.rpstoragesolution.com/locations/${activeHp.city?.slug}`}
                        className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:border-[#E85B12]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm space-y-6">
                  <div className="border-b border-neutral-100 pb-4">
                    <h3 className="text-base font-bold text-neutral-900">Global City Homepage Settings</h3>
                    <p className="text-xs text-neutral-500">Enable or disable homepage inheritance and page accessibility.</p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeHp.inheritHomepage}
                        onChange={(e) =>
                          setActiveHp((prev) => ({ ...prev, inheritHomepage: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#E85B12] rounded border-neutral-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block">
                          Inherit Common Homepage Architecture
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          When checked, missing fields and un-overridden sections automatically inherit the published Common Homepage.
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeHp.enabled}
                        onChange={(e) =>
                          setActiveHp((prev) => ({ ...prev, enabled: e.target.checked }))
                        }
                        className="w-4 h-4 text-[#E85B12] rounded border-neutral-300"
                      />
                      <div>
                        <span className="text-xs font-bold text-neutral-900 block">
                          Enable City Homepage
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          If disabled, public requests to this city landing page will yield a 404 or redirect.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Live Visual Preview Screen (5 cols) */}
            <div className="lg:col-span-5 space-y-4 sticky top-36">
              <div className="bg-white p-3 rounded-xl border border-neutral-200 shadow-sm flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#E85B12]" /> Live Visual Simulation
                </span>

                <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`p-1.5 rounded transition-colors ${
                      previewDevice === 'desktop' ? 'bg-white shadow text-[#E85B12]' : 'text-neutral-500'
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    className={`p-1.5 rounded transition-colors ${
                      previewDevice === 'tablet' ? 'bg-white shadow text-[#E85B12]' : 'text-neutral-500'
                    }`}
                    title="Tablet Preview"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`p-1.5 rounded transition-colors ${
                      previewDevice === 'mobile' ? 'bg-white shadow text-[#E85B12]' : 'text-neutral-500'
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Rendered Preview Card Frame */}
              <div
                className={`bg-neutral-900 p-2 rounded-2xl shadow-xl mx-auto transition-all duration-300 ${
                  previewDevice === 'desktop'
                    ? 'w-full'
                    : previewDevice === 'tablet'
                    ? 'w-[85%]'
                    : 'w-[65%]'
                }`}
              >
                <div className="bg-white rounded-xl overflow-hidden text-neutral-900 font-sans shadow-inner border border-neutral-200 min-h-[500px] max-h-[640px] overflow-y-auto">
                  {/* Browser Bar */}
                  <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-1.5 flex items-center gap-2 text-[10px] text-neutral-500">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400" />
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <span className="font-mono truncate">
                      https://www.rpstoragesolution.com/locations/{activeHp.city?.slug}/
                    </span>
                  </div>

                  {/* City Breadcrumb */}
                  <div className="bg-neutral-50 border-b border-neutral-200 px-3 py-1 text-[9px] text-neutral-500 flex items-center justify-between">
                    <span>Home &gt; Locations &gt; {activeHp.city?.name}</span>
                    <span className="text-[#E85B12] font-bold">Verified Service Hub</span>
                  </div>

                  {/* Simulated Hero Section */}
                  <div className="p-4 bg-gradient-to-b from-neutral-50 to-white border-b border-neutral-100 space-y-2">
                    <span className="inline-block px-2 py-0.5 bg-orange-50 text-[#E85B12] text-[9px] font-bold rounded-full">
                      {activeHp.sectionOverrides?.hero?.eyebrow || 'Atelier Industrial Racking & Shelving'}
                    </span>
                    <h1 className="text-base font-black text-neutral-900 leading-tight">
                      {activeHp.sectionOverrides?.hero?.headline || 'Smart Storage.'}{' '}
                      <span className="italic font-serif text-[#E85B12]">
                        {activeHp.sectionOverrides?.hero?.italicHeadline || `In ${activeHp.city?.name}.`}
                      </span>
                    </h1>
                    <p className="text-[10px] text-neutral-600 line-clamp-2">
                      {activeHp.sectionOverrides?.hero?.subtitle ||
                        `Discover intelligently designed storage and display systems in ${activeHp.city?.name}.`}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2.5 py-1 bg-[#E85B12] text-white text-[9px] font-bold rounded">
                        {activeHp.sectionOverrides?.hero?.primaryCtaText || 'Request a Quote'}
                      </span>
                      <span className="px-2.5 py-1 border border-neutral-300 text-neutral-700 text-[9px] font-bold rounded">
                        Explore Products
                      </span>
                    </div>
                  </div>

                  {/* Simulated About Section */}
                  <div className="p-4 bg-white border-b border-neutral-100 space-y-1.5 text-[10px]">
                    <span className="text-[#E85B12] font-bold uppercase tracking-wider text-[8px]">
                      About RP Storage
                    </span>
                    <h2 className="text-xs font-bold text-neutral-900">
                      {activeHp.sectionOverrides?.about?.headline || 'Engineering Superior Storage Systems'}{' '}
                      <span className="italic text-neutral-500">
                        {activeHp.sectionOverrides?.about?.italicHeadline || `Across ${activeHp.city?.name}`}
                      </span>
                    </h2>
                    <p className="text-neutral-600 text-[9px] line-clamp-2">
                      {activeHp.sectionOverrides?.about?.paragraph1 ||
                        'Certified manufacturing of industrial warehouse pallet racks, retail display fixtures, and turnkey spatial engineering.'}
                    </p>
                  </div>

                  {/* Simulated Featured Products */}
                  <div className="p-4 bg-neutral-50/50 border-b border-neutral-100 space-y-2 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900">
                        {activeHp.sectionOverrides?.featuredProducts?.heading ||
                          `Available Storage Systems in ${activeHp.city?.name}`}
                      </span>
                      <span className="text-[8px] text-[#E85B12] font-semibold">Mapped Products Only</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-white rounded border border-neutral-200 text-[9px] space-y-1">
                        <div className="w-full h-12 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-[8px]">
                          Pallet Racks
                        </div>
                        <span className="font-bold block truncate">Heavy Duty Racks</span>
                        <span className="text-[8px] text-[#E85B12]">
                          /locations/{activeHp.city?.slug}/heavy-duty-racks/
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded border border-neutral-200 text-[9px] space-y-1">
                        <div className="w-full h-12 bg-neutral-100 rounded flex items-center justify-center text-neutral-400 text-[8px]">
                          Mezzanine
                        </div>
                        <span className="font-bold block truncate">Mezzanine Floor</span>
                        <span className="text-[8px] text-[#E85B12]">
                          /locations/{activeHp.city?.slug}/mezzanine-floor/
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated CTA Banner */}
                  <div className="p-4 bg-neutral-900 text-white text-center space-y-1">
                    <span className="text-[11px] font-black block">
                      {activeHp.sectionOverrides?.enquiryCta?.heading ||
                        `Optimize Your Facility in ${activeHp.city?.name}`}
                    </span>
                    <span className="text-[9px] text-neutral-400 block">
                      {activeHp.sectionOverrides?.enquiryCta?.phone || '+91 99900 23436'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-bold text-neutral-900">Create City Homepage</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Select an authorized verified distribution city to instantiate an admin-controlled city homepage inheriting common layout sections.
            </p>

            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Select Verified City</label>
              <select
                value={selectedCityForCreate}
                onChange={(e) => setSelectedCityForCreate(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-xs font-semibold focus:border-[#E85B12]"
              >
                <option value="">-- Choose City --</option>
                {unconfiguredCities.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 border border-neutral-300 rounded-lg text-xs font-bold hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={!selectedCityForCreate || saving}
                className="px-4 py-2 bg-[#E85B12] text-white rounded-lg text-xs font-bold hover:bg-[#c4490b] disabled:opacity-50"
              >
                {saving ? 'Creating...' : 'Instantiate Homepage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVISIONS MODAL */}
      {revisionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-neutral-700" />
                <h3 className="text-base font-bold text-neutral-900">
                  Revision History — {activeHp?.city?.name}
                </h3>
              </div>
              <button onClick={() => setRevisionsModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {loadingRevisions ? (
                <div className="py-8 text-center text-neutral-400">Loading version history...</div>
              ) : revisions.length === 0 ? (
                <div className="py-8 text-center text-neutral-400">No previous revisions recorded yet.</div>
              ) : (
                revisions.map((rev) => (
                  <div key={rev._id} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-neutral-900 font-mono">
                        Version {rev.version}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-neutral-200 text-neutral-800">
                        {rev.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-neutral-500">
                      Saved by {rev.createdBy?.name || 'Administrator'} on{' '}
                      {new Date(rev.createdAt).toLocaleString()}
                    </div>

                    {rev.changeSummary && (
                      <div className="text-[11px] text-neutral-700 italic">
                        "{rev.changeSummary}"
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => handleRestoreRevision(rev.version)}
                        className="px-3 py-1 bg-neutral-900 text-white rounded text-[11px] font-bold hover:bg-black transition-colors"
                      >
                        Restore Version {rev.version}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMPACT ANALYSIS MODAL */}
      {impactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  Common Content Update Impact Analysis
                </h3>
              </div>
              <button onClick={() => setImpactModalOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Before modifying the Common Homepage, review which city pages will automatically inherit changes versus which city pages have custom overrides or are hidden.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700">Section Analyzed:</span>
              <select
                value={impactSection}
                onChange={(e) => runImpactAnalysis(e.target.value)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:border-[#E85B12]"
              >
                <option value="all">All Sections Overview</option>
                <option value="hero">Hero Section</option>
                <option value="about">About Section</option>
                <option value="featuredProducts">Featured Products</option>
                <option value="faqs">FAQs</option>
                <option value="enquiryCta">Enquiry CTA</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
              {impactLoading ? (
                <div className="py-12 text-center text-neutral-400">Calculating inheritance graph...</div>
              ) : impactData ? (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[11px] font-bold text-emerald-700 block">Inheriting (Affected)</span>
                      <span className="text-xl font-extrabold text-emerald-800">{impactData.affectedCount}</span>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                      <span className="text-[11px] font-bold text-orange-700 block">Protected (Overridden)</span>
                      <span className="text-xl font-extrabold text-orange-800">{impactData.protectedCount}</span>
                    </div>
                    <div className="p-3 bg-neutral-100 border border-neutral-200 rounded-xl">
                      <span className="text-[11px] font-bold text-neutral-600 block">Hidden</span>
                      <span className="text-xl font-extrabold text-neutral-800">{impactData.hiddenCount}</span>
                    </div>
                  </div>

                  {/* Affected List */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-neutral-900 block">
                      Inheriting City Homepages ({impactData.affectedCities?.length || 0})
                    </span>
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                      {impactData.affectedCities?.length > 0 ? (
                        impactData.affectedCities.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[11px] font-medium">
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-400">None</span>
                      )}
                    </div>
                  </div>

                  {/* Protected List */}
                  <div className="space-y-1.5">
                    <span className="font-bold text-neutral-900 block">
                      Protected by Custom Overrides ({impactData.protectedCities?.length || 0})
                    </span>
                    <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg max-h-36 overflow-y-auto flex flex-wrap gap-1.5">
                      {impactData.protectedCities?.length > 0 ? (
                        impactData.protectedCities.map((c, i) => (
                          <span key={i} className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-[11px] font-medium">
                            {c.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-400">None</span>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => setImpactModalOpen(false)}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-bold"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityHomepages;
