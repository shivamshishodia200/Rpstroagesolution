import React, { useState, useEffect } from 'react';
import { HomepageTemplate } from '../components/homepage/HomepageTemplate';
import { getHomepageData } from '../services/api';

const defaultHomeContent = {
  isCityHomepage: false,
  sections: {
    hero: { enabled: true },
    trustStrip: { enabled: true },
    about: { enabled: true },
    industries: { enabled: true },
    featuredProducts: { enabled: true },
    statistics: { enabled: true },
    benefits: { enabled: true },
    projects: { enabled: true },
    testimonials: { enabled: true },
    faqs: { enabled: true },
    enquiryCta: { enabled: true },
    areasWeServe: { enabled: true },
  },
  seo: {
    title: 'RP Storage Solution | Industrial Storage & Supermarket Rack Manufacturers',
    description:
      'ISO 9001:2015 certified manufacturer of heavy duty warehouse racks, supermarket display racks, mezzanine floors, and pallet racking systems in Delhi NCR.',
    canonicalUrl: 'https://www.rpstoragesolution.com',
  },
};

export const Home = ({ onOpenQuote, onViewDetails }) => {
  const [content, setContent] = useState(() => {
    if (
      typeof window !== 'undefined' &&
      window.__INITIAL_DATA__?.sections &&
      !window.__INITIAL_DATA__?.isCityHomepage
    ) {
      return window.__INITIAL_DATA__;
    }
    return defaultHomeContent;
  });

  useEffect(() => {
    let mounted = true;
    const fetchHome = async () => {
      try {
        const res = await getHomepageData();
        if (mounted && res && res.sections) {
          setContent(res);
        }
      } catch (e) {
        // Silently retain defaultHomeContent
      }
    };
    fetchHome();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <HomepageTemplate
      pageType="home"
      content={content}
      onOpenQuote={onOpenQuote}
      onViewDetails={onViewDetails}
    />
  );
};

export default Home;
