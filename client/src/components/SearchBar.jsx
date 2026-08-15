import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder = 'Search Masala Dosa, Idli, Coffee...' }) => {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        size={20}
        color="var(--color-text-muted)"
        style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '0.85rem 2.8rem 0.85rem 3rem',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--color-border)',
          backgroundColor: '#fff',
          fontSize: '0.95rem',
          outline: 'none',
          boxShadow: 'var(--shadow-sm)',
          transition: 'var(--transition-fast)'
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', padding: '2px' }}
        >
          <X size={18} color="var(--color-text-muted)" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
