import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X, RotateCcw, Star, Check, Award, Flame } from 'lucide-react';
import FoodCard from '../components/FoodCard';
import FoodDetailsModal from '../components/FoodDetailsModal';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import SEOHead from '../components/SEOHead';
import { apiService, cleanDishName } from '../services/api';

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

const POPULAR_SEARCH_TAGS = ['Masala Dosa', 'Ghee Special Dosa', 'Loni Sponge Dosa', 'Thatte Idli', 'Uttapam', 'Pineapple Sheera', 'Coffee'];

const MenuPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [selectedFoodModal, setSelectedFoodModal] = useState(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('dakshin_recent_searches');
      return saved ? JSON.parse(saved) : ['Masala Dosa', 'Pineapple Sheera'];
    } catch (e) {
      return [];
    }
  });

  const [vegFilter, setVegFilter] = useState('all'); // 'all', 'veg', 'nonveg'
  const [bestsellerOnly, setBestsellerOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [rating4Plus, setRating4Plus] = useState(false);
  const [pricePreset, setPricePreset] = useState('all'); // 'all', 'under100', 'under200'
  const [sortOption, setSortOption] = useState('featured'); // 'featured', 'price_asc', 'price_desc', 'rating'

  useEffect(() => {
    fetchDynamicCategories();
  }, []);

  useEffect(() => {
    fetchMenu();
  }, [selectedCategory, searchQuery, vegFilter, bestsellerOnly, availableOnly, rating4Plus, pricePreset, sortOption]);

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
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (vegFilter === 'veg') params.append('veg', 'true');
      if (vegFilter === 'nonveg') params.append('veg', 'false');
      if (bestsellerOnly) params.append('bestseller', 'true');
      if (availableOnly) params.append('availableOnly', 'true');
      if (pricePreset === 'under100') params.append('maxPrice', '100');
      if (pricePreset === 'under200') params.append('maxPrice', '200');
      if (sortOption) params.append('sort', sortOption);

      const res = await apiService.getMenu(params.toString());
      let resultItems = res.items || [];

      if (rating4Plus) {
        resultItems = resultItems.filter(i => parseFloat(i.rating) >= 4.0);
      }

      setItems(resultItems);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      setRecentSearches(prev => {
        const updated = [q, ...prev.filter(s => s.toLowerCase() !== q.toLowerCase())].slice(0, 5);
        localStorage.setItem('dakshin_recent_searches', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setVegFilter('all');
    setBestsellerOnly(false);
    setAvailableOnly(false);
    setRating4Plus(false);
    setPricePreset('all');
    setSortOption('featured');
    setSearchParams({});
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

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (vegFilter !== 'all' ? 1 : 0) +
    (bestsellerOnly ? 1 : 0) +
    (availableOnly ? 1 : 0) +
    (rating4Plus ? 1 : 0) +
    (pricePreset !== 'all' ? 1 : 0);

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', minHeight: '90vh', padding: '2rem 0 4rem 0' }}>
      <SEOHead title="South Indian Menu | Dakshin Bhavan" />

      <div className="container">
        
        {/* Header & Search Bar */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'var(--font-heading)', marginBottom: '0.4rem' }}>
            Our South Indian Menu
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Explore authentic crisp dosas, ghee specials, uttapam, soft idli, pineapple sheera, and filter coffee.
          </p>

          {/* Search Box */}
          <form 
            onSubmit={handleSearchSubmit} 
            style={{
              marginTop: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '6px 8px 6px 16px',
              border: '1.5px solid var(--color-border)',
              boxShadow: '0 4px 14px rgba(0,0,0,0.05)',
              maxWidth: '650px'
            }}
          >
            <Search size={22} color="var(--color-gold)" style={{ flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for dosa, idli, vada, uttapam, coffee..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '10px 12px',
                fontSize: '1rem',
                color: 'var(--color-emerald)'
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.4rem', borderRadius: '12px', fontWeight: 800 }}
            >
              Search
            </button>
          </form>

          {/* Popular & Recent Search Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginTop: '0.8rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Popular:</span>
            {POPULAR_SEARCH_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => { setSearchQuery(tag); }}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-emerald)',
                  borderRadius: '12px',
                  padding: '3px 10px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {tag}
              </button>
            ))}
          </div>
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
                border: '1px solid',
                borderColor: selectedCategory === cat.slug ? 'var(--color-emerald)' : 'var(--color-border)',
                backgroundColor: selectedCategory === cat.slug ? 'var(--color-emerald)' : '#FFFFFF',
                color: selectedCategory === cat.slug ? '#FFFFFF' : 'var(--color-emerald)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cleanDishName(cat.name)}
            </button>
          ))}
        </div>

        {/* Main Desktop Layout: Left Sidebar Categories + Right Menu Grid */}
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
                Categories
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
                      <span>{cleanDishName(cat.name)}</span>
                      {isActiveCat && <Check size={16} color="#FFFFFF" />}
                    </button>
                  );
                })}
              </div>

            </div>
          </aside>

          {/* Right Main Content Area */}
          <div>
            
            {/* Filter Bar Controls */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '1rem 1.2rem',
              border: '1px solid var(--color-border)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              
              {/* Pill Filters */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                
                {/* Veg Toggle */}
                <button
                  onClick={() => setVegFilter(prev => prev === 'veg' ? 'all' : 'veg')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: vegFilter === 'veg' ? '#16A34A' : 'var(--color-border)',
                    backgroundColor: vegFilter === 'veg' ? '#DCFCE7' : '#FFFFFF',
                    color: vegFilter === 'veg' ? '#15803D' : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                  Veg Only
                </button>

                {/* Bestseller Filter */}
                <button
                  onClick={() => setBestsellerOnly(!bestsellerOnly)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: bestsellerOnly ? 'var(--color-saffron)' : 'var(--color-border)',
                    backgroundColor: bestsellerOnly ? '#FFEDD5' : '#FFFFFF',
                    color: bestsellerOnly ? '#C2410C' : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Award size={14} /> Bestseller
                </button>

                {/* Available Filter */}
                <button
                  onClick={() => setAvailableOnly(!availableOnly)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: availableOnly ? 'var(--color-gold)' : 'var(--color-border)',
                    backgroundColor: availableOnly ? '#FEF3C7' : '#FFFFFF',
                    color: availableOnly ? '#B45309' : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Available
                </button>

                {/* Rating 4.0+ */}
                <button
                  onClick={() => setRating4Plus(!rating4Plus)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: rating4Plus ? '#B45309' : 'var(--color-border)',
                    backgroundColor: rating4Plus ? '#FEF3C7' : '#FFFFFF',
                    color: rating4Plus ? '#B45309' : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  <Star size={13} fill="#B45309" color="#B45309" /> 4.0+ Rating
                </button>

                {/* Price Presets */}
                <button
                  onClick={() => setPricePreset(prev => prev === 'under100' ? 'all' : 'under100')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid',
                    borderColor: pricePreset === 'under100' ? 'var(--color-emerald)' : 'var(--color-border)',
                    backgroundColor: pricePreset === 'under100' ? 'var(--color-cream-alt)' : '#FFFFFF',
                    color: pricePreset === 'under100' ? 'var(--color-emerald)' : 'var(--color-text)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Under ₹100
                </button>

                {/* Clear Filters Button */}
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: '#F1F5F9',
                      color: '#64748B',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    <RotateCcw size={13} /> Clear Filters ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Sort Selection */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Sort:</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#FFFFFF',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--color-emerald)',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="featured">Recommended</option>
                  <option value="rating">Rating</option>
                  <option value="price_asc">Price Low to High</option>
                  <option value="price_desc">Price High to Low</option>
                </select>
              </div>

            </div>

            {/* Dishes Grid or Empty State */}
            {loading ? (
              <SkeletonLoader count={6} type="card" />
            ) : items.length > 0 ? (
              <div className="food-menu-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '1.5rem'
              }}>
                {items.map((item) => (
                  <FoodCard key={item.id} item={item} onClickDetail={handleOpenDetailModal} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No dishes found"
                description="No dishes match your current search or filter criteria. Try clicking 'Clear All Filters'."
                actionText="Clear All Filters"
                onAction={handleClearFilters}
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
