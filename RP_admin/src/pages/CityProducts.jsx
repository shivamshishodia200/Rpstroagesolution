import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  ExternalLink,
  Edit,
  Trash2,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  MapPin,
  ShoppingBag,
  Eye,
  History,
  Check,
  Send,
  RotateCcw,
  Globe,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  ArrowUpRight,
  HelpCircle,
  Building,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { RichTextEditor } from '../components/common/RichTextEditor';

export const CityProducts = () => {
  const { user } = useAuth();

  // Role permissions
  const canPublish = user?.role === 'super_admin' || user?.role === 'seo_manager';
  const canApprove = user?.role === 'super_admin' || user?.role === 'seo_manager';
  const canRestore = user?.role === 'super_admin' || user?.role === 'seo_manager';
  const canDelete = user?.role === 'super_admin';

  // State: Data
  const [items, setItems] = useState([]);
  const [cities, setCities] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 15 });

  // State: Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [missingMetadataFilter, setMissingMetadataFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');

  // State: Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // State: Modals
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // content | seo | audit | revisions

  // State: Preview Modal
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // desktop | tablet | mobile

  // State: Revisions Modal / Drawer
  const [revisionsModalOpen, setRevisionsModalOpen] = useState(false);
  const [revisionsList, setRevisionsList] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);
  const [revisionsLoading, setRevisionsLoading] = useState(false);

  // State: Review / Change Request Modal
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [workflowActionType, setWorkflowActionType] = useState('submit'); // submit | approve | request_changes
  const [workflowTargetItem, setWorkflowTargetItem] = useState(null);
  const [workflowNotes, setWorkflowNotes] = useState('');

  // State: Mapping Availability Warning in Create Form
  const [mappingWarning, setMappingWarning] = useState(null);
  const [checkingMapping, setCheckingMapping] = useState(false);

  // Form State
  const initialFormState = {
    cityId: '',
    productId: '',
    pageName: '',
    h1Heading: '',
    introContent: '',
    customContent: '',
    benefits: ['High tensile CRCA steel frame', 'Electrostatic powder coated finish', 'Custom beam loading capacity', 'Quick hook connector assembly'],
    applications: ['Logistics Warehousing', 'Retail Supermarkets', 'Cold Storage Plants', 'Automotive Distribution'],
    serviceDetails: 'Factory-direct dispatch from Najafgarh, New Delhi with complete layout survey, load engineering certification, and professional erection.',
    localBusinessInfo: {
      hubName: '',
      warehouseAddress: '',
      servicePhone: '+91 99900 23436',
      deliveryTimelines: '48 to 72 hours dispatch',
      verifiedServiceArea: '',
    },
    customFaqs: [
      {
        question: 'What is the load rating per level?',
        answer: 'Capacities range from 500 kg to 4,000 kg UDL per pallet level, engineered with finite element analysis.',
      },
      {
        question: 'Do you provide on-site installation?',
        answer: 'Yes, our certified structural crew handles complete floor anchoring, leveling, and testing.',
      },
    ],
    enquiryCta: {
      heading: 'Request Technical Drawing & Factory Pricing',
      subheading: 'Get customized CAD drawings and direct manufacturer estimates within 24 hours.',
      buttonText: 'Get Free Estimate',
      phone: '+91 99900 23436',
    },
    seoTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    robotsDirective: 'index, follow',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    schemaType: 'Product',
    internalLinks: [],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [formIsDirty, setFormIsDirty] = useState(false);

  // Fetch Listing
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        sort: sortBy,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (cityFilter) params.cityId = cityFilter;
      if (productFilter) params.productId = productFilter;
      if (missingMetadataFilter) params.missingMetadata = missingMetadataFilter;

      const [resItems, resCities, resProducts] = await Promise.all([
        api.get('/city-products', { params }),
        api.get('/cities', { params: { isVerified: 'true' } }),
        api.get('/products'),
      ]);

      if (resItems.data.success) {
        setItems(resItems.data.cityProducts || []);
        if (resItems.data.pagination) {
          setPagination(resItems.data.pagination);
        }
      }
      if (resCities.data.success) setCities(resCities.data.cities || []);
      if (resProducts.data.success) setProducts(resProducts.data.products || []);
    } catch (err) {
      console.error('Failed to load SEO pages:', err);
      setErrorMsg('Failed to load landing pages. Please check API connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
  }, [search, statusFilter, cityFilter, productFilter, missingMetadataFilter, sortBy]);

  // Check Availability Mapping when City or Product changes in Create Mode
  useEffect(() => {
    const checkAvailability = async () => {
      if (editingItem || !formData.cityId || !formData.productId) {
        setMappingWarning(null);
        return;
      }
      setCheckingMapping(true);
      try {
        const res = await api.get('/product-city-mappings', {
          params: { cityId: formData.cityId, productId: formData.productId },
        });
        const mapping = res.data.mappings?.[0];
        if (!mapping || !mapping.isAvailable) {
          setMappingWarning({
            exists: Boolean(mapping),
            isAvailable: mapping?.isAvailable || false,
            message: !mapping
              ? 'No availability mapping exists for this Product in this City. You must enable it in the Product × City Matrix before publishing.'
              : 'This combination is currently marked as DISABLED in the availability matrix.',
          });
        } else {
          setMappingWarning(null);
        }
      } catch (err) {
        setMappingWarning(null);
      } finally {
        setCheckingMapping(false);
      }
    };

    checkAvailability();
  }, [formData.cityId, formData.productId, editingItem]);

  // Auto-fill sensible SEO defaults when selecting city/product
  const handleSelectCityOrProduct = (field, val) => {
    const updated = { ...formData, [field]: val };
    const selectedCity = cities.find((c) => c._id === (field === 'cityId' ? val : updated.cityId));
    const selectedProduct = products.find((p) => p._id === (field === 'productId' ? val : updated.productId));

    if (selectedCity && selectedProduct) {
      const combinedSlug = `${selectedCity.slug}/${selectedProduct.slug}`;
      if (!updated.h1Heading) {
        updated.h1Heading = `${selectedProduct.name} in ${selectedCity.name} | Heavy Duty Industrial & Retail Racks`;
      }
      if (!updated.seoTitle) {
        updated.seoTitle = `Top ${selectedProduct.name} Manufacturers in ${selectedCity.name} | RP Storage`;
      }
      if (!updated.metaDescription) {
        updated.metaDescription = `Looking for high-grade ${selectedProduct.name} in ${selectedCity.name}? Direct factory supply, heavy-duty powder-coated racking systems with on-site survey and installation.`;
      }
      if (!updated.canonicalUrl) {
        updated.canonicalUrl = `https://www.rpstoragesolution.com/locations/${combinedSlug}/`;
      }
      if (!updated.pageName) {
        updated.pageName = `${selectedProduct.name} — ${selectedCity.name}`;
      }
      if (!updated.localBusinessInfo.hubName) {
        updated.localBusinessInfo = {
          ...updated.localBusinessInfo,
          hubName: `${selectedCity.name} Logistics Delivery Hub`,
          warehouseAddress: `${selectedCity.name} Industrial Area, ${selectedCity.state}`,
        };
      }
    }
    setFormData(updated);
    setFormIsDirty(true);
  };

  // Open Create Modal
  const openNewModal = () => {
    setEditingItem(null);
    const defaultCityId = cities[0]?._id || '';
    const defaultProductId = products[0]?._id || '';

    const initial = {
      ...initialFormState,
      cityId: defaultCityId,
      productId: defaultProductId,
    };

    const c = cities.find((x) => x._id === defaultCityId);
    const p = products.find((x) => x._id === defaultProductId);
    if (c && p) {
      const slug = `${c.slug}/${p.slug}`;
      initial.h1Heading = `${p.name} in ${c.name} | Heavy Duty Industrial & Retail Racks`;
      initial.seoTitle = `Top ${p.name} Manufacturers in ${c.name} | RP Storage`;
      initial.metaDescription = `Looking for high-grade ${p.name} in ${c.name}? Direct factory supply, heavy-duty powder-coated racking systems with on-site survey and installation.`;
      initial.canonicalUrl = `https://www.rpstoragesolution.com/locations/${slug}/`;
      initial.pageName = `${p.name} — ${c.name}`;
      initial.localBusinessInfo.hubName = `${c.name} Logistics Delivery Hub`;
      initial.localBusinessInfo.warehouseAddress = `${c.name} Industrial Area, ${c.state}`;
    }

    setFormData(initial);
    setActiveTab('content');
    setErrorMsg('');
    setFormIsDirty(false);
    setEditorModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      cityId: item.city?._id || item.city || '',
      productId: item.product?._id || item.product || '',
      pageName: item.pageName || `${item.productName} — ${item.cityName}`,
      h1Heading: item.h1Heading || '',
      introContent: item.introContent || '',
      customContent: item.customContent || '',
      benefits: item.benefits?.length ? item.benefits : initialFormState.benefits,
      applications: item.applications?.length ? item.applications : initialFormState.applications,
      serviceDetails: item.serviceDetails || initialFormState.serviceDetails,
      localBusinessInfo: {
        hubName: item.localBusinessInfo?.hubName || '',
        warehouseAddress: item.localBusinessInfo?.warehouseAddress || '',
        servicePhone: item.localBusinessInfo?.servicePhone || '+91 99900 23436',
        deliveryTimelines: item.localBusinessInfo?.deliveryTimelines || '48 to 72 hours dispatch',
        verifiedServiceArea: item.localBusinessInfo?.verifiedServiceArea || '',
      },
      customFaqs: item.customFaqs?.length ? item.customFaqs : initialFormState.customFaqs,
      enquiryCta: item.enquiryCta || initialFormState.enquiryCta,
      seoTitle: item.seoTitle || '',
      metaDescription: item.metaDescription || '',
      canonicalUrl: item.canonicalUrl || '',
      robotsDirective: item.robotsDirective || 'index, follow',
      ogTitle: item.ogTitle || '',
      ogDescription: item.ogDescription || '',
      ogImage: item.ogImage || '',
      schemaType: item.schemaType || 'Product',
      internalLinks: item.internalLinks || [],
    });
    setActiveTab('content');
    setErrorMsg('');
    setFormIsDirty(false);
    setEditorModalOpen(true);
  };

  // Save / Submit Form
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      if (editingItem) {
        const res = await api.patch(`/city-products/${editingItem._id}`, formData);
        setSuccessMsg(res.data.message || 'Page updated successfully!');
      } else {
        const res = await api.post('/city-products', formData);
        setSuccessMsg(`Created new SEO draft for /locations/${res.data.cityProduct.slug}/!`);
      }
      setEditorModalOpen(false);
      setFormIsDirty(false);
      fetchData(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Save operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Publish
  const handlePublish = async (id, slug) => {
    try {
      const res = await api.post(`/city-products/${id}/publish`);
      setSuccessMsg(res.data.message || `Page /locations/${slug}/ is now live.`);
      fetchData(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      alert(err.response?.data?.message || 'Publishing failed. Please resolve SEO blockers.');
    }
  };

  // Unpublish
  const handleUnpublish = async (id, slug) => {
    if (!window.confirm(`Unpublish page /locations/${slug}/? It will be removed from sitemaps and return 404.`)) return;
    try {
      const res = await api.post(`/city-products/${id}/unpublish`);
      setSuccessMsg(res.data.message || 'Page unpublished.');
      fetchData(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      alert(err.response?.data?.message || 'Unpublish failed.');
    }
  };

  // Delete
  const handleDelete = async (id, slug) => {
    if (!window.confirm(`Permanently delete SEO landing page '${slug}' and all revision snapshots?`)) return;
    try {
      await api.delete(`/city-products/${id}`);
      setSuccessMsg(`Deleted page '${slug}'.`);
      fetchData(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  // Open Workflow Modal (Submit review / Approve / Request Changes)
  const openWorkflowModal = (item, actionType) => {
    setWorkflowTargetItem(item);
    setWorkflowActionType(actionType);
    setWorkflowNotes('');
    setWorkflowModalOpen(true);
  };

  // Submit Workflow Action
  const handleWorkflowSubmit = async (e) => {
    e.preventDefault();
    if (!workflowTargetItem) return;
    setSubmitting(true);
    try {
      if (workflowActionType === 'submit') {
        await api.post(`/city-products/${workflowTargetItem._id}/submit-review`, {
          reviewNotes: workflowNotes || 'Ready for editorial review',
        });
        setSuccessMsg(`Page '${workflowTargetItem.slug}' submitted for review.`);
      } else if (workflowActionType === 'approve') {
        await api.post(`/city-products/${workflowTargetItem._id}/approve`, {
          notes: workflowNotes || 'Approved for publishing',
        });
        setSuccessMsg(`Page '${workflowTargetItem.slug}' approved.`);
      } else if (workflowActionType === 'request_changes') {
        if (!workflowNotes.trim()) {
          alert('Please enter editorial feedback or change reason.');
          setSubmitting(false);
          return;
        }
        await api.post(`/city-products/${workflowTargetItem._id}/request-changes`, {
          reason: workflowNotes,
        });
        setSuccessMsg(`Changes requested for '${workflowTargetItem.slug}'.`);
      }
      setWorkflowModalOpen(false);
      fetchData(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      alert(err.response?.data?.message || 'Workflow action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Revisions History Drawer
  const openRevisionsHistory = async (item) => {
    setSelectedRevision(null);
    setEditingItem(item);
    setRevisionsModalOpen(true);
    setRevisionsLoading(true);
    try {
      const res = await api.get(`/city-products/${item._id}/revisions`);
      if (res.data.success) {
        setRevisionsList(res.data.revisions || []);
      }
    } catch (err) {
      alert('Failed to load revisions.');
    } finally {
      setRevisionsLoading(false);
    }
  };

  // Restore Revision Snapshot
  const handleRestoreRevision = async (version) => {
    if (!window.confirm(`Restore version v${version} into a new draft? Current uncommitted edits will be superseded.`)) return;
    try {
      const res = await api.post(`/city-products/${editingItem._id}/revisions/${version}/restore`);
      setSuccessMsg(res.data.message || `Restored version v${version} into draft!`);
      setRevisionsModalOpen(false);
      fetchData(pagination.page);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore revision.');
    }
  };

  // Open Preview Modal
  const openPreview = async (item) => {
    try {
      const res = await api.get(`/city-products/${item._id}/preview`);
      if (res.data.success) {
        setPreviewItem(res.data.cityProduct);
        setPreviewDevice('desktop');
        setPreviewModalOpen(true);
      }
    } catch (err) {
      alert('Failed to load preview.');
    }
  };

  // Dynamic Array Handlers for Form
  const handleAddBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
    setFormIsDirty(true);
  };
  const handleUpdateBenefit = (index, val) => {
    const list = [...formData.benefits];
    list[index] = val;
    setFormData({ ...formData, benefits: list });
    setFormIsDirty(true);
  };
  const handleRemoveBenefit = (index) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) });
    setFormIsDirty(true);
  };

  const handleAddApplication = () => {
    setFormData({ ...formData, applications: [...formData.applications, ''] });
    setFormIsDirty(true);
  };
  const handleUpdateApplication = (index, val) => {
    const list = [...formData.applications];
    list[index] = val;
    setFormData({ ...formData, applications: list });
    setFormIsDirty(true);
  };
  const handleRemoveApplication = (index) => {
    setFormData({ ...formData, applications: formData.applications.filter((_, i) => i !== index) });
    setFormIsDirty(true);
  };

  const handleAddFaq = () => {
    setFormData({
      ...formData,
      customFaqs: [...formData.customFaqs, { question: '', answer: '' }],
    });
    setFormIsDirty(true);
  };
  const handleUpdateFaq = (index, field, val) => {
    const faqs = [...formData.customFaqs];
    faqs[index][field] = val;
    setFormData({ ...formData, customFaqs: faqs });
    setFormIsDirty(true);
  };
  const handleRemoveFaq = (index) => {
    setFormData({ ...formData, customFaqs: formData.customFaqs.filter((_, i) => i !== index) });
    setFormIsDirty(true);
  };

  const handleAddInternalLink = () => {
    setFormData({
      ...formData,
      internalLinks: [...formData.internalLinks, { anchorText: '', targetUrl: '' }],
    });
    setFormIsDirty(true);
  };
  const handleUpdateInternalLink = (index, field, val) => {
    const links = [...formData.internalLinks];
    links[index][field] = val;
    setFormData({ ...formData, internalLinks: links });
    setFormIsDirty(true);
  };
  const handleRemoveInternalLink = (index) => {
    setFormData({ ...formData, internalLinks: formData.internalLinks.filter((_, i) => i !== index) });
    setFormIsDirty(true);
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    const map = {
      published: { label: 'Published', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      approved: { label: 'Approved', bg: 'bg-blue-100 text-blue-800 border-blue-200' },
      review: { label: 'In Review', bg: 'bg-amber-100 text-amber-800 border-amber-200' },
      changes_requested: { label: 'Changes Req.', bg: 'bg-red-100 text-red-800 border-red-200' },
      draft: { label: 'Draft', bg: 'bg-neutral-100 text-neutral-700 border-neutral-300' },
      archived: { label: 'Archived', bg: 'bg-gray-100 text-gray-500 border-gray-200' },
    };
    const s = map[status] || map.draft;
    return (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${s.bg}`}>
        {s.label}
      </span>
    );
  };

  // Quality Score Badge Helper
  const renderQualityBadge = (audit) => {
    if (!audit) return null;
    const score = audit.score ?? 0;
    let color = 'bg-emerald-50 text-emerald-700 border-emerald-300';
    if (score < 60) color = 'bg-red-50 text-red-700 border-red-300';
    else if (score < 80) color = 'bg-amber-50 text-amber-700 border-amber-300';

    return (
      <div className="flex items-center gap-1.5" title={`SEO Score: ${score}/100. Blockers: ${audit.blockersCount}, Warnings: ${audit.warningsCount}`}>
        <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${color}`}>
          {score}%
        </span>
        {audit.blockersCount > 0 ? (
          <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5">
            <AlertCircle className="w-3 h-3" /> {audit.blockersCount}
          </span>
        ) : audit.warningsCount > 0 ? (
          <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" /> {audit.warningsCount}
          </span>
        ) : (
          <Check className="w-3.5 h-3.5 text-emerald-600" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-orange" />
            <span>SEO Landing Pages (Programmatic CMS)</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage high-intent programmatic landing pages (e.g. /locations/delhi/supermarket-racks/) with role-governed review, version control, and real-time SEO quality validation.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create SEO Page</span>
        </button>
      </div>

      {/* Global Notifications */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-500 hover:text-red-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 border border-brand-border rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city, product, heading, or slug..."
              className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:border-brand-orange focus:bg-white focus:outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
            >
              <option value="all">All Workflow Statuses</option>
              <option value="draft">Drafts</option>
              <option value="review">In Review</option>
              <option value="changes_requested">Changes Requested</option>
              <option value="approved">Approved</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
            >
              <option value="">All Verified Cities</option>
              {cities.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={productFilter}
              onChange={(e) => setProductFilter(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
          {/* Missing Metadata & Quality Filter */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-bold uppercase text-[10px]">SEO Quality Filters:</span>
            <select
              value={missingMetadataFilter}
              onChange={(e) => setMissingMetadataFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-700 text-xs focus:border-brand-orange focus:outline-none"
            >
              <option value="">All Pages (No filter)</option>
              <option value="missing_title">Missing Meta Title</option>
              <option value="missing_desc">Missing Meta Description</option>
              <option value="missing_canonical">Missing Canonical URL</option>
              <option value="thin_content">Thin Content (&lt;200 chars)</option>
              <option value="all_issues">Any Critical SEO Issue</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-bold uppercase text-[10px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-neutral-50 border border-neutral-300 rounded-lg text-neutral-700 text-xs focus:border-brand-orange focus:outline-none"
            >
              <option value="-createdAt">Newest Created</option>
              <option value="createdAt">Oldest Created</option>
              <option value="-updatedAt">Recently Updated</option>
              <option value="cityName">City Name (A–Z)</option>
              <option value="productName">Product Name (A–Z)</option>
            </select>
            <span className="text-xs font-mono text-neutral-500 ml-2">
              Showing <strong>{items.length}</strong> of <strong>{pagination.total}</strong> pages
            </span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-brand-border rounded-xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-brand-border text-neutral-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Landing Page / URL</th>
                <th className="py-3 px-4">Target Product</th>
                <th className="py-3 px-4">Target City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Indexability</th>
                <th className="py-3 px-4">SEO Health</th>
                <th className="py-3 px-4">Version & Editor</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-neutral-400">
                    <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading SEO landing pages...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-neutral-400">
                    <p className="font-semibold text-neutral-600">No SEO Landing Pages Match Query</p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Try clearing your search/filters or click "+ Create SEO Page" to add one.
                    </p>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-neutral-50/70 transition-colors">
                    {/* Page Name & Slug */}
                    <td className="py-3.5 px-4 font-medium text-neutral-900 max-w-xs">
                      <div className="font-bold text-neutral-900 truncate" title={item.h1Heading}>
                        {item.pageName || item.h1Heading}
                      </div>
                      <div className="font-mono text-[11px] text-brand-orange mt-0.5 truncate">
                        /locations/{item.slug}/
                      </div>
                    </td>

                    {/* Product */}
                    <td className="py-3.5 px-4 font-medium text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{item.productName}</span>
                      </div>
                    </td>

                    {/* City */}
                    <td className="py-3.5 px-4 text-neutral-800">
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span>{item.cityName}</span>
                        {item.city?.state && (
                          <span className="text-[10px] font-normal text-neutral-400">({item.city.state})</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {renderStatusBadge(item.status)}
                    </td>

                    {/* Indexability */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {item.robotsDirective === 'noindex, nofollow' ? (
                        <span className="text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          noindex
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          index, follow
                        </span>
                      )}
                    </td>

                    {/* SEO Health Score */}
                    <td className="py-3.5 px-4">
                      {renderQualityBadge(item.seoAudit)}
                    </td>

                    {/* Version & Editor */}
                    <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                      <div className="font-mono font-bold text-neutral-700">v{item.version || 1}</div>
                      <div className="text-[10px] text-neutral-400">
                        {item.updatedBy?.name || item.createdBy?.name || 'Admin'}
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                      {/* Preview Action */}
                      <button
                        onClick={() => openPreview(item)}
                        className="p-1.5 text-neutral-600 hover:text-brand-orange inline-block rounded hover:bg-neutral-100"
                        title="Secure Draft Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit Action */}
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 text-neutral-600 hover:text-neutral-900 inline-block rounded hover:bg-neutral-100"
                        title="Edit Page"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Workflow Actions */}
                      {item.status === 'draft' || item.status === 'changes_requested' ? (
                        <button
                          onClick={() => openWorkflowModal(item, 'submit')}
                          className="px-2 py-1 text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 inline-flex items-center gap-1"
                          title="Submit to SEO Manager for Review"
                        >
                          <Send className="w-3 h-3" />
                          <span>Submit</span>
                        </button>
                      ) : null}

                      {item.status === 'review' && canApprove ? (
                        <>
                          <button
                            onClick={() => openWorkflowModal(item, 'approve')}
                            className="px-2 py-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 inline-flex items-center gap-1"
                            title="Approve for Publication"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => openWorkflowModal(item, 'request_changes')}
                            className="px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                            title="Request Editorial Changes"
                          >
                            Reject
                          </button>
                        </>
                      ) : null}

                      {item.status === 'approved' && canPublish ? (
                        <button
                          onClick={() => handlePublish(item._id, item.slug)}
                          className="px-2 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-2xs inline-flex items-center gap-1"
                          title="Publish Live"
                        >
                          <Globe className="w-3 h-3" />
                          <span>Publish</span>
                        </button>
                      ) : null}

                      {item.status === 'published' ? (
                        <>
                          <a
                            href={`http://localhost:5173/locations/${item.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-neutral-500 hover:text-brand-orange inline-block rounded hover:bg-neutral-100"
                            title="View Public Page"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          {canPublish && (
                            <button
                              onClick={() => handleUnpublish(item._id, item.slug)}
                              className="px-2 py-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100"
                              title="Unpublish page"
                            >
                              Unpublish
                            </button>
                          )}
                        </>
                      ) : null}

                      {/* Revisions History Action */}
                      <button
                        onClick={() => openRevisionsHistory(item)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 inline-block rounded hover:bg-neutral-100"
                        title="Version Revision History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Action (Super Admin) */}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item._id, item.slug)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 inline-block rounded hover:bg-neutral-100"
                          title="Delete Page"
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

        {/* Pagination Bar */}
        <div className="bg-neutral-50 px-4 py-3 border-t border-brand-border flex items-center justify-between text-xs text-neutral-500">
          <div>
            Page <strong>{pagination.page}</strong> of <strong>{pagination.pages || 1}</strong>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchData(pagination.page - 1)}
              className="p-1.5 border border-neutral-300 rounded bg-white hover:bg-neutral-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => fetchData(pagination.page + 1)}
              className="p-1.5 border border-neutral-300 rounded bg-white hover:bg-neutral-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE & EDIT TABBED MODAL */}
      {editorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-brand-border my-8 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-neutral-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded bg-brand-orange flex items-center justify-center text-white font-bold text-xs">
                  SEO
                </div>
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wider">
                    {editingItem ? `Edit: ${editingItem.slug}` : 'New Programmatic SEO Landing Page'}
                  </h2>
                  <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                    {editingItem ? `Status: ${editingItem.status} | Version: v${editingItem.version || 1}` : 'Will be saved as initial Draft (v1)'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (formIsDirty && !window.confirm('You have unsaved changes. Discard?')) return;
                  setEditorModalOpen(false);
                }}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unsaved Changes Warning Banner */}
            {formIsDirty && (
              <div className="bg-amber-500 text-white px-4 py-1.5 text-[11px] font-bold flex items-center justify-between">
                <span>⚠️ Unsaved changes in progress. Click "Save Draft" below to preserve edits.</span>
                {editingItem?.status === 'approved' && (
                  <span className="underline font-normal text-[10px]">
                    Note: Editing approved content resets status to "In Review".
                  </span>
                )}
              </div>
            )}

            {/* Tabs Bar */}
            <div className="flex border-b border-neutral-200 bg-neutral-50 px-6 gap-2 text-xs font-semibold select-none">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`py-3 px-3.5 border-b-2 transition-colors ${
                  activeTab === 'content'
                    ? 'border-brand-orange text-brand-orange bg-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                1. General Content & Media
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`py-3 px-3.5 border-b-2 transition-colors ${
                  activeTab === 'seo'
                    ? 'border-brand-orange text-brand-orange bg-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                2. Technical SEO & Schema
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audit')}
                className={`py-3 px-3.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'audit'
                    ? 'border-brand-orange text-brand-orange bg-white font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <span>3. Live Quality Audit</span>
                <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              </button>
            </div>

            {/* Form Form Container */}
            <form onSubmit={handleSubmitForm} className="overflow-y-auto flex-1 p-6 space-y-6 text-xs">
              {/* Mapping Availability Warning on Create */}
              {mappingWarning && (
                <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-start justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Availability Warning:</strong>
                      <p className="mt-0.5">{mappingWarning.message}</p>
                    </div>
                  </div>
                  <Link
                    to="/mappings"
                    target="_blank"
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs shrink-0 flex items-center gap-1"
                  >
                    <span>Configure Matrix</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* TAB 1: CONTENT */}
              {activeTab === 'content' && (
                <div className="space-y-5">
                  {/* City and Product Selection (Only on create) */}
                  {!editingItem ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">Target Verified City *</label>
                        <select
                          value={formData.cityId}
                          onChange={(e) => handleSelectCityOrProduct('cityId', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
                        >
                          {cities.map((c) => (
                            <option key={c._id} value={c._id}>
                              {c.name} ({c.state})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-neutral-800 mb-1">Target Product *</label>
                        <select
                          value={formData.productId}
                          onChange={(e) => handleSelectCityOrProduct('productId', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
                        >
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ) : null}

                  {/* Primary Heading */}
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">
                      Primary H1 Heading *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.h1Heading}
                      onChange={(e) => {
                        setFormData({ ...formData, h1Heading: e.target.value });
                        setFormIsDirty(true);
                      }}
                      placeholder="e.g. Warehouse Pallet Racks in Noida | Heavy Duty Industrial Storage"
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  {/* Introductory Summary */}
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1">
                      Introductory Content / Summary (Lead Paragraph)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.introContent}
                      onChange={(e) => {
                        setFormData({ ...formData, introContent: e.target.value });
                        setFormIsDirty(true);
                      }}
                      placeholder="Brief overview highlighting engineering grade, service areas, and fast dispatch..."
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  {/* Main Rich Text Content with TipTap */}
                  <div>
                    <label className="block font-bold text-neutral-800 mb-1 flex items-center justify-between">
                      <span>Substantive City-Product Content (Value-Add Content) *</span>
                      <span className="text-[11px] text-neutral-400 font-normal">TipTap WYSIWYG Editor</span>
                    </label>
                    <RichTextEditor
                      value={formData.customContent}
                      onChange={(html) => {
                        setFormData({ ...formData, customContent: html });
                        setFormIsDirty(true);
                      }}
                    />
                  </div>

                  {/* Technical Advantages / Benefits */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Key Product Benefits & Structural Advantages</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddBenefit}
                        className="text-brand-orange hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Benefit
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.benefits.map((b, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={b}
                            onChange={(e) => handleUpdateBenefit(idx, e.target.value)}
                            placeholder="e.g. Heavy-duty 8-tank powder coated finish"
                            className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveBenefit(idx)}
                            className="p-1.5 text-neutral-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Target Applications */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                        <Building className="w-4 h-4 text-[#E85B12]" />
                        <span>Recommended Applications & Industries</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddApplication}
                        className="text-brand-orange hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Application
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formData.applications.map((app, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={app}
                            onChange={(e) => handleUpdateApplication(idx, e.target.value)}
                            placeholder="e.g. Cold Storage Plants"
                            className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveApplication(idx)}
                            className="p-1.5 text-neutral-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Genuine Local Business Details */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <label className="font-bold text-neutral-800 block">
                      Genuine Local Business & Delivery Information
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold block mb-1">Local Hub / Center Name</span>
                        <input
                          type="text"
                          value={formData.localBusinessInfo.hubName}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              localBusinessInfo: { ...formData.localBusinessInfo, hubName: e.target.value },
                            });
                            setFormIsDirty(true);
                          }}
                          placeholder="e.g. Noida Sector 63 Logistics Hub"
                          className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold block mb-1">Dispatch Timelines</span>
                        <input
                          type="text"
                          value={formData.localBusinessInfo.deliveryTimelines}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              localBusinessInfo: { ...formData.localBusinessInfo, deliveryTimelines: e.target.value },
                            });
                            setFormIsDirty(true);
                          }}
                          placeholder="e.g. 48 to 72 hours direct dispatch"
                          className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[10px] text-neutral-500 font-bold block mb-1">Local Warehouse / Office Address</span>
                        <input
                          type="text"
                          value={formData.localBusinessInfo.warehouseAddress}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              localBusinessInfo: { ...formData.localBusinessInfo, warehouseAddress: e.target.value },
                            });
                            setFormIsDirty(true);
                          }}
                          placeholder="Street, Industrial Area, City..."
                          className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Custom FAQs */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-neutral-800 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-neutral-600" />
                        <span>Custom FAQs for Search Snippets</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleAddFaq}
                        className="text-brand-orange hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add FAQ
                      </button>
                    </div>
                    <div className="space-y-3">
                      {formData.customFaqs.map((faq, idx) => (
                        <div key={idx} className="p-3 bg-white border border-neutral-200 rounded-lg space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleUpdateFaq(idx, 'question', e.target.value)}
                              placeholder="Question: e.g. What is the pallet capacity?"
                              className="flex-1 px-2.5 py-1.5 font-semibold text-xs border border-neutral-200 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFaq(idx)}
                              className="text-neutral-400 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => handleUpdateFaq(idx, 'answer', e.target.value)}
                            placeholder="Answer text..."
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-200 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL SEO */}
              {activeTab === 'seo' && (
                <div className="space-y-5">
                  {/* Meta Title with Live Character Counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-neutral-800">SEO Meta Title *</label>
                      <span
                        className={`text-[10px] font-mono ${
                          formData.seoTitle.length < 35 || formData.seoTitle.length > 65
                            ? 'text-amber-600 font-bold'
                            : 'text-emerald-600 font-bold'
                        }`}
                      >
                        {formData.seoTitle.length} / 60 characters
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.seoTitle}
                      onChange={(e) => {
                        setFormData({ ...formData, seoTitle: e.target.value });
                        setFormIsDirty(true);
                      }}
                      placeholder="e.g. Heavy Duty Warehouse Racks in Noida | RP Storage Solution"
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  {/* Meta Description with Live Character Counter */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-neutral-800">SEO Meta Description *</label>
                      <span
                        className={`text-[10px] font-mono ${
                          formData.metaDescription.length < 100 || formData.metaDescription.length > 165
                            ? 'text-amber-600 font-bold'
                            : 'text-emerald-600 font-bold'
                        }`}
                      >
                        {formData.metaDescription.length} / 155 characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      required
                      value={formData.metaDescription}
                      onChange={(e) => {
                        setFormData({ ...formData, metaDescription: e.target.value });
                        setFormIsDirty(true);
                      }}
                      placeholder="Target 120–160 characters describing product load capacities, factory direct supply, site survey, and location benefits."
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg focus:border-brand-orange focus:outline-none"
                    />
                  </div>

                  {/* SERP Snippet Preview */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                      Google SERP Desktop Snippet Preview
                    </span>
                    <div className="text-[11px] text-neutral-700 font-mono truncate">
                      {formData.canonicalUrl || 'https://www.rpstoragesolution.com/locations/...'}
                    </div>
                    <div className="text-base font-semibold text-blue-800 hover:underline cursor-pointer truncate">
                      {formData.seoTitle || 'Meta Title Preview'}
                    </div>
                    <div className="text-xs text-neutral-600 leading-normal line-clamp-2">
                      {formData.metaDescription || 'Meta description preview snippet will appear here...'}
                    </div>
                  </div>

                  {/* Canonical URL & Robots Directive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Canonical URL *</label>
                      <input
                        type="url"
                        required
                        value={formData.canonicalUrl}
                        onChange={(e) => {
                          setFormData({ ...formData, canonicalUrl: e.target.value });
                          setFormIsDirty(true);
                        }}
                        placeholder="https://www.rpstoragesolution.com/locations/..."
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-neutral-800 mb-1">Robots Directive</label>
                      <select
                        value={formData.robotsDirective}
                        onChange={(e) => {
                          setFormData({ ...formData, robotsDirective: e.target.value });
                          setFormIsDirty(true);
                        }}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                      >
                        <option value="index, follow">index, follow (Default - Recommended)</option>
                        <option value="noindex, nofollow">noindex, nofollow (Draft / Safeguard)</option>
                        <option value="noindex, follow">noindex, follow</option>
                        <option value="index, nofollow">index, nofollow</option>
                      </select>
                    </div>
                  </div>

                  {/* Open Graph Tags */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <label className="font-bold text-neutral-800 block">Open Graph (Social Sharing) Tags</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold block mb-1">OG Title</span>
                        <input
                          type="text"
                          value={formData.ogTitle}
                          onChange={(e) => {
                            setFormData({ ...formData, ogTitle: e.target.value });
                            setFormIsDirty(true);
                          }}
                          placeholder="Defaults to SEO Title"
                          className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-500 font-bold block mb-1">OG Image URL</span>
                        <input
                          type="url"
                          value={formData.ogImage}
                          onChange={(e) => {
                            setFormData({ ...formData, ogImage: e.target.value });
                            setFormIsDirty(true);
                          }}
                          placeholder="https://.../rack-image.jpg"
                          className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Internal Links Manager */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-neutral-800">Internal Contextual Links</label>
                      <button
                        type="button"
                        onClick={handleAddInternalLink}
                        className="text-brand-orange hover:underline font-bold text-xs flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Link
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.internalLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={link.anchorText}
                            onChange={(e) => handleUpdateInternalLink(idx, 'anchorText', e.target.value)}
                            placeholder="Anchor Text (e.g. Industrial Racks in Delhi)"
                            className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs"
                          />
                          <input
                            type="text"
                            value={link.targetUrl}
                            onChange={(e) => handleUpdateInternalLink(idx, 'targetUrl', e.target.value)}
                            placeholder="Target URL (/locations/delhi/...)"
                            className="flex-1 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveInternalLink(idx)}
                            className="p-1.5 text-neutral-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REAL-TIME QUALITY AUDIT */}
              {activeTab === 'audit' && (
                <div className="space-y-4">
                  <div className="p-5 bg-white border border-neutral-200 rounded-2xl shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">Real-Time SEO Quality Engine</h3>
                        <p className="text-xs text-neutral-500">
                          Automated evaluation of critical publishing blockers and editorial recommendations.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                          SEO Readiness
                        </span>
                        <span className="text-2xl font-black text-brand-orange">
                          {formData.h1Heading && formData.seoTitle && formData.metaDescription && formData.customContent
                            ? '95%'
                            : '40%'}
                        </span>
                      </div>
                    </div>

                    {/* Quality Rules Check Table */}
                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">1. Primary H1 Heading:</span>
                        {formData.h1Heading.trim() ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Present ({formData.h1Heading.length} chars)
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Missing (Blocker)
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">2. SEO Meta Title:</span>
                        {formData.seoTitle.trim() ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Present ({formData.seoTitle.length} chars)
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Missing (Blocker)
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">3. SEO Meta Description:</span>
                        {formData.metaDescription.trim() ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Present ({formData.metaDescription.length} chars)
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Missing (Blocker)
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">4. Substantive Local Content:</span>
                        {formData.customContent && formData.customContent.length > 150 ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Good depth (~{Math.round(formData.customContent.split(/\s+/).length)} words)
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> Thin Content (Recommendation)
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">5. Canonical URL:</span>
                        {formData.canonicalUrl.startsWith('http') ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> Valid Absolute URL
                          </span>
                        ) : (
                          <span className="text-red-600 font-bold flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Invalid or Missing
                          </span>
                        )}
                      </div>

                      <div className="p-3 bg-neutral-50 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-neutral-700">6. Custom Local FAQs:</span>
                        {formData.customFaqs?.length > 0 ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" /> {formData.customFaqs.length} FAQs configured
                          </span>
                        ) : (
                          <span className="text-amber-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" /> 0 FAQs (Recommended)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="border-t border-neutral-200 pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand-orange hover:bg-brand-orangeHover text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{submitting ? 'Saving...' : editingItem ? 'Save Updates' : 'Create Draft'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECURE PREVIEW MODAL */}
      {previewModalOpen && previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative w-full max-w-6xl bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-700 flex flex-col h-[94vh] overflow-hidden">
            {/* Preview Toolbar */}
            <div className="px-6 py-3 border-b border-neutral-800 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800 px-2.5 py-1 rounded">
                  DRAFT PREVIEW (NOINDEX)
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  /locations/{previewItem.slug}/
                </span>
              </div>

              {/* Device Viewport Toggle */}
              <div className="flex items-center bg-neutral-800 p-1 rounded-lg border border-neutral-700 text-xs">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1 rounded flex items-center gap-1.5 ${
                    previewDevice === 'desktop' ? 'bg-brand-orange text-white font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" /> Desktop
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`px-3 py-1 rounded flex items-center gap-1.5 ${
                    previewDevice === 'tablet' ? 'bg-brand-orange text-white font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" /> Tablet
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1 rounded flex items-center gap-1.5 ${
                    previewDevice === 'mobile' ? 'bg-brand-orange text-white font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> Mobile
                </button>
              </div>

              <button onClick={() => setPreviewModalOpen(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Public Webview */}
            <div className="flex-1 bg-neutral-100 overflow-y-auto p-4 flex items-start justify-center">
              <div
                className={`bg-white shadow-2xl transition-all duration-300 rounded-t-xl overflow-hidden min-h-full ${
                  previewDevice === 'desktop'
                    ? 'w-full max-w-5xl'
                    : previewDevice === 'tablet'
                    ? 'w-[768px]'
                    : 'w-[375px]'
                }`}
              >
                {/* Draft Watermark */}
                <div className="bg-amber-500 text-white px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>DRAFT PREVIEW MODE — UNPUBLISHED CONTENT (ROBOTS NOINDEX ACTIVE)</span>
                </div>

                {/* Rendered Preview Page Content */}
                <div className="p-6 sm:p-10 space-y-8">
                  {/* Breadcrumb Preview */}
                  <div className="text-xs text-neutral-400 flex items-center gap-1.5 font-medium">
                    <span>Home</span> / <span>Locations</span> / <span>{previewItem.cityName}</span> /{' '}
                    <span className="text-neutral-900 font-bold">{previewItem.productName}</span>
                  </div>

                  {/* Hero Heading */}
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-brand-orange font-bold text-xs uppercase tracking-wider rounded-full mb-3">
                      <MapPin className="w-3.5 h-3.5" /> {previewItem.cityName} Industrial Corridors
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight leading-tight">
                      {previewItem.h1Heading}
                    </h1>
                  </div>

                  {/* Intro Content */}
                  {previewItem.introContent && (
                    <div
                      className="text-sm font-medium text-neutral-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: previewItem.introContent }}
                    />
                  )}

                  {/* Main Rich Content */}
                  <div
                    className="text-xs sm:text-sm text-neutral-600 leading-relaxed prose prose-orange max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewItem.customContent }}
                  />

                  {/* Technical Advantages */}
                  {previewItem.benefits?.length > 0 && (
                    <div className="p-5 bg-neutral-50 rounded-xl border border-neutral-200">
                      <h4 className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-3">
                        Key Engineering Advantages
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-800">
                        {previewItem.benefits.map((b, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Local Business Hub Info */}
                  {previewItem.localBusinessInfo && (previewItem.localBusinessInfo.hubName || previewItem.localBusinessInfo.warehouseAddress) && (
                    <div className="p-5 bg-orange-50/50 rounded-xl border border-orange-200">
                      <h4 className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2">
                        Genuine Local Service Information
                      </h4>
                      <p className="font-bold text-neutral-900 text-sm">
                        {previewItem.localBusinessInfo.hubName || `${previewItem.cityName} Hub`}
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {previewItem.localBusinessInfo.warehouseAddress}
                      </p>
                      <p className="text-xs font-mono font-bold text-brand-orange mt-2">
                        Helpline: {previewItem.localBusinessInfo.servicePhone}
                      </p>
                    </div>
                  )}

                  {/* FAQs */}
                  {previewItem.customFaqs?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        Technical Q&A for {previewItem.cityName}
                      </h4>
                      {previewItem.customFaqs.map((faq, i) => (
                        <div key={i} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
                          <strong className="text-neutral-900 block">{faq.question}</strong>
                          <p className="text-neutral-600 mt-1">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REVISION HISTORY MODAL / DRAWER */}
      {revisionsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-xl bg-white shadow-2xl h-full flex flex-col overflow-hidden border-l border-brand-border">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-neutral-900 text-white">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-brand-orange" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Version History: {editingItem?.slug}
                </h3>
              </div>
              <button onClick={() => setRevisionsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {revisionsLoading ? (
                <div className="py-12 text-center text-neutral-400">Loading version snapshots...</div>
              ) : revisionsList.length === 0 ? (
                <div className="py-12 text-center text-neutral-400">No revisions recorded yet.</div>
              ) : (
                revisionsList.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-4 rounded-xl border border-neutral-200 hover:border-brand-orange transition-colors bg-white shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-brand-orange">
                          v{rev.version}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                          {rev.workflowAction}
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {new Date(rev.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-neutral-700 font-medium">{rev.changeSummary}</p>
                    <div className="text-[11px] text-neutral-400">Author: {rev.authorName || 'Administrator'}</div>

                    <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                      <button
                        onClick={() => setSelectedRevision(selectedRevision?._id === rev._id ? null : rev)}
                        className="text-brand-orange hover:underline font-bold text-[11px]"
                      >
                        {selectedRevision?._id === rev._id ? 'Hide Snapshot' : 'Inspect Snapshot'}
                      </button>

                      {canRestore && (
                        <button
                          onClick={() => handleRestoreRevision(rev.version)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded hover:bg-amber-100 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore to Draft</span>
                        </button>
                      )}
                    </div>

                    {/* Snapshot Inspector */}
                    {selectedRevision?._id === rev._id && (
                      <div className="mt-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] space-y-1 font-mono">
                        <div>
                          <strong>H1:</strong> {rev.snapshot.h1Heading}
                        </div>
                        <div>
                          <strong>SEO Title:</strong> {rev.snapshot.seoTitle}
                        </div>
                        <div>
                          <strong>Meta Desc:</strong> {rev.snapshot.metaDescription}
                        </div>
                        <div>
                          <strong>Canonical:</strong> {rev.snapshot.canonicalUrl}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* WORKFLOW ACTION MODAL (Submit / Approve / Request Changes) */}
      {workflowModalOpen && workflowTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-border overflow-hidden">
            <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-neutral-900 text-white">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {workflowActionType === 'submit'
                  ? 'Submit for Editorial Review'
                  : workflowActionType === 'approve'
                  ? 'Approve for Publication'
                  : 'Request Editorial Changes'}
              </h3>
              <button onClick={() => setWorkflowModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleWorkflowSubmit} className="p-6 space-y-4 text-xs">
              <p className="text-neutral-600">
                Target Page: <strong>{workflowTargetItem.slug}</strong>
              </p>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  {workflowActionType === 'request_changes' ? 'Editorial Feedback / Change Reason *' : 'Optional Review Notes'}
                </label>
                <textarea
                  rows={3}
                  required={workflowActionType === 'request_changes'}
                  value={workflowNotes}
                  onChange={(e) => setWorkflowNotes(e.target.value)}
                  placeholder={
                    workflowActionType === 'request_changes'
                      ? 'Specify which headings, word count, or technical details require editing...'
                      : 'Add any notes for the team...'
                  }
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-lg focus:border-brand-orange focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWorkflowModalOpen(false)}
                  className="px-4 py-2 font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 rounded-lg font-bold text-white shadow-sm uppercase tracking-wider text-xs ${
                    workflowActionType === 'request_changes'
                      ? 'bg-red-600 hover:bg-red-700'
                      : workflowActionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityProducts;
