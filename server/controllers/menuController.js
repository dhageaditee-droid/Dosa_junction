const db = require('../config/db');

// GET /api/menu (Public: filtered list with search, category, veg, available, price, bestseller filtering)
const getMenuItems = async (req, res, next) => {
  try {
    const { category, search, veg, bestseller, availableOnly, maxPrice, sort } = req.query;

    let queryText = `
      SELECT m.*, c.name as category_name, c.slug as category_slug 
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
      params.push(category);
      queryText += ` AND (c.slug = $${params.length} OR c.name ILIKE $${params.length})`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      queryText += ` AND (m.name ILIKE $${params.length} OR m.description ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    if (veg === 'true') {
      queryText += ` AND m.is_veg = TRUE`;
    }

    if (veg === 'false') {
      queryText += ` AND m.is_veg = FALSE`;
    }

    if (bestseller === 'true') {
      queryText += ` AND m.is_bestseller = TRUE`;
    }

    if (availableOnly === 'true') {
      queryText += ` AND m.is_available = TRUE`;
    }

    if (maxPrice) {
      params.push(parseFloat(maxPrice));
      queryText += ` AND m.price <= $${params.length}`;
    }

    // Sorting options
    if (sort === 'price_asc') {
      queryText += ` ORDER BY m.price ASC`;
    } else if (sort === 'price_desc') {
      queryText += ` ORDER BY m.price DESC`;
    } else if (sort === 'rating') {
      queryText += ` ORDER BY m.rating DESC`;
    } else {
      queryText += ` ORDER BY m.is_featured DESC, m.is_bestseller DESC, m.id ASC`;
    }

    const result = await db.query(queryText, params);
    res.json({
      success: true,
      count: result.rows.length,
      items: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/menu/:id
const getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT m.*, c.name as category_name, c.slug as category_slug 
       FROM menu_items m
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    // Fetch related items from the same category ("You May Also Like")
    const item = result.rows[0];
    const relatedRes = await db.query(
      `SELECT m.*, c.name as category_name 
       FROM menu_items m 
       LEFT JOIN categories c ON m.category_id = c.id
       WHERE m.category_id = $1 AND m.id != $2 AND m.is_available = TRUE 
       LIMIT 4`,
      [item.category_id, item.id]
    );

    res.json({ success: true, item: { ...item, relatedItems: relatedRes.rows } });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/menu (Admin: Create food item)
const createMenuItem = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      categoryId,
      imageUrl,
      isVeg = true,
      spiceLevel = 'medium',
      preparationTime = '15 mins',
      isAvailable = true,
      isBestseller = false,
      isFeatured = false,
      rating = 4.5
    } = req.body;

    const result = await db.query(
      `INSERT INTO menu_items (name, description, price, category_id, image_url, is_veg, spice_level, preparation_time, is_available, is_bestseller, is_featured, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        name,
        description,
        price,
        categoryId,
        imageUrl || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
        isVeg,
        spiceLevel,
        preparationTime,
        isAvailable,
        isBestseller,
        isFeatured,
        rating
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully.',
      item: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/menu/:id (Admin: Update food item)
const updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      categoryId,
      imageUrl,
      isVeg,
      spiceLevel,
      preparationTime,
      isAvailable,
      isBestseller,
      isFeatured,
      rating
    } = req.body;

    const result = await db.query(
      `UPDATE menu_items 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           category_id = COALESCE($4, category_id),
           image_url = COALESCE($5, image_url),
           is_veg = COALESCE($6, is_veg),
           spice_level = COALESCE($7, spice_level),
           preparation_time = COALESCE($8, preparation_time),
           is_available = COALESCE($9, is_available),
           is_bestseller = COALESCE($10, is_bestseller),
           is_featured = COALESCE($11, is_featured),
           rating = COALESCE($12, rating),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING *`,
      [name, description, price, categoryId, imageUrl, isVeg, spiceLevel, preparationTime, isAvailable, isBestseller, isFeatured, rating, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({
      success: true,
      message: 'Menu item updated successfully.',
      item: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/menu/:id (Admin: Delete food item)
const deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM menu_items WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Menu item not found' });
    }

    res.json({
      success: true,
      message: 'Menu item deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
};
