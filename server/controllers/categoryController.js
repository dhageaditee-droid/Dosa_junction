const db = require('../config/db');

// GET /api/categories
const getCategories = async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY display_order ASC, name ASC');
    res.json({
      success: true,
      categories: result.rows
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/categories
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, description, imageUrl, displayOrder } = req.body;
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const result = await db.query(
      `INSERT INTO categories (name, slug, description, image_url, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, generatedSlug, description, imageUrl, displayOrder || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/categories/:id
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, imageUrl, displayOrder } = req.body;

    const result = await db.query(
      `UPDATE categories
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           display_order = COALESCE($5, display_order),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [name, slug, description, imageUrl, displayOrder, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
