import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
    LayoutGrid, Package, Users, BarChart3, Trash2, Pencil,
    Plus, X, Check, Star, Search, ChevronDown, AlertTriangle,
    ArrowLeft, Layers, ShoppingBag
} from 'lucide-react';

const CATEGORIES = ['Chairs', 'Tables', 'Sofas', 'Beds', 'Storage', 'Other'];

const EMPTY_FORM = {
    name: '', category: 'Sofas', price: '', material: '',
    description: '',
    dimensions: { width: '', height: '', depth: '' },
    image: null, model: null, // Files
    imageUrl: '', modelUrl: '', // Fallback/Existing
    colors: '#111827',
    rating: '4.5', reviews: '0',
};

// ─── Sub-components ────────────────────────────────────────────────────────

const StatCard = ({ label, value, icon: Icon, color, bg, delta }) => (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
        <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-gray-900">{value}</p>
            {delta && <p className="text-[11px] font-bold text-green-500 mt-1">{delta}</p>}
        </div>
        <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color}`} />
        </div>
    </div>
);

// ─── Add/Edit Furniture Modal ───────────────────────────────────────────────

const FurnitureModal = ({ initial, onClose, onSave }) => {
    const [form, setForm] = useState(initial || EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
    const setDim = (dim, val) => setForm(prev => ({ ...prev, dimensions: { ...prev.dimensions, [dim]: val } }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        const formData = new FormData();
        formData.append('name', form.name);
        formData.append('category', form.category);
        formData.append('price', form.price);
        formData.append('material', form.material);
        formData.append('description', form.description);
        formData.append('width', form.dimensions.width);
        formData.append('height', form.dimensions.height);
        formData.append('depth', form.dimensions.depth);
        formData.append('colors', form.colors);
        formData.append('rating', form.rating);
        formData.append('reviews', form.reviews);

        if (form.image) formData.append('image', form.image);
        if (form.model) formData.append('model', form.model);

        await onSave(formData);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
                    <h2 className="text-lg font-black text-gray-900">{initial ? 'Edit Furniture' : 'Add New Furniture'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Product Name *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 focus:border-[#A85517]" placeholder="e.g. Modern Velvet Sofa" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Category *</label>
                            <select required value={form.category} onChange={e => set('category', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100">
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Price (USD) *</label>
                            <input required type="number" value={form.price} onChange={e => set('price', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100" placeholder="1299" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Material</label>
                            <input value={form.material} onChange={e => set('material', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100" placeholder="e.g. Velvet & Steel" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Colors (comma-separated hex)</label>
                            <input value={typeof form.colors === 'string' ? form.colors : form.colors?.join(', ')} onChange={e => set('colors', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100" placeholder="#111827, #8B4513" />
                        </div>
                        <div className="col-span-2 grid grid-cols-3 gap-3">
                            {['width', 'height', 'depth'].map(dim => (
                                <div key={dim}>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{dim} (cm)</label>
                                    <input type="number" value={form.dimensions[dim]} onChange={e => setDim(dim, e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100" placeholder="100" />
                                </div>
                            ))}
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Product Image (PNG/JPG)</label>
                                <input type="file" accept="image/*" onChange={e => set('image', e.target.files[0])} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-orange-50 file:text-[#A85517] hover:file:bg-orange-100" />
                                {form.imageUrl && <p className="mt-1 text-[10px] text-gray-400 italic truncate">Current: {form.imageUrl}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">3D Model (.GLB)</label>
                                <input type="file" accept=".glb" onChange={e => set('model', e.target.files[0])} className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-orange-50 file:text-[#A85517] hover:file:bg-orange-100" />
                                {form.modelUrl && <p className="mt-1 text-[10px] text-gray-400 italic truncate">Current: {form.modelUrl}</p>}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100 resize-none" placeholder="Short product description..." />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Rating</label>
                            <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={e => set('rating', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Reviews count</label>
                            <input type="number" value={form.reviews} onChange={e => set('reviews', e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-100" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl bg-[#A85517] hover:bg-[#8B4413] text-white text-sm font-bold transition-colors shadow-lg shadow-orange-900/10">
                            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Add Furniture'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Main Admin Page ────────────────────────────────────────────────────────

const AdminPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('analytics');
    const [stats, setStats] = useState(null);
    const [furniture, setFurniture] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchAll();
    }, [user]);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [statsRes, furnitureRes, usersRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/admin/stats`),
                axios.get(`${import.meta.env.VITE_API_URL}/furniture`),
                axios.get(`${import.meta.env.VITE_API_URL}/admin/users`),
            ]);
            setStats(statsRes.data);
            setFurniture(furnitureRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Admin fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Furniture CRUD
    const saveFurniture = async (formData) => {
        try {
            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (editTarget) {
                // For updates, if files are not provided, we might need a separate endpoint or handle it in backend
                // For now, let's just use the same form data (multer handles it)
                const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/furniture/${editTarget._id}`, formData, config);
                setFurniture(prev => prev.map(f => f._id === editTarget._id ? res.data : f));
            } else {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/admin/furniture`, formData, config);
                setFurniture(prev => [res.data, ...prev]);
            }
            setShowModal(false);
            setEditTarget(null);
            fetchAll(); // Refresh stats and list
        } catch (err) {
            console.error('Save furniture error:', err);
        }
    };

    const deleteFurniture = async (id) => {
        if (!window.confirm('Delete this furniture item permanently?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/furniture/${id}`);
            setFurniture(prev => prev.filter(f => f._id !== id));
        } catch (err) { console.error(err); }
    };

    // User management
    const changeRole = async (id, role) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/admin/users/${id}/role`, { role });
            setUsers(prev => prev.map(u => u._id === id ? res.data : u));
        } catch (err) { console.error(err); }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Delete this user account permanently?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (err) { console.error(err); }
    };

    const filteredFurniture = furniture.filter(f => {
        const matchesSearch = (f.name || '').toLowerCase().includes(search.toLowerCase());
        const matchesCat = categoryFilter === 'All' || f.category === categoryFilter;
        return matchesSearch && matchesCat;
    });

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F4F1]">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 border-4 border-[#A85517] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Admin Portal...</p>
            </div>
        </div>
    );

    const TABS = [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'furniture', label: 'Furniture Management', icon: Package },
        { id: 'users', label: 'User Management', icon: Users },
    ];

    return (
        <div className="min-h-screen flex bg-[#F5F4F1]">

            {/* ── Sidebar ── */}
            <aside className="w-64 bg-[#111827] text-white flex flex-col shrink-0">
                <div className="px-6 py-8 border-b border-white/10">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Admin Portal</p>
                    <p className="text-[11px] text-white/60">Designers Only</p>
                </div>
                <nav className="flex-1 p-4 space-y-1.5">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveTab(id); setSearch(''); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === id ? 'bg-[#A85517] text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}
                        >
                            <Icon className="w-4 h-4" /> {label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <Link to="/" className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Site
                    </Link>
                    <div className="flex items-center gap-3 mt-4">
                        <div className="w-8 h-8 rounded-lg bg-[#A85517] flex items-center justify-center text-white text-xs font-black">
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <p className="text-[11px] font-black text-white">{user?.name}</p>
                            <p className="text-[10px] text-white/40 capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>
                <p className="p-4 text-[9px] text-white/20 text-center">RoomVis v1.0.0</p>
            </aside>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-10">

                    {/* ── Analytics Tab ── */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Analytics Overview</h1>
                                <p className="text-sm text-gray-400 mt-1">Platform usage statistics and insights</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <StatCard label="Total Users" value={stats?.totalUsers ?? '-'} icon={Users} color="text-blue-500" bg="bg-blue-50" delta="+12%" />
                                <StatCard label="Total Designs" value={stats?.totalDesigns ?? '-'} icon={LayoutGrid} color="text-[#A85517]" bg="bg-orange-50" delta="+18%" />
                                <StatCard label="Furniture Items" value={stats?.totalFurniture ?? '-'} icon={Package} color="text-purple-500" bg="bg-purple-50" delta="+5%" />
                            </div>

                            {/* Recent Designs Activity */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-sm font-black text-gray-800 mb-5 uppercase tracking-widest">Recent Design Activity</h2>
                                {stats?.recentDesigns?.length === 0 && (
                                    <p className="text-sm text-gray-400 text-center py-8">No designs saved yet</p>
                                )}
                                <div className="space-y-0 divide-y divide-gray-50">
                                    {(stats?.recentDesigns || []).map((d, i) => (
                                        <div key={d._id} className="flex items-center justify-between py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                                    <LayoutGrid className="w-4 h-4 text-[#A85517]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{d.name}</p>
                                                    <p className="text-[11px] text-gray-400">by {d.creator?.name || 'Unknown'} · {d.creator?.email}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[11px] text-gray-400">{new Date(d.createdAt).toLocaleDateString()}</p>
                                                <p className="text-[11px] font-bold text-gray-500">{d.furnitureItems?.length || 0} items</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-sm font-black text-gray-800 mb-5 uppercase tracking-widest">Furniture by Category</h2>
                                <div className="space-y-3">
                                    {CATEGORIES.map(cat => {
                                        const count = furniture.filter(f => f.category === cat).length;
                                        const pct = furniture.length > 0 ? (count / furniture.length) * 100 : 0;
                                        return (
                                            <div key={cat} className="flex items-center gap-4">
                                                <span className="w-20 text-xs font-bold text-gray-500 shrink-0">{cat}</span>
                                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#A85517] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                                </div>
                                                <span className="text-xs font-black text-gray-600 w-8 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Furniture Management Tab ── */}
                    {activeTab === 'furniture' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Furniture Management</h1>
                                    <p className="text-sm text-gray-400 mt-1">{furniture.length} products in inventory</p>
                                </div>
                                <button
                                    onClick={() => { setEditTarget(null); setShowModal(true); }}
                                    className="flex items-center gap-2 bg-[#111827] hover:bg-[#A85517] text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
                                >
                                    <Plus className="w-4 h-4" /> Add Product
                                </button>
                            </div>

                            {/* Filters */}
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-100" />
                                </div>
                                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-600 outline-none">
                                    <option value="All">All Categories</option>
                                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                </select>
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            {['Product', 'Category', 'Price', 'Rating', 'Dimensions', 'Actions'].map(h => (
                                                <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredFurniture.map(item => (
                                            <tr key={item._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img 
                                                            src={item.imageUrl?.startsWith('/') ? encodeURI(`${import.meta.env.VITE_API_URL}${item.imageUrl}`) : item.imageUrl} 
                                                            alt={item.name} 
                                                            className="w-10 h-10 rounded-lg object-cover bg-gray-100" 
                                                            onError={e => e.target.style.display = 'none'} 
                                                        />
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{item.name}</p>
                                                            <p className="text-[11px] text-gray-400">{item.material}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[11px] font-black text-[#A85517] bg-orange-50 px-2.5 py-1 rounded-full">{item.category}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-gray-900">${item.price?.toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                                        <span className="text-xs font-bold text-gray-700">{item.rating}</span>
                                                        <span className="text-[10px] text-gray-400">({item.reviews})</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-[11px] text-gray-500">
                                                    {item.dimensions?.width}×{item.dimensions?.depth}×{item.dimensions?.height} cm
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => { setEditTarget(item); setShowModal(true); }}
                                                            className="p-2 rounded-lg hover:bg-orange-50 text-gray-400 hover:text-[#A85517] transition-colors"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteFurniture(item._id)}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredFurniture.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-400">No furniture found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* ── User Management Tab ── */}
                    {activeTab === 'users' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
                                    <p className="text-sm text-gray-400 mt-1">{users.length} registered users</p>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <StatCard label="Total Users" value={users.length} icon={Users} color="text-blue-500" bg="bg-blue-50" />
                                <StatCard label="Admins" value={users.filter(u => u.role === 'admin').length} icon={AlertTriangle} color="text-[#A85517]" bg="bg-orange-50" />
                                <StatCard label="Customers" value={users.filter(u => u.role === 'customer').length} icon={ShoppingBag} color="text-purple-500" bg="bg-purple-50" />
                            </div>

                            {/* Search */}
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-100" />
                            </div>

                            {/* Table */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-50">
                                            {['User', 'Role', 'Joined', 'Actions'].map(h => (
                                                <th key={h} className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest px-6 py-4">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map(u => (
                                            <tr key={u._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A85517] to-[#7a3c10] flex items-center justify-center text-white text-sm font-black shrink-0">
                                                            {u.name?.[0]?.toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900">{u.name}</p>
                                                            <p className="text-[11px] text-gray-400">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-orange-50 text-[#A85517]' : 'bg-blue-50 text-blue-600'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={u.role}
                                                            onChange={e => changeRole(u._id, e.target.value)}
                                                            disabled={u._id === user?.id}
                                                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-orange-200 disabled:opacity-40 bg-white"
                                                        >
                                                            <option value="customer">Customer</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                        <button
                                                            onClick={() => deleteUser(u._id)}
                                                            disabled={u._id === user?.id}
                                                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredUsers.length === 0 && (
                                            <tr><td colSpan={4} className="px-6 py-16 text-center text-sm text-gray-400">No users found</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Add/Edit Modal ── */}
            {showModal && (
                <FurnitureModal
                    initial={editTarget ? {
                        ...editTarget,
                        colors: Array.isArray(editTarget.colors) ? editTarget.colors.join(', ') : editTarget.colors,
                        dimensions: {
                            width: editTarget.dimensions?.width || '',
                            height: editTarget.dimensions?.height || '',
                            depth: editTarget.dimensions?.depth || '',
                        }
                    } : null}
                    onClose={() => { setShowModal(false); setEditTarget(null); }}
                    onSave={saveFurniture}
                />
            )}
        </div>
    );
};

export default AdminPage;
