import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Phone, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileText,
  Building2,
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COMPANY_INFO } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const EnquiryCTA = ({
  onOpenQuote,
  heading = null,
  subtitle = null,
  phone = null,
  buttonText = null,
  cityContext = null,
}) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-reveal-element',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="enquiry-cta" 
      ref={sectionRef}
      className="py-20 sm:py-28 bg-gradient-to-br from-[#FFF9F5] via-[#FBF5EE] to-[#F5ECE1] text-[#0F172A] relative overflow-hidden border-b border-orange-200/50"
    >
      {/* Subtle warm industrial ambient glow & architectural pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(15,23,42,0.4) 1px, transparent 0)`,
            backgroundSize: '28px 28px'
          }}
        />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Headline, Description & Actions (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag Badge */}
            <div className="cta-reveal-element inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 border border-orange-200/80 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-orange">
                {cityContext ? `Turnkey Service Hub: ${cityContext}` : 'Turnkey Industrial & Retail Shelving'}
              </span>
            </div>

            {/* Main Headline */}
            <h2 className="cta-reveal-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-display text-[#0F172A] tracking-tight leading-[1.1]">
              {heading ? (
                heading
              ) : (
                <>
                  Let's Create a{' '}
                  <span className="font-editorial-italic font-normal text-brand-orange">
                    Better Space.
                  </span>
                </>
              )}
            </h2>

            {/* Description */}
            <p className="cta-reveal-element text-sm sm:text-base md:text-lg text-neutral-600 leading-relaxed max-w-2xl font-normal">
              {subtitle || "Tell us what you need. We'll help you explore the right storage and display solution for your business with custom load calculations, 2D/3D layouts, and direct factory pricing."}
            </p>

            {/* Action Buttons Row */}
            <div className="cta-reveal-element flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 pt-2">
              {/* Primary Discuss Requirements */}
              <button
                onClick={() => onOpenQuote && onOpenQuote(cityContext ? { category: `${cityContext} Estimate` } : null)}
                className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-orange hover:bg-brand-orangeHover text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all whitespace-nowrap cursor-pointer w-full sm:w-auto text-center"
              >
                <span>{buttonText || 'Discuss Your Requirements'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Call Direct */}
              <a
                href={`tel:${(phone || COMPANY_INFO.phonePrimary || '+91 99900 23436').replace(/\s+/g, '')}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white hover:bg-neutral-50 text-[#0F172A] border border-neutral-300/90 hover:border-neutral-400 text-xs sm:text-sm font-bold tracking-wide shadow-xs transition-all whitespace-nowrap w-full sm:w-auto text-center"
              >
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <span>{phone || '+91 99900 23436'}</span>
              </a>

              {/* WhatsApp Us */}
              <a
                href={COMPANY_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs sm:text-sm font-bold tracking-wide shadow-xs transition-all whitespace-nowrap w-full sm:w-auto text-center"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span>WhatsApp Us</span>
              </a>
            </div>

            {/* 3 Guarantees Strip */}
            <div className="cta-reveal-element pt-6 border-t border-orange-200/60 grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-neutral-700">
              <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-orange-100 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="font-medium">Free 2D/3D Layout & Feasibility</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-orange-100 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="font-medium">Zero Intermediate Commission</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-orange-100 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-brand-orange shrink-0" />
                <span className="font-medium">Pan-India On-Site Erection</span>
              </div>
            </div>

          </div>

          {/* Right Column: High-Value Direct Factory Consultation Card (5 cols) */}
          <div className="lg:col-span-5 cta-reveal-element">
            <div className="relative rounded-2xl bg-white border border-orange-200/70 p-6 sm:p-8 shadow-xl shadow-orange-900/5 overflow-hidden">
              
              {/* Subtle accent glow */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-brand-orange/5 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center justify-between pb-5 border-b border-neutral-100 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800">
                    Factory Technical Desk
                  </span>
                </div>
                <span className="text-[11px] font-mono text-brand-orange bg-brand-orange/10 px-2.5 py-0.5 rounded-full border border-brand-orange/20 font-bold">
                  Najafgarh Base
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold font-display text-[#0F172A] mb-2">
                Need Fast Project Estimation?
              </h3>
              <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
                Connect with our senior racking engineers for floor area planning, payload safety calculations, and direct factory pricing.
              </p>

              {/* Feature Points */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">24-Hour CAD Turnaround</h4>
                    <p className="text-[11px] text-neutral-500">Custom 2D/3D layouts tailored to your warehouse or retail floor space.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Certified Load Safety</h4>
                    <p className="text-[11px] text-neutral-500">Strict deflection compliance for heavy pallets and high-density storage.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/80 text-brand-orange flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0F172A]">Direct Mill Pricing</h4>
                    <p className="text-[11px] text-neutral-500">Transparent factory quotes with zero broker or middleman margins.</p>
                  </div>
                </div>
              </div>

              {/* Interactive Quote Action inside Card */}
              <button
                onClick={onOpenQuote}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-orange to-[#E04800] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 group"
              >
                <span>Request Custom Layout & Quote</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-4 text-center">
                <span className="text-[11px] text-neutral-500">
                  Or call directly: {' '}
                  <a href={`tel:${COMPANY_INFO.phonePrimary}`} className="text-brand-orange hover:underline font-bold">
                    +91 99900 23436
                  </a>
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default EnquiryCTA;
