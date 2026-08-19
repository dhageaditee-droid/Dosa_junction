import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  Award, 
  Leaf, 
  Truck, 
  UtensilsCrossed, 
  Phone, 
  MapPin, 
  Clock, 
  Mail, 
  Send, 
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const { t, translateDish, language } = useLanguage();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFoodModal, setSelectedFoodModal] = useState(null);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [sendingContact, setSendingContact] = useState(false);

  // Popular Dishes Carousel Ref
  const popularRef = useRef(null);
  const testimonialRef = useRef(null);

  // Sample Featured Popular Dishes (matching image mockup)
  const popularDishesData = [
    {
      id: 10,
      name: 'Masala Dosa',
      description: 'Crispy dosa with spicy potato masala',
      price: 129,
      rating: 4.8,
      is_veg: true,
      is_bestseller: true,
      image_url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 11,
      name: 'Mysore Masala Dosa',
      description: 'Spicy dosa with mysore masala',
      price: 149,
      rating: 4.7,
      is_veg: true,
      is_bestseller: true,
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 12,
      name: 'Idli Sambar',
      description: 'Soft idlis served with hot sambar & chutney',
      price: 79,
      rating: 4.9,
      is_veg: true,
      is_bestseller: false,
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 13,
      name: 'Medu Vada',
      description: 'Crispy medu vada with sambar & chutney',
      price: 79,
      rating: 4.8,
      is_veg: true,
      is_bestseller: false,
      image_url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 14,
      name: 'Uttapam',
      description: 'Soft & tasty uttapam with veggies',
      price: 109,
      rating: 4.6,
      is_veg: true,
      is_bestseller: false,
      image_url: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'Filter Coffee',
      description: 'South Indian filter coffee made fresh',
      price: 49,
      rating: 4.9,
      is_veg: true,
      is_bestseller: true,
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const testimonials = [
    {
      name: 'Priya S.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      comment: 'Best dosa I ever had! Authentic taste and super fresh.',
      rating: 5
    },
    {
      name: 'Rahul K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      comment: 'Filter coffee is just wow! Feels like South India.',
      rating: 5
    },
    {
      name: 'Neha M.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      comment: 'Quick delivery and amazing food. Highly recommended!',
      rating: 5
    }
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await apiService.getMenu();
        if (res && res.items && res.items.length > 0) {
          setMenuItems(res.items);
        } else {
          setMenuItems(popularDishesData);
        }
      } catch (err) {
        setMenuItems(popularDishesData);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleScrollPopular = (direction) => {
    if (popularRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      popularRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleScrollTestimonials = (direction) => {
    if (testimonialRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      testimonialRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      addToast('Please fill out all fields in the contact form.', 'warning');
      return;
    }
    setSendingContact(true);
    setTimeout(() => {
      setSendingContact(false);
      addToast('Thank you! Your message has been sent successfully.', 'success');
      setContactForm({ name: '', email: '', message: '' });
    }, 1000);
  };

  const displayDishes = menuItems.length > 0 ? menuItems.slice(0, 6) : popularDishesData;

  return (
    <div style={{ backgroundColor: '#FAF7F0', color: '#1E293B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SEOHead title="Dosa Junction | Authentic Taste of South India" />

      {/* ================= HERO SECTION ================= */}
      <section
        style={{
          position: 'relative',
          padding: '3rem 0 4rem 0',
          background: 'linear-gradient(180deg, #FBF8F1 0%, #F5EFE3 100%)',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2.5rem',
              alignItems: 'center'
            }}
            className="hero-grid"
          >
            {/* Left Content Column */}
            <div>
              {/* Top Traditional Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#EFF6E0',
                  border: '1px solid #A3E635',
                  color: '#15803D',
                  padding: '6px 16px',
                  borderRadius: '30px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                <Leaf size={15} color="#16A34A" />
                <span>100% Traditional South Indian Recipes</span>
              </div>

              {/* Main Headline */}
              <h1
                style={{
                  fontSize: '3.2rem',
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  color: '#064E3B',
                  marginBottom: '1.2rem'
                }}
              >
                Taste the Tradition <br />
                of <span style={{ color: '#D97706' }}>South India</span>
              </h1>

              {/* Subheadline */}
              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  marginBottom: '2rem',
                  maxWidth: '500px'
                }}
              >
                Crispy Dosas, Soft Idlis & Authentic Flavours Made Fresh Every Day.
              </p>

              {/* Primary Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link
                  to="/menu"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    padding: '12px 26px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    textDecoration: 'none',
                    boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <span>Explore Menu</span>
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/menu"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    backgroundColor: '#064E3B',
                    color: '#FFFFFF',
                    padding: '12px 26px',
                    borderRadius: '30px',
                    fontWeight: 800,
                    fontSize: '0.98rem',
                    textDecoration: 'none',
                    boxShadow: '0 6px 18px rgba(6, 78, 59, 0.3)',
                    transition: 'transform 0.2s'
                  }}
                >
                  <ShoppingCart size={18} />
                  <span>Order Now</span>
                </Link>
              </div>

              {/* Feature Pills Row */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Leaf size={16} color="#16A34A" />
                  <span>Pure Veg</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} color="#D97706" />
                  <span>Fresh Ingredients</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} color="#0284C7" />
                  <span>Fast Delivery</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Column */}
            <div style={{ position: 'relative', textAlign: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
                  border: '4px solid #FFFFFF'
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=1000&q=80"
                  alt="South Indian Dosa Platter"
                  style={{ width: '100%', height: 'auto', display: 'block', transform: 'scale(1.02)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= POPULAR SOUTH INDIAN DISHES ================= */}
      <section style={{ padding: '4rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          
          {/* Section Header with Slider Navigation Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ flexGrow: 1, textAlign: 'center' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 700 }}>
                — POPULAR SOUTH INDIAN DISHES —
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleScrollPopular('left')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <ChevronLeft size={20} color="#475569" />
              </button>
              <button
                onClick={() => handleScrollPopular('right')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <ChevronRight size={20} color="#475569" />
              </button>
            </div>
          </div>

          {/* Horizontally Scrollable Carousel Grid */}
          <div
            ref={popularRef}
            style={{
              display: 'flex',
              gap: '1.25rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              paddingBottom: '1rem',
              scrollbarWidth: 'none'
            }}
            className="no-scrollbar"
          >
            {displayDishes.map((dish) => {
              const translatedName = translateDish(dish.name);
              return (
                <div
                  key={dish.id}
                  style={{
                    flexShrink: 0,
                    width: '240px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s, boxShadow 0.2s'
                  }}
                  className="pop-dish-card"
                >
                  <div>
                    <div style={{ width: '100%', height: '140px', borderRadius: '12px', overflow: 'hidden', marginBottom: '10px' }}>
                      <img
                        src={dish.image_url || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=500&q=80'}
                        alt={translatedName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#064E3B', margin: '0 0 4px 0' }}>
                      {translatedName}
                    </h4>
                    <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 10px 0', lineHeight: 1.4, height: '34px', overflow: 'hidden' }}>
                      {dish.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#064E3B' }}>
                      ₹{dish.price}
                    </span>

                    <button
                      onClick={() => {
                        addToCart(dish, 1);
                        addToast(`${translatedName} added to cart!`, 'success');
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: '1.5px solid #D97706',
                        backgroundColor: '#FFF9ED',
                        color: '#D97706',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <ShoppingCart size={13} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>



      {/* ================= WHY CHOOSE DOSA JUNCTION? ================= */}
      <section style={{ padding: '3rem 0 4rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <span style={{ color: '#94A3B8', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 700 }}>
              — WHY CHOOSE DOSA JUNCTION? —
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {[
              {
                icon: UtensilsCrossed,
                title: '100% Authentic',
                desc: 'Traditional recipes passed down through generations.'
              },
              {
                icon: Leaf,
                title: 'Fresh Ingredients',
                desc: 'We use only the freshest and finest ingredients.'
              },
              {
                icon: CheckCircle2,
                title: 'Pure Veg Restaurant',
                desc: '100% vegetarian with hygienic preparation.'
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                desc: 'Hot & fresh food delivered to your doorstep.'
              }
            ].map((feature, idx) => {
              const IconComp = feature.icon;
              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FAF7F0',
                    borderRadius: '16px',
                    padding: '1.8rem 1.2rem',
                    textAlign: 'center',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                  }}
                >
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      backgroundColor: '#064E3B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.2rem auto',
                      boxShadow: '0 4px 10px rgba(6, 78, 59, 0.25)'
                    }}
                  >
                    <IconComp size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064E3B', marginBottom: '0.5rem' }}>
                    {feature.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= OUR STORY & GALLERY ================= */}
      <section style={{ padding: '4rem 0', backgroundColor: '#FAF7F0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.3fr',
              gap: '3rem',
              alignItems: 'center'
            }}
            className="story-grid"
          >
            {/* Left Story Text */}
            <div>
              <h2 style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#064E3B', marginBottom: '1rem' }}>
                Our Story
              </h2>
              <p style={{ fontSize: '1rem', color: '#475569', lineHeight: 1.7, marginBottom: '1.8rem' }}>
                Dosa Junction is born out of a passion for authentic South Indian food. We bring you the true taste of tradition with love and quality in every dish.
              </p>

              <Link
                to="/about"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#064E3B',
                  color: '#FFFFFF',
                  padding: '10px 22px',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(6, 78, 59, 0.3)'
                }}
              >
                <span>Read More</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Photo Gallery Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {[
                'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=400&q=80',
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80'
              ].map((imgUrl, i) => (
                <div key={i} style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  <img src={imgUrl} alt={`Gallery item ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHAT OUR CUSTOMERS SAY ================= */}
      <section style={{ padding: '4rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ flexGrow: 1, textAlign: 'center' }}>
              <span style={{ color: '#94A3B8', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 700 }}>
                — WHAT OUR CUSTOMERS SAY —
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleScrollTestimonials('left')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronLeft size={20} color="#475569" />
              </button>
              <button
                onClick={() => handleScrollTestimonials('right')}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ChevronRight size={20} color="#475569" />
              </button>
            </div>
          </div>

          <div
            ref={testimonialRef}
            style={{
              display: 'flex',
              gap: '1.5rem',
              overflowX: 'auto',
              scrollBehavior: 'smooth',
              paddingBottom: '1rem',
              scrollbarWidth: 'none'
            }}
            className="no-scrollbar"
          >
            {testimonials.map((test, idx) => (
              <div
                key={idx}
                style={{
                  flexShrink: 0,
                  width: '320px',
                  backgroundColor: '#FAF7F0',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'flex-start'
                }}
              >
                <img
                  src={test.avatar}
                  alt={test.name}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
                />

                <div>
                  <div style={{ display: 'flex', gap: '2px', color: '#F59E0B', marginBottom: '6px' }}>
                    {Array.from({ length: test.rating }).map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" />
                    ))}
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#334155', fontStyle: 'italic', marginBottom: '8px', lineHeight: 1.5 }}>
                    "{test.comment}"
                  </p>

                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#064E3B' }}>
                    — {test.name}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= VISIT US & CONTACT US ================= */}
      <section style={{ padding: '4rem 0 5rem 0', backgroundColor: '#FAF7F0' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr 1.2fr',
              gap: '2rem',
              alignItems: 'start'
            }}
            className="contact-grid"
          >
            {/* Column 1: Visit Us Details */}
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', marginBottom: '1rem' }}>
                Visit Us
              </h3>
              <p style={{ fontWeight: 800, fontSize: '1.05rem', margin: '0 0 0.8rem 0', color: '#064E3B' }}>
                Dosa Junction
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.88rem', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <MapPin size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>Sinnar Gaurav, Near Panchvati Hotel, Sinnar, Maharashtra 422103</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={18} color="#D97706" />
                  <span>+91 70207 58779</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} color="#D97706" />
                  <span>Mon - Sun: 7:00 AM - 10:00 PM</span>
                </div>
              </div>
            </div>

            {/* Column 2: Google Maps Card */}
            <div>
              <div
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                  position: 'relative'
                }}
              >
                <iframe
                  title="Dosa Junction Location Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3752.428489240822!2d73.9925!3d19.8456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDUwJzg0LjIiTiA3M8KwNTknMzMuMCJF!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin"
                  width="100%"
                  height="220"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                />
                <a
                  href="https://maps.google.com/?q=Sinnar+Gaurav+Near+Panchvati+Hotel+Sinnar+Maharashtra+422103"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#064E3B',
                    color: '#FFFFFF',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    textDecoration: 'none',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Column 3: Contact Us Form */}
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', marginBottom: '1rem' }}>
                Contact Us
              </h3>

              <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <textarea
                  placeholder="Your Message"
                  rows={3}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />

                <button
                  type="submit"
                  disabled={sendingContact}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    padding: '10px 20px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
                  }}
                >
                  <span>{sendingContact ? 'Sending...' : 'Send Message'}</span>
                  <Send size={15} />
                </button>
              </form>
            </div>
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

      {/* Responsive Breakpoint CSS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .pop-dish-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 22px rgba(0,0,0,0.1) !important;
        }
        @media (max-width: 900px) {
          .hero-grid, .story-grid {
            grid-template-columns: 1fr !important;
          }
          .offer-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .desktop-save-badge {
            display: none !important;
          }
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
