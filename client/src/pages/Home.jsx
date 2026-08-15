import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Award, Flame, Clock, ArrowRight, Star, CheckCircle2, Coffee, Sparkles } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import OfferCard from '../components/OfferCard';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [popularDishes, setPopularDishes] = useState([]);
  const [bestsellerDishes, setBestsellerDishes] = useState([]);
  const [recommendedDishes, setRecommendedDishes] = useState([]);
  const [offers, setOffers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [selectedFoodModal, setSelectedFoodModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const circularCategories = [
    { name: 'Dosa', slug: 'dosa', img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=300&q=80' },
    { name: 'Idli', slug: 'idli', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80' },
    { name: 'Vada', slug: 'vada', img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=300&q=80' },
    { name: 'Uttapam', slug: 'uttapam', img: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=300&q=80' },
    { name: 'Meals', slug: 'south-indian-meals', img: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=300&q=80' },
    { name: 'Rice', slug: 'rice', img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=300&q=80' },
    { name: 'Snacks', slug: 'snacks', img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80' },
    { name: 'Desserts', slug: 'desserts', img: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=300&q=80' },
    { name: 'Beverages', slug: 'beverages', img: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=300&q=80' },
    { name: 'Filter Coffee', slug: 'filter-coffee', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=300&q=80' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuRes, offersRes, reviewsRes] = await Promise.all([
          apiService.getMenu(),
          apiService.getOffers().catch(() => ({ offers: [] })),
          apiService.getReviews().catch(() => ({ reviews: [] }))
        ]);

        if (menuRes.items && menuRes.items.length > 0) {
          const items = menuRes.items;
          setPopularDishes(items.slice(0, 4));
          setBestsellerDishes(items.filter(i => i.is_bestseller).slice(0, 4));
          setRecommendedDishes(items.filter(i => i.is_featured || i.rating >= 4.7).slice(0, 4));
        }

        if (offersRes.offers) setOffers(offersRes.offers.slice(0, 3));
        if (reviewsRes.reviews) setReviews(reviewsRes.reviews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleOpenDetailModal = async (foodItem) => {
    try {
      const res = await apiService.getMenuItem(foodItem.id);
      if (res.success) {
        setSelectedFoodModal(res.item);
      } else {
        setSelectedFoodModal(foodItem);
      }
    } catch (e) {
      setSelectedFoodModal(foodItem);
    }
  };

  return (
    <div>
      <SEOHead title="Dakshin Bhavan - Authentic South Indian Food & Filter Coffee" />

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '82vh',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.85) 100%), url("https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1800&q=80") center/cover no-repeat',
        display: 'flex',
        alignItems: 'center',
        color: '#fff',
        padding: '3.5rem 0'
      }}>
        <div className="container">
          <div style={{ maxWidth: '720px' }}>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(217, 119, 6, 0.22)',
              border: '1px solid rgba(217, 119, 6, 0.45)',
              color: '#F59E0B',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '1.5rem'
            }}>
              <Award size={16} /> 100% Traditional South Indian Recipes
            </div>

            <h1 style={{
              fontSize: '3.4rem',
              fontFamily: 'var(--font-heading)',
              lineHeight: 1.15,
              marginBottom: '1rem',
              color: '#FFFFFF'
            }}>
              Authentic South Indian Food, <span style={{ color: 'var(--color-gold)' }}>Delivered Fresh</span>
            </h1>

            <p style={{
              fontSize: '1.15rem',
              color: '#E2E8F0',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              Traditional recipes, fresh ingredients and unforgettable South Indian flavours. Experience golden crispy dosas, fluffy idlis, and authentic filter coffee delivered hot to your doorstep.
            </p>

            {/* Search Bar */}
            <form 
              onSubmit={handleSearchSubmit} 
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                padding: '6px 8px 6px 18px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
                maxWidth: '560px',
                marginBottom: '1.8rem'
              }}
            >
              <Search size={22} color="#64748B" style={{ flexShrink: 0 }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for dosa, idli, vada, coffee..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  padding: '10px 12px',
                  fontSize: '1rem',
                  color: '#0F172A',
                  backgroundColor: 'transparent'
                }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.4rem', borderRadius: '12px', fontWeight: 800 }}
              >
                Search
              </button>
            </form>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <Link to="/menu" className="btn btn-primary" style={{ padding: '0.75rem 1.8rem' }}>
                Explore Menu <ArrowRight size={18} />
              </Link>
              <Link to="/menu" className="btn btn-outline" style={{ borderColor: '#FFFFFF', color: '#FFFFFF', padding: '0.75rem 1.8rem' }}>
                Order Now
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* What's on your mind? Circular Category Cards */}
      <section className="section-padding" style={{ backgroundColor: '#FFFFFF', padding: '3rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)' }}>
              What's on your mind?
            </h2>
            <Link to="/menu" style={{ color: 'var(--color-gold)', fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem' }}>
              See All Menu →
            </Link>
          </div>

          <div style={{
            display: 'flex',
            gap: '1.5rem',
            overflowX: 'auto',
            paddingBottom: '1rem',
            scrollSnapType: 'x mandatory'
          }}>
            {circularCategories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/menu?category=${cat.slug}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textDecoration: 'none',
                  flexShrink: 0,
                  width: '90px',
                  scrollSnapAlign: 'start'
                }}
              >
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginBottom: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid var(--color-gold)',
                  transition: 'transform 0.2s'
                }}>
                  <img
                    src={cat.img}
                    alt={cat.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-emerald)', textAlign: 'center' }}>
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Dishes */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Customer Favorites</span>
            <h2 className="section-title">Popular Dishes</h2>
            <p className="section-desc">Handcrafted South Indian delicacies prepared fresh with stone-ground batter and pure ghee.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {popularDishes.map((dish) => (
              <FoodCard key={dish.id} item={dish} onClickDetail={handleOpenDetailModal} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestsellerDishes.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} /> Top Rated
              </span>
              <h2 className="section-title">Best Sellers</h2>
              <p className="section-desc">The most ordered dishes loved by thousands of South Indian food enthusiasts.</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '1.5rem'
            }}>
              {bestsellerDishes.map((dish) => (
                <FoodCard key={dish.id} item={dish} onClickDetail={handleOpenDetailModal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Today's Offers */}
      {offers.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: 'var(--color-cream-alt)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">Promotions & Coupons</span>
              <h2 className="section-title">Today's Offers</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {offers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recommended For You */}
      {recommendedDishes.length > 0 && (
        <section className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-subtitle">Curated Selection</span>
              <h2 className="section-title">Recommended For You</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
              gap: '1.5rem'
            }}>
              {recommendedDishes.map((dish) => (
                <FoodCard key={dish.id} item={dish} onClickDetail={handleOpenDetailModal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-cream)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">The Dakshin Quality</span>
            <h2 className="section-title">Why Choose Us</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {[
              { title: 'Stone-Ground Batter', desc: 'Fermented naturally over 12 hours for light digestion & optimal crunch.' },
              { title: 'Pure A2 Cow Ghee', desc: 'Golden dosas roasted lavishly in pure ghee for unmatchable richness.' },
              { title: 'Kumbakonam Filter Coffee', desc: 'Brewed using freshly roasted Chikmagalur coffee beans in traditional brass tumblers.' },
              { title: 'Fast & Hygienic Packing', desc: 'Hot piping food packed in eco-friendly tamper-proof banana leaf boxes.' }
            ].map((item, idx) => (
              <div key={idx} style={{
                padding: '1.5rem',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--color-border)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}>
                <CheckCircle2 size={30} color="var(--color-gold)" style={{ marginBottom: '0.8rem' }} />
                <h4 style={{ fontSize: '1.1rem', color: 'var(--color-emerald)', fontWeight: 800, marginBottom: '0.4rem' }}>{item.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="section-padding" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">Real Feedback</span>
            <h2 className="section-title">Customer Reviews</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {(reviews.length > 0 ? reviews : [
              { id: 1, customer_name: 'Ramesh Kumar', rating: 5, comment: 'The Mysore Masala Dosa is out of this world! Crunchy, authentic red chutney and aromatic ghee.' },
              { id: 2, customer_name: 'Ananya S', rating: 5, comment: 'Filter coffee served hot in brass tumbler! Reminds me of Bangalore morning breakfast joints.' },
              { id: 3, customer_name: 'Venkatesh Rao', rating: 5, comment: 'Feather soft idlis and crisp Medu Vadas. Piping hot sambar delivered fast.' }
            ]).map((rev) => (
              <div key={rev.id} style={{
                backgroundColor: 'var(--color-cream-alt)',
                padding: '1.5rem',
                borderRadius: '16px',
                border: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', gap: '3px', color: '#D97706', marginBottom: '0.75rem' }}>
                  {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                    <Star key={i} size={16} fill="#D97706" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', fontStyle: 'italic', marginBottom: '1rem', lineHeight: 1.5 }}>
                  "{rev.comment}"
                </p>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-emerald)' }}>
                  — {rev.customer_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Food Details Modal */}
      {selectedFoodModal && (
        <FoodDetailsModal
          item={selectedFoodModal}
          onClose={() => setSelectedFoodModal(null)}
          onSelectRelated={(related) => handleOpenDetailModal(related)}
        />
      )}

    </div>
  );
};

export default Home;
