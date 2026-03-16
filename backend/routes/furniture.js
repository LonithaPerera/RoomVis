const express = require('express');
const router = express.Router();
const Furniture = require('../models/Furniture');

// @route   GET api/furniture
// @desc    Get all furniture
// @access  Public
router.get('/', async (req, res) => {
    try {
        const furniture = await Furniture.find().sort({ createdAt: -1 });
        res.json(furniture);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/furniture/:id
// @desc    Get furniture by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const item = await Furniture.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Furniture not found' });
        res.json(item);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') return res.status(404).json({ msg: 'Furniture not found' });
        res.status(500).send('Server Error');
    }
});

module.exports = router;
