import React, { useEffect } from 'react';

const SEOHead = ({ title, description, canonical, schema }) => {
  useEffect(() => {
    // 1. Update Title
    const defaultTitle = 'Dosa Junction | Authentic Taste of South India';
    document.title = title ? `${title} | Dosa Junction` : defaultTitle;

    // 2. Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content =
      description ||
      'Experience authentic South Indian cuisine at Dosa Junction. Serving crispy Masala Dosas, fluffy Idlis, Medu Vadas, and Degree Filter Coffee.';

    // 3. Schema.org Restaurant Structured Data
    const restaurantSchema = schema || {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: 'Dosa Junction South Indian Restaurant',
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1200&q=80',
      telePhone: '+917020758779',
      email: 'info@dosajunction.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Sinnar Gaurav, Near Panchvati Hotel',
        addressLocality: 'Sinnar',
        addressRegion: 'Maharashtra',
        postalCode: '422103',
        addressCountry: 'IN'
      },
      servesCuisine: 'South Indian',
      priceRange: '₹₹',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '07:00',
          closes: '22:30'
        }
      ]
    };

    let scriptTag = document.getElementById('jsonld-restaurant');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'jsonld-restaurant';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.text = JSON.stringify(restaurantSchema);
  }, [title, description, canonical, schema]);

  return null;
};

export default SEOHead;
