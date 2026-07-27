const Product = require('../../models/Product');
const Category = require('../../models/Category');
const { sendSuccess, sendError } = require('../../utils/response');
const mongoose = require('mongoose');

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter query
    const filter = { isActive: true };

    // ✅ SCOPING: Resolve category slugs or names dynamically into active category Document ObjectIDs
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        filter.category = category;
      } else {
        const catDoc = await Category.findOne({
          $or: [
            { slug: { $regex: new RegExp(`^${category}$`, 'i') } },
            { name: { $regex: new RegExp(`^${category}$`, 'i') } }
          ]
        });
        if (catDoc) {
          filter.category = catDoc._id;
        } else {
          filter.category = null; // Forces empty result set if category slug is incorrect
        }
      }
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    const allTags = await Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    sendSuccess(res, 'Products fetched successfully', {
      products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      filters: {
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 },
        tags: allTags.map(tag => tag._id)
      }
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate('category', 'name description');

    if (!product || !product.isActive) {
      return sendError(res, 'Product not found', 404);
    }

    product.views += 1;
    await product.save();

    // Query related products based on shared category
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true
    })
      .populate('category', 'name')
      .limit(4);

    sendSuccess(res, 'Product fetched successfully', {
      product,
      relatedProducts
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 });

    sendSuccess(res, 'Categories fetched successfully', categories);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return sendSuccess(res, 'Search results', []);
    }

    const products = await Product.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    })
      .select('name price images category')
      .populate('category', 'name')
      .limit(parseInt(limit));

    sendSuccess(res, 'Search results', products);
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

module.exports = {
  getProducts,
  getProduct,
  getCategories,
  searchProducts
};