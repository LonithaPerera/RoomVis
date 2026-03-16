import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Star, ChevronRight, Minus, Plus, Box, ShoppingCart, Truck, ShieldCheck, RefreshCw, Ruler, Layers, Maximize, Image as ImageIcon } from 'lucide-react';
import Product3DViewer from '../components/Product3DViewer';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedColor, setSelectedColor] = useState(0);
    const [activeTab, setActiveTab] = useState('Description');
    const [show3D, setShow3D] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/furniture/${id}`);
                setProduct(res.data);
                setLoading(false);
                if (res.data.modelUrl) {
                    setShow3D(true);
                }
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleQuantity = (type) => {
        if (type === 'inc') setQuantity(q => q + 1);
        if (type === 'dec' && quantity > 1) setQuantity(q => q - 1);
    };

    if (loading) return <div className="pt-32 text-center animate-pulse text-gray-400 font-bold uppercase tracking-widest">Loading Details...</div>;
    if (!product) return <div className="pt-32 text-center text-red-500 font-bold uppercase tracking-widest">Product Not Found</div>;

    const thumbnails = product.galleryImages?.length > 0 ? product.galleryImages : [product.imageUrl];

    return (
        <div className="pt-24 pb-16 bg-white min-h-screen">
            <div className="container mx-auto px-6 max-w-7xl">

                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-gray-400 mb-12">
                    <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link to="/store" className="hover:text-gray-900 transition-colors">Store</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">

                    {/* Left: Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square bg-gray-50 rounded-[40px] overflow-hidden border border-gray-100 shadow-sm relative group">
                            {show3D && product.modelUrl ? (
                                <Product3DViewer modelUrl={product.modelUrl} />
                            ) : (
                                <img
                                    src={thumbnails[selectedImage]?.startsWith('/') ? encodeURI(`${import.meta.env.VITE_API_URL}${thumbnails[selectedImage]}`) : thumbnails[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            )}

                            {product.modelUrl && (
                                <button
                                    onClick={() => setShow3D(!show3D)}
                                    className="absolute top-6 right-6 bg-white shadow-xl px-4 py-2.5 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#A85517] hover:text-white transition-all z-10"
                                >
                                    {show3D ? <ImageIcon className="w-3.5 h-3.5" /> : <Box className="w-3.5 h-3.5" />}
                                    {show3D ? 'View Photos' : 'View in 3D'}
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4">
                            {!show3D && thumbnails.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-[#A85517] ring-4 ring-orange-50' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img 
                                        src={img?.startsWith('/') ? encodeURI(`${import.meta.env.VITE_API_URL}${img}`) : img} 
                                        className="w-full h-full object-cover" 
                                        alt="" 
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Info */}
                    <div className="flex flex-col">
                        <h1 className="text-5xl font-black text-gray-900 mb-4 font-serif leading-tight">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                                {product.rating} ({product.reviews} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className="text-5xl font-black text-gray-900 mb-12 leading-none">
                            ${product.price}
                        </div>

                        {/* Specifications */}
                        <div className="mb-12">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 py-2 border-b border-gray-100 inline-block">Specifications</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Ruler className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Width</p>
                                        <p className="text-sm font-bold text-gray-800">{product.dimensions.width}cm</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <div className="w-5 h-5 flex flex-col justify-center gap-0.5">
                                            <div className="w-full h-0.5 bg-gray-400 rounded-full" />
                                            <div className="w-full h-0.5 bg-gray-400 rounded-full" />
                                            <div className="w-full h-0.5 bg-gray-400 rounded-full" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Height</p>
                                        <p className="text-sm font-bold text-gray-800">{product.dimensions.height}cm</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 transform rotate-90">
                                        <Ruler className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Depth</p>
                                        <p className="text-sm font-bold text-gray-800">{product.dimensions.depth}cm</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <Layers className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Material</p>
                                        <p className="text-sm font-bold text-gray-800">{product.material || 'Premium Upholstery'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Color Selector */}
                        <div className="mb-10">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Available Colors</h3>
                            <div className="flex gap-4">
                                {product.colors?.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedColor(idx)}
                                        className={`w-12 h-12 rounded-full border-4 transition-all ${selectedColor === idx ? 'border-[#A85517] scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Quantity & Actions */}
                        <div className="mb-12">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Quantity</h3>
                            <div className="flex items-center gap-8">
                                <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-100 p-1.5">
                                    <button
                                        onClick={() => handleQuantity('dec')}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-500 hover:text-gray-900 shadow-sm transition-all"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="w-12 text-center font-black text-lg text-gray-800">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantity('inc')}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-gray-500 hover:text-gray-900 shadow-sm transition-all"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mb-16">
                            <button
                                onClick={() => navigate(`/editor?item=${product._id}`)}
                                className="w-full bg-[#A85517] text-white py-5 rounded-[22px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-[#8B4413] transition-all shadow-xl shadow-orange-900/20 active:scale-[0.98]"
                            >
                                <Box className="w-6 h-6" />
                                Open in Room Editor
                            </button>
                            <button className="w-full bg-white border-2 border-gray-900 text-gray-900 py-5 rounded-[22px] font-black text-lg uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-gray-900 hover:text-white transition-all active:scale-[0.98]">
                                <ShoppingCart className="w-6 h-6" />
                                Add to Cart
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-8 py-8 border-t border-gray-100">
                            <div className="flex flex-col items-center gap-3 text-center">
                                <Truck className="w-6 h-6 text-[#A85517] opacity-60" />
                                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Free Shipping</span>
                            </div>
                            <div className="flex flex-col items-center gap-3 text-center border-x border-gray-100">
                                <ShieldCheck className="w-6 h-6 text-[#A85517] opacity-60" />
                                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">2 Year Warranty</span>
                            </div>
                            <div className="flex flex-col items-center gap-3 text-center">
                                <RefreshCw className="w-6 h-6 text-[#A85517] opacity-60" />
                                <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">30 Day Returns</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="mb-20">
                    <div className="flex border-b border-gray-100 mb-12">
                        {['Description', 'Dimensions', `Reviews (${product.reviews})`].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.split(' ')[0])}
                                className={`px-8 py-4 text-sm font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === tab.split(' ')[0] ? 'border-[#A85517] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <div className="max-w-4xl">
                        {activeTab === 'Description' && (
                            <p className="text-gray-500 leading-relaxed text-lg font-medium">
                                {product.description}
                            </p>
                        )}
                        {activeTab === 'Dimensions' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Width</span>
                                    <span className="text-gray-900 font-black">{product.dimensions.width} cm</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Height</span>
                                    <span className="text-gray-900 font-black">{product.dimensions.height} cm</span>
                                </div>
                                <div className="flex justify-between items-center py-4 border-b border-gray-50">
                                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Depth</span>
                                    <span className="text-gray-900 font-black">{product.dimensions.depth} cm</span>
                                </div>
                            </div>
                        )}
                        {activeTab === 'Reviews' && (
                            <div className="text-center py-12 bg-gray-50 rounded-[32px]">
                                <Star className="w-12 h-12 text-[#A85517] opacity-20 mx-auto mb-4" />
                                <h3 className="text-xl font-black text-gray-900 font-serif">Customer Feedback</h3>
                                <p className="text-gray-400 mt-2">Displaying top rated reviews for this collection.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProductDetailPage;
