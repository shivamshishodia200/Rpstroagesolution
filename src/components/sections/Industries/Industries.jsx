import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { INDUSTRY_SOLUTIONS } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const Industries = ({ onOpenQuote }) => {
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef(null);

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
        <div className="bg-neutral-900 text-white border border-neutral-800 overflow-hidden shadow-2xl transition-all duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
            
            {/* Left Content Column */}
            <div className="lg:col-span-5 p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
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
                
                <p className="text-neutral-300 text-sm leading-relaxed mb-8">
                  {current.description}
                </p>

                {/* System Deliverables */}
                <div className="space-y-2 mb-8">
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
              </div>

              <div>
                <button
                  onClick={onOpenQuote}
                  className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 transition-all flex items-center justify-center gap-2 rounded-lg"
                >
                  <span>Request Custom Store Layout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Large Image with Smooth Zoom */}
            <div className="lg:col-span-7 relative min-h-[300px] lg:min-h-full overflow-hidden">
              <img
                key={current.id}
                src={current.image}
                alt={current.title}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out hover:scale-105 animate-in fade-in duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 right-6 bg-brand-dark/90 backdrop-blur-md px-4 py-2 border border-neutral-700 text-right hidden sm:block">
                <span className="text-[10px] font-mono text-brand-orange block uppercase tracking-widest">
                  Field Installed
                </span>
                <span className="text-xs font-semibold text-white">
                  Turnkey Engineering Execution
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
