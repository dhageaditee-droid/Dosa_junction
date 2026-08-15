const db = require('../config/db');

// GET /api/settings (Public settings map)
const getSettings = async (req, res, next) => {
  try {
    const result = await db.query('SELECT key, value FROM restaurant_settings');
    const settingsMap = {};
    result.rows.forEach(row => {
      settingsMap[row.key] = row.value;
    });

    res.json({
      success: true,
      settings: settingsMap
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/admin/settings (Admin update settings)
const updateSettings = async (req, res, next) => {
  try {
    const settingsObj = req.body; // e.g. { tax_rate_percent: '5.0', packing_charge: '15.0' }

    for (const [key, value] of Object.entries(settingsObj)) {
      await db.query(
        `INSERT INTO restaurant_settings (key, value)
         VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value)]
      );
    }

    res.json({
      success: true,
      message: 'Restaurant settings updated successfully.'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
