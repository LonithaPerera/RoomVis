const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Design = require('../models/Design');

// @route   GET /api/designs
// @desc    Get all designs for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const designs = await Design.find({ creator: req.user.id }).sort({ updatedAt: -1 });
        res.json(designs);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/designs
// @desc    Create or update a design
// @access  Private
router.post('/', auth, async (req, res) => {
    const { name, roomSettings, placedItems } = req.body;

    // Map the editor's placedItems format to the DB schema
    const furnitureItems = placedItems.map(item => ({
        furnitureId: item.furnitureId,
        name: item.name,
        category: item.category,
        color: item.color,
        position: { x: item.x, y: 0, z: item.y },
        rotation: { y: item.rotation },
        scaleX: item.scaleX,
        scaleY: item.scaleY,
        width: item.width,
        depth: item.depth,
    }));

    try {
        const design = new Design({
            name: name || 'Untitled Design',
            creator: req.user.id,
            roomSettings,
            furnitureItems,
            thumbnail: null,
            updatedAt: Date.now(),
        });

        await design.save();
        res.json(design);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/designs/:id
// @desc    Update a specific design
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, roomSettings, placedItems } = req.body;

    const furnitureItems = (placedItems || []).map(item => ({
        furnitureId: item.furnitureId,
        name: item.name,
        category: item.category,
        color: item.color,
        position: { x: item.x, y: 0, z: item.y },
        rotation: { y: item.rotation },
        scaleX: item.scaleX,
        scaleY: item.scaleY,
        width: item.width,
        depth: item.depth,
    }));

    try {
        let design = await Design.findById(req.params.id);
        if (!design) return res.status(404).json({ msg: 'Design not found' });
        if (design.creator.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        design.name = name || design.name;
        design.roomSettings = roomSettings || design.roomSettings;
        design.furnitureItems = furnitureItems;
        design.updatedAt = Date.now();

        await design.save();
        res.json(design);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/designs/:id
// @desc    Delete a design
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const design = await Design.findById(req.params.id);
        if (!design) return res.status(404).json({ msg: 'Design not found' });
        if (design.creator.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        await Design.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Design removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
