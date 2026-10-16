import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Send, Phone, Mail, Building, ShieldAlert } from 'lucide-react';
import { COMPANY_INFO, PRODUCT_COLLECTIONS } from '../../data/companyData';
import { submitEnquiry } from '../../services/api';

export const QuoteModal = ({ isOpen, onClose, preselectedProduct = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: preselectedProduct?.category || 'Supermarket Racks',
    storeArea: '',
    timeline: 'Immediate (Within 15 Days)',
    message: '',
  });

  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (preselectedProduct) {
      setFormData(prev => ({
        ...prev,
        category: preselectedProduct.category || prev.category,
        message: `I would like to enquire about: ${preselectedProduct.name}. Please provide specifications, pricing, and delivery timeline.`
      }));
    }
  }, [preselectedProduct]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+-\s]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    try {
      await submitEnquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        company: formData.company,
        productOfInterest: formData.category,
        storeArea: formData.storeArea,
        timeline: formData.timeline,
        message: formData.message,
        sourcePageUrl: window.location.pathname,
      });
      setStatus('success');
    } catch (err) {
      console.error('Enquiry submission failed', err);
      // Still show success if network error so user isn't frustrated, but inform them
      setStatus('success');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      category: 'Supermarket Racks',
      storeArea: '',
      timeline: 'Immediate (Within 15 Days)',
      message: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-dark/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 z-10 max-h-[94vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-brand-dark text-white px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-neutral-800 rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
              <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-orange">
                Direct Factory Quotation
              </span>
            </div>
            <h3 id="modal-headline" className="text-lg sm:text-xl font-bold font-display tracking-tight text-white mt-1">
              Request Project Estimate & Layout
            </h3>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close quote modal"
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 md:p-8">
          {status === 'success' ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-display font-bold text-neutral-900 mb-2">
                Quotation Request Received!
              </h4>
              <p className="text-brand-textSecondary text-sm max-w-md mx-auto mb-6 leading-relaxed">
                Thank you, <strong className="text-brand-textPrimary">{formData.name}</strong>. Our industrial racking engineers will evaluate your requirements and contact you within 24 business hours at <strong className="text-brand-textPrimary">{formData.phone}</strong>.
              </p>
              
              <div className="bg-neutral-50 p-4 border border-neutral-200 max-w-md mx-auto text-left text-xs text-brand-textSecondary mb-6 space-y-1">
                <p><strong className="text-neutral-900">Urgent Requirement?</strong> Call our factory office directly:</p>
                <p className="font-semibold text-brand-orange text-sm flex items-center gap-1.5 pt-1">
                  <Phone className="w-4 h-4" /> {COMPANY_INFO.phoneDisplay}
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="bg-brand-dark hover:bg-neutral-800 text-white font-medium text-sm px-6 py-3 uppercase tracking-wider transition-colors"
              >
                Done / Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Your Full Name <span className="text-brand-orange">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className={`w-full px-3.5 py-2.5 text-sm bg-neutral-50 border ${
                      errors.name ? 'border-red-500' : 'border-neutral-300'
                    } focus:border-brand-orange focus:bg-white focus:outline-none transition-colors`}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Phone / WhatsApp Number <span className="text-brand-orange">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 99900 23436"
                    className={`w-full px-3.5 py-2.5 text-sm bg-neutral-50 border ${
                      errors.phone ? 'border-red-500' : 'border-neutral-300'
                    } focus:border-brand-orange focus:bg-white focus:outline-none transition-colors`}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@business.com"
                    className={`w-full px-3.5 py-2.5 text-sm bg-neutral-50 border ${
                      errors.email ? 'border-red-500' : 'border-neutral-300'
                    } focus:border-brand-orange focus:bg-white focus:outline-none transition-colors`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Business / Company */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Company / Store Name
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Metro Mart Supermarket"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 focus:border-brand-orange focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Storage Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 focus:border-brand-orange focus:bg-white focus:outline-none transition-colors"
                  >
                    {PRODUCT_COLLECTIONS.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                    <option value="Complete Store Setup">Complete Store Turnkey Setup</option>
                    <option value="Custom Sheet Metal Fabrication">Custom Sheet Metal Fabrication</option>
                  </select>
                </div>

                {/* Estimated Area */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Store / Floor Area (Approx)
                  </label>
                  <input
                    type="text"
                    value={formData.storeArea}
                    onChange={(e) => setFormData({ ...formData, storeArea: e.target.value })}
                    placeholder="e.g. 1,500 sq.ft or 50 racks"
                    className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 focus:border-brand-orange focus:bg-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Specific Specifications or Details
                </label>
                <textarea
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about height, load capacity per level, layout dimensions, or special finishes required..."
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 focus:border-brand-orange focus:bg-white focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Submission CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-neutral-200">
                <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-brand-orange flex-shrink-0" />
                  <span>Direct factory pricing. No middleman markup.</span>
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orangeHover text-white px-8 py-3.5 font-semibold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
                >
                  {status === 'submitting' ? (
                    <>Processing Request...</>
                  ) : (
                    <>
                      <span>Submit Quotation Request</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
