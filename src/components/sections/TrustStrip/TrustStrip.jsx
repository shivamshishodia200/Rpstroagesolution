import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Check, ShieldCheck, Cog, Factory } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const TrustStrip = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.trust-item',
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const trustItems = [
    {
      icon: Factory,
      title: "Manufacturing Expertise",
      desc: "In-house automated sheet-metal fabrication and roll-forming plant."
    },
    {
      icon: Cog,
      title: "Custom Storage Solutions",
      desc: "Engineered to fit precise store blueprints and warehouse heights."
    },
    {
      icon: ShieldCheck,
      title: "Quality-Focused Products",
      desc: "8-tank chemical pre-treatment with 200°C baked powder coating."
    },
    {
      icon: Check,
      title: "Retail & Industrial Scope",
      desc: "Turnkey installations from local kirana outlets to logistics parks."
    }
  ];

  const marqueeItems = [
    "Supermarket Racks",
    "Gondola Racks",
    "Warehouse Pallet Racks",
    "Retail Display Racks",
    "Shopping Trolleys",
    "Checkout Counters",
    "Slotted Angle Shelving",
    "Heavy Duty Racks",
    "Departmental Store Racks",
    "Metal Cabinets",
    "Garment Display Racks",
    "Produce Display Racks"
  ];

  return (
    <div ref={containerRef} className="bg-neutral-50 border-b border-neutral-200">
      {/* Horizontal Trust Building Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 divide-y sm:divide-y-0 lg:divide-x divide-neutral-200">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="trust-item pt-4 sm:pt-0 lg:px-6 first:lg:pl-0 last:lg:pr-0 flex items-start gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-none bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 text-brand-orange group-hover:border-brand-orange transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-brand-textSecondary leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Elegant Industrial Marquee Bar */}
      <div className="bg-brand-dark text-white py-3 overflow-hidden border-t border-neutral-800">
        <div className="animate-marquee-infinite flex items-center whitespace-nowrap text-xs font-mono uppercase tracking-widest text-neutral-300">
          {[...marqueeItems, ...marqueeItems].map((text, i) => (
            <span key={i} className="inline-flex items-center mx-6">
              <span className="w-1.5 h-1.5 bg-brand-orange rounded-full mr-3 inline-block" />
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
