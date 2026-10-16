import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gem,
  Cog,
  Truck
} from 'lucide-react';
import gsap from 'gsap';
import heroimage1 from '../../../assets/heroimage1.jpeg';
import heroimage2 from '../../../assets/heroimage2.jpeg';
import heroimage3 from '../../../assets/heroimage3.jpeg';

export const Hero = ({
  onOpenQuote,
  onExploreProducts,
  eyebrow,
  headline,
  italicHeadline,
  subtitle,
  primaryCtaText,
  secondaryCtaText,
  image,
  cityContext,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroRef = useRef(null);
  const contentRef = useRef(null);
  const visualRef = useRef(null);
  const cardRef = useRef(null);
  const thumbsRef = useRef(null);

  const slides = [
    {
      id: 0,
      image: heroimage1,
      thumb: heroimage1,
      category: 'HEAVY DUTY WAREHOUSE RACKS',
      title: 'Industrial Heavy Duty Pallet Racking Systems',
      ctaUrl: '#featured-products',
    },
    {
      id: 1,
      image: heroimage2,
      thumb: heroimage2,
      category: 'RETAIL GARMENT & APPAREL DISPLAY',
      title: 'Modern Retail Apparel & Showroom Display Fixtures',
      ctaUrl: '#featured-products',
    },
    {
      id: 2,
      image: heroimage3,
      thumb: heroimage3,
      category: 'SUPERMARKET DISPLAY RACKS',
      title: 'Modular Supermarket Wall & Gondola Shelving',
      ctaUrl: '#featured-products',
    },
  ];

  // Auto rotate slides every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Entrance Animations with GSAP
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.hero-eyebrow-container',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.7, delay: 0.1 }
      )
        .fromTo(
          '.hero-heading-line',
          { opacity: 0, y: 35 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
          "-=0.4"
        )
        .fromTo(
          '.hero-description',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          '.hero-cta-group',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7 },
          "-=0.5"
        )
        .fromTo(
          '.hero-feature-item',
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          "-=0.4"
        )
        .fromTo(
          visualRef.current,
          { opacity: 0, scale: 0.98 },
          { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' },
          "-=1.1"
        )
        .fromTo(
          cardRef.current,
          { opacity: 0, y: 30, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.5)' },
          "-=0.5"
        )
        .fromTo(
          thumbsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          "-=0.4"
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handlePrevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const currentSlide = slides[activeSlide];

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative w-full bg-white pt-32 sm:pt-36 lg:pt-40 pb-8 sm:pb-12 lg:pb-16 overflow-hidden border-b border-gray-100"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 w-full">
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10 min-h-[560px] lg:min-h-[620px]">

          {/* ======================================================== */}
          {/* LEFT COLUMN: Editorial Typography, CTAs & 3-Feature Strip */}
          {/* ======================================================== */}
          <div
            ref={contentRef}
            className="w-full lg:w-[46%] xl:w-[44%] z-20 flex flex-col justify-center py-4 lg:py-8"
          >
            {/* Top Eyebrow Tagline */}
            <div className="hero-eyebrow-container flex items-center gap-2.5 mb-4 sm:mb-5">
              <span className="w-7 h-[2px] bg-[#FF5200] rounded-full inline-block" />
              <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                {eyebrow ? (
                  <span className="text-[#FF5200]">{eyebrow}</span>
                ) : (
                  <>
                    <span className="text-[#FF5200]">SMART STORAGE</span>
                    <span className="text-gray-400 font-medium ml-1.5">FOR MODERN BUSINESS</span>
                  </>
                )}
              </div>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[62px] font-bold text-[#0F172A] tracking-tight leading-[1.12] font-editorial mb-5 sm:mb-6 break-words">
              {headline ? (
                <>
                  <span className="hero-heading-line block">{headline}</span>
                  {italicHeadline && (
                    <span className="hero-heading-line block text-[#FF5200] italic font-normal">
                      {italicHeadline}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="hero-heading-line block">
                    Innovative
                  </span>
                  <span className="hero-heading-line block">
                    Storage Solutions
                  </span>
                  <span className="hero-heading-line block">
                    for a <span className="text-[#FF5200]">Better Tomorrow</span>
                  </span>
                </>
              )}
            </h1>

            {/* Subtitle / Descriptive Copy */}
            <p className="hero-description text-sm sm:text-[15px] lg:text-base text-gray-600 leading-relaxed max-w-lg mb-8 font-normal">
              {subtitle || 'Leading manufacturer and supplier of high-quality storage and display systems for Retail Stores, Supermarkets, Warehouses and Industrial Spaces.'}
            </p>

            {/* CTA Buttons Row */}
            <div className="hero-cta-group flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10 sm:mb-12">
              <button
                onClick={onExploreProducts}
                className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 bg-[#FF5200] hover:bg-[#E04800] text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full sm:w-auto text-center"
              >
                <span>{secondaryCtaText || 'Explore Products'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onOpenQuote && onOpenQuote(cityContext ? { category: `${cityContext} Site Survey` } : null)}
                className="inline-flex items-center justify-center px-7 sm:px-8 py-3.5 bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 text-[#0F172A] text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 shadow-2xs w-full sm:w-auto text-center"
              >
                {primaryCtaText || 'Contact Us'}
              </button>
            </div>

            {/* Bottom 3-Feature Strip (Seamless, matching reference) */}
            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-start sm:gap-8 pt-2">
              {/* Feature 1 */}
              <div className="hero-feature-item flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 group text-center sm:text-left">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#0F172A] group-hover:text-[#FF5200] transition-colors">
                  <Gem className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.6]" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-[13px] font-bold text-[#0F172A] leading-tight">
                    Premium
                  </span>
                  <span className="block text-[10px] sm:text-xs text-gray-500 font-medium leading-tight mt-0.5">
                    Quality
                  </span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="hero-feature-item flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 group text-center sm:text-left">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#0F172A] group-hover:text-[#FF5200] transition-colors">
                  <Cog className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.6]" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-[13px] font-bold text-[#0F172A] leading-tight">
                    Customised
                  </span>
                  <span className="block text-[10px] sm:text-xs text-gray-500 font-medium leading-tight mt-0.5">
                    Designs
                  </span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="hero-feature-item flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 group text-center sm:text-left">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[#0F172A] group-hover:text-[#FF5200] transition-colors">
                  <Truck className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.6]" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-[13px] font-bold text-[#0F172A] leading-tight">
                    Pan India
                  </span>
                  <span className="block text-[10px] sm:text-xs text-gray-500 font-medium leading-tight mt-0.5">
                    Delivery
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Modern Architectural Visual & Cards        */}
          {/* ======================================================== */}
          <div
            ref={visualRef}
            className="w-full lg:w-[52%] xl:w-[54%] mt-8 lg:mt-0 flex items-center justify-center z-10"
          >
            {/* Main Photography Container with Rounded Modern Frame */}
            <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[560px] xl:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl shadow-neutral-900/10 border border-neutral-100">

              {/* Slides Images */}
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${activeSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Subtle warm architectural lighting overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent pointer-events-none" />
                </div>
              ))}

              {/* ==================================================== */}
              {/* FLOATING CARD: Retail Display Racks                  */}
              {/* ==================================================== */}
              <div
                ref={cardRef}
                onClick={onExploreProducts}
                className="absolute bottom-16 sm:bottom-24 lg:bottom-20 left-3 right-3 sm:left-auto sm:right-8 lg:right-12 z-30 bg-white rounded-2xl p-3 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.14)] border border-gray-100 flex items-center justify-between gap-3 sm:gap-6 cursor-pointer group hover:shadow-2xl transition-all duration-300 max-w-full sm:max-w-[340px]"
              >
                <div className="min-w-0">
                  <span className="block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-0.5 sm:mb-1 truncate">
                    {currentSlide.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug group-hover:text-[#FF5200] transition-colors line-clamp-1">
                    {currentSlide.title}
                  </h4>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#FF5200] group-hover:bg-[#E04800] text-white flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 duration-200">
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* ==================================================== */}
              {/* FLOATING CAROUSEL: Thumbnails & Prev/Next Arrows     */}
              {/* ==================================================== */}
              <div
                ref={thumbsRef}
                className="absolute bottom-2.5 sm:bottom-5 inset-x-2 sm:inset-x-auto sm:right-8 lg:right-12 z-30 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5"
              >
                {/* Prev Button */}
                <button
                  onClick={handlePrevSlide}
                  aria-label="Previous slide"
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/95 hover:bg-white text-gray-700 hover:text-[#FF5200] flex items-center justify-center shadow-md border border-gray-100 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* 3 Thumbnails */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {slides.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveSlide(idx)}
                      className={`relative w-12 sm:w-16 h-8 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${activeSlide === idx
                          ? 'border-2 border-[#FF5200] ring-2 ring-orange-400/40 scale-105 shadow-md'
                          : 'border border-white/80 opacity-75 hover:opacity-100 shadow-sm'
                        }`}
                    >
                      <img
                        src={s.thumb}
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextSlide}
                  aria-label="Next slide"
                  className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/95 hover:bg-white text-gray-700 hover:text-[#FF5200] flex items-center justify-center shadow-md border border-gray-100 transition-all cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
