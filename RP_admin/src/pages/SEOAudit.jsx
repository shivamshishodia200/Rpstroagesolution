import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Search, RefreshCw, AlertTriangle, AlertCircle, CheckCircle2, ShieldCheck, ExternalLink, Globe } from 'lucide-react';

export default function SEOAudit() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ summary: {}, issues: [] });
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  const fetchAudit = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/seo/audit');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load SEO audit', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  const filteredIssues = data.issues?.filter((issue) => {
    if (filterType !== 'all' && issue.type !== filterType) return false;
    if (search && !issue.page.toLowerCase().includes(search.toLowerCase()) && !issue.message.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Technical SEO Health & Audit</h1>
          <p className="text-sm text-gray-500 mt-1">
            Automated crawler analyzing published city pages, products, canonical duplicates, thin content & indexability directives.
          </p>
        </div>
        <button
          onClick={fetchAudit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-semibold shadow-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          Run SEO Audit
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Indexed URLs</span>
            <Globe className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{data.summary?.totalIndexedPages ?? '--'}</p>
          <p className="text-xs text-gray-500 mt-1">Live canonical XML URLs</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Flags</span>
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">{data.summary?.totalIssues ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1">Quality & crawler warnings</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-100 bg-red-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-600">Critical Errors</span>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-600 mt-2">{data.summary?.errors ?? 0}</p>
          <p className="text-xs text-red-500 mt-1">Thin content or unverified areas</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">Warnings</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">{data.summary?.warnings ?? 0}</p>
          <p className="text-xs text-amber-600 mt-1">Short metadata or missing tags</p>
        </div>
      </div>

      {/* SEO Guidelines Checklist */}
      <div className="bg-gradient-to-r from-orange-50/60 to-white border border-orange-200/70 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-[#E85B12]" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">SEO Best Practices & Guardrails</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>No Automatic Bulk Spun Pages:</strong> City-product pairs require substantive, authentic local value.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Strict Service Verification:</strong> Location landing pages cannot publish without verified coverage notes.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span><strong>Automated XML Sitemaps:</strong> Dynamic sitemaps immediately purge cache upon page publication or unpublishing.</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'all' ? 'bg-[#E85B12] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Issues ({data.issues?.length || 0})
          </button>
          <button
            onClick={() => setFilterType('error')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'error' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            Errors ({data.summary?.errors || 0})
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterType === 'warning' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            Warnings ({data.summary?.warnings || 0})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search path or message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12] focus:bg-white"
          />
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#E85B12] mb-3" />
            Analyzing metadata, tags and canonical directives...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">All Clear! No SEO Issues Found</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Every published city page, product, and landing page passes title length, meta description, canonical URL and content thickness checks.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Affected Page Route</th>
                  <th className="py-3 px-4">Audit Field</th>
                  <th className="py-3 px-4">Audit Finding / Recommendation</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredIssues.map((issue, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      {issue.type === 'error' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
                          <AlertCircle className="w-3 h-3" /> ERROR
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                          <AlertTriangle className="w-3 h-3" /> WARN
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-gray-900">
                      {issue.page}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-semibold">
                        {issue.field}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-medium">
                      {issue.message}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={issue.page.startsWith('http') ? issue.page : `http://localhost:5173${issue.page}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#E85B12] hover:text-[#c4490b] font-semibold"
                      >
                        Inspect <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
