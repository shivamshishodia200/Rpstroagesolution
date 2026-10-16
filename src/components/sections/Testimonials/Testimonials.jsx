import React, { useEffect, useRef } from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AUTHENTIC_TESTIMONIALS } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const Testimonials = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.testimonial-card',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
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

  return (
    <section 
      id="testimonials" 
      ref={sectionRef}
      className="py-16 sm:py-24 lg:py-32 bg-white border-b border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-[2px] bg-brand-orange" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
              Client Feedback
            </span>
            <span className="w-6 h-[2px] bg-brand-orange" />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-neutral-900 tracking-tight leading-tight">
            Trusted by Commercial Leaders{' '}
            <span className="font-editorial-italic font-normal text-brand-orange">
              Across India.
            </span>
          </h2>
          <p className="text-brand-textSecondary text-sm sm:text-base mt-4 leading-relaxed">
            Verified feedback from retail enterprise owners, supermarket managers, and warehouse operations heads.
          </p>
        </div>

        {/* 3-Column Editorial Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AUTHENTIC_TESTIMONIALS.map((item) => (
            <div
              key={item.id}
              className="testimonial-card flex flex-col justify-between p-5 sm:p-8 bg-neutral-50/70 border border-neutral-200 hover:border-brand-orange/60 transition-all duration-300 relative group"
            >
              <div>
                {/* Quote Icon & Stars */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-neutral-300 group-hover:text-brand-orange transition-colors" />
                </div>

                {/* Comment */}
                <p className="text-sm text-neutral-800 leading-relaxed font-normal mb-8 italic">
                  "{item.comment}"
                </p>
              </div>

              {/* Author & Verification */}
              <div className="pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-neutral-900">
                    {item.author}
                  </h4>
                  <p className="text-xs text-neutral-500">
                    {item.role}
                  </p>
                  <p className="text-[11px] text-neutral-400">
                    {item.company}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Fine bottom accent line */}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
