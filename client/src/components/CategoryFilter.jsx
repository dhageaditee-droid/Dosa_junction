import React from 'react';

const CategoryFilter = ({ categories = [], activeCategory, onSelectCategory }) => {
  const allCategories = [{ slug: 'all', name: 'All Dishes' }, ...categories];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      overflowX: 'auto',
      paddingBottom: '0.5rem',
      scrollbarWidth: 'none'
    }}>
      {allCategories.map((cat) => {
        const isSelected = activeCategory === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => onSelectCategory(cat.slug)}
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.9rem',
              fontWeight: isSelected ? 700 : 500,
              whiteSpace: 'nowrap',
              backgroundColor: isSelected ? 'var(--color-emerald)' : '#fff',
              color: isSelected ? '#fff' : 'var(--color-emerald)',
              border: isSelected ? '1.5px solid var(--color-emerald)' : '1.5px solid var(--color-border)',
              boxShadow: isSelected ? '0 4px 12px rgba(11,60,38,0.2)' : 'none',
              transition: 'var(--transition-fast)',
              cursor: 'pointer'
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
