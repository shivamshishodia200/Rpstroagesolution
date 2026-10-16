import React from 'react';
import { Helmet } from 'react-helmet-async';

export const SEOHead = ({
  title = 'RP Storage Solution | Industrial Storage & Supermarket Rack Manufacturers',
  description = 'ISO 9001 certified heavy-duty warehouse racking, supermarket display racks, mezzanine floors and pallet racks direct from manufacturer in Delhi NCR.',
  canonicalUrl,
  ogImage = 'https://www.rpstoragesolution.com/images/gallery/mfg-1.jpg',
  noindex = false,
  schema = null,
}) => {
  const fullTitle = title.includes('RP Storage Solution') ? title : `${title} | RP Storage Solution`;
  const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://www.rpstoragesolution.com');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Robots Directive */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="RP Storage Solution" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonical} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />

      {/* Schema.org Structured Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
