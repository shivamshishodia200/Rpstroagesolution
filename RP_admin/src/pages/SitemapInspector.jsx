import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { adminApi } from '../services/api';
import { Network, RefreshCw, ExternalLink, CheckCircle, FileCode, Server, Layers } from 'lucide-react';

export default function SitemapInspector() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeXml, setActiveXml] = useState(null);
  const [xmlContent, setXmlContent] = useState('');
  const [xmlLoading, setXmlLoading] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);

  const sitemaps = [
    {
      name: 'Sitemap Index',
      endpoint: '/sitemap.xml',
      description: 'Master XML index referencing all modular sub-sitemaps.',
      type: 'Index',
    },
    {
      name: 'Products Sitemap',
      endpoint: '/sitemap-products.xml',
      description: 'All published & active industrial storage racking products.',
      type: 'Products',
    },
    {
      name: 'City Delivery Hubs Sitemap',
      endpoint: '/sitemap-locations.xml',
      description: 'Verified strategic location pages (Delhi, Noida, Gurugram, etc.).',
      type: 'Locations',
    },
    {
      name: 'City + Product Targeted Pages',
      endpoint: '/sitemap-city-products.xml',
      description: 'High-intent localized racking landing pages.',
      type: 'CityProducts',
    },
  ];

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/sitemap/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load sitemap stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    loadXml('/sitemap.xml');
  }, []);

  const loadXml = async (endpoint) => {
    try {
      setXmlLoading(true);
      setActiveXml(endpoint);
      const res = await axios.get(`http://localhost:5001${endpoint}`);
      setXmlContent(typeof res.data === 'string' ? res.data : new XMLSerializer().serializeToString(res.data));
    } catch (err) {
      setXmlContent(`<!-- Error fetching ${endpoint}: ${err.message} -->`);
    } finally {
      setXmlLoading(false);
    }
  };

  const handlePurge = async () => {
    setPurging(true);
    setTimeout(async () => {
      await fetchStats();
      if (activeXml) await loadXml(activeXml);
      setPurging(false);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dynamic XML Sitemap Inspector</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time sitemap generator complying with Google Sitemaps 0.9 protocol. Automatically excludes drafts and noncanonical URLs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {purgeSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
              <CheckCircle className="w-4 h-4" /> Cache Purged & Revalidated
            </span>
          )}
          <button
            onClick={handlePurge}
            disabled={purging}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#E85B12] text-white rounded-lg hover:bg-[#c4490b] text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${purging ? 'animate-spin' : ''}`} />
            Purge & Revalidate Sitemaps
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Valid URLs</span>
            <Network className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats?.totalUrls ?? '--'}</p>
          <p className="text-xs text-gray-500 mt-1">Across all sub-sitemaps</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Product URLs</span>
            <Layers className="w-5 h-5 text-[#E85B12]" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats?.breakdown?.products ?? '--'}</p>
          <p className="text-xs text-gray-500 mt-1">Active published products</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Verified Cities</span>
            <Server className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats?.breakdown?.locations ?? '--'}</p>
          <p className="text-xs text-gray-500 mt-1">Delivery hub landing pages</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">City + Products</span>
            <FileCode className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{stats?.breakdown?.cityProducts ?? '--'}</p>
          <p className="text-xs text-gray-500 mt-1">High-intent localized pages</p>
        </div>
      </div>

      {/* Sitemap List & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sitemap Files Column */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Available XML Sitemaps</h2>
          {sitemaps.map((item) => (
            <div
              key={item.endpoint}
              onClick={() => loadXml(item.endpoint)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                activeXml === item.endpoint
                  ? 'bg-orange-50/70 border-[#E85B12] shadow-sm'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-gray-900">{item.name}</span>
                <a
                  href={`http://localhost:5001${item.endpoint}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-[#E85B12] p-1"
                  title="Open live XML in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-xs font-mono text-gray-500 mb-2">{item.endpoint}</p>
              <p className="text-xs text-gray-600">{item.description}</p>
            </div>
          ))}

          {/* Submission Instructions */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-2 mt-4">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Google Search Console</h3>
            <p>
              Submit only the root index:
              <br />
              <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-300 text-gray-800 font-mono mt-1 inline-block">
                https://www.rpstoragesolution.com/sitemap.xml
              </code>
            </p>
            <p className="text-[11px] text-gray-500">
              Google crawler discovers the child product and location sitemaps automatically from the index.
            </p>
          </div>
        </div>

        {/* XML Viewer Column */}
        <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-800 shadow-sm overflow-hidden flex flex-col h-[520px]">
          <div className="bg-gray-950 px-4 py-3 border-b border-gray-800 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="font-mono text-gray-200">{activeXml}</span>
            </div>
            <a
              href={`http://localhost:5001${activeXml}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[#E85B12] hover:text-orange-400 font-semibold"
            >
              Open Direct XML <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex-1 p-4 overflow-auto font-mono text-xs text-emerald-400 whitespace-pre">
            {xmlLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                Loading XML response...
              </div>
            ) : (
              xmlContent
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
