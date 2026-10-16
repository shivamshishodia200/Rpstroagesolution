import React, { useEffect, useRef } from 'react';
import { ArrowRight, CheckCircle2, ShieldCheck, Cpu, Flame, Truck } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MANUFACTURING_PROCESS } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const Manufacturing = ({ onOpenQuote }) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.process-step-card',
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

  const icons = [ShieldCheck, Cpu, Flame, CheckCircle2, Truck];

  return (
    <section 
      id="manufacturing" 
      ref={sectionRef}
      className="py-24 sm:py-32 bg-neutral-900 text-white border-b border-neutral-800 relative overflow-hidden"
    >
      {/* Background industrial texture */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5"
        style={{
          backgroundImage: `linear-gradient(#FFFFFF 1px, transparent 1px), linear-gradient(90deg, #FFFFFF 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-[2px] bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Manufacturing & Quality Assurance
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-white tracking-tight leading-tight">
              Engineering Rigor,{' '}
              <span className="font-editorial-italic font-normal text-brand-orange">
                From Coil to Finished Bay.
              </span>
            </h2>
          </div>
          <p className="text-neutral-400 text-sm sm:text-base max-w-md leading-relaxed">
            Our 5-stage precision workflow guarantees maximum structural load capacity, corrosion-free lifespan, and zero manufacturing defects.
          </p>
        </div>

        {/* 5-Step Connected Process Flow */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {/* Subtle horizontal connecting line on desktop */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-[1px] bg-neutral-800 pointer-events-none z-0" />

          {MANUFACTURING_PROCESS.map((proc, index) => {
            const Icon = icons[index] || ShieldCheck;
            return (
              <div
                key={proc.step}
                className="process-step-card relative z-10 flex flex-col justify-between bg-neutral-800/80 border border-neutral-700/80 hover:border-brand-orange transition-all duration-300 p-6 group hover:-translate-y-1 shadow-lg"
              >
                <div>
                  {/* Step Icon & Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-neutral-900 border border-neutral-700 flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-neutral-500 group-hover:text-brand-orange transition-colors">
                      STEP {proc.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold font-display text-white group-hover:text-brand-orange transition-colors mb-1">
                    {proc.title}
                  </h3>
                  <span className="text-[11px] text-brand-orange font-mono block mb-3">
                    {proc.subtitle}
                  </span>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {proc.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-700/60 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>QA PROTOCOL</span>
                  <span className="text-neutral-400">PASSED</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Facility Guarantee Box */}
        <div className="mt-16 p-8 bg-black/60 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">
                Certified Manufacturing Quality Standards
              </h4>
              <p className="text-xs text-neutral-400 mt-0.5">
                Every rack undergoes deflection calculations and salt spray powder coat testing prior to factory release.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenQuote}
            className="btn-magnetic bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 transition-colors whitespace-nowrap flex-shrink-0"
          >
            <span>Request Mill Test Certificate</span>
          </button>
        </div>

      </div>
    </section>
  );
};
