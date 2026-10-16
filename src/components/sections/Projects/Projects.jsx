import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, MapPin, CheckCircle, ArrowRight, X } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const Projects = ({ onOpenQuote }) => {
  const [activeLightbox, setActiveLightbox] = useState(null);
  const sectionRef = useRef(null);

  const projects = [
    {
      id: "proj-1",
      title: "High-Bay Pallet Racking Hub",
      category: "Industrial Warehouse",
      location: "Delhi NCR Logistics Hub",
      image: "/images/banner3.jpeg",
      specs: "Heavy-Duty Uprights, 2,500 kg/level, Seismic Anchoring",
      description: "Custom-configured multi-tier warehouse pallet system engineered for reach-truck forklifts and maximum cubic density."
    },
    {
      id: "proj-2",
      title: "Hypermarket Gondola Aisles",
      category: "Supermarket Retail",
      location: "Modern Retail Chain, North India",
      image: "/images/banner1.jpeg",
      specs: "Modular Double-Sided Gondolas with LED Headers",
      description: "Complete retail shelving fitout including wall displays, center gondolas, and promotional end-caps for high customer footfall."
    },
    {
      id: "proj-3",
      title: "Commercial Retail Store Outfitting",
      category: "Departmental Store",
      location: "Commercial Shopping Complex",
      image: "/images/banner2.jpeg",
      specs: "Perimeter Racks, Produce Stands & Garment Rails",
      description: "Architectural retail outfitting combining wood-accented displays, hanging racks, and durable powder-coated steel bays."
    },
    {
      id: "proj-4",
      title: "Heavy Sheet Metal Fabrication & Storage",
      category: "Manufacturing Plant",
      location: "Industrial Tooling Hub, Haryana",
      image: "/images/banner4.jpeg",
      specs: "Lockable Steel Tooling Cabinets & Slotted Angles",
      description: "Shopfloor organization system designed for high-capacity tooling, spare parts segregation, and industrial equipment."
    },
    {
      id: "proj-5",
      title: "Supermarket Trolley Fleet Deployment",
      category: "Material Handling",
      location: "Retail Mall Superstore",
      image: "/images/Trolley.jpg",
      specs: "Zinc-Plated 150L Shopping Trolleys with PU Swivels",
      description: "Supply of heavy-duty, nestable shopping cart fleet engineered with corrosion-resistant zinc plating and whisper-quiet wheels."
    },
    {
      id: "proj-6",
      title: "Supermarket Cash & Checkout Counters",
      category: "Checkout Solutions",
      location: "Multi-Lane Supermarket",
      image: "/images/checkout-cash-counter-real.png",
      specs: "Hairline Stainless Steel Slide Top, Multi-Slot Locking Cash Drawer",
      description: "High-throughput cashier desks designed with brushed stainless steel tops, durable red metal chassis, and integrated locking cash drawers."
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.project-item',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
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
      id="projects" 
      ref={sectionRef}
      className="py-16 sm:py-24 lg:py-32 bg-white border-b border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-[2px] bg-brand-orange" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-orange">
                Real-World Implementations
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display text-neutral-900 tracking-tight leading-tight">
              Designed for{' '}
              <span className="font-editorial-italic font-normal text-brand-orange">
                Real Spaces.
              </span>
            </h2>
          </div>
          <p className="text-brand-textSecondary text-sm sm:text-base max-w-md leading-relaxed">
            Real installations across retail supermarkets, department stores, and warehouse logistics hubs in India.
          </p>
        </div>

        {/* Structured Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="project-item group flex flex-col justify-between bg-neutral-50 border border-neutral-200 hover:border-brand-orange/60 transition-all duration-300 overflow-hidden hover:shadow-xl"
            >
              {/* Image Container with Hover Lightbox trigger */}
              <div 
                onClick={() => setActiveLightbox(proj)}
                className="relative aspect-[16/11] bg-neutral-100 overflow-hidden cursor-pointer"
              >
                <img
                  src={proj.image}
                  alt={proj.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                
                {/* Location Badge */}
                <div className="absolute top-3 left-3 bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-neutral-900 flex items-center gap-1.5 border border-neutral-200">
                  <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                  <span>{proj.location}</span>
                </div>

                {/* Lightbox action icon */}
                <div className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 text-neutral-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>

              {/* Caption & Specs */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-brand-orange block mb-1">
                    {proj.category}
                  </span>
                  <h3 className="text-lg font-bold font-display text-neutral-900 group-hover:text-brand-orange transition-colors mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-brand-textSecondary leading-relaxed mb-4">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-200 text-[11px] text-neutral-600 font-mono">
                  <span className="text-neutral-400 block mb-0.5">Specifications:</span>
                  <span className="font-semibold text-neutral-800">{proj.specs}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeLightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md">
            <div className="relative max-w-4xl w-full bg-white overflow-hidden shadow-2xl border border-neutral-800 rounded-2xl max-h-[94vh] flex flex-col">
              <div className="bg-brand-dark text-white px-5 sm:px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono text-brand-orange uppercase">{activeLightbox.category}</span>
                  <h3 className="text-base sm:text-lg font-bold">{activeLightbox.title}</h3>
                </div>
                <button
                  onClick={() => setActiveLightbox(null)}
                  className="p-2 text-neutral-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="aspect-[16/10] bg-neutral-900 overflow-hidden flex-1 min-h-0">
                <img
                  src={activeLightbox.image}
                  alt={activeLightbox.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="p-4 sm:p-6 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-neutral-600 max-w-xl text-center sm:text-left">{activeLightbox.description}</p>
                <button
                  onClick={() => {
                    setActiveLightbox(null);
                    onOpenQuote();
                  }}
                  className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orangeHover text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg text-center transition-all"
                >
                  Plan Similar Layout
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
