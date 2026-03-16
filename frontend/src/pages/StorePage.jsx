import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, SlidersHorizontal, Grid, List, RotateCcw } from 'lucide-react';
import FurnitureCard from '../components/FurnitureCard';

const StorePage = () => {
    const [furniture, setFurniture] = useState([]);
    const [filteredFurniture, setFilteredFurniture] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [priceRange, setPriceRange] = useState(2000);
    const [activeMaterial, setActiveMaterial] = useState('All');

    const categories = ['All', 'Sofas', 'Tables', 'Chairs', 'Beds', 'Storage'];
    const materials = ['All', 'Wood', 'Metal', 'Fabric', 'Velvet', 'Leather'];

    useEffect(() => {
        const fetchFurniture = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/furniture`);
                setFurniture(res.data);
                setFilteredFurniture(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchFurniture();
    }, []);

    useEffect(() => {
        let result = furniture;

        if (activeCategory !== 'All') {
            result = result.filter(item => item.category === activeCategory);
        }

        result = result.filter(item => item.price <= priceRange);

        // Simulated material filtering as we don't have this in the model yet, 
        // we'll just show everything for now or filter by description if matches
        if (activeMaterial !== 'All') {
            result = result.filter(item =>
                item.description.toLowerCase().includes(activeMaterial.toLowerCase())
            );
        }

        setFilteredFurniture(result);
    }, [activeCategory, priceRange, activeMaterial, furniture]);

    const resetFilters = () => {
        setActiveCategory('All');
        setPriceRange(2000);
        setActiveMaterial('All');
    };

    return (
        <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 mb-2 font-serif tracking-tight">
                            Furniture Catalog
                        </h1>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                            {filteredFurniture.length} products available
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
                        <button className="p-2 bg-[#111827] text-white rounded-xl shadow-md transition-all">
                            <Grid className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-transparent text-gray-400 hover:text-gray-900 transition-all">
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-80 shrink-0">
                        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-28">
                            <div className="flex items-center justify-between mb-10">
                                <div className="flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-gray-900" />
                                    <h3 className="text-xl font-black text-gray-900">Filters</h3>
                                </div>
                                <button
                                    onClick={resetFilters}
                                    className="text-xs font-bold text-[#A85517] hover:text-[#8B4413] flex items-center gap-1 transition-all uppercase tracking-wider"
                                >
                                    <RotateCcw className="w-3 h-3" /> Reset
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-10">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">Category</h4>
                                <div className="space-y-4">
                                    {categories.map(cat => (
                                        <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    className="appearance-none w-5 h-5 rounded-full border-2 border-gray-200 checked:border-[#A85517] transition-all cursor-pointer"
                                                    checked={activeCategory === cat}
                                                    onChange={() => setActiveCategory(cat)}
                                                />
                                                {activeCategory === cat && <div className="absolute w-2.5 h-2.5 bg-[#A85517] rounded-full"></div>}
                                            </div>
                                            <span className={`text-sm font-bold transition-all ${activeCategory === cat ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                {cat}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-10">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">Price Range</h4>
                                <div className="px-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="2000"
                                        step="50"
                                        value={priceRange}
                                        onChange={(e) => setPriceRange(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#A85517]"
                                    />
                                    <div className="flex justify-between mt-4 text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                                        <span>$0</span>
                                        <span className="text-[#A85517] bg-orange-50 px-2 py-0.5 rounded text-[13px] font-black tracking-normal">Up to ${priceRange}</span>
                                        <span>$2000</span>
                                    </div>
                                </div>
                            </div>

                            {/* Material Filter */}
                            <div className="mb-4">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">Material</h4>
                                <div className="flex flex-wrap gap-2">
                                    {materials.map(material => (
                                        <button
                                            key={material}
                                            onClick={() => setActiveMaterial(material)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${activeMaterial === material
                                                ? 'bg-[#111827] text-white border-[#111827] shadow-md'
                                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-300'
                                                }`}
                                        >
                                            {material}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-[32px] h-[450px] animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredFurniture.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredFurniture.map(item => (
                                    <FurnitureCard key={item._id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[32px] p-20 text-center flex flex-col items-center shadow-sm border border-gray-100">
                                <div className="bg-orange-50 p-6 rounded-full mb-6">
                                    <RotateCcw className="w-12 h-12 text-[#A85517] opacity-20" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2 font-serif">No products found</h3>
                                <p className="text-gray-500 font-medium mb-8">Try adjusting your filters to find what you're looking for.</p>
                                <button
                                    onClick={resetFilters}
                                    className="bg-[#111827] text-white px-8 py-3 rounded-full font-bold transition-all hover:bg-[#A85517] shadow-lg shadow-orange-900/10"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorePage;
