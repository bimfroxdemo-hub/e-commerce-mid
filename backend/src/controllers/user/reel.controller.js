const Reel = require('../../models/Reel');

const PRODUCT_POPULATE_FIELDS =
  'name slug image images price salePrice oldPrice category brand stock inventory isActive';

exports.getPublicReels = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 5, 20);

    const reels = await Reel.find({ isActive: true })
      .populate('product', PRODUCT_POPULATE_FIELDS)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: reels,
    });
  } catch (error) {
    next(error);
  }
};