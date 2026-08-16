import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Check, 
  Search, 
  Leaf, 
  Star, 
  ChevronRight, 
  Coffee, 
  Sparkles, 
  Utensils, 
  Cookie, 
  Grid, 
  Flame,
  ArrowRight
} from 'lucide-react';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import SEOHead from '../components/SEOHead';
import { apiService, cleanDishName } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Dishes', slug: 'all', icon: Grid },
  { id: 'beverages', name: 'Tea & Beverages', slug: 'beverages', icon: Coffee },
  { id: 'dosa', name: 'Dosa', slug: 'dosa', icon: Utensils },
  { id: 'special-dosa', name: 'Special Dosa', slug: 'special-dosa', icon: Sparkles },
  { id: 'uttapam', name: 'Uttapam', slug: 'uttapam', icon: Utensils },
  { id: 'idli', name: 'Idli', slug: 'idli', icon: Cookie },
  { id: 'vada', name: 'Vada', slug: 'vada', icon: Cookie },
  { id: 'desserts', name: 'Sheera & Desserts', slug: 'desserts', icon: Sparkles },
  { id: 'rice', name: 'Rice', slug: 'rice', icon: Utensils },
  { id: 'extras', name: 'Extras', slug: 'extras', icon: Leaf }
];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedFoodModal, setSelectedFoodModal] = useState(null);

  const { t, translateCategory, translateDish } = useLanguage();

  // Filters & Controls State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [pureVegOnly, setPureVegOnly] = useState(true);
  const [sortBy, setSortBy] = useState('popular'); // 'popular', 'price-low', 'price-high', 'rating'

  useEffect(() => {
    fetchDynamicCategories();
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory]);

  const fetchDynamicCategories = async () => {
    try {
      const res = await apiService.getCategories();
      if (res.categories && res.categories.length > 0) {
        const catList = DEFAULT_CATEGORIES.map(def => {
          const match = res.categories.find(c => c.slug === def.slug || c.id === def.id);
          return match ? { ...def, name: match.name } : def;
        });
        setCategories(catList);
      }
    } catch (e) {
      console.error('Using default category list');
    }
  };

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);

      const res = await apiService.getMenu(params.toString());
      setItems(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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

  // Filter and Sort Items
  let filteredItems = items.filter(item => {
    if (pureVegOnly && item.is_veg === false) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = (item.description || '').toLowerCase().includes(query);
      return nameMatch || descMatch;
    }
    return true;
  });

  if (sortBy === 'price-low') {
    filteredItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  } else if (sortBy === 'price-high') {
    filteredItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  } else if (sortBy === 'rating') {
    filteredItems.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
  } else if (sortBy === 'popular') {
    filteredItems.sort((a, b) => (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0));
  }

  return (
    <div style={{ backgroundColor: '#FAF7F0', minHeight: '90vh', color: '#1E293B' }}>
      <SEOHead title="South Indian Menu | Dosa Junction" />

      {/* ================= TOP MENU HERO BANNER ================= */}
      <section
        style={{
          background: 'linear-gradient(180deg, #FBF8F1 0%, #F5EFE3 100%)',
          padding: '2.5rem 0 2rem 0',
          borderBottom: '1px solid #E5E7EB',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 340px',
              gap: '2rem',
              alignItems: 'center'
            }}
            className="menu-banner-grid"
          >
            <div>
              <h1
                style={{
                  fontSize: '3rem',
                  fontWeight: 800,
                  color: '#064E3B',
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 8px 0',
                  lineHeight: 1.15
                }}
              >
                Our <span style={{ color: '#D97706' }}>South Indian</span> Menu
              </h1>

              {/* Ornamental Divider */}
              <div style={{ color: '#D97706', fontSize: '0.9rem', letterSpacing: '4px', margin: '0 0 12px 0' }}>
                ❖ ❖ ❖
              </div>

              <p style={{ color: '#475569', fontSize: '1.05rem', maxWidth: '520px', margin: 0, lineHeight: 1.6 }}>
                Explore authentic crisp dosas, ghee specials, uttapam, soft idli, pineapple sheera, and filter coffee.
              </p>
            </div>

            {/* Right Hero Dish Graphic */}
            <div style={{ borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '3px solid #FFFFFF' }}>
              <img
                src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
                alt="South Indian Dosa Platter"
                style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT SECTION ================= */}
      <section style={{ padding: '2rem 0 4rem 0' }}>
        <div className="container">
          
          {/* Top Controls & Filter Toolbar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '2rem',
              backgroundColor: '#FFFFFF',
              padding: '12px 20px',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Pure Veg Toggle Pill Button */}
              <button
                onClick={() => setPureVegOnly(!pureVegOnly)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1.5px solid',
                  borderColor: pureVegOnly ? '#16A34A' : '#CBD5E1',
                  backgroundColor: pureVegOnly ? '#F0FDF4' : '#FFFFFF',
                  color: pureVegOnly ? '#15803D' : '#64748B',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                <Leaf size={15} color={pureVegOnly ? '#16A34A' : '#64748B'} />
                <span>Pure Veg</span>
              </button>

              {/* Sort Dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748B' }}>
                <span style={{ fontWeight: 600 }}>Sort By:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#064E3B',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="popular">Popular</option>
                  <option value="rating">Top Rated</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* Right Search Input Box */}
            <div style={{ position: 'relative', width: '260px' }}>
              <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '36px',
                  paddingRight: '14px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  borderRadius: '20px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  backgroundColor: '#FAF7F0'
                }}
              />
            </div>
          </div>

          {/* Main 2-Column Grid: Left Categories Sidebar + Right Dishes */}
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="menu-layout-grid">
            
            {/* Left Category Sidebar (❖ CATEGORIES ❖) */}
            <aside className="desktop-category-sidebar">
              <div
                style={{
                  backgroundColor: '#FBF8F1',
                  borderRadius: '18px',
                  padding: '1.25rem',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                  position: 'sticky',
                  top: '90px'
                }}
              >
                <h3
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    color: '#064E3B',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}
                >
                  ❖ CATEGORIES ❖
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {categories.map((cat) => {
                    const isActiveCat = selectedCategory === cat.slug;
                    const IconComponent = cat.icon || Utensils;
                    return (
                      <button
                        key={cat.slug}
                        onClick={() => setSelectedCategory(cat.slug)}
                        style={{
                          textAlign: 'left',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: isActiveCat ? '#064E3B' : 'transparent',
                          color: isActiveCat ? '#FFFFFF' : '#334155',
                          fontWeight: isActiveCat ? 800 : 600,
                          fontSize: '0.88rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <IconComponent size={17} color={isActiveCat ? '#F59E0B' : '#64748B'} />
                          <span>{translateCategory(cat.name)}</span>
                        </div>
                        {isActiveCat && <ChevronRight size={16} color="#F59E0B" />}
                      </button>
                    );
                  })}
                </div>

              </div>
            </aside>

            {/* Right Food Grid */}
            <div>
              {loading ? (
                <SkeletonLoader count={6} type="card" />
              ) : filteredItems.length > 0 ? (
                <div
                  className="food-menu-grid"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1.25rem'
                  }}
                >
                  {filteredItems.map((item) => (
                    <FoodCard key={item.id} item={item} onClickDetail={handleOpenDetailModal} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title={t('noDishes')}
                  description={t('noDishesDesc')}
                  actionText={t('viewAllDishes')}
                  onAction={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                />
              )}
            </div>

          </div>

          {/* ================= BOTTOM SPECIAL OFFER BANNER ================= */}
          <div style={{ marginTop: '4rem' }}>
            <div
              style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #0A4D28 0%, #032A15 100%)',
                borderRadius: '20px',
                padding: '2rem',
                color: '#FFFFFF',
                boxShadow: '0 12px 30px rgba(6, 78, 59, 0.25)',
                border: '2px solid #D4AF37'
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr auto',
                  gap: '2rem',
                  alignItems: 'center'
                }}
                className="offer-grid-menu"
              >
                <div style={{ borderRadius: '14px', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                  <img
                    src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80"
                    alt="Special Offer Combo"
                    style={{ width: '100%', height: '140px', objectFit: 'cover', display: 'block' }}
                  />
                </div>

                <div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: 'rgba(245, 158, 11, 0.2)',
                      border: '1px solid #F59E0B',
                      color: '#FCD34D',
                      padding: '3px 10px',
                      borderRadius: '16px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      marginBottom: '0.5rem'
                    }}
                  >
                    <Star size={12} fill="#FCD34D" color="#FCD34D" />
                    <span>Today's Special</span>
                  </div>

                  <h3 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', margin: '0 0 4px 0', color: '#FFFFFF' }}>
                    South Indian Breakfast Combo
                  </h3>

                  <p style={{ fontSize: '0.9rem', color: '#E2E8F0', margin: '0 0 1rem 0' }}>
                    Masala Dosa + Idli + Vada + Filter Coffee
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FCD34D' }}>₹199</span>
                      <span style={{ fontSize: '1rem', textDecoration: 'line-through', color: '#94A3B8' }}>₹259</span>
                    </div>

                    <span style={{ backgroundColor: '#EA580C', color: '#FFFFFF', padding: '3px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800 }}>
                      Save ₹60
                    </span>
                  </div>
                </div>

                <div>
                  <Link
                    to="/menu"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#D97706',
                      color: '#FFFFFF',
                      padding: '12px 24px',
                      borderRadius: '30px',
                      fontWeight: 800,
                      fontSize: '0.92rem',
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.4)'
                    }}
                  >
                    <span>Order Now</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Food Details Modal */}
      {selectedFoodModal && (
        <FoodDetailsModal
          item={selectedFoodModal}
          onClose={() => setSelectedFoodModal(null)}
          onSelectRelated={(rel) => handleOpenDetailModal(rel)}
        />
      )}

      {/* Responsive Breakpoints */}
      <style>{`
        @media (max-width: 850px) {
          .menu-banner-grid, .menu-layout-grid, .offer-grid-menu {
            grid-template-columns: 1fr !important;
          }
          .desktop-category-sidebar {
            display: none !important;
          }
          .food-menu-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)) !important;
            gap: 0.85rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default MenuPage;
