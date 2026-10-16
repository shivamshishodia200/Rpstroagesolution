import React, { useState } from 'react';
import { Send, CheckCircle2, Phone, AlertCircle, ShieldCheck } from 'lucide-react';
import { submitEnquiry } from '../../services/api';

export const ProductEnquiryCard = ({
  productId = '',
  productName = 'Warehouse Racks',
  cityId = '',
  cityName = '',
  className = '',
}) => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    cityRequirement: cityName ? `${cityName} - ` : '',
    botField: '', // Spam honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Spam honeypot detection
    if (form.botField) {
      setSubmitted(true);
      return;
    }

    if (!form.name.trim() || !form.phone.trim()) {
      setErrorMsg('Please enter your name and contact phone number.');
      return;
    }

    // Phone validation
    const cleanPhone = form.phone.replace(/[\s+-]/g, '');
    if (cleanPhone.length < 8 || cleanPhone.length > 15) {
      setErrorMsg('Please enter a valid phone number (8 to 15 digits).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      // Split city and requirement if provided
      let cityVal = cityName || '';
      let requirementVal = form.cityRequirement.trim();

      if (!cityVal && requirementVal) {
        const parts = requirementVal.split(/[,-]/);
        cityVal = parts[0]?.trim() || '';
      }

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        city: cityVal,
        message: requirementVal || `Enquiry for ${productName}${cityName ? ` in ${cityName}` : ''}`,
        productOfInterest: productName,
        productId: productId || undefined,
        cityId: cityId || undefined,
        sourcePageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
      };

      const res = await submitEnquiry(payload);
      if (res.success) {
        setSubmitted(true);
        setForm({
          name: '',
          phone: '',
          email: '',
          cityRequirement: cityName ? `${cityName} - ` : '',
          botField: '',
        });
      } else {
        setErrorMsg(res.message || 'Unable to submit enquiry. Please call us directly.');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        'Network error submitting enquiry. Please call our technical desk.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-200/90 w-full max-w-[360px] text-gray-900 ${className}`}
    >
      {/* Header */}
      <div className="border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-[#E85B12] border border-orange-200 uppercase tracking-wider">
            Direct Factory Quote
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Desk
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">
          Quick Enquiry
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          Factory rates & 24hr CAD estimation
        </p>
      </div>

      {submitted ? (
        <div className="py-6 px-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center animate-fade-in">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-gray-900">Enquiry Confirmed!</h4>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            Our engineering team will call you shortly to discuss dimensions, load requirements and direct dispatch.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="mt-4 text-xs font-bold text-[#E85B12] hover:underline cursor-pointer"
          >
            Submit Another Enquiry &rarr;
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {errorMsg && (
            <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs flex items-start gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Spam Honeypot - Hidden from Real Users */}
          <div style={{ display: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="fax_number_verification"
              tabIndex={-1}
              autoComplete="off"
              value={form.botField}
              onChange={(e) => setForm({ ...form, botField: e.target.value })}
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Your Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12] focus:bg-white transition-all text-gray-900"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+91 99900 23436"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12] focus:bg-white transition-all text-gray-900 font-mono"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Work Email
            </label>
            <input
              type="email"
              placeholder="name@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12] focus:bg-white transition-all text-gray-900"
            />
          </div>

          {/* City / Requirement */}
          <div>
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              City / Requirement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={cityName ? `${cityName} - 50 bays, 2000kg load...` : 'City or dimensions/load details...'}
              value={form.cityRequirement}
              onChange={(e) => setForm({ ...form, cityRequirement: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E85B12] focus:bg-white transition-all text-gray-900"
            />
          </div>

          {/* Hidden Context Fields */}
          <input type="hidden" name="productOfInterest" value={productName} />
          {cityId && <input type="hidden" name="cityId" value={cityId} />}
          {productId && <input type="hidden" name="productId" value={productId} />}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 bg-[#E85B12] text-white rounded-xl text-xs sm:text-sm font-bold hover:bg-[#c4490b] transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Submitting Enquiry...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Enquiry</span>
              </>
            )}
          </button>

          {/* Footer Call Assist */}
          <div className="pt-2 text-center text-[11px] text-gray-500 border-t border-gray-100 flex items-center justify-center gap-1.5">
            <Phone className="w-3 h-3 text-[#E85B12]" />
            <span>Direct helpline:</span>
            <a
              href="tel:+919990023436"
              className="font-bold text-gray-800 hover:text-[#E85B12] transition-colors"
            >
              +91 99900 23436
            </a>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductEnquiryCard;
