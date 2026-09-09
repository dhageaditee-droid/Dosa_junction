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

  // Featured Popular Dishes (matching image mockup)
  const popularDishesData = [
    {
      id: 5,
      name: 'South Indian Special Combo',
      description: 'Masala Dosa + 1 Pc Idli + 1 Pc Medu Vada + Pineapple Sheera + Chaha',
      price: 149,
      rating: 5.0,
      is_veg: true,
      is_bestseller: true,
      image_url: '/south-indian-special-combo.jpg'
    },
    {
      id: 1,
      name: 'Chaha',
      description: 'Traditional hot spiced Indian tea',
      price: 20,
      rating: 4.8,
      is_veg: true,
      is_bestseller: true,
      image_url: '/chaha.jpg'
    },
    {
      id: 2,
      name: 'Black Tea',
      description: 'Strong aromatic black tea',
      price: 15,
      rating: 4.5,
      is_veg: true,
      is_bestseller: false,
      image_url: '/black-tea.jpg'
    },
    {
      id: 3,
      name: 'Coffee',
      description: 'Authentic South Indian filter coffee',
      price: 25,
      rating: 4.9,
      is_veg: true,
      is_bestseller: true,
      image_url: '/coffee.jpg'
    },
    {
      id: 4,
      name: 'Milk',
      description: 'Fresh hot milk',
      price: 20,
      rating: 4.4,
      is_veg: true,
      is_bestseller: false,
      image_url: '/milk.jpg'
    },
    {
      id: 6,
      name: 'Ghee Namma South Special Dosa',
      description: 'Grand special dosa loaded with pure A2 Ghee & South Indian herbs',
      price: 125,
      rating: 4.9,
      is_veg: true,
      is_bestseller: true,
      image_url: '/ghee-namma-south-special-dosa.jpg'
    },
    {
      id: 14,
      name: 'Masala Dosa',
      description: 'Classic crispy Dosa stuffed with spiced potato masala',
      price: 70,
      rating: 4.8,
      is_veg: true,
      is_bestseller: true,
      image_url: '/masala-dosa.jpg'
    },
    {
      id: 13,
      name: 'Plain Dosa',
      description: 'Golden crisp plain fermented crepe served with chutneys & sambar',
      price: 60,
      rating: 4.6,
      is_veg: true,
      is_bestseller: false,
      image_url: '/plain-dosa.jpg'
    },
    {
      id: 40,
      name: 'Medu Vada 2 Pcs',
      description: 'Crispy golden fried lentil donuts served with coconut chutney & sambar',
      price: 60,
      rating: 4.8,
      is_veg: true,
      is_bestseller: true,
      image_url: '/medu-vada-2-pcs.jpg'
    },
    {
      id: 41,
      name: 'Idli Medu Vada Combo 2 Pcs',
      description: 'Combo of 1 steamed Idli and 1 Medu Vada served with hot sambar',
      price: 40,
      rating: 4.9,
      is_veg: true,
      is_bestseller: true,
      image_url: '/idli-medu-vada-combo.jpg'
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

  const displayDishes = popularDishesData.map(p => {
    const found = menuItems.find(m => String(m.id) === String(p.id) || (m.name && m.name.toLowerCase() === p.name.toLowerCase()));
    return found ? { ...p, ...found, image_url: p.image_url || found.image_url } : p;
  });

  return (
    <div style={{ backgroundColor: '#FAF7F0', color: '#1E293B', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <SEOHead title="Dosa Junction | Authentic Taste of South India" />

      {/* ================= HERO SECTION (FULL PANORAMIC BANNER) ================= */}
      <section
        className="hero-panoramic-section"
        style={{
          position: 'relative',
          minHeight: '640px',
          backgroundImage: "linear-gradient(to right, rgba(28, 16, 8, 0.48) 0%, rgba(28, 16, 8, 0.22) 45%, rgba(0, 0, 0, 0) 100%), url('/hero-full-banner-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          padding: '4.5rem 0',
          color: '#FFFFFF',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '580px' }} className="hero-content-wrapper">
            
            {/* Top Traditional Golden Ribbon Badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#FBBF24',
                color: '#1C1917',
                padding: '7px 18px',
                borderRadius: '30px',
                fontSize: '0.85rem',
                fontWeight: 800,
                marginBottom: '1.6rem',
                boxShadow: '0 4px 16px rgba(251, 191, 36, 0.35)',
                letterSpacing: '0.2px'
              }}
            >
              <Leaf size={16} color="#1C1917" />
              <span>100% Traditional South Indian Recipes</span>
            </div>

            {/* Main Headline: Script Top Line + Bold Gold Second Line */}
            <h1
              style={{
                lineHeight: 1.15,
                marginBottom: '1.2rem'
              }}
            >
              <span
                style={{
                  display: 'block',
                  fontFamily: "'Caveat', cursive, 'Playfair Display', serif",
                  fontSize: 'clamp(3.2rem, 5.5vw, 4.6rem)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '1px',
                  textShadow: '0 3px 14px rgba(0,0,0,0.7)'
                }}
              >
                Taste the Tradition
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontFamily: "var(--font-heading)",
                  fontSize: 'clamp(2.4rem, 4.2vw, 3.5rem)',
                  fontWeight: 800,
                  color: '#FBBF24',
                  textShadow: '0 3px 14px rgba(0,0,0,0.7)'
                }}
              >
                of South India <span style={{ fontSize: '1.8rem' }}>🍃</span>
              </span>
            </h1>

            {/* Subheadline */}
            <p
              style={{
                fontSize: '1.08rem',
                color: '#E2E8F0',
                lineHeight: 1.6,
                marginBottom: '2.4rem',
                maxWidth: '480px',
                fontWeight: 400,
                textShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}
            >
              Crispy Dosas, Soft Idlis & Authentic Flavours Made Fresh Every Day.
            </p>

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', marginBottom: '2.8rem' }}>
              <Link
                to="/menu"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FBBF24',
                  color: '#1C1917',
                  padding: '13px 28px',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.98rem',
                  textDecoration: 'none',
                  boxShadow: '0 6px 20px rgba(251, 191, 36, 0.45)',
                  transition: 'all 0.2s ease'
                }}
              >
                <UtensilsCrossed size={18} color="#1C1917" />
                <span>Explore Menu</span>
                <ArrowRight size={18} color="#1C1917" />
              </Link>

              <Link
                to="/cart"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  border: '1.5px solid rgba(255, 255, 255, 0.65)',
                  color: '#FFFFFF',
                  padding: '13px 28px',
                  borderRadius: '30px',
                  fontWeight: 700,
                  fontSize: '0.98rem',
                  textDecoration: 'none',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease'
                }}
              >
                <ShoppingCart size={18} color="#FFFFFF" />
                <span>Order Now</span>
              </Link>
            </div>

            {/* Feature Pills Row */}
            <div className="hero-features-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.92rem', fontWeight: 700, color: '#F1F5F9', textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Leaf size={18} color="#FBBF24" />
                <span>Pure Veg</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#FBBF24" />
                <span>Fresh Ingredients</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={18} color="#FBBF24" />
                <span>Fast Delivery</span>
              </div>
            </div>

            {/* Dedicated High-Quality Food Platter Photo for Mobile View Only */}
            <div className="hero-mobile-image-container">
              <img
                src="/hero-dosa-platter.jpg"
                alt="Authentic South Indian Dosa Platter"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>

          </div>
        </div>

        {/* Responsive Mobile Stylesheet */}
        <style>{`
          .hero-mobile-image-container {
            display: none;
          }
          @media (max-width: 768px) {
            .hero-panoramic-section {
              background: radial-gradient(ellipse at 50% 15%, #352114 0%, #20130B 60%, #120A05 100%) !important;
              padding: 2.2rem 0 2.5rem 0 !important;
              min-height: auto !important;
            }
            .hero-content-wrapper {
              max-width: 100% !important;
              text-align: center !important;
            }
            .hero-content-wrapper div[style*="inline-flex"] {
              justify-content: center !important;
            }
            .hero-features-row {
              justify-content: center !important;
              gap: 1.2rem !important;
              font-size: 0.85rem !important;
            }
            .hero-content-wrapper > div[style*="flexWrap"] {
              justify-content: center !important;
            }
            .hero-mobile-image-container {
              display: block !important;
              margin-top: 2rem !important;
              border-radius: 20px !important;
              overflow: hidden !important;
              border: 1.5px solid rgba(251, 191, 36, 0.35) !important;
              box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6) !important;
              background-color: #1A1009 !important;
            }
          }
        `}</style>
      </section>

      {/* ================= POPULAR SOUTH INDIAN DISHES ================= */}
      <section style={{ padding: '4.5rem 0 3.5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          
          {/* Section Header: Leaf Icon + Overline + Script Heading + Subtitle */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>🍃</span>
            </div>
            <div style={{ color: '#064E3B', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 800, textTransform: 'uppercase' }}>
              — POPULAR SOUTH INDIAN DISHES —
            </div>
            <h2
              style={{
                fontFamily: "'Caveat', cursive, 'Playfair Display', serif",
                fontSize: 'clamp(2.4rem, 4.5vw, 3.4rem)',
                fontWeight: 700,
                color: '#064E3B',
                margin: '0.4rem 0 0.5rem 0'
              }}
            >
              Authentic <span style={{ color: '#D97706' }}>Flavours</span>, Loved by All
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.96rem', maxWidth: '680px', margin: '0 auto', lineHeight: 1.5 }}>
              Explore our most loved South Indian dishes, made with fresh ingredients and traditional recipes.
            </p>
          </div>

          {/* Horizontally Scrollable Carousel Grid with Floating Side Arrows */}
          <div style={{ position: 'relative' }}>
            
            {/* Left Circular Slider Button */}
            <button
              onClick={() => handleScrollPopular('left')}
              className="carousel-nav-btn carousel-left-btn"
              style={{
                position: 'absolute',
                left: '-18px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                transition: 'all 0.2s'
              }}
              title="Scroll Left"
            >
              <ChevronLeft size={22} color="#064E3B" />
            </button>

            {/* Right Circular Slider Button */}
            <button
              onClick={() => handleScrollPopular('right')}
              className="carousel-nav-btn carousel-right-btn"
              style={{
                position: 'absolute',
                right: '-18px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 10,
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                transition: 'all 0.2s'
              }}
              title="Scroll Right"
            >
              <ChevronRight size={22} color="#064E3B" />
            </button>

            {/* Scrollable Container */}
            <div
              ref={popularRef}
              style={{
                display: 'flex',
                gap: '1.25rem',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                padding: '0.5rem 0.2rem 1.5rem 0.2rem',
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
                      width: '245px',
                      backgroundColor: '#FFFFFF',
                      borderRadius: '18px',
                      border: '1px solid #E8E5DC',
                      boxShadow: '0 4px 18px rgba(0,0,0,0.06)',
                      padding: '13px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'transform 0.2s, boxShadow 0.2s'
                    }}
                    className="pop-dish-card"
                  >
                    <div>
                      {/* Image Box with Veg Badge */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          height: '150px',
                          borderRadius: '14px',
                          overflow: 'hidden',
                          marginBottom: '10px'
                        }}
                      >
                        <img
                          src={dish.image_url || '/south-indian-special-combo.jpg'}
                          alt={translatedName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            backgroundColor: 'rgba(6, 78, 59, 0.88)',
                            backdropFilter: 'blur(4px)',
                            color: '#FFFFFF',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <Leaf size={11} color="#4ADE80" />
                          <span>Veg</span>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h4
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 800,
                          color: '#064E3B',
                          margin: '0 0 4px 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                        title={translatedName}
                      >
                        {translatedName}
                      </h4>
                      <p
                        style={{
                          fontSize: '0.79rem',
                          color: '#64748B',
                          margin: '0 0 10px 0',
                          lineHeight: 1.4,
                          height: '36px',
                          overflow: 'hidden'
                        }}
                      >
                        {dish.description}
                      </p>
                    </div>

                    {/* Bottom Price and Add to Cart Button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B' }}>
                        ₹{dish.price}
                      </span>

                      <button
                        onClick={() => {
                          addToCart(dish, 1);
                          addToast(`${translatedName} added to cart!`, 'success');
                        }}
                        style={{
                          padding: '7px 14px',
                          borderRadius: '24px',
                          border: '1.5px solid #D97706',
                          backgroundColor: '#FFFFFF',
                          color: '#D97706',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.2s ease',
                          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)'
                        }}
                      >
                        <ShoppingCart size={14} color="#D97706" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>



      {/* ================= WHY CHOOSE DOSA JUNCTION? ================= */}
      <section style={{ padding: '3.5rem 0 4.5rem 0', backgroundColor: '#FAF7F0', borderTop: '1px solid #EAE7DC' }}>
        <div className="container">
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ marginBottom: '6px' }}>
              <span style={{ fontSize: '1.4rem' }}>🍃</span>
            </div>
            <div style={{ color: '#064E3B', fontSize: '0.9rem', letterSpacing: '2px', fontWeight: 800, textTransform: 'uppercase' }}>
              — WHY CHOOSE DOSA JUNCTION? —
            </div>
          </div>

          {/* 4 Features Horizontal Grid with Dividers */}
          <div
            className="why-choose-features-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1rem',
              alignItems: 'flex-start'
            }}
          >
            {[
              {
                icon: Leaf,
                title: 'Pure Veg',
                desc: 'Made with 100% fresh & natural ingredients'
              },
              {
                icon: Sparkles,
                title: 'Fresh Ingredients',
                desc: 'Quality ingredients for better taste'
              },
              {
                icon: Award,
                title: 'Authentic Taste',
                desc: 'Traditional recipes, original flavours'
              },
              {
                icon: Truck,
                title: 'Fast Delivery',
                desc: 'Hot & fresh, right to your door'
              }
            ].map((feature, idx) => {
              const IconComp = feature.icon;
              return (
                <div
                  key={idx}
                  style={{
                    textAlign: 'center',
                    padding: '0 1rem',
                    borderRight: idx < 3 ? '1px solid #E2E8F0' : 'none'
                  }}
                  className="why-choose-col"
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#DCFCE7',
                      color: '#16A34A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px auto',
                      boxShadow: '0 4px 14px rgba(22, 163, 74, 0.15)'
                    }}
                  >
                    <IconComp size={28} color="#16A34A" />
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064E3B', marginBottom: '6px' }}>
                    {feature.title}
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#64748B', lineHeight: 1.5, margin: '0 auto', maxWidth: '200px' }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* Responsive CSS for Why Choose Grid and Carousel Buttons */}
        <style>{`
          @media (max-width: 900px) {
            .why-choose-features-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              gap: 2rem !important;
            }
            .why-choose-col {
              border-right: none !important;
            }
            .carousel-left-btn {
              left: 0px !important;
            }
            .carousel-right-btn {
              right: 0px !important;
            }
          }
          @media (max-width: 600px) {
            .why-choose-features-grid {
              grid-template-columns: 1fr !important;
              gap: 2rem !important;
            }
          }
        `}</style>
      </section>

      {/* ================= OUR STORY & GALLERY ================= */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#FAF7F0', borderTop: '1px solid #EAE7DC' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.35fr',
              gap: '3rem',
              alignItems: 'center'
            }}
            className="story-grid"
          >
            {/* Left Story Content */}
            <div>
              <div style={{ color: '#064E3B', fontSize: '0.88rem', letterSpacing: '2px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.8rem' }}>
                — OUR STORY 🍃 —
              </div>
              
              <h2
                style={{
                  fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: '#064E3B',
                  lineHeight: 1.15,
                  marginBottom: '1.2rem'
                }}
              >
                From the Heart of <br />
                <span style={{ color: '#D97706', position: 'relative', display: 'inline-block' }}>
                  South India
                  <svg style={{ position: 'absolute', bottom: '-8px', left: 0, width: '100%', height: '10px' }} viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="#F59E0B" strokeWidth="3" fill="none" />
                  </svg>
                </span>
              </h2>

              <p style={{ fontSize: '1.02rem', color: '#475569', lineHeight: 1.7, marginBottom: '2.2rem', maxWidth: '480px' }}>
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
                  padding: '12px 28px',
                  borderRadius: '30px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(6, 78, 59, 0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Read More</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Right Photo Collage Layout */}
            <div
              className="story-collage-container"
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Main Organic Dosa Card */}
              <div
                style={{
                  position: 'relative',
                  width: '240px',
                  height: '310px',
                  borderRadius: '24px 60px 24px 24px',
                  overflow: 'hidden',
                  border: '2.5px solid #F59E0B',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                  flexShrink: 0
                }}
              >
                <img
                  src="/hero-dosa-platter.jpg"
                  alt="Authentic Dosa"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: '#064E3B',
                    color: '#FBBF24',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                  }}
                >
                  ✨
                </div>
              </div>

              {/* Middle 2 Stacked Images (Coffee & Idli Vada) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '135px', flexShrink: 0 }}>
                <div style={{ height: '148px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
                  <img
                    src="/coffee.jpg"
                    alt="Filter Coffee"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ height: '148px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.08)' }}>
                  <img
                    src="/idli-medu-vada-combo.jpg"
                    alt="Idli Vada Combo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              </div>

              {/* Right Tall Image (Restaurant Interior) */}
              <div style={{ width: '140px', height: '310px', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', flexShrink: 0 }}>
                <img
                  src="/restaurant-interior.jpg"
                  alt="Restaurant Dining Ambiance"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Far Right Calligraphy Quote */}
              <div
                className="story-quote-tag"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: '1.45rem',
                  color: '#064E3B',
                  lineHeight: 1.25,
                  fontWeight: 700,
                  paddingLeft: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flexShrink: 0
                }}
              >
                <span>Good</span>
                <span>Food</span>
                <span>Brings</span>
                <span>People</span>
                <span>Together</span>
                <span style={{ fontSize: '1.8rem', color: '#16A34A', marginTop: '4px' }}>♡</span>
              </div>
            </div>

          </div>
        </div>

        {/* Responsive Story Collage Style */}
        <style>{`
          @media (max-width: 900px) {
            .story-grid {
              grid-template-columns: 1fr !important;
              text-align: center !important;
            }
            .story-grid > div {
              margin: 0 auto !important;
            }
            .story-collage-container {
              flex-wrap: wrap !important;
              justify-content: center !important;
            }
          }
        `}</style>
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
