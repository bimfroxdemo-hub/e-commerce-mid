const Category = require('../../models/Category');
const { sendSuccess, sendError } = require('../../utils/response');

const createCategory = async (req, res) => {
  try {
    const { name, slug, description } = req.body;
    
    // Resolve the uploaded image URL from req.file or req.body
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path || req.file.location || req.file.url;
      if (!imageUrl && req.file.filename) {
        imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }
    }

    if (!name || !slug) {
      return sendError(res, "Category Name and Slug are required", 400);
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      description: description || '',
      image: imageUrl || null
    });

    return sendSuccess(res, "Category created successfully", { category });
  } catch (error) {
    console.error("Create Category Error:", error);
    return sendError(res, error.message, 500);
  }
};