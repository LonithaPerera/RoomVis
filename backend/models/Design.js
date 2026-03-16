const mongoose = require('mongoose');

const FurnitureItemSchema = new mongoose.Schema({
    furnitureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Furniture',
    },
    name: { type: String },
    category: { type: String },
    color: { type: String },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 },
    },
    rotation: {
        y: { type: Number, default: 0 },
    },
    scaleX: { type: Number, default: 100 },
    scaleY: { type: Number, default: 100 },
    width: { type: Number, default: 1 },
    depth: { type: Number, default: 1 },
    modelUrl: { type: String },
});

const DesignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 'Untitled Design',
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    roomSettings: {
        width: { type: Number, default: 10 },
        depth: { type: Number, default: 8 },
        wallColor: { type: String, default: '#F2F2F2' },
        floorColor: { type: String, default: '#C4A484' },
    },
    furnitureItems: [FurnitureItemSchema],
    thumbnail: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Design', DesignSchema);
