import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INDUSTRY_SOLUTIONS } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const Industries = ({ onOpenQuote }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const sectionRef = useRef(null);

  useEffect(() => {
    setSelectedImageIdx(0);
  }, [activeTab]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.industry-header',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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

  const current = INDUSTRY_SOLUTIONS[activeTab];
  const activeImage = (current.gallery && current.gallery[selectedImageIdx])
    ? current.gallery[selectedImageIdx]
    : { url: current.image, title: current.title, tag: "Primary System" };

  return (
    <section 
      id="industries" 
      ref={sectionRef}
      className="py-16 sm:py-24 lg:py-32 bg-white border-b border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="industry-header flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-[2px] bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Sector Applications
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-neutral-900 tracking-tight leading-tight">
              Made for the Way{' '}
              <span className="font-editorial-italic font-normal text-brand-orange">
                You Work.
              </span>
            </h2>
          </div>
          <p className="text-brand-textSecondary text-sm sm:text-base max-w-md leading-relaxed">
            Tailored structural systems engineered for the exact load requirements, traffic flow, and operational rhythms of modern facilities.
          </p>
        </div>

        {/* Tab Selection Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 border-b border-neutral-200 pb-2">
          {INDUSTRY_SOLUTIONS.map((ind, idx) => (
            <button
              key={ind.id}
              onClick={() => setActiveTab(idx)}
              className={`text-left p-4 transition-all duration-300 border-b-2 relative ${
                activeTab === idx
                  ? 'border-brand-orange bg-neutral-50'
                  : 'border-transparent hover:bg-neutral-50/50 text-neutral-600'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
                SECTOR 0{idx + 1}
              </span>
              <span className={`text-sm font-bold block ${
                activeTab === idx ? 'text-neutral-900' : 'text-neutral-700'
              }`}>
                {ind.title.split('&')[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Featured Showcase Card for Selected Industry */}
        <div className="bg-neutral-900 text-white border border-neutral-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-brand-orange text-xs font-mono uppercase tracking-widest mb-3">
                  <span>Targeted Solution</span>
                  <span>/</span>
                  <span>0{activeTab + 1}</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-bold font-display text-white mb-2">
                  {current.title}
                </h3>
                
                <p className="text-brand-orange text-sm font-medium mb-4">
                  {current.subtitle}
                </p>
                
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                  {current.description}
                </p>

                {/* System Deliverables */}
                <div className="space-y-2 mb-6">
                  <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400 block mb-2">
                    Standard Storage Deliverables:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {current.deliverables.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-neutral-200">
                        <Check className="w-3.5 h-3.5 text-brand-orange flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Specifications Grid */}
                {current.specs && (
                  <div className="mb-6 pt-4 border-t border-neutral-800">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-orange block mb-2">
                      Engineered Specifications
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {current.specs.map((sp, idx) => (
                        <div key={idx} className="bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-700/60">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">
                            {sp.label}
                          </span>
                          <span className="text-xs font-bold text-white block">
                            {sp.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenQuote}
                  className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 transition-all flex items-center justify-center gap-2 rounded-lg shadow-lg shadow-brand-orange/20"
                >
                  <span>Request Custom Store Layout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Large Image with Multi-Equipment Selector */}
            <div className="lg:col-span-7 relative min-h-[400px] lg:min-h-full flex flex-col justify-between bg-neutral-950 p-4 sm:p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-neutral-800">
              
              {/* Main Visual Frame */}
              <div className="relative w-full h-[300px] sm:h-[350px] lg:h-[380px] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 group shadow-2xl">
                <img
                  key={`${current.id}-${activeImage.url}`}
                  src={activeImage.url}
                  alt={activeImage.title || current.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                
                {/* Ambient Overlay Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

                {/* Top Badge Strip */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full border border-neutral-700/80 text-[11px] font-mono font-medium text-brand-orange uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                    {activeImage.tag || "Field Installation"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/75 backdrop-blur-md rounded-full border border-neutral-700/80 text-[11px] font-medium text-neutral-200">
                    <Check className="w-3 h-3 text-emerald-400" />
                    Factory Certified
                  </span>
                </div>

                {/* Bottom Title & Counter Badge */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between pointer-events-none">
                  <div>
                    <span className="text-[10px] font-mono text-brand-orange uppercase tracking-widest block mb-0.5">
                      Live Equipment View
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-white drop-shadow-md">
                      {activeImage.title || current.title}
                    </h4>
                  </div>
                  <div className="hidden sm:block text-right">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      Sector Track Record
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">
                      {current.installedStat || "100% In-House Built"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Equipment Gallery Selector */}
              {current.gallery && current.gallery.length > 1 && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
                      Equipment Views ({current.gallery.length})
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500">
                      Click to switch module
                    </span>
                  </div>
                  <div className={`grid gap-2 ${current.gallery.length === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
                    {current.gallery.map((item, idx) => {
                      const isSelected = selectedImageIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIdx(idx)}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all duration-200 ${
                            isSelected
                              ? 'bg-neutral-800 border-brand-orange ring-1 ring-brand-orange/60'
                              : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200'
                          }`}
                          title={item.title}
                        >
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-9 h-9 rounded object-cover border border-neutral-700/80 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className={`text-[11px] font-medium block truncate ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                              {item.title}
                            </span>
                            <span className="text-[9px] font-mono text-brand-orange block uppercase truncate">
                              {item.tag}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

