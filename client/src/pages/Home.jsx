import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, ArrowRight, Truck, Clock, ShieldCheck, Heart, 
  Sparkles, CheckCircle2, Play, ChevronLeft, ChevronRight, MessageCircle, Utensils, Star, Leaf
} from 'lucide-react';
import FoodCard from '../components/FoodCard';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';
import { useCart } from '../context/CartContext';

const Home = ({ onOpenAuthModal }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Popular Picks mockup items with badges matching user design
  const FEATURED_PICKS = [
    {
      id: 13,
      name: 'MASALA DOSA',
      price: 120,
      description: 'Crispy dosa with special potato masala.',
      image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
      badge: 'BESTSELLER',
      badgeColor: '#EA580C',
      rating: 4.8
    },
    {
      id: 41,
      name: 'IDLI SAMBAR',
      price: 70,
      description: 'Soft idlis served with hot sambar & chutney.',
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      badge: 'HEALTHY CHOICE',
      badgeColor: '#0F3825',
      rating: 4.9
    },
    {
      id: 15,
      name: 'MYSORE DOSA',
      price: 130,
      description: 'Crispy dosa with spicy Mysore chutney.',
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
      badge: "CHEF'S SPECIAL",
      badgeColor: '#EA580C',
      rating: 4.8
    },
    {
      id: 39,
      name: 'MEDU VADA',
      price: 80,
      description: 'Crispy medu vada served with sambar.',
      image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      badge: 'MOST LOVED',
      badgeColor: '#0F3825',
      rating: 4.8
    }
  ];

  return (
    <div style={{ backgroundColor: '#FDFBF7', color: '#18181B', fontFamily: 'var(--font-body)' }}>
      <SEOHead title="Dosa Junction - Pure South Indian Restaurant Sinnar" />

      {/* SECTION 1: HERO BANNER (Dark textured wooden banner with giant Dosa platter image) */}
      <section 
        style={{ 
          background: 'linear-gradient(135deg, #0B0F0D 0%, #151D18 50%, #0B0F0D 100%)', 
          color: '#FFFFFF', 
          padding: '3.5rem 0 4.5rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative background glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'rgba(234, 88, 12, 0.12)', filter: 'blur(90px)', pointerEvents: 'none' }} />

        <div className="container">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            {/* Left Content */}
            <div>
              <div style={{ fontFamily: 'cursive', fontSize: '1.6rem', color: '#FFC83B', marginBottom: '0.2rem', fontStyle: 'italic' }}>
                The Real Taste of
              </div>
              <h1 
                style={{ 
                  fontFamily: 'var(--font-heading)', 
                  fontSize: 'clamp(2.8rem, 5vw, 4.2rem)', 
                  fontWeight: 900, 
                  letterSpacing: '2px',
                  color: '#FFFFFF',
                  lineHeight: 1.05,
                  marginBottom: '0.8rem',
                  textTransform: 'uppercase'
                }}
              >
                SOUTH INDIA
              </h1>
              <div 
                style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: 900, 
                  color: '#EA580C', 
                  letterSpacing: '3px', 
                  textTransform: 'uppercase',
                  marginBottom: '1.2rem'
                }}
              >
                CRISPY. HEALTHY. DELICIOUS.
              </div>
              <p style={{ color: '#D4D4D8', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '480px', marginBottom: '2rem' }}>
                From crispy Dosas to soft Idlis, we serve happiness on your plate. Freshly prepared with traditional recipes every day.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                <Link
                  to="/menu"
                  style={{
                    backgroundColor: '#EA580C',
                    color: '#FFFFFF',
                    padding: '0.85rem 1.8rem',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(234, 88, 12, 0.45)',
                    transition: 'all 0.2s'
                  }}
                >
                  <ShoppingBag size={18} />
                  <span>ORDER NOW</span>
                </Link>

                <a
                  href="https://wa.me/917020758779"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    color: '#FFFFFF',
                    padding: '0.85rem 1.6rem',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    letterSpacing: '0.5px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'
                  }}
                >
                  <MessageCircle size={18} color="#25D366" />
                  <span>WHATSAPP ORDER</span>
                </a>
              </div>

              {/* Feature Badges */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#E4E4E7', fontWeight: 700 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Leaf size={14} color="#22C55E" />
                  </div>
                  <span>100% Pure Veg</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#E4E4E7', fontWeight: 700 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #FFC83B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={14} color="#FFC83B" />
                  </div>
                  <span>Hygienic & Clean</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#E4E4E7', fontWeight: 700 }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={14} color="#EA580C" />
                  </div>
                  <span>Made with Love</span>
                </div>
              </div>
            </div>

            {/* Right Banner Image */}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div 
                style={{ 
                  borderRadius: '24px', 
                  overflow: 'hidden', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  border: '3px solid rgba(255, 200, 59, 0.3)',
                  position: 'relative'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80"
                  alt="Crispy South Indian Dosa Platter"
                  style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.02)' }}
                />
              </div>

              {/* Slider Arrows */}
              <button 
                aria-label="Previous banner slide"
                style={{ position: 'absolute', left: '-15px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#0B0F0D', border: '1px solid #EA580C', color: '#FFFFFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.4)' }}
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                aria-label="Next banner slide"
                style={{ position: 'absolute', right: '-15px', top: '50%', transform: 'translateY(-50%)', backgroundColor: '#0B0F0D', border: '1px solid #EA580C', color: '#FFFFFF', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.4)' }}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURE VALUE PROPS BAR (White rounded card with 4 props) */}
      <section style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        <div className="container">
          <div 
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '16px', 
              padding: '1.8rem 1.5rem', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              border: '1px solid #EAE3D2',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {[
              { icon: Truck, title: 'FREE DELIVERY', subtitle: 'On orders above ₹199', color: '#EA580C' },
              { icon: Clock, title: 'FAST SERVICE', subtitle: 'Quick & Fresh', color: '#0F3825' },
              { icon: Leaf, title: 'FRESH INGREDIENTS', subtitle: 'Daily Sourced', color: '#D97706' },
              { icon: ShieldCheck, title: 'SECURE PAYMENT', subtitle: '100% Safe & Secure', color: '#22C55E' }
            ].map((prop, idx) => {
              const IconComp = prop.icon;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div 
                    style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(234, 88, 12, 0.08)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0 
                    }}
                  >
                    <IconComp size={24} color={prop.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0F3825', letterSpacing: '0.5px' }}>
                      {prop.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#71717A', fontWeight: 500 }}>
                      {prop.subtitle}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: OUR POPULAR PICKS (Grid of popular food cards) */}
      <section style={{ padding: '4.5rem 0 3.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0F3825', fontFamily: 'var(--font-heading)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>
              🌿 OUR POPULAR PICKS 🌿
            </h2>
            <p style={{ fontFamily: 'cursive', fontSize: '1.2rem', color: '#D97706', margin: 0 }}>
              Your all-time favorite South Indian dishes
            </p>
          </div>

          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
              gap: '1.8rem',
              marginBottom: '2.5rem'
            }}
          >
            {FEATURED_PICKS.map((dish) => (
              <div 
                key={dish.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #EAE3D2',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Top Badge */}
                <div 
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: dish.badgeColor,
                    color: '#FFFFFF',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    letterSpacing: '0.5px',
                    zIndex: 2,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                  }}
                >
                  👑 {dish.badge}
                </div>

                {/* Favorite Heart Icon */}
                <button 
                  aria-label="Add to favorites"
                  style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2 }}
                >
                  <Heart size={16} color="#71717A" />
                </button>

                {/* Dish Photo */}
                <div style={{ height: '170px', overflow: 'hidden' }}>
                  <img
                    src={dish.image_url}
                    alt={dish.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                {/* Dish Content */}
                <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F3825', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {dish.name}
                    </h3>
                    <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#EA580C' }}>
                      ₹{dish.price}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: '#71717A', lineHeight: 1.4, margin: '0 0 1rem 0', flex: 1 }}>
                    {dish.description}
                  </p>

                  <button
                    onClick={() => {
                      addToCart(dish);
                      navigate('/cart');
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '0.65rem 0',
                      borderRadius: '25px',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 10px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link
              to="/menu"
              style={{
                backgroundColor: '#0F3825',
                color: '#FFFFFF',
                padding: '0.8rem 2.2rem',
                borderRadius: '30px',
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '0.8px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(15, 56, 37, 0.3)'
              }}
            >
              <span>VIEW FULL MENU</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: SPECIAL OFFER PROMOTIONAL BANNER */}
      <section style={{ padding: '1rem 0 4rem 0' }}>
        <div className="container">
          <div 
            style={{ 
              backgroundColor: '#0F3825', 
              borderRadius: '20px', 
              padding: '2.5rem 2rem',
              color: '#FFFFFF',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              alignItems: 'center',
              boxShadow: '0 12px 35px rgba(15, 56, 37, 0.35)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Food Image */}
            <div style={{ textAlign: 'center' }}>
              <img
                src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80"
                alt="Special Offer South Indian Platter"
                style={{ width: '220px', height: '220px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #FFC83B', boxShadow: '0 10px 25px rgba(0,0,0,0.4)' }}
              />
            </div>

            {/* Offer Text */}
            <div>
              <div style={{ fontFamily: 'cursive', fontSize: '1.8rem', color: '#FFC83B', fontStyle: 'italic', marginBottom: '2px' }}>
                Special OFFER
              </div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#FFFFFF', margin: '0 0 8px 0', lineHeight: 1.1 }}>
                Get <span style={{ color: '#EA580C' }}>10% OFF</span>
              </h2>
              <p style={{ fontSize: '1rem', color: '#E4E4E7', margin: 0 }}>
                on your first online order! Authentic South Indian taste delivered hot & fresh to your doorstep.
              </p>
            </div>

            {/* Promo Code Box */}
            <div style={{ textAlign: 'center' }}>
              <div 
                style={{ 
                  border: '2px dashed #FFC83B', 
                  borderRadius: '12px', 
                  padding: '1rem', 
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ fontSize: '0.78rem', color: '#D4D4D8', fontWeight: 600 }}>Use Promo Code:</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFC83B', letterSpacing: '2px' }}>DJ10</div>
              </div>

              <Link
                to="/menu"
                style={{
                  backgroundColor: '#EA580C',
                  color: '#FFFFFF',
                  padding: '0.75rem 1.8rem',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  letterSpacing: '0.5px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)'
                }}
              >
                <span>ORDER NOW</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: WHY CHOOSE DOSA JUNCTION? & DID YOU KNOW? & VISIT US GRID */}
      <section style={{ padding: '1rem 0 5rem 0', backgroundColor: '#FDFBF7' }}>
        <div className="container">
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', 
              gap: '2.2rem' 
            }}
          >
            {/* Column 1: Why Choose Dosa Junction? */}
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F3825', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>
                WHY CHOOSE DOSA JUNCTION?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {[
                  { title: 'AUTHENTIC TASTE', desc: 'Traditional recipes with authentic South Indian taste.', color: '#22C55E' },
                  { title: 'QUALITY INGREDIENTS', desc: 'We use only fresh & premium quality ingredients.', color: '#0F3825' },
                  { title: 'HYGIENIC & CLEAN', desc: 'We maintain the highest standards of cleanliness.', color: '#EA580C' },
                  { title: 'FRIENDLY SERVICE', desc: 'Warm hospitality and customer satisfaction.', color: '#D97706' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(15, 56, 37, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                      <CheckCircle2 size={18} color={item.color} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0F3825', letterSpacing: '0.5px' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#71717A', lineHeight: 1.4 }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Did You Know? Chalkboard Card */}
            <div>
              <div 
                style={{ 
                  backgroundColor: '#0B0F0D', 
                  border: '2px solid #D97706', 
                  borderRadius: '16px', 
                  padding: '2rem 1.8rem',
                  color: '#FFFFFF',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }}
              >
                <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#FFC83B', textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px', fontFamily: 'var(--font-heading)' }}>
                  DID YOU KNOW?
                </h4>
                <p style={{ fontSize: '0.95rem', color: '#E4E4E7', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                  "Fermented food like Dosa and Idli is not only tasty but also extremely good for your gut health and digestion!"
                </p>
              </div>
            </div>

            {/* Column 3: Visit Us Video Thumbnail Card */}
            <div>
              <div 
                style={{ 
                  borderRadius: '16px', 
                  overflow: 'hidden', 
                  border: '1px solid #EAE3D2', 
                  boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                <div 
                  style={{ 
                    height: '180px', 
                    backgroundImage: 'url(https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.45)', position: 'absolute', inset: 0 }} />
                  <div 
                    style={{ 
                      position: 'relative', 
                      width: '54px', 
                      height: '54px', 
                      borderRadius: '50%', 
                      backgroundColor: 'rgba(234, 88, 12, 0.9)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      boxShadow: '0 0 20px rgba(234, 88, 12, 0.6)',
                      cursor: 'pointer'
                    }}
                  >
                    <Play size={24} fill="#FFFFFF" style={{ marginLeft: '3px' }} />
                  </div>
                </div>

                <div style={{ padding: '1.2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F3825', margin: '0 0 4px 0', fontFamily: 'var(--font-heading)' }}>
                    VISIT US
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#71717A', lineHeight: 1.5, margin: 0 }}>
                    Experience the best South Indian food ambience with your family & friends at Sinnar.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
