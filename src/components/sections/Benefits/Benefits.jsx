import React, { useEffect, useRef } from 'react';
import { 
  Ruler, 
  ShieldCheck, 
  Maximize, 
  Sparkles, 
  TrendingUp, 
  Truck, 
  ArrowRight 
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WHY_CHOOSE_US } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const Benefits = ({ onOpenQuote }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.benefit-block',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const iconMap = {
    Ruler,
    ShieldCheck,
    Maximize,
    Sparkles,
    TrendingUp,
    Truck
  };

  return (
    <section 
      id="why-choose-us" 
      ref={sectionRef}
      className="py-16 sm:py-24 lg:py-32 bg-white border-b border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-[2px] bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Manufacturing Integrity
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-neutral-900 tracking-tight leading-tight">
              Performance Beyond{' '}
              <span className="font-editorial-italic font-normal text-brand-orange">
                the Ordinary.
              </span>
            </h2>
          </div>
          <p className="text-brand-textSecondary text-sm sm:text-base max-w-md leading-relaxed">
            Engineered with certified steel alloys, automated CNC fabrication, and strict quality deflection tests.
          </p>
        </div>

        {/* Architectural 3-Column / Asymmetric Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Left Column: 2 Key Pillars */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            {WHY_CHOOSE_US.slice(0, 2).map((item) => {
              const Icon = iconMap[item.icon] || ShieldCheck;
              return (
                <div 
                  key={item.number}
                  className="benefit-block p-5 sm:p-8 bg-neutral-50/70 border border-neutral-200 hover:border-brand-orange/60 transition-all duration-300 flex-1 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-brand-orange transition-colors">
                        PILLAR // {item.number}
                      </span>
                      <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold font-display text-neutral-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brand-textSecondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-neutral-200 text-[11px] font-semibold text-neutral-500 flex items-center gap-1 group-hover:text-brand-orange transition-colors">
                    <span>Engineered Specification</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center Column: Genuine Plant Photographic Centerpiece */}
          <div className="lg:col-span-4 benefit-block relative overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl min-h-[340px] sm:min-h-[400px] flex flex-col justify-between p-6 sm:p-8 text-white">
            <img
              src="/images/why.jpg"
              alt="RP Storage Solution Quality Inspection & Manufacturing"
              className="absolute inset-0 w-full h-full object-cover opacity-45 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-brand-orange bg-black/60 px-2.5 py-1 border border-neutral-700">
                Direct Indian Factory
              </span>
              <h3 className="text-2xl font-bold font-display text-white mt-4">
                No Sub-Contracting. Complete In-House Fabrication.
              </h3>
            </div>

            <div className="relative z-10 pt-6">
              <p className="text-xs text-neutral-300 leading-relaxed mb-6">
                Every upright, beam, bracket, and shelf plate is fabricated under our direct supervision in Delhi NCR to guarantee dimensional tolerance.
              </p>
              <button
                onClick={onOpenQuote}
                className="w-full bg-brand-orange hover:bg-brand-orangeHover text-white py-3 px-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                <span>Request Technical Specs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column: 2 Key Pillars */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            {WHY_CHOOSE_US.slice(2, 4).map((item) => {
              const Icon = iconMap[item.icon] || ShieldCheck;
              return (
                <div 
                  key={item.number}
                  className="benefit-block p-5 sm:p-8 bg-neutral-50/70 border border-neutral-200 hover:border-brand-orange/60 transition-all duration-300 flex-1 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-xs font-mono font-bold text-neutral-400 group-hover:text-brand-orange transition-colors">
                        PILLAR // {item.number}
                      </span>
                      <div className="w-10 h-10 bg-white border border-neutral-200 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold font-display text-neutral-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-brand-textSecondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-neutral-200 text-[11px] font-semibold text-neutral-500 flex items-center gap-1 group-hover:text-brand-orange transition-colors">
                    <span>Engineered Specification</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Bottom Horizontal Split for Remaining 2 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {WHY_CHOOSE_US.slice(4, 6).map((item) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div 
                key={item.number}
                className="benefit-block p-5 sm:p-8 bg-white border border-neutral-200 hover:border-brand-orange/60 transition-all duration-300 flex flex-col xs:flex-row items-start gap-4 sm:gap-5 group"
              >
                <div className="w-12 h-12 bg-neutral-50 border border-neutral-200 flex items-center justify-center text-brand-orange flex-shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-all">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono text-neutral-400">PILLAR {item.number}</span>
                    <span className="text-neutral-300">/</span>
                    <h3 className="text-base font-bold font-display text-neutral-900">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-brand-textSecondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
