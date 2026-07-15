const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        reelUrl: {
            type: String,
            required: true,
            trim: true,
        },

        type: {
            type: String,
            enum: ['reel', 'post', 'tv'],
            default: 'reel',
        },

        shortcode: {
            type: String,
            required: true,
            index: true,
        },

        embedUrl: {
            type: String,
            required: true,
        },

        thumbnailUrl: {
            type: String,
            default: '',
        },

        caption: {
            type: String,
            default: '',
        },

        category: {
            type: String,
            default: 'Fashion',
        },

        username: {
            type: String,
            default: '@luxe.atelier',
        },

        audioName: {
            type: String,
            default: 'Original audio',
        },

        viewsLabel: {
            type: String,
            default: '',
        },

        likesLabel: {
            type: String,
            default: '',
        },

        commentsLabel: {
            type: String,
            default: '',
        },

        // ✅ This links reel to product
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            default: null,
        },

        displayOrder: {
            type: Number,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Reel', reelSchema);