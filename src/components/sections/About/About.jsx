import React, { useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  Factory, 
  Award, 
  Compass, 
  ShieldCheck, 
  Truck, 
  CheckCircle2,
  MapPin,
  Sparkles
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { COMPANY_INFO } from '../../../data/companyData';

gsap.registerPlugin(ScrollTrigger);

export const About = ({
  onOpenQuote,
  eyebrow,
  headline,
  italicHeadline,
  paragraph1,
  paragraph2,
  image,
  localPresenceDetails,
  cityContext,
}) => {
  const sectionRef = useRef(null);
  const imageCardRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Visual reveal
      gsap.fromTo(
        imageCardRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          }
        }
      );

      // Staggered text & cards entrance
      gsap.fromTo(
        '.about-anim-item',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: contentRef.current,
            start: 'top 80%',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const capabilities = [
    { 
      title: "Direct Indian Manufacturing", 
      desc: "Equipped with automated press brakes, roll-forming, and CNC punching machinery.",
      icon: Factory,
      highlight: "In-House Plant"
    },
    { 
      title: "Space Optimization Engineering", 
      desc: "Custom CAD layouts engineered to extract maximum cubic storage volume.",
      icon: Compass,
      highlight: "Custom CAD"
    },
    { 
      title: "Rigorous 8-Tank Pretreatment", 
      desc: "Chemical de-greasing, phosphating, and electrostatic powder curing at 200°C.",
      icon: ShieldCheck,
      highlight: "Rust-Proof"
    },
    { 
      title: "Reliable Nationwide Logistics", 
      desc: "Punctual order execution, secure industrial crating, and on-site assembly crew.",
      icon: Truck,
      highlight: "Pan-India"
    },
  ];

  return (
    <section 
      id="about" 
      ref={sectionRef}
      className="py-20 sm:py-28 lg:py-32 bg-white border-b border-neutral-200/80 relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* ======================================================== */}
          {/* LEFT COLUMN: Premium Industrial Photography Showcase     */}
          {/* ======================================================== */}
          <div className="lg:col-span-5 relative">
            <div 
              ref={imageCardRef}
              className="relative rounded-3xl bg-neutral-100 p-2 sm:p-2.5 border border-neutral-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)] group"
            >
              {/* Main Image Container */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-neutral-900">
                <img
                  src="/images/4605.jpg"
                  alt="RP Storage Solution Manufacturing Facility"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                
                {/* Refined gradient scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge: Manufacturing Origin */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-[#0F172A] shadow-md border border-white/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Established Manufacturer</span>
                  </span>
                </div>

                {/* Bottom Image Caption */}
                <div className="absolute bottom-5 left-5 right-5 z-10 text-white">
                  <div className="flex items-center gap-1.5 text-[#FF5200] text-[11px] font-bold uppercase tracking-widest mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Plant & Fabrication Facility</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                    Nangali Sakrawati, Najafgarh, New Delhi
                  </h4>
                  <p className="text-xs text-neutral-300 mt-1">
                    Heavy-duty retail & warehouse racking production
                  </p>
                </div>
              </div>

              {/* Overlapping Floating Milestone Card */}
              <div className="absolute -bottom-5 right-2 sm:-bottom-8 sm:-right-6 w-52 sm:w-64 max-w-[calc(100%-1.5rem)] bg-[#0F172A] text-white p-4 sm:p-5 rounded-2xl shadow-2xl border border-neutral-800 z-20 group-hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-[#FF5200]/20 flex items-center justify-center text-[#FF5200]">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-800/80 px-2 py-0.5 rounded">
                    ISO 9001:2015
                  </span>
                </div>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Certified Quality
                </h5>
                <p className="text-[11px] text-neutral-300 leading-relaxed font-normal">
                  Precision engineering that meets rigorous B2B storage safety factors.
                </p>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Editorial Story & 4 Capability Cards       */}
          {/* ======================================================== */}
          <div ref={contentRef} className="lg:col-span-7 flex flex-col justify-center lg:pl-4">
            
            {/* Top Eyebrow */}
            <div className="about-anim-item flex items-center gap-2.5 mb-3">
              <span className="w-7 h-[2px] bg-[#FF5200] rounded-full inline-block" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF5200]">
                {eyebrow || 'About RP Storage Solution'}
              </span>
            </div>

            {/* Main Heading */}
            <h2 className="about-anim-item text-3xl sm:text-4xl lg:text-[44px] font-bold font-display text-[#0F172A] tracking-tight leading-[1.15] mb-6">
              {headline ? (
                <>
                  {headline}{' '}
                  {italicHeadline && (
                    <span className="font-editorial italic font-normal text-[#FF5200] block sm:inline">
                      {italicHeadline}
                    </span>
                  )}
                </>
              ) : (
                <>
                  Built with Precision.{' '}
                  <span className="font-editorial italic font-normal text-[#FF5200] block sm:inline">
                    Designed for Possibilities.
                  </span>
                </>
              )}
            </h2>

            {/* Narrative Editorial Copy */}
            <div className="about-anim-item space-y-4 text-sm sm:text-base text-neutral-600 leading-relaxed mb-8 font-normal">
              {paragraph1 ? (
                <p>{paragraph1}</p>
              ) : (
                <p>
                  At <strong className="text-[#0F172A] font-semibold">RP Storage Solution</strong>, we view our clients as long-term partners, building business relationships founded on structural reliability, precision fabrication, and mutual growth. Based in New Delhi, India, we have established ourselves as one of the country's most dependable manufacturers and suppliers of retail and industrial storage systems.
                </p>
              )}
              {paragraph2 ? (
                <p>{paragraph2}</p>
              ) : (
                <p>
                  With over three decades of practical engineering expertise, we understand the distinct spatial demands of modern retail stores, supermarkets, and high-throughput distribution warehouses. Our dedicated design team customizes each racking assembly to maximize vertical footprint and optimize workflow efficiency.
                </p>
              )}
              {localPresenceDetails && (
                <div className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200/70 text-xs text-gray-700 leading-relaxed font-medium">
                  <span className="text-[#0F172A] font-bold block mb-1">Local Service Hub:</span>
                  {localPresenceDetails}
                </div>
              )}
            </div>

            {/* 4 Capabilities: Redesigned into High-End Modern Cards */}
            <div className="about-anim-item grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-9 pt-6 border-t border-neutral-100">
              {capabilities.map((cap, i) => {
                const IconComponent = cap.icon;
                return (
                  <div 
                    key={i} 
                    className="group relative flex items-start gap-3.5 p-4 rounded-xl bg-[#FAFAFA] hover:bg-white border border-neutral-200/80 hover:border-[#FF5200]/40 shadow-xs hover:shadow-md transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white group-hover:bg-orange-50 border border-neutral-200 group-hover:border-orange-200/60 flex items-center justify-center text-[#0F172A] group-hover:text-[#FF5200] transition-colors shrink-0 shadow-2xs">
                      <IconComponent className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="text-xs sm:text-[13px] font-bold text-[#0F172A] group-hover:text-[#FF5200] transition-colors leading-tight">
                          {cap.title}
                        </h4>
                      </div>
                      <p className="text-[11px] sm:text-xs text-neutral-500 leading-relaxed">
                        {cap.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA Row (Original Concept with Modern Design) */}
            <div className="about-anim-item flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 pt-2">
              <button
                onClick={onOpenQuote}
                className="group inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF5200] hover:bg-[#E04800] text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto text-center"
              >
                <span>Discuss Your Project</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 px-3.5 py-2.5 rounded-lg border border-neutral-200/60 w-full sm:w-auto">
                <Factory className="w-4 h-4 text-[#FF5200] shrink-0" />
                <span>Visit our facility in Najafgarh, New Delhi by appointment</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default About;
