import React, { useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PRODUCT_COLLECTIONS } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const Collections = ({ onSelectCategory, onOpenQuote }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.collection-card',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
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
      id="collections" 
      ref={sectionRef}
      className="py-16 sm:py-24 lg:py-32 bg-white border-b border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-[2px] bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Product Collections
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-neutral-900 tracking-tight leading-tight">
              Storage Solutions,{' '}
              <span className="font-editorial-italic font-normal text-brand-orange">
                Thoughtfully Engineered.
              </span>
            </h2>
          </div>
          <p className="text-brand-textSecondary text-sm sm:text-base max-w-md leading-relaxed">
            Six comprehensive product lines built for heavy daily throughput, modular flexibility, and visual sophistication.
          </p>
        </div>

        {/* Asymmetric Editorial Grid (6 Categories) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {PRODUCT_COLLECTIONS.map((item, index) => {
            // Asymmetric col span: 0 and 3 are 7 cols, 1 and 2 are 5 cols, 4 is 6 cols, 5 is 6 cols
            const colSpans = [
              "md:col-span-7",
              "md:col-span-5",
              "md:col-span-5",
              "md:col-span-7",
              "md:col-span-6",
              "md:col-span-6"
            ];
            const currentSpan = colSpans[index] || "md:col-span-6";

            return (
              <div
                key={item.id}
                onClick={() => onSelectCategory(item)}
                className={`collection-card ${currentSpan} group cursor-pointer flex flex-col justify-between bg-neutral-50/60 border border-neutral-200 hover:border-brand-orange/60 transition-all duration-500 p-5 sm:p-8 hover:shadow-xl hover:shadow-brand-orange/5 relative overflow-hidden`}
              >
                {/* Top Row: Number & Tag */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs font-bold text-neutral-400 group-hover:text-brand-orange transition-colors">
                    CATEGORY / {item.number}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 bg-white border border-neutral-200 text-neutral-700">
                    {item.tag}
                  </span>
                </div>

                {/* Image Container with editorial zoom */}
                <div className="relative aspect-[16/10] sm:aspect-[16/11] bg-white border border-neutral-200 overflow-hidden mb-6">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-neutral-900/10 group-hover:bg-neutral-900/0 transition-colors duration-500" />
                  
                  {/* Floating Action Circle */}
                  <div className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-md group-hover:bg-brand-orange group-hover:text-white transition-all duration-300">
                    <ArrowUpRight className="w-5 h-5 group-hover:rotate-45 transition-transform duration-300" />
                  </div>
                </div>

                {/* Text Content */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold font-display text-neutral-900 group-hover:text-brand-orange transition-colors duration-300 mb-1.5 flex items-center justify-between">
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-xs font-medium text-brand-orange mb-2">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-brand-textSecondary leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Feature Pills */}
                  <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-wrap gap-2">
                    {item.features.map((feat, i) => (
                      <span key={i} className="text-[11px] text-neutral-600 bg-white px-2 py-0.5 border border-neutral-200">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom subtle accent line on hover */}
                <span className="absolute bottom-0 left-0 w-0 h-1 bg-brand-orange transition-all duration-500 group-hover:w-full" />
              </div>
            );
          })}
        </div>

        {/* Bottom Custom Layout Prompt */}
        <div className="mt-14 p-5 sm:p-8 bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-base font-bold text-neutral-900">
              Need a Customized Floor Layout or Non-Standard Rack Dimensions?
            </h4>
            <p className="text-xs text-brand-textSecondary mt-1">
              Our engineering team drafts tailored CAD layouts according to your column spacing and ceiling clearance.
            </p>
          </div>
          <button
            onClick={onOpenQuote}
            className="btn-magnetic bg-brand-dark hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 transition-colors whitespace-nowrap w-full sm:w-auto text-center flex-shrink-0"
          >
            <span>Consult Design Engineer</span>
          </button>
        </div>

      </div>
    </section>
  );
};
