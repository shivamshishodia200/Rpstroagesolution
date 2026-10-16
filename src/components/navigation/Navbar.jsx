import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ChevronDown, 
  Menu, 
  X, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  ExternalLink 
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { COMPANY_INFO, PRODUCT_COLLECTIONS } from '../../data/companyData';

export const Navbar = ({ onOpenQuote }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const megaRef = useRef(null);

  // Monitor scroll for shrink effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside for mega menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setMegaOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMegaOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const location = useLocation();

  // Smooth scroll to section
  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    setMegaOpen(false);
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
      {/* 1. Slim Top Contact Bar */}
      <div 
        className={`bg-[#0F172A] text-neutral-300 border-b border-neutral-800 transition-all duration-300 overflow-hidden ${
          isScrolled ? 'max-h-0 opacity-0 py-0' : 'max-h-12 opacity-100 py-2'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs tracking-wide">
          <div className="flex items-center gap-4 sm:gap-6">
            <span className="font-medium text-white hidden sm:inline">
              Reliable Storage. Stronger Businesses.
            </span>
            <span className="hidden sm:inline text-neutral-600">|</span>
            <a 
              href={`tel:${COMPANY_INFO.phonePrimary}`} 
              className="flex items-center gap-1.5 hover:text-brand-orange transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-orange" />
              <span className="font-medium text-neutral-200">{COMPANY_INFO.phoneDisplay}</span>
            </a>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <a 
              href={`mailto:${COMPANY_INFO.email}`} 
              className="hidden sm:flex items-center gap-1.5 hover:text-brand-orange transition-colors text-neutral-300"
            >
              <Mail className="w-3.5 h-3.5 text-brand-orange" />
              <span>{COMPANY_INFO.email}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navbar */}
      <nav 
        className={`bg-white transition-all duration-300 border-b ${
          isScrolled 
            ? 'py-3 shadow-md border-neutral-200/80 bg-white/95 backdrop-blur-md' 
            : 'py-4 sm:py-5 border-neutral-200 bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Real Company Logo */}
          <button 
            onClick={() => scrollTo('hero')} 
            className="flex items-center gap-3 group focus:outline-none text-left"
            aria-label="RP Storage Solution Home"
          >
            <img 
              src="/images/logo.png" 
              alt="RP Storage Solution" 
              className={`transition-all duration-300 object-contain ${
                isScrolled ? 'h-9 sm:h-10' : 'h-11 sm:h-12'
              }`}
            />
            <div className="border-l border-neutral-300 pl-3 hidden sm:block">
              <span className="block text-[10px] font-bold tracking-widest uppercase text-neutral-400 leading-none">
                Industrial Racks & Shelving
              </span>
              <span className="block text-xs font-semibold tracking-wide text-brand-textPrimary leading-tight mt-0.5">
                New Delhi, India
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-7">
            <button 
              onClick={() => scrollTo('hero')}
              className="group relative text-sm font-semibold text-neutral-800 hover:text-brand-orange py-2 transition-colors"
            >
              <span>Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
            </button>

            <button 
              onClick={() => scrollTo('about')}
              className="group relative text-sm font-semibold text-neutral-800 hover:text-brand-orange py-2 transition-colors"
            >
              <span>About</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
            </button>

            {/* Products with Mega Dropdown */}
            <div 
              className="relative"
              ref={megaRef}
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button 
                onClick={() => {
                  scrollTo('featured-products');
                  setMegaOpen(false);
                }}
                className={`group flex items-center gap-1.5 text-sm font-semibold py-2 transition-colors ${
                  megaOpen ? 'text-brand-orange' : 'text-neutral-800 hover:text-brand-orange'
                }`}
              >
                <span>Products</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`} />
                <span className={`absolute bottom-0 left-0 h-0.5 bg-brand-orange transition-all duration-300 ${
                  megaOpen ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>

              {/* Mega Dropdown Panel */}
              <div 
                className={`absolute top-full -left-28 w-[720px] bg-white border border-neutral-200 shadow-2xl transition-all duration-200 p-6 z-50 ${
                  megaOpen 
                    ? 'opacity-100 visible translate-y-1' 
                    : 'opacity-0 invisible translate-y-3 pointer-events-none'
                }`}
              >
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                      Product Engineering Categories
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      scrollTo('featured-products');
                      setMegaOpen(false);
                    }}
                    className="text-xs font-semibold text-brand-orange hover:text-brand-orangeHover flex items-center gap-1"
                  >
                    <span>View All Products</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {PRODUCT_COLLECTIONS.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => {
                        scrollTo('featured-products');
                        setMegaOpen(false);
                      }}
                      className="group/card flex flex-col p-2.5 rounded-none border border-neutral-100 hover:border-brand-orange/40 hover:bg-neutral-50/80 cursor-pointer transition-all"
                    >
                      <div className="h-24 w-full bg-neutral-100 overflow-hidden mb-2 border border-neutral-200">
                        <img 
                          src={item.image} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 group-hover/card:text-brand-orange transition-colors">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {item.number}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Bar in Mega Menu */}
                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs bg-neutral-50 p-2.5">
                  <span className="text-neutral-600">Need custom rack dimensions or complete store 3D layout?</span>
                  <button
                    onClick={() => {
                      setMegaOpen(false);
                      onOpenQuote();
                    }}
                    className="text-brand-orange font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Get Free Store Design</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>


            <button 
              onClick={() => scrollTo('industries')}
              className="group relative text-sm font-semibold text-neutral-800 hover:text-brand-orange py-2 transition-colors"
            >
              <span>Industries</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
            </button>

            <button 
              onClick={() => scrollTo('contact')}
              className="group relative text-sm font-semibold text-neutral-800 hover:text-brand-orange py-2 transition-colors"
            >
              <span>Contact</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange transition-all duration-300 group-hover:w-full" />
            </button>
          </div>

          {/* Right Action: Quotation CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={onOpenQuote}
              className="bg-[#FF5200] hover:bg-[#E04800] text-white text-xs font-bold tracking-wider px-6 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <span>Get Quote</span>
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenQuote}
              className="bg-brand-orange hover:bg-brand-orangeHover text-white text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg shadow-xs transition-colors"
            >
              Get Quote
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 text-neutral-800 hover:text-brand-orange hover:bg-neutral-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Mobile Navigation Drawer */}
      <div 
        className={`lg:hidden fixed inset-x-0 ${isScrolled ? 'top-[62px]' : 'top-[100px] sm:top-[104px]'} bg-white border-b border-neutral-200 shadow-2xl transition-all duration-300 overflow-y-auto max-h-[calc(100vh-80px)] ${
          mobileMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="p-5 sm:p-6 pb-28 space-y-4">
          <div className="flex flex-col space-y-2 border-b border-neutral-200 pb-4 text-base font-semibold">
            <button 
              onClick={() => scrollTo('hero')} 
              className="text-left py-2 hover:text-brand-orange transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => scrollTo('about')} 
              className="text-left py-2 hover:text-brand-orange transition-colors"
            >
              About Us
            </button>
            <button 
              onClick={() => scrollTo('featured-products')} 
              className="text-left py-2 hover:text-brand-orange transition-colors flex items-center justify-between"
            >
              <span>Products Catalog</span>
              <span className="text-xs bg-brand-orangeLight text-brand-orange font-bold px-2 py-0.5">Explore</span>
            </button>

            <button 
              onClick={() => scrollTo('industries')} 
              className="text-left py-2 hover:text-brand-orange transition-colors"
            >
              Industry Solutions
            </button>
            <button 
              onClick={() => scrollTo('why-choose-us')} 
              className="text-left py-2 hover:text-brand-orange transition-colors"
            >
              Why RP Storage Solution
            </button>
            <button 
              onClick={() => scrollTo('faq')} 
              className="text-left py-2 hover:text-brand-orange transition-colors"
            >
              Frequently Asked Questions
            </button>
            <button 
              onClick={() => scrollTo('contact')} 
              className="text-left py-2 hover:text-brand-orange transition-colors"
            >
              Contact & Plant Location
            </button>
          </div>

          {/* Quick contact details in mobile menu */}
          <div className="pt-2 text-xs text-neutral-600 space-y-2">
            <p className="font-semibold text-neutral-900">Direct Customer Helpline:</p>
            <a href={`tel:${COMPANY_INFO.phonePrimary}`} className="flex items-center gap-2 text-brand-orange font-bold text-sm">
              <Phone className="w-4 h-4" /> {COMPANY_INFO.phoneDisplay}
            </a>
            <p className="text-neutral-500 text-[11px] pt-1">
              {COMPANY_INFO.address}
            </p>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenQuote();
            }}
            className="w-full bg-brand-orange hover:bg-brand-orangeHover text-white py-3.5 text-xs font-bold uppercase tracking-widest text-center shadow rounded-lg transition-all"
          >
            Request Official Quotation
          </button>
        </div>
      </div>
    </header>
  );
};
