const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  updateCategoryOrder
} = require('../../controllers/admin/category.controller');
const authenticate = require('../../middleware/auth');
const adminOnly = require('../../middleware/admin');
const handleUpload = require('../../middleware/upload');

router.use(authenticate);
router.use(adminOnly);

router.get('/', getAllCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategory);
router.post('/', handleUpload('categoryImage', 1), createCategory);
router.put('/:id', handleUpload('categoryImage', 1), updateCategory);
router.delete('/:id', deleteCategory);
router.post('/update-order', updateCategoryOrder);

// ✅ DYNAMIC COVER IMAGE UPLOADER (Integrates with your exact upload middleware)
router.post('/upload', handleUpload('categoryImage', 1), (req, res) => {
  try {
    const file = req.file || (req.files && req.files[0]);
    let imageUrl = req.body.image || file?.path || file?.location || file?.url;
    
    // Local static file path fallback
    if (!imageUrl && file?.filename) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "Upload failed. Image path could not be resolved." });
    }

    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;