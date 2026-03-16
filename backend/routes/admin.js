const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Furniture = require('../models/Furniture');
const User = require('../models/User');
const Design = require('../models/Design');

const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.webp', '.glb'].includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only images and .glb models are allowed'), false);
        }
    }
});

// Middleware to check admin role
const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: 'Admin access required' });
        }
        next();
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// ── ANALYTICS ──────────────────────────────────────────────────────────────

// @route   GET /api/admin/stats
// @desc    Get platform-wide statistics
// @access  Admin only
router.get('/stats', auth, adminOnly, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDesigns = await Design.countDocuments();
        const totalFurniture = await Furniture.countDocuments();
        const recentDesigns = await Design.find().sort({ createdAt: -1 }).limit(5).populate('creator', 'name email');
        res.json({ totalUsers, totalDesigns, totalFurniture, recentDesigns });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ── FURNITURE CRUD ──────────────────────────────────────────────────────────

// @route   POST /api/admin/furniture
// @desc    Add new furniture item with file upload
// @access  Admin only
router.post('/furniture', auth, adminOnly, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, category, price, width, height, depth, colors, description } = req.body;
        
        let imageUrl = '';
        let modelUrl = '';

        if (req.files['image']) {
            imageUrl = `/uploads/${req.files['image'][0].filename}`;
        }
        if (req.files['model']) {
            modelUrl = `/uploads/${req.files['model'][0].filename}`;
        }

        const furnitureData = {
            name,
            category,
            price: Number(price),
            dimensions: {
                width: Number(width),
                height: Number(height),
                depth: Number(depth)
            },
            colors: typeof colors === 'string' ? colors.split(',') : colors,
            description,
            imageUrl,
            modelUrl
        };

        const item = new Furniture(furnitureData);
        await item.save();
        res.status(201).json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/furniture/:id
// @desc    Update a furniture item with file upload
// @access  Admin only
router.put('/furniture/:id', auth, adminOnly, upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'model', maxCount: 1 }
]), async (req, res) => {
    try {
        const { name, category, price, width, height, depth, colors, description, material } = req.body;
        
        let updateData = {
            name,
            category,
            price: Number(price),
            dimensions: {
                width: Number(width),
                height: Number(height),
                depth: Number(depth)
            },
            colors: typeof colors === 'string' ? colors.split(',').map(c => c.trim()) : colors,
            description,
            material
        };

        if (req.files['image']) {
            updateData.imageUrl = `/uploads/${req.files['image'][0].filename}`;
        }
        if (req.files['model']) {
            updateData.modelUrl = `/uploads/${req.files['model'][0].filename}`;
        }

        const item = await Furniture.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/admin/furniture/:id
// @desc    Delete a furniture item
// @access  Admin only
router.delete('/furniture/:id', auth, adminOnly, async (req, res) => {
    try {
        const item = await Furniture.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        res.json({ msg: 'Item deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// ── USER MANAGEMENT ─────────────────────────────────────────────────────────

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Admin only
router.get('/users', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Change a user's role
// @access  Admin only
router.put('/users/:id/role', auth, adminOnly, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['admin', 'customer'].includes(role)) return res.status(400).json({ msg: 'Invalid role' });
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin only
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ msg: 'User deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
