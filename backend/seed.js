const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Furniture = require('./models/Furniture');

dotenv.config();

const furnitureData = [
    {
        name: "Modern Velvet Sofa",
        category: "Sofas",
        price: 1299,
        material: "Velvet Fabric",
        dimensions: { width: 220, height: 85, depth: 95 },
        modelUrl: "/models/sofa.glb",
        imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
        galleryImages: [
            "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1505693415957-40b9f59f03c4?auto=format&fit=crop&q=80&w=800"
        ],
        colors: ["#2D3E50", "#8D6E63", "#4A5568"],
        rating: 4.8,
        reviews: 124,
        description: "Experience ultimate comfort with our Modern Velvet Sofa. Featuring premium velvet upholstery and solid wood frame, this sofa combines elegance with durability. Perfect for contemporary living spaces."
    },
    {
        name: "Scandinavian Dining Table",
        category: "Tables",
        price: 899,
        dimensions: { width: 180, height: 75, depth: 90 },
        modelUrl: "/models/table.glb",
        imageUrl: "https://images.unsplash.com/photo-1530018607912-eff2df114f11?auto=format&fit=crop&q=80&w=800",
        rating: 4.5,
        reviews: 89,
        description: "Minimalist oak dining table perfect for family gatherings."
    },
    {
        name: "Ergonomic Office Chair",
        category: "Chairs",
        price: 549,
        dimensions: { width: 65, height: 120, depth: 65 },
        modelUrl: "/models/chair.glb",
        imageUrl: "https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&q=80&w=800",
        rating: 4.9,
        reviews: 156,
        description: "High-performance office chair with lumbar support."
    },
    {
        name: "Minimalist Bookshelf",
        category: "Storage",
        price: 399,
        dimensions: { width: 90, height: 180, depth: 30 },
        modelUrl: "/models/shelf.glb",
        imageUrl: "https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=800",
        rating: 4.7,
        reviews: 78,
        description: "Open-concept bookshelf with modern aesthetics."
    },
    {
        name: "Luxury King Bed Frame",
        category: "Beds",
        price: 1599,
        dimensions: { width: 200, height: 110, depth: 210 },
        modelUrl: "/models/bed.glb",
        imageUrl: "https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=800",
        rating: 4.6,
        reviews: 67,
        description: "Elegant upholstered bed frame with winged headboard."
    },
    {
        name: "Industrial Coffee Table",
        category: "Tables",
        price: 349,
        dimensions: { width: 110, height: 45, depth: 60 },
        modelUrl: "/models/coffee-table.glb",
        imageUrl: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
        rating: 4.4,
        reviews: 92,
        description: "Rustic wood and metal coffee table for an urban look."
    },
    {
        name: "Premium Round Table",
        category: "Tables",
        price: 1150,
        dimensions: { width: 120, height: 75, depth: 120 },
        modelUrl: "/models/round_table.glb",
        imageUrl: "https://images.unsplash.com/photo-1581428982868-e410dd047a90?auto=format&fit=crop&q=80&w=800",
        rating: 5.0,
        reviews: 1,
        description: "A premium round 3D table model for testing high-fidelity rendering."
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        await Furniture.deleteMany({});
        await Furniture.insertMany(furnitureData);
        console.log('Database Seeded!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
