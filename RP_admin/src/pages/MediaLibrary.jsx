import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Upload, Image as ImageIcon, Trash2, Copy, Check, Search, AlertCircle, FileText } from 'lucide-react';

export default function MediaLibrary() {
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [altText, setAltText] = useState('');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get('/media');
      if (res.data.success) {
        setMediaList(res.data.media || []);
      }
    } catch (err) {
      console.error('Failed to load media', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg('');
      const formData = new FormData();
      formData.append('image', file);
      if (altText) formData.append('altText', altText);

      const res = await adminApi.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setFile(null);
        setAltText('');
        fetchMedia();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to upload asset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media asset?')) return;
    try {
      await adminApi.delete(`/media/${id}`);
      fetchMedia();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete asset');
    }
  };

  const handleCopyUrl = (url, id) => {
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5001${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = mediaList.filter((m) =>
    m.originalName?.toLowerCase().includes(search.toLowerCase()) ||
    m.altText?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media & Asset Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage product photography, warehouse schematics, and city landing page banners.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Upload New Image Asset</h2>
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Image File (JPEG, PNG, WebP &lt; 5MB)</label>
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-[#E85B12] hover:file:bg-orange-100 cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Image Alt Text (SEO)</label>
            <input
              type="text"
              placeholder="e.g., Heavy Duty Warehouse Pallet Rack System"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12]"
            />
          </div>
          <button
            type="submit"
            disabled={!file || uploading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-[#E85B12] text-white rounded-lg hover:bg-[#c4490b] text-xs font-semibold shadow-sm transition-colors disabled:opacity-50 h-[38px]"
          >
            <Upload className={`w-4 h-4 ${uploading ? 'animate-bounce' : ''}`} />
            {uploading ? 'Uploading...' : 'Upload Asset'}
          </button>
        </form>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by file name or alt text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12] focus:bg-white"
          />
        </div>
        <span className="text-xs text-gray-500 font-medium">Total Assets: {filtered.length}</span>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <ImageIcon className="w-8 h-8 text-gray-300 animate-pulse mx-auto mb-2" />
          <p className="text-xs text-gray-500">Loading asset collection...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-gray-800">No Media Found</h3>
          <p className="text-xs text-gray-500 mt-1">Upload an image above to populate the media library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group">
              <div className="aspect-square bg-gray-100 relative overflow-hidden flex items-center justify-center">
                <img
                  src={`http://localhost:5001${item.url}`}
                  alt={item.altText || item.originalName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="p-4 text-center text-xs text-gray-400">Preview Unavailable</div>';
                  }}
                />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900 truncate" title={item.originalName}>
                    {item.originalName}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5 truncate" title={item.altText}>
                    Alt: {item.altText || 'None'}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {(item.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => handleCopyUrl(item.url, item._id)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#E85B12] hover:text-[#c4490b]"
                  >
                    {copiedId === item._id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors"
                    title="Delete asset"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
