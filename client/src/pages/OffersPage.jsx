import React, { useState, useEffect } from 'react';
import OfferCard from '../components/OfferCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';

const OffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const res = await apiService.getOffers();
      if (res.offers) {
        setOffers(res.offers);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="Special Offers & Promo Codes | Dakshin Bhavan" />

      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            Exclusive Dining & Delivery Deals
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            Special Offers & Coupons
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Copy promo codes below and apply them in your shopping cart or checkout for instant discount savings.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={3} type="card" />
        ) : offers.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active offers currently"
            description="Check back soon for new weekend promotions and festival discounts."
            actionText="Explore Food Menu"
            actionLink="/menu"
          />
        )}

      </div>
    </div>
  );
};

export default OffersPage;
