import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';
import { Hero } from '../sections/Hero/Hero';
import { TrustStrip } from '../sections/TrustStrip/TrustStrip';
import { About } from '../sections/About/About';
import { Industries } from '../sections/Industries/Industries';
import { Statistics } from '../sections/Statistics/Statistics';
import { Benefits } from '../sections/Benefits/Benefits';
import { FeaturedProducts } from '../sections/FeaturedProducts/FeaturedProducts';
import { AreasWeServe } from '../sections/AreasWeServe/AreasWeServe';
import { Projects } from '../sections/Projects/Projects';
import { Testimonials } from '../sections/Testimonials/Testimonials';
import { FAQ } from '../sections/FAQ/FAQ';
import { EnquiryCTA } from '../sections/EnquiryCTA/EnquiryCTA';
import { Navbar } from '../navigation/Navbar';
import { Footer } from '../layout/Footer';
import { SEOHead } from '../seo/SEOHead';

/**
 * Shared Enterprise Homepage Template
 * Reused for:
 * 1. Main Homepage (/)
 * 2. City Homepage (/locations/:citySlug)
 *
 * Visually inherits the main homepage layout, design system, animations,
 * and sections while applying resolved field-level overrides, mapped products,
 * and city-specific SEO metadata.
 */
export const HomepageTemplate = ({
  pageType = 'home',
  city: propCity = null,
  content,
  onOpenQuote,
  onViewDetails,
}) => {
  const [locationsOpen, setLocationsOpen] = useState(false);

  if (!content || !content.sections) {
    return null;
  }

  const { isCityHomepage = false, city: contentCity = null, sections = {}, seo = {} } = content;
  const city = propCity || contentCity;
  const isCity = pageType === 'city' || isCityHomepage || Boolean(city);

  // Smooth scroll helper for Hero CTA
  const handleExploreProducts = () => {
    const el = document.getElementById('featured-products');
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Toggle delivery locations section
  const handleToggleLocations = () => {
    setLocationsOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          const el = document.getElementById('areas-we-serve');
          if (el) {
            const yOffset = -70;
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 120);
      }
      return next;
    });
  };

  const cityName = city?.name || null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title={seo.title || (isCityHomepage ? `Industrial Racks Manufacturer in ${cityName} | RP Storage` : 'RP Storage Solution')}
        description={seo.description || (isCityHomepage ? `Heavy duty pallet racks & supermarket display shelving in ${cityName}.` : 'Premier storage systems.')}
        canonicalUrl={seo.canonicalUrl || (isCityHomepage ? `https://www.rpstoragesolution.com/locations/${city?.slug}` : 'https://www.rpstoragesolution.com/')}
        schema={
          isCityHomepage && city
            ? {
                '@context': 'https://schema.org',
                '@type': 'LocalBusiness',
                name: `RP Storage Solution - ${city.name} Delivery Hub`,
                description: seo.description,
                telephone: '+91-9990023436',
                areaServed: {
                  '@type': 'City',
                  name: city.name,
                },
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: 'Plot At, Kh No. 13/7, Village Nangali Sakrawati, Najafgarh',
                  addressLocality: 'New Delhi',
                  postalCode: '110043',
                  addressCountry: 'IN',
                },
              }
            : {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'RP Storage Solution',
                url: 'https://www.rpstoragesolution.com',
                logo: 'https://www.rpstoragesolution.com/images/logorp.png',
                telephone: '+91-9990023436',
              }
        }
      />

      <Navbar onOpenQuote={() => onOpenQuote(cityName ? { category: `${cityName} General Enquiry` } : null)} />

      {/* City Breadcrumb Strip (Only shown on City Homepage) */}
      {isCityHomepage && city && (
        <div className="bg-gray-50/90 border-b border-gray-200 pt-28 sm:pt-32 pb-3">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between flex-wrap gap-2 text-xs">
            <nav className="flex items-center gap-2 text-gray-500 font-medium">
              <Link to="/" className="hover:text-[#E85B12] transition-colors">Home</Link>
              <span>/</span>
              <Link to="/locations" className="hover:text-[#E85B12] transition-colors">Locations</Link>
              <span>/</span>
              <span className="text-gray-900 font-bold">{city.name}</span>
            </nav>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 rounded-full text-[11px] font-bold text-[#E85B12]">
              <MapPin className="w-3 h-3" />
              <span>Verified Service Corridor: {city.name}, {city.state}</span>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* 1. Hero Section */}
        {sections.hero?.enabled !== false && (
          <Hero
            onOpenQuote={onOpenQuote}
            onExploreProducts={handleExploreProducts}
            eyebrow={sections.hero?.eyebrow}
            headline={sections.hero?.headline}
            italicHeadline={sections.hero?.italicHeadline}
            subtitle={sections.hero?.subtitle}
            primaryCtaText={sections.hero?.primaryCtaText}
            secondaryCtaText={sections.hero?.secondaryCtaText}
            image={sections.hero?.image}
            cityContext={cityName}
          />
        )}

        {/* 2. Trust Strip */}
        {sections.trustStrip?.enabled !== false && <TrustStrip />}

        {/* 3. About Section */}
        {sections.about?.enabled !== false && (
          <About
            onOpenQuote={onOpenQuote}
            eyebrow={sections.about?.eyebrow}
            headline={sections.about?.headline}
            italicHeadline={sections.about?.italicHeadline}
            paragraph1={sections.about?.paragraph1}
            paragraph2={sections.about?.paragraph2}
            image={sections.about?.image}
            localPresenceDetails={sections.about?.localPresenceDetails}
            cityContext={cityName}
          />
        )}

        {/* 4. Industries Section */}
        {sections.industries?.enabled !== false && (
          <Industries onOpenQuote={onOpenQuote} />
        )}

        {/* 5. Featured Products Catalog (City-Filtered Mapped Products & Context-Aware Links) */}
        {sections.featuredProducts?.enabled !== false && (
          <FeaturedProducts
            onViewDetails={onViewDetails}
            onEnquireProduct={onOpenQuote}
            products={sections.featuredProducts?.products}
            heading={sections.featuredProducts?.heading}
            subtitle={sections.featuredProducts?.subtitle}
            cityContext={cityName}
            city={city}
            pageType={pageType}
          />
        )}

        {/* 6. Statistics / Proven Track Record */}
        {sections.statistics?.enabled !== false && <Statistics />}

        {/* 7. Why Choose RP Storage Solution / Benefits */}
        {sections.benefits?.enabled !== false && (
          <Benefits onOpenQuote={onOpenQuote} />
        )}

        {/* 8. Projects & Installations */}
        {sections.projects?.enabled !== false && (
          <Projects onOpenQuote={onOpenQuote} />
        )}

        {/* 9. Testimonials */}
        {sections.testimonials?.enabled !== false && <Testimonials />}

        {/* 10. Frequently Asked Questions */}
        {sections.faqs?.enabled !== false && (
          <FAQ
            onOpenQuote={onOpenQuote}
            items={sections.faqs?.items}
            heading={isCityHomepage ? `Frequently Asked Questions in ${cityName}` : null}
            subtitle={isCityHomepage ? `Technical specs, localized installation timeframes, and factory supply direct to ${cityName}.` : null}
          />
        )}

        {/* 11. Premium Enquiry CTA */}
        {sections.enquiryCta?.enabled !== false && (
          <EnquiryCTA
            onOpenQuote={onOpenQuote}
            heading={sections.enquiryCta?.heading}
            subtitle={sections.enquiryCta?.subtitle}
            phone={sections.enquiryCta?.phone}
            buttonText={sections.enquiryCta?.buttonText}
            cityContext={cityName}
          />
        )}

        {/* 12. Areas We Serve (Regional Hubs) */}
        {sections.areasWeServe?.enabled !== false && (
          <AreasWeServe
            isOpen={locationsOpen}
            onClose={() => setLocationsOpen(false)}
            onOpenQuote={onOpenQuote}
          />
        )}
      </main>

      <Footer
        onOpenQuote={() => onOpenQuote(cityName ? { category: `${cityName} General Enquiry` } : null)}
        onToggleLocations={handleToggleLocations}
        isLocationsOpen={locationsOpen}
      />
    </div>
  );
};

export default HomepageTemplate;
