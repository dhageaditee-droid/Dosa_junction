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
        className="menu-top-banner"
        style={{
          background: 'linear-gradient(180deg, #FBF8F1 0%, #F5EFE3 100%)',
          padding: '1.25rem 0 1rem 0',
          borderBottom: '1px solid #E5E7EB',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 280px',
              gap: '1.5rem',
              alignItems: 'center'
            }}
            className="menu-banner-grid"
          >
            <div>
              <h1
                className="menu-title-text"
                style={{
                  fontSize: '2rem',
                  fontWeight: 800,
                  color: '#064E3B',
                  fontFamily: 'var(--font-heading)',
                  margin: '0 0 4px 0',
                  lineHeight: 1.15
                }}
              >
                Our <span style={{ color: '#D97706' }}>South Indian</span> Menu
              </h1>

              <p className="menu-desc-text" style={{ color: '#475569', fontSize: '0.88rem', maxWidth: '520px', margin: 0, lineHeight: 1.5 }}>
                Explore authentic crisp dosas, ghee specials, uttapam, soft idli, pineapple sheera, and filter coffee.
              </p>
            </div>

            {/* Right Hero Dish Graphic */}
            <div className="menu-banner-img" style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 6px 18px rgba(0,0,0,0.08)', border: '2px solid #FFFFFF' }}>
              <img
                src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80"
                alt="South Indian Dosa Platter"
                style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT SECTION ================= */}
      <section className="menu-main-section" style={{ padding: '1.25rem 0 4rem 0' }}>
        <div className="container">
          


          {/* Mobile Horizontally Scrollable Category Bar */}
          <div className="mobile-category-container" style={{ display: 'none', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#064E3B', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>
              ❖ Categories ❖
            </div>
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '8px',
                scrollbarWidth: 'none'
              }}
              className="no-scrollbar"
            >
              {categories.map((cat) => {
                const isActiveCat = selectedCategory === cat.slug;
                const IconComponent = cat.icon || Utensils;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '25px',
                      border: '1.5px solid',
                      borderColor: isActiveCat ? '#064E3B' : '#E2E8F0',
                      backgroundColor: isActiveCat ? '#064E3B' : '#FFFFFF',
                      color: isActiveCat ? '#FFFFFF' : '#334155',
                      fontWeight: isActiveCat ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: isActiveCat ? '0 4px 10px rgba(6, 78, 59, 0.25)' : '0 2px 6px rgba(0,0,0,0.03)'
                    }}
                  >
                    <IconComponent size={15} color={isActiveCat ? '#F59E0B' : '#64748B'} />
                    <span>{translateCategory(cat.name)}</span>
                  </button>
                );
              })}
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
          .menu-top-banner {
            padding: 0.75rem 0 !important;
          }
          .menu-banner-grid {
            grid-template-columns: 1fr !important;
            gap: 0.4rem !important;
          }
          .menu-title-text {
            font-size: 1.35rem !important;
            margin-bottom: 2px !important;
          }
          .menu-desc-text {
            font-size: 0.78rem !important;
            line-height: 1.35 !important;
          }
          .menu-banner-img {
            display: none !important;
          }
          .menu-main-section {
            padding: 0.6rem 0 3rem 0 !important;
          }
          .mobile-category-container {
            display: block !important;
            margin-bottom: 1rem !important;
          }
          .menu-layout-grid, .offer-grid-menu {
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
