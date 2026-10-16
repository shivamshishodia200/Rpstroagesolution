import React, { useEffect, useRef } from 'react';
import { 
  Clock, 
  Layers, 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Factory, 
  ArrowUpRight,
  TrendingUp,
  Award
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TRUST_METRICS } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const Statistics = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate count-up for numbers
      const counters = sectionRef.current.querySelectorAll('.stat-number');

      counters.forEach((counter) => {
        const targetValue = parseInt(counter.getAttribute('data-target'), 10);

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top 85%',
          once: true,
          onEnter: () => {
            const obj = { val: 0 };
            gsap.to(obj, {
              val: targetValue,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                counter.innerText = Math.floor(obj.val);
              }
            });
          }
        });
      });

      // Cards staggered entrance
      gsap.fromTo(
        '.stat-card-modern',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 85%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const cardIcons = [Award, Layers, Building2, Users];
  const cardCategories = ["ESTABLISHED", "FABRICATION", "CLIENT BASE", "MANPOWER"];

  return (
    <section 
      id="statistics" 
      ref={sectionRef}
      className="py-20 sm:py-28 bg-[#FAFAFA] border-b border-neutral-200/80 relative overflow-hidden"
    >
      {/* Background subtle radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        
        {/* ======================================================== */}
        {/* SECTION HEADER: Editorial Typography                     */}
        {/* ======================================================== */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3.5">
            <span className="w-6 h-[2px] bg-[#FF5200] rounded-full inline-block" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF5200]">
              PROVEN TRACK RECORD
            </span>
            <span className="w-6 h-[2px] bg-[#FF5200] rounded-full inline-block" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-[#0F172A] tracking-tight leading-[1.15]">
            Industrial Strength{' '}
            <span className="font-editorial italic font-normal text-[#FF5200]">
              in Numbers.
            </span>
          </h2>

          <p className="text-neutral-600 text-sm sm:text-base mt-3.5 leading-relaxed max-w-2xl mx-auto font-normal">
            Authentic operational metrics reflecting three decades of engineering dedication and client trust across India.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 4 MODERN STAT CARDS GRID                                 */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {TRUST_METRICS.map((metric, i) => {
            const IconComponent = cardIcons[i] || TrendingUp;
            const categoryTag = cardCategories[i] || `METRIC 0${i + 1}`;

            return (
              <div 
                key={i} 
                className="stat-card-modern group relative bg-white rounded-2xl p-6 sm:p-7 border border-neutral-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(255,82,0,0.09)] hover:border-orange-300 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Top Badge & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-100 group-hover:bg-orange-50 group-hover:text-[#FF5200] px-2.5 py-1 rounded-md font-semibold transition-colors">
                      {categoryTag}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-neutral-50 group-hover:bg-orange-50 border border-neutral-100 group-hover:border-orange-200 flex items-center justify-center text-neutral-700 group-hover:text-[#FF5200] transition-all duration-300 shadow-2xs">
                      <IconComponent className="w-5 h-5 stroke-[1.8]" />
                    </div>
                  </div>

                  {/* Main Metric Counter */}
                  <div className="flex items-baseline gap-1 text-4xl sm:text-5xl font-extrabold font-display text-[#0F172A] tracking-tight mb-2">
                    <span className="stat-number" data-target={metric.value}>
                      {metric.value}
                    </span>
                    <span className="text-[#FF5200]">{metric.suffix}</span>
                  </div>

                  {/* Metric Label */}
                  <h3 className="text-base font-bold text-[#0F172A] tracking-tight mb-3 group-hover:text-[#FF5200] transition-colors leading-snug">
                    {metric.label}
                  </h3>
                </div>

                {/* Metric Descriptive Copy */}
                <div className="pt-4 border-t border-neutral-100 mt-2">
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    {metric.description}
                  </p>
                </div>

                {/* Bottom Card Hover Accent Line */}
                <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#FF5200] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-full origin-left" />
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* BOTTOM VERIFICATION BAR                                  */}
        {/* ======================================================== */}
        <div className="mt-12 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-neutral-700">
              All production figures verified from Delhi NCR plant operations.
            </span>
          </div>
          
          <div className="flex items-center gap-2 font-mono text-neutral-500 text-[11px]">
            <Factory className="w-3.5 h-3.5 text-[#FF5200]" />
            <span>Plot Kh No. 13/7, Nangali Sakrawati, Najafgarh, New Delhi</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Statistics;
