import { useNavigate } from 'react-router-dom';
import { Star, Box, ShoppingCart } from 'lucide-react';

const FurnitureCard = ({ item }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group">
            {/* Image Container */}
            <div
                onClick={() => navigate(`/store/${item._id}`)}
                className="relative h-64 overflow-hidden cursor-pointer"
            >
                <img
                    src={item.imageUrl?.startsWith('/') ? encodeURI(`${import.meta.env.VITE_API_URL}${item.imageUrl}`) : item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-700 shadow-sm">
                    {item.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3
                        onClick={() => navigate(`/store/${item._id}`)}
                        className="text-xl font-bold text-gray-900 group-hover:text-[#A85517] transition-colors line-clamp-1 cursor-pointer"
                    >
                        {item.name}
                    </h3>
                </div>

                <p className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-tight">{item.category}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                        />
                    ))}
                    <span className="text-xs text-gray-400 font-bold ml-1">({item.reviews})</span>
                </div>

                {/* Price */}
                <div className="text-2xl font-black text-gray-900 mb-6">
                    ${item.price}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                    <button
                        onClick={() => navigate(`/editor?item=${item._id}`)}
                        className="w-full bg-white border-2 border-gray-100 py-3 rounded-xl font-bold text-sm text-gray-700 hover:border-[#A85517] hover:text-[#A85517] transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        <Box className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Visualize in 3D
                    </button>
                    <button
                        className="w-full bg-[#111827] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#A85517] transition-all flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FurnitureCard;
