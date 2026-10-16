import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, MapPin, Phone } from 'lucide-react';
import { Navbar } from '../components/navigation/Navbar';
import { Footer } from '../components/layout/Footer';
import { SEOHead } from '../components/seo/SEOHead';

export const NotFound = ({ onOpenQuote }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SEOHead
        title="404 - Page Not Found"
        description="The requested industrial racking or storage page could not be located."
        noindex={true}
      />
      <Navbar onOpenQuote={onOpenQuote} />

      <main className="flex-1 flex items-center justify-center pt-36 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-orange-50 text-[#E85B12] flex items-center justify-center font-black text-3xl mx-auto shadow-inner">
            404
          </div>

          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Page Not Found
          </h1>

          <p className="text-sm text-gray-600 leading-relaxed">
            The page or delivery location you are searching for might have been moved, updated, or does not exist.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#E85B12] text-white rounded-xl text-xs font-bold hover:bg-[#c4490b] transition-colors shadow-sm"
            >
              <Home className="w-4 h-4" /> Return to Homepage
            </Link>

            <Link
              to="/locations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#E85B12]" /> View Delivery Hubs
            </Link>
          </div>
        </div>
      </main>

      <Footer onOpenQuote={onOpenQuote} />
    </div>
  );
};

export default NotFound;
