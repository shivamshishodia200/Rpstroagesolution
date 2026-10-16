import React, { useState, useEffect } from 'react';
import { Home, Save, CheckCircle2, AlertCircle, MapPin, Eye, Sparkles, X } from 'lucide-react';
import api from '../services/api';

export const HomepageCMS = () => {
  const [content, setContent] = useState(null);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Impact Analysis State
  const [impactModalOpen, setImpactModalOpen] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactSection, setImpactSection] = useState('all');

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
      console.error('Failed to run impact analysis:', err);
    } finally {
      setImpactLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resHome, resCities] = await Promise.all([
          api.get('/homepage'),
          api.get('/cities', { params: { isVerified: 'true' } }),
        ]);

        if (resHome.data.success) {
          setContent(resHome.data.homepage);
        }
        if (resCities.data.success) {
          setCities(resCities.data.cities);
        }
      } catch (err) {
        console.error('Failed to fetch homepage CMS:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await api.put('/homepage', content);
      if (res.data.success) {
        setContent(res.data.homepage);
        setSuccessMsg('Homepage CMS updated and synchronized live!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCitySelection = (cityId) => {
    setContent((prev) => {
      const currentSelected = prev.areasWeServe?.selectedCities || [];
      const isAlreadySelected = currentSelected.some(
        (c) => (typeof c === 'object' ? c._id : c) === cityId
      );

      let newSelected;
      if (isAlreadySelected) {
        newSelected = currentSelected.filter(
          (c) => (typeof c === 'object' ? c._id : c) !== cityId
        );
      } else {
        newSelected = [...currentSelected, cityId];
      }

      return {
        ...prev,
        areasWeServe: {
          ...prev.areasWeServe,
          selectedCities: newSelected,
        },
      };
    });
  };

  if (loading || !content) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange"></div>
      </div>
    );
  }

  const selectedCityIds = (content.areasWeServe?.selectedCities || []).map((c) =>
    typeof c === 'object' ? c._id : c
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Homepage CMS & "Areas We Serve" Manager
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Configure live public homepage sections, headline copy, service area listings, and global SEO.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => runImpactAnalysis('all')}
            className="border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 text-xs font-bold px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Impact Analysis</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Updates...' : 'Publish to Homepage'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        
        {/* Module 1: Areas We Serve (Core Requirement) */}
        <div className="bg-white p-6 border border-brand-border rounded shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2 font-bold text-sm text-neutral-900">
              <MapPin className="w-4 h-4 text-brand-orange" />
              <span>Section: Areas We Serve (Verified Locations on Homepage)</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-neutral-800">
              <input
                type="checkbox"
                checked={content.areasWeServe?.isEnabled}
                onChange={(e) =>
                  setContent({
                    ...content,
                    areasWeServe: {
                      ...content.areasWeServe,
                      isEnabled: e.target.checked,
                    },
                  })
                }
                className="rounded text-brand-orange focus:ring-brand-orange"
              />
              <span>Section Enabled on Public Site</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Section Heading</label>
              <input
                type="text"
                value={content.areasWeServe?.heading || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    areasWeServe: { ...content.areasWeServe, heading: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Editorial Accent Heading</label>
              <input
                type="text"
                value={content.areasWeServe?.italicHeading || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    areasWeServe: { ...content.areasWeServe, italicHeading: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-700 mb-1">Subtitle / Description</label>
              <textarea
                rows="2"
                value={content.areasWeServe?.subtitle || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    areasWeServe: { ...content.areasWeServe, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Select Verified Cities to Show on Homepage */}
          <div className="pt-3 border-t border-neutral-100">
            <span className="font-bold text-neutral-800 block mb-2">
              Select Verified Regional Hubs to Display in Homepage Grid ({selectedCityIds.length} Selected):
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {cities.map((city) => {
                const isChecked = selectedCityIds.includes(city._id);
                return (
                  <label
                    key={city._id}
                    className={`flex items-center gap-2 p-3 border rounded cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-brand-orange bg-brand-orangeLight/60 font-bold text-brand-dark'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCitySelection(city._id)}
                      className="rounded text-brand-orange"
                    />
                    <div>
                      <span className="block text-xs">{city.name}</span>
                      <span className="block text-[10px] font-mono text-neutral-400">
                        {city.state}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Module 2: Hero Section */}
        <div className="bg-white p-6 border border-brand-border rounded shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 pb-3 border-b border-neutral-100">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span>Section: Cinematic Hero Headline & Subtitle</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">Headline First Line</label>
              <input
                type="text"
                value={content.hero?.headline || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, headline: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Italic Editorial Line</label>
              <input
                type="text"
                value={content.hero?.italicHeadline || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, italicHeadline: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-neutral-700 mb-1">Hero Supporting Copy</label>
              <textarea
                rows="2"
                value={content.hero?.subtitle || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, subtitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Hero Primary CTA Button</label>
              <input
                type="text"
                value={content.hero?.primaryCtaText || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, primaryCtaText: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">Hero Secondary Button</label>
              <input
                type="text"
                value={content.hero?.secondaryCtaText || ''}
                onChange={(e) =>
                  setContent({
                    ...content,
                    hero: { ...content.hero, secondaryCtaText: e.target.value },
                  })
                }
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Module 3: Homepage SEO Metadata */}
        <div className="bg-white p-6 border border-brand-border rounded shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-sm text-neutral-900 pb-3 border-b border-neutral-100">
            <span>Homepage SEO Metadata (Google Search Preview)</span>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Homepage Title Tag</label>
            <input
              type="text"
              value={content.seo?.title || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  seo: { ...content.seo, title: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">Meta Description</label>
            <textarea
              rows="2"
              value={content.seo?.description || ''}
              onChange={(e) =>
                setContent({
                  ...content,
                  seo: { ...content.seo, description: e.target.value },
                })
              }
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded focus:border-brand-orange focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Bottom Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-wider px-8 py-3 rounded transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Publishing...' : 'Save & Publish Homepage CMS'}
          </button>
        </div>
      </form>

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
              Review which city homepages will automatically inherit updates to the shared Common Homepage versus which city homepages are protected by custom city overrides.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700">Section Analyzed:</span>
              <select
                value={impactSection}
                onChange={(e) => runImpactAnalysis(e.target.value)}
                className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-bold bg-neutral-50 focus:border-brand-orange"
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
                type="button"
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
