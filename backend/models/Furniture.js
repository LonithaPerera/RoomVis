const mongoose = require('mongoose');

const FurnitureSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Chairs', 'Tables', 'Sofas', 'Beds', 'Storage', 'Other'],
    },
    price: {
        type: Number,
        required: true,
    },
    dimensions: {
        width: Number,
        height: Number,
        depth: Number,
    },
    modelUrl: {
        type: String, // Path to .glb or .gltF file
        required: true,
    },
    imageUrl: {
        type: String, // Path to thumbnail image
        required: true,
    },
    galleryImages: [String], // Array of gallery image URLs
    material: String,
    colors: [String],
    description: String,
    rating: {
        type: Number,
        default: 0,
    },
    reviews: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Furniture', FurnitureSchema);
