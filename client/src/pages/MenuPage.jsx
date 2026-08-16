import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import SEOHead from '../components/SEOHead';
import { apiService, cleanDishName } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All Dishes', slug: 'all' },
  { id: 'beverages', name: 'Tea & Beverages', slug: 'beverages' },
  { id: 'dosa', name: 'Dosa', slug: 'dosa' },
  { id: 'special-dosa', name: 'Special Dosa', slug: 'special-dosa' },
  { id: 'uttapam', name: 'Uttapam', slug: 'uttapam' },
  { id: 'idli', name: 'Idli', slug: 'idli' },
  { id: 'vada', name: 'Vada', slug: 'vada' },
  { id: 'desserts', name: 'Sheera & Desserts', slug: 'desserts' },
  { id: 'rice', name: 'Rice', slug: 'rice' },
  { id: 'extras', name: 'Extras', slug: 'extras' }
];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedFoodModal, setSelectedFoodModal] = useState(null);

  const { t, translateCategory } = useLanguage();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

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
        const catList = [{ id: 'all', name: 'All Dishes', slug: 'all' }, ...res.categories];
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

      const res = await apiService.getMenuItems(params.toString());
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

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', minHeight: '90vh', padding: '2rem 0 4rem 0' }}>
      <SEOHead title="South Indian Menu | Dosa Junction" />

      <div className="container">
        
        {/* Clean Header */}
        <div style={{ marginBottom: '1.8rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', marginBottom: '0.4rem' }}>
            {t('ourMenu')}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            {t('menuDesc')}
          </p>
        </div>

        {/* Mobile Horizontally Scrollable Category Tabs */}
        <div className="mobile-category-tabs" style={{ display: 'none', gap: '8px', overflowX: 'auto', paddingBottom: '0.8rem', marginBottom: '1.2rem' }}>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              style={{
                flexShrink: 0,
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1.5px solid',
                borderColor: selectedCategory === cat.slug ? 'var(--color-emerald)' : 'var(--color-border)',
                backgroundColor: selectedCategory === cat.slug ? 'var(--color-emerald)' : '#FFFFFF',
                color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--color-emerald)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {translateCategory(cat.name)}
            </button>
          ))}
        </div>

        {/* Main Layout: Left Sidebar Categories + Right Clean Menu Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }} className="menu-layout-grid">
          
          {/* Left Category Navigation (Desktop) */}
          <aside className="desktop-category-sidebar">
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.2rem',
              border: '1px solid var(--color-border)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
              position: 'sticky',
              top: '90px'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-emerald)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {t('categories')}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {categories.map((cat) => {
                  const isActiveCat = selectedCategory === cat.slug;
                  return (
                    <button
                      key={cat.slug}
                      onClick={() => setSelectedCategory(cat.slug)}
                      style={{
                        textAlign: 'left',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: isActiveCat ? 'var(--color-emerald)' : 'transparent',
                        color: isActiveCat ? '#FFFFFF' : 'var(--color-text)',
                        fontWeight: isActiveCat ? 800 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{translateCategory(cat.name)}</span>
                      {isActiveCat && <Check size={16} color="#FFFFFF" />}
                    </button>
                  );
                })}
              </div>

            </div>
          </aside>

          {/* Right Main Food Grid */}
          <div>
            {loading ? (
              <SkeletonLoader count={6} type="card" />
            ) : items.length > 0 ? (
              <div className="food-menu-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1.5rem'
              }}>
                {items.map((item) => (
                  <FoodCard key={item.id} item={item} onClickDetail={handleOpenDetailModal} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No dishes found"
                description="No dishes available in this category."
                actionText="View All Dishes"
                onAction={() => setSelectedCategory('all')}
              />
            )}
          </div>

        </div>

      </div>

      {/* Food Details Modal */}
      {selectedFoodModal && (
        <FoodDetailsModal
          item={selectedFoodModal}
          onClose={() => setSelectedFoodModal(null)}
          onSelectRelated={(rel) => handleOpenDetailModal(rel)}
        />
      )}

      {/* Responsive Layout Rules */}
      <style>{`
        @media (max-width: 850px) {
          .menu-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .desktop-category-sidebar {
            display: none !important;
          }
          .mobile-category-tabs {
            display: flex !important;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .mobile-category-tabs::-webkit-scrollbar {
            display: none;
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
