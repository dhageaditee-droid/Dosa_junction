import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle, AlertTriangle, X, Image as ImageIcon, Award, Flame, Clock } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import SkeletonLoader from '../components/SkeletonLoader';
import ConfirmationModal from '../components/ConfirmationModal';
import SEOHead from '../components/SEOHead';
import { apiService } from '../services/api';
import { useToast } from '../context/ToastContext';

const AdminMenu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: 1,
    imageUrl: '',
    isVeg: true,
    spiceLevel: 'medium',
    preparationTime: '15 mins',
    isAvailable: true,
    isBestseller: false,
    isFeatured: false,
    rating: 4.5
  });

  const { addToast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await apiService.getCategories();
      if (res.categories) setCategories(res.categories);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('availableOnly', 'false');

      const res = await apiService.getMenu(params.toString());
      if (res.items) setItems(res.items);
    } catch (e) {
      if (addToast) addToast('Failed to load menu items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: categories.length > 0 ? categories[0].id : 1,
      imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
      isVeg: true,
      spiceLevel: 'medium',
      preparationTime: '15 mins',
      isAvailable: true,
      isBestseller: false,
      isFeatured: false,
      rating: 4.5
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.category_id || 1,
      imageUrl: item.image_url || '',
      isVeg: item.is_veg,
      spiceLevel: item.spice_level || 'medium',
      preparationTime: item.preparation_time || '15 mins',
      isAvailable: item.is_available,
      isBestseller: item.is_bestseller || false,
      isFeatured: item.is_featured || false,
      rating: item.rating || 4.5
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      if (addToast) addToast('Food name and price are required.', 'error');
      return;
    }

    try {
      let res;
      if (editingItem) {
        res = await apiService.updateMenuItem(editingItem.id, formData);
      } else {
        res = await apiService.createMenuItem(formData);
      }

      if (res.success) {
        if (addToast) addToast(editingItem ? 'Food item updated!' : 'New food item added!', 'success');
        setModalOpen(false);
        fetchMenuItems();
      }
    } catch (err) {
      if (addToast) addToast(err.message || 'Failed to save menu item.', 'error');
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const res = await apiService.updateMenuItem(item.id, {
        isAvailable: !item.is_available
      });
      if (res.success) {
        if (addToast) addToast(`"${item.name}" availability updated.`, 'info');
        fetchMenuItems();
      }
    } catch (err) {
      if (addToast) addToast('Failed to update availability.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await apiService.deleteMenuItem(itemToDelete.id);
      if (res.success) {
        if (addToast) addToast(`Deleted "${itemToDelete.name}".`, 'info');
        setDeleteModalOpen(false);
        fetchMenuItems();
      }
    } catch (err) {
      if (addToast) addToast('Failed to delete item.', 'error');
    }
  };

  return (
    <div className="admin-page-layout" style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-cream-alt)' }}>
      <SEOHead title="Admin Menu Management | Dosa Junction" />
      <AdminSidebar />

      <main className="admin-main-content" style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* Header Bar */}
        <div className="admin-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-emerald)', margin: 0 }}>
              Menu Management
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Add, edit, delete, enable/disable food items, and mark bestsellers in PostgreSQL.
            </p>
          </div>

          <button onClick={handleOpenAddModal} className="btn btn-primary btn-sm" style={{ fontWeight: 800 }}>
            <Plus size={18} /> Add Food Item
          </button>
        </div>

        {/* Filter Controls */}
        <div style={{
          backgroundColor: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flexGrow: 1, maxWidth: '450px' }}>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search food by name, description, or category..."
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                border: '1px solid var(--color-border)',
                fontSize: '0.85rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <SkeletonLoader count={6} type="table" />
        ) : (
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 14px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Prep Time</th>
                    <th>Spice</th>
                    <th>Availability</th>
                    <th>Badges</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={item.image_url || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80'}
                          alt={item.name}
                          style={{ width: '46px', height: '46px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--color-emerald)' }}>{item.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{item.is_veg ? '🟢 Veg' : '🔴 Non-Veg'}</span>
                        </div>
                      </td>
                      <td>{item.category_name || 'General'}</td>
                      <td style={{ fontWeight: 800 }}>₹{parseFloat(item.price).toFixed(2)}</td>
                      <td style={{ fontSize: '0.85rem' }}>{item.preparation_time || '15 mins'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{item.spice_level || 'Medium'}</td>
                      <td>
                        <button
                          onClick={() => handleToggleAvailability(item)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            backgroundColor: item.is_available ? '#DCFCE7' : '#FEE2E2',
                            color: item.is_available ? '#15803D' : '#991B1B',
                            border: item.is_available ? '1px solid #86EFAC' : '1px solid #FCA5A5',
                            cursor: 'pointer'
                          }}
                        >
                          {item.is_available ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {item.is_bestseller && (
                            <span style={{ backgroundColor: 'var(--color-saffron)', color: '#FFFFFF', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                              Bestseller
                            </span>
                          )}
                          {item.is_featured && (
                            <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            style={{ padding: '6px', color: 'var(--color-emerald)', backgroundColor: 'var(--color-cream-alt)', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            aria-label="Edit item"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setItemToDelete(item);
                              setDeleteModalOpen(true);
                            }}
                            style={{ padding: '6px', color: '#DC2626', backgroundColor: '#FEE2E2', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                            aria-label="Delete item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', borderRadius: '20px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.8rem' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--color-emerald)', margin: 0 }}>
                  {editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                </h3>
                <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={22} color="#64748B" />
                </button>
              </div>

              <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                <div>
                  <label className="form-label">Food Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Mysore Masala Dosa"
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Price (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="150.00"
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                      className="form-input"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Golden crispy dosa roasted in pure ghee and spicy red chutney..."
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Preparation Time</label>
                    <input
                      type="text"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      placeholder="15 mins"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Spice Level</label>
                    <select
                      value={formData.spiceLevel}
                      onChange={(e) => setFormData({ ...formData, spiceLevel: e.target.value })}
                      className="form-input"
                    >
                      <option value="mild">Mild</option>
                      <option value="medium">Medium</option>
                      <option value="spicy">Spicy</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingTop: '0.4rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isVeg}
                        onChange={(e) => setFormData({ ...formData, isVeg: e.target.checked })}
                        style={{ accentColor: '#16A34A' }}
                      /> Pure Veg
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isBestseller}
                        onChange={(e) => setFormData({ ...formData, isBestseller: e.target.checked })}
                        style={{ accentColor: 'var(--color-saffron)' }}
                      /> Mark Bestseller Badge
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                        style={{ accentColor: 'var(--color-gold)' }}
                      /> Mark Featured
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.8rem', width: '100%', padding: '0.8rem', fontWeight: 800 }}>
                  {editingItem ? 'Update Food Item' : 'Create Food Item'}
                </button>

              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title="Delete Menu Item"
          message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete Item"
        />

      </main>
    </div>
  );
};

export default AdminMenu;
