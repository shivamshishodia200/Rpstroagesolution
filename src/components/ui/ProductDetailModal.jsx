import React, { useEffect } from 'react';
import { X, Check, ArrowRight, ShieldCheck, Layers, Scale } from 'lucide-react';
import { COMPANY_INFO } from '../../data/companyData';

export const ProductDetailModal = ({ product, isOpen, onClose, onEnquire }) => {
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

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-brand-dark/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        className="relative w-full max-w-4xl bg-white rounded-none shadow-2xl border border-neutral-200 z-10 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-brand-dark text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono tracking-widest text-brand-orange uppercase bg-neutral-900 px-2 py-0.5 border border-neutral-800">
              {product.category}
            </span>
            <span className="text-neutral-400 text-xs hidden sm:inline">| Engineering Specification</span>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close product details"
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Left: Image & Badge */}
          <div className="md:col-span-5 flex flex-col">
            <div className="relative bg-neutral-100 border border-neutral-200 overflow-hidden aspect-square flex items-center justify-center p-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-neutral-900 uppercase tracking-widest border border-neutral-200 shadow-sm">
                Industrial Grade
              </div>
            </div>

            <div className="mt-4 bg-brand-orangeLight/60 p-4 border border-brand-orange/20 text-xs text-brand-dark">
              <div className="flex items-center gap-2 font-semibold text-brand-orange mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Certified Indian Steel</span>
              </div>
              <p className="text-neutral-600 leading-relaxed">
                Fabricated with automated punching, 8-tank chemical pretreatment, and oven-baked electrostatic powder coating.
              </p>
            </div>
          </div>

          {/* Right: Technical Specs & Actions */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              <h2 id="product-modal-title" className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-neutral-900 mb-2">
                {product.name}
              </h2>
              <p className="text-brand-textSecondary text-sm leading-relaxed mb-6">
                {product.shortDesc}
              </p>

              {/* Technical Specifications Table */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-brand-orange" />
                  Technical Parameters
                </h4>
                <div className="divide-y divide-neutral-200 border-y border-neutral-200 text-xs">
                  {Object.entries(product.specs || {}).map(([key, val]) => (
                    <div key={key} className="py-2.5 grid grid-cols-12 gap-2">
                      <span className="col-span-5 font-semibold text-neutral-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="col-span-7 text-neutral-900 font-medium">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              {product.highlights && (
                <div className="mb-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">
                    Key Advantages
                  </h4>
                  <ul className="space-y-1.5">
                    {product.highlights.map((h, i) => (
                      <li key={i} className="text-xs text-brand-textSecondary flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-brand-orange flex-shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Buttons */}
            <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  onEnquire(product);
                }}
                className="w-full sm:flex-1 bg-brand-orange hover:bg-brand-orangeHover text-white py-3 px-5 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Request Pricing For This Model</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto border border-neutral-300 hover:border-brand-dark bg-white hover:bg-neutral-50 text-neutral-900 py-3 px-4 text-xs font-semibold uppercase tracking-wider text-center transition-all"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
