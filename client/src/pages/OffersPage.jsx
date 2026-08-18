import React, { useState, useEffect } from 'react';
import OfferCard from '../components/OfferCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';

const SINGLE_OFFER = [
  {
    id: 1,
    title: 'Buy 5 Ghee Namma South Special Dosa & Get 1 Dosa Free!',
    description: 'Order 5 Ghee Namma South Special Dosa and get 1 Dosa (Worth ₹125) absolutely FREE!',
    code: 'FREEDOSA125',
    discount_percentage: 0,
    discount_amount: 125,
    min_order_amount: 625,
    image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    end_date: '2026-12-31'
  }
];

const OffersPage = () => {
  const [offers, setOffers] = useState(SINGLE_OFFER);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await apiService.getOffers();
      if (res.offers && res.offers.length > 0) {
        setOffers(res.offers);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', padding: '3rem 0 5rem 0', minHeight: '85vh' }}>
      <SEOHead title="Special Offers & Promo Codes | Dosa Junction" />

      <div className="container">
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            Exclusive Restaurant Special Offer
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            Special Combo Offer
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
            Enjoy our special Dosa Junction promotion! Use promo code below during checkout.
          </p>
        </div>

        {loading ? (
          <SkeletonLoader count={1} type="card" />
        ) : offers.length > 0 ? (
          <div style={{
            maxWidth: '520px',
            margin: '0 auto'
          }}>
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active offers currently"
            description="Check back soon for new promotions."
            actionText="Explore Food Menu"
            actionLink="/menu"
          />
        )}

      </div>
    </div>
  );
};

export default OffersPage;
