/**
 * Central JSON-LD Structured Data Engine
 * Generates verified, valid Schema.org schemas compliant with Google Search Central guidelines.
 * Strict Integrity Rule: Never emit fake reviews, fake ratings, or invented pricing.
 */

const BASE_URL = process.env.BASE_URL || 'https://www.rpstoragesolution.com';

export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'RP Storage Solution',
    legalName: 'RP Storage Solution',
    url: BASE_URL,
    logo: `${BASE_URL}/images/logorp.png`,
    image: `${BASE_URL}/images/banner3.jpeg`,
    description: 'ISO 9001 certified heavy-duty warehouse racking, supermarket display racks, mezzanine floors and industrial storage systems direct from manufacturer in Delhi NCR.',
    telephone: '+91-9990023436',
    email: 'rpstoragesolution12@gmail.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Plot At, Kh No. 13/7, Village Nangali Sakrawati, Najafgarh',
      addressLocality: 'New Delhi',
      addressRegion: 'Delhi',
      postalCode: '110043',
      addressCountry: 'IN',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9990023436',
      contactType: 'sales & technical support',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
    sameAs: [
      'https://www.facebook.com/rpstoragesolution',
      'https://www.instagram.com/rpstoragesolution',
      'https://www.linkedin.com/company/rp-storage-solution',
    ],
  };
};

export const generateWebSiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'RP Storage Solution',
    description: 'Manufacturer of industrial storage racks and supermarket display fixtures',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
  };
};

export const generateBreadcrumbSchema = (crumbs = []) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url.startsWith('http') ? crumb.url : `${BASE_URL}${crumb.url}`,
    })),
  };
};

export const generateProductSchema = ({ product, city = null, canonicalUrl = '' }) => {
  if (!product) return null;

  const productName = city ? `${product.name} in ${city.name}` : product.name;
  const description = (product.metaDescription || product.shortDesc || product.description || '').replace(/<[^>]*>/g, ' ').trim();
  const imageUrl = product.images?.[0]?.url || product.image || '/images/gallery/mfg-1.jpg';
  const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${BASE_URL}${imageUrl}`;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productName,
    description,
    image: fullImageUrl,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: 'RP Storage Solution',
    },
    manufacturer: {
      '@id': `${BASE_URL}/#organization`,
    },
  };

  if (canonicalUrl) {
    schema.url = canonicalUrl;
  }

  return schema;
};

export const generateLocalBusinessSchema = ({ city, localInfo = null, canonicalUrl = '' }) => {
  if (!city || !city.isVerified) return null;

  const hubName = localInfo?.hubName || `RP Storage Solution - ${city.name} Service Hub`;
  const address = localInfo?.warehouseAddress || `${city.name} Industrial Area, ${city.state}`;
  const phone = localInfo?.servicePhone || '+91-9990023436';

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: hubName,
    url: canonicalUrl || `${BASE_URL}/locations/${city.slug}`,
    telephone: phone,
    parentOrganization: {
      '@id': `${BASE_URL}/#organization`,
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: city.state,
      },
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressLocality: city.name,
      addressRegion: city.state,
      addressCountry: 'IN',
    },
  };
};
