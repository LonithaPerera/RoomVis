import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, ShoppingBag, Box, LogIn, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center shadow-sm">
            <div className="container mx-auto px-6 flex justify-between items-center">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-[#A85517] p-1.5 rounded-lg shadow-md group-hover:bg-[#8B4413] transition-colors">
                        <Home className="text-white w-5 h-5" />
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                        Room<span className="text-[#A85517]">Vis</span>
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wide uppercase">
                    <Link to="/" className="text-green-700 font-bold hover:text-[#A85517] transition-all flex items-center gap-1">
                        Home
                    </Link>
                    <Link to="/store" className="text-gray-600 hover:text-[#A85517] transition-all flex items-center gap-1">
                        Store
                    </Link>
                    <Link to="/editor" className="text-gray-600 hover:text-[#A85517] transition-all flex items-center gap-1">
                        Editor
                    </Link>
                    {user && (
                        <Link to="/designs" className="text-gray-600 hover:text-[#A85517] transition-all flex items-center gap-1">
                            Designs
                        </Link>
                    )}
                    {user?.role === 'admin' && (
                        <Link to="/admin" className="text-gray-600 hover:text-[#A85517] transition-all flex items-center gap-1 font-bold">
                            Management
                        </Link>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${user.role === 'admin' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {user.role}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-red-500 transition-colors flex items-center gap-1 h-10 px-3 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline font-bold text-xs uppercase">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-gray-700 hover:text-[#A85517] font-bold text-sm tracking-wide uppercase h-10 flex items-center">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-[#A85517] hover:bg-[#8B4413] text-white px-5 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all shadow-md shadow-orange-900/10"
                            >
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
