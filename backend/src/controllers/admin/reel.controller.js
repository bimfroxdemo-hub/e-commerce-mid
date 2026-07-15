const mongoose = require('mongoose');
const Reel = require('../../models/Reel');
const { extractInstagramInfo } = require('../../utils/instagram');

const PRODUCT_POPULATE_FIELDS =
  'name slug image images price salePrice oldPrice category brand stock inventory isActive';

const normalizeProductId = (product) => {
  if (!product) return null;

  const productId =
    typeof product === 'object'
      ? product._id || product.id || product.productId
      : product;

  if (!productId) return null;

  if (!mongoose.Types.ObjectId.isValid(String(productId))) {
    throw new Error('Invalid linked product ID');
  }

  return productId;
};

exports.getReels = async (req, res, next) => {
  try {
    const reels = await Reel.find()
      .populate('product', PRODUCT_POPULATE_FIELDS)
      .sort({ displayOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      data: reels,
    });
  } catch (error) {
    next(error);
  }
};

exports.createReel = async (req, res) => {
  try {
    const {
      title,
      reelUrl,
      thumbnailUrl,
      caption,
      category,
      username,
      audioName,
      viewsLabel,
      likesLabel,
      commentsLabel,
      product,
      displayOrder,
      isActive,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!reelUrl || !String(reelUrl).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Instagram reel URL is required',
      });
    }

    const instagramInfo = extractInstagramInfo(reelUrl);

    const linkedProductId = normalizeProductId(product);

    const reel = await Reel.create({
      title: String(title).trim(),
      reelUrl: instagramInfo.normalizedUrl,
      type: instagramInfo.type,
      shortcode: instagramInfo.shortcode,
      embedUrl: instagramInfo.embedUrl,

      thumbnailUrl: thumbnailUrl || '',
      caption: caption || '',
      category: category || 'Fashion',
      username: username || '@luxe.atelier',
      audioName: audioName || 'Original audio',

      viewsLabel: viewsLabel || '',
      likesLabel: likesLabel || '',
      commentsLabel: commentsLabel || '',

      // ✅ This is the actual product tracking/linking
      product: linkedProductId,

      displayOrder: Number(displayOrder) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    const populatedReel = await Reel.findById(reel._id).populate(
      'product',
      PRODUCT_POPULATE_FIELDS
    );

    res.status(201).json({
      success: true,
      message: 'Reel created successfully',
      data: populatedReel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create reel',
    });
  }
};

exports.updateReel = async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    const payload = { ...req.body };

    if (payload.title !== undefined) {
      payload.title = String(payload.title || '').trim();

      if (!payload.title) {
        return res.status(400).json({
          success: false,
          message: 'Title is required',
        });
      }
    }

    if (payload.reelUrl && payload.reelUrl !== reel.reelUrl) {
      const instagramInfo = extractInstagramInfo(payload.reelUrl);

      payload.reelUrl = instagramInfo.normalizedUrl;
      payload.type = instagramInfo.type;
      payload.shortcode = instagramInfo.shortcode;
      payload.embedUrl = instagramInfo.embedUrl;
    }

    // ✅ Handle linked product update
    if (payload.product !== undefined) {
      payload.product = normalizeProductId(payload.product);
    }

    if (payload.displayOrder !== undefined) {
      payload.displayOrder = Number(payload.displayOrder) || 0;
    }

    if (payload.isActive !== undefined) {
      payload.isActive = Boolean(payload.isActive);
    }

    const updatedReel = await Reel.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    }).populate('product', PRODUCT_POPULATE_FIELDS);

    res.json({
      success: true,
      message: 'Reel updated successfully',
      data: updatedReel,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update reel',
    });
  }
};

exports.deleteReel = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    await reel.deleteOne();

    res.json({
      success: true,
      message: 'Reel deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleReelStatus = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: 'Reel not found',
      });
    }

    reel.isActive = !reel.isActive;
    await reel.save();

    const populatedReel = await Reel.findById(reel._id).populate(
      'product',
      PRODUCT_POPULATE_FIELDS
    );

    res.json({
      success: true,
      message: 'Reel status updated',
      data: populatedReel,
    });
  } catch (error) {
    next(error);
  }
};