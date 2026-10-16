import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, HelpCircle, Phone, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FAQ_ITEMS, COMPANY_INFO } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const FAQ = ({ onOpenQuote, items = null, heading = null, subtitle = null }) => {
  const [openIndex, setOpenIndex] = useState(0);
  const sectionRef = useRef(null);

  const displayItems = (Array.isArray(items) && items.length > 0)
    ? items.map((f, i) => ({ id: `faq-${i}`, question: f.question, answer: f.answer }))
    : FAQ_ITEMS;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-item',
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
  }, [displayItems]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section 
      id="faq" 
      ref={sectionRef}
      className="py-16 sm:py-24 lg:py-32 bg-neutral-50/50 border-b border-neutral-200"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-[2px] bg-brand-orange" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Common Inquiries
            </span>
            <span className="w-6 h-[2px] bg-brand-orange" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-neutral-900 tracking-tight leading-tight">
            {heading ? (
              heading
            ) : (
              <>
                Frequently Asked{' '}
                <span className="font-editorial-italic font-normal text-brand-orange">
                  Questions.
                </span>
              </>
            )}
          </h2>
          <p className="text-brand-textSecondary text-sm sm:text-base mt-4 leading-relaxed">
            {subtitle || 'Technical answers regarding rack dimensions, load capacities, delivery logistics, and customized retail store designs.'}
          </p>
        </div>

        {/* Accordion Stack */}
        <div className="space-y-4">
          {displayItems.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.id || idx}
                className="faq-item bg-white border border-neutral-200 transition-all duration-300"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  aria-expanded={isOpen}
                  className="w-full text-left p-4 sm:p-6 lg:p-7 flex items-center justify-between gap-4 focus:outline-none group"
                >
                  <span className="text-base sm:text-lg font-bold font-display text-neutral-900 group-hover:text-brand-orange transition-colors">
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-none border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    isOpen 
                      ? 'bg-brand-orange text-white border-brand-orange' 
                      : 'bg-neutral-50 text-neutral-600 border-neutral-300 group-hover:border-brand-orange group-hover:text-brand-orange'
                  }`}>
                    {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                </button>

                {/* Answer Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 text-sm text-brand-textSecondary leading-relaxed border-t border-neutral-100 pt-4">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-14 p-5 sm:p-8 bg-white border border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-brand-orangeLight border border-brand-orange/30 flex items-center justify-center text-brand-orange flex-shrink-0 rounded-xl">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-neutral-900">
                Have a Technical Project Question Not Listed Here?
              </h4>
              <p className="text-xs text-brand-textSecondary mt-0.5">
                Speak directly with an RP Storage engineering consultant: <strong className="text-brand-orange">{COMPANY_INFO.phoneDisplay}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onOpenQuote}
            className="btn-magnetic bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 transition-colors whitespace-nowrap w-full sm:w-auto text-center flex-shrink-0 rounded-lg"
          >
            <span>Ask an Engineer</span>
          </button>
        </div>

      </div>
    </section>
  );
};
