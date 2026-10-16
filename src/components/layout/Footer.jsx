import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  ArrowUp, 
  ShieldCheck, 
  Clock, 
  ChevronRight,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { COMPANY_INFO, PRODUCT_COLLECTIONS } from '../../data/companyData';

export const Footer = ({ onOpenQuote, onToggleLocations, isLocationsOpen }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-[#0A0D12] text-white border-t border-neutral-800 relative">
      
      {/* Upper Contact Quick Banner */}
      <div className="border-b border-neutral-800/80 bg-black/40 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            
            {/* Phone */}
            <a 
              href={`tel:${COMPANY_INFO.phonePrimary}`}
              className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-800/90 hover:border-brand-orange/60 bg-neutral-900/60 hover:bg-neutral-900/90 transition-all duration-300 group shadow-sm hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-brand-orange flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-all shadow-inner">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">Direct Sales Helpline</span>
                <span className="text-sm sm:text-base font-bold text-white group-hover:text-brand-orange transition-colors truncate block">
                  {COMPANY_INFO.phoneDisplay}
                </span>
              </div>
            </a>

            {/* Email */}
            <a 
              href={`mailto:${COMPANY_INFO.email}`}
              className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-800/90 hover:border-brand-orange/60 bg-neutral-900/60 hover:bg-neutral-900/90 transition-all duration-300 group shadow-sm hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-brand-orange flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-all shadow-inner">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">Technical Inquiries</span>
                <span className="text-xs sm:text-sm font-bold text-white truncate block group-hover:text-brand-orange transition-colors">
                  {COMPANY_INFO.email}
                </span>
              </div>
            </a>

            {/* Plant Facility */}
            <a 
              href={COMPANY_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl border border-neutral-800/90 hover:border-brand-orange/60 bg-neutral-900/60 hover:bg-neutral-900/90 transition-all duration-300 group shadow-sm hover:-translate-y-0.5"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-brand-orange flex items-center justify-center shrink-0 group-hover:bg-brand-orange group-hover:text-white transition-all shadow-inner">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-mono text-neutral-400 block uppercase tracking-wider">Manufacturing Facility</span>
                <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors block">
                  Nangali Sakrawati, Najafgarh, New Delhi
                </span>
              </div>
            </a>

          </div>
        </div>
      </div>

      {/* Main Footer Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Col 1: Brand & Identity (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Transparent White-Text Logo without ugly white box */}
            <div className="flex items-center">
              <img 
                src="/images/logo-white.png" 
                alt="RP Storage Solution Logo" 
                className="h-11 sm:h-12 w-auto object-contain"
              />
            </div>

            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              RP Storage Solution is a premier manufacturer, supplier, and exporter of heavy-duty supermarket racks, retail display fixtures, and warehouse storage systems based in New Delhi, India. Over 35 years of engineering dependability.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-xl bg-neutral-900/80 p-2 border border-neutral-800">
                <img 
                  src="/images/export.png" 
                  alt="Global Export Quality" 
                  className="h-10 w-auto object-contain"
                />
                <img 
                  src="/images/quality.png" 
                  alt="Certified Quality Check" 
                  className="h-10 w-auto object-contain"
                />
              </div>
              <div className="text-[11px] text-neutral-400 leading-tight">
                <span className="font-bold text-white block">Certified Production</span>
                <span>Export Standard Finishes</span>
              </div>
            </div>
          </div>

          {/* Col 2: Useful Company Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange mb-5">
              Company
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => scrollToSection('hero')} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform" />
                  <span>Home</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('about')} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform" />
                  <span>About Us</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('featured-products')} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform" />
                  <span>Products</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('industries')} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform" />
                  <span>Industries</span>
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('why-choose-us')} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform" />
                  <span>Why RP Storage</span>
                </button>
              </li>

              <li>
                <button onClick={() => scrollToSection('faq')} className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 group">
                  <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform" />
                  <span>FAQ</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Product Categories (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange mb-5">
              Storage Systems
            </h4>
            <ul className="space-y-2.5 text-xs">
              {PRODUCT_COLLECTIONS.map((c) => (
                <li key={c.id}>
                  <button 
                    onClick={() => scrollToSection('featured-products')}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-left group"
                  >
                    <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform shrink-0" />
                    <span>{c.title}</span>
                  </button>
                </li>
              ))}
              <li>
                <Link 
                  to="/locations"
                  className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 text-left group"
                >
                  <ChevronRight className="w-3 h-3 text-brand-orange group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span>Locations</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Facility Address & Hours (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-orange mb-5">
              Factory Office
            </h4>
            <div className="space-y-4 text-xs text-neutral-400">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                <span className="leading-relaxed">{COMPANY_INFO.address}</span>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-orange shrink-0" />
                <span>{COMPANY_INFO.workingHours}</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenQuote}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-orange to-[#E04800] hover:brightness-110 text-white py-3.5 px-4 text-xs font-bold uppercase tracking-wider text-center transition-all shadow-md shadow-orange-950/40 flex items-center justify-center gap-2 group"
                >
                  <span>Request Plant Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Legal & Copyright Bar */}
      <div className="border-t border-neutral-800/80 bg-black/80 py-6 pb-24 sm:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-400 gap-4 sm:pr-72 lg:pr-80 text-center sm:text-left">
          <p>© {new Date().getFullYear()} RP Storage Solution. All Rights Reserved. Engineered in New Delhi, India.</p>
          
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Back to top"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop Floating Instant Communication Widgets (>= 640px) */}
      <div className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 pointer-events-auto">
        <a
          href={COMPANY_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-2.5 rounded-full shadow-2xl shadow-emerald-950/50 transition-all hover:scale-105 active:scale-95 border border-white/20"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide">WhatsApp Us</span>
        </a>

        <a
          href={`tel:${COMPANY_INFO.phonePrimary}`}
          aria-label="Call RP Storage Solution"
          className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orangeHover text-white px-4 py-2.5 rounded-full shadow-2xl shadow-orange-950/50 transition-all hover:scale-105 active:scale-95 border border-white/20"
        >
          <Phone className="w-4 h-4" />
          <span className="text-xs font-bold tracking-wide">Call Now</span>
        </a>
      </div>

      {/* Mobile Bottom Action Bar (< 640px) - Thumb-friendly, 0 overlap */}
      <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-neutral-900/95 backdrop-blur-md border-t border-neutral-800 p-2.5 px-4 flex items-center justify-between gap-3 shadow-2xl">
        <a
          href={COMPANY_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] active:bg-[#20bd5a] text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>

        <a
          href={`tel:${COMPANY_INFO.phonePrimary}`}
          aria-label="Call RP Storage Solution"
          className="flex-1 flex items-center justify-center gap-2 bg-brand-orange active:bg-brand-orangeHover text-white py-2.5 px-3 rounded-xl text-xs font-bold shadow-md transition-transform active:scale-95"
        >
          <Phone className="w-4 h-4" />
          <span>Call Now</span>
        </a>
      </div>

    </footer>
  );
};

export default Footer;
