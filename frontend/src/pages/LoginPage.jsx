import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const res = await login(formData.email, formData.password);
        if (res.success) {
            navigate('/');
        } else {
            setError(res.msg);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="max-w-md w-full">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                    <p className="text-gray-500 mb-8 font-medium">Sign in to continue designing your dream space</p>

                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-8">
                        <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Demo Credentials:</p>
                        <p className="text-xs text-orange-700 font-medium">Customer: <span className="font-bold">john@example.com</span> / Password: <span className="font-bold">123456</span></p>
                        <p className="text-xs text-orange-700 font-medium mt-1">Designer: <span className="font-bold">sarah@example.com</span> / Password: <span className="font-bold">123456</span></p>
                    </div>

                    <form onSubmit={onSubmit}>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                placeholder="you@example.com"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 transition-all text-gray-800"
                                value={formData.email}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between mb-1">
                                <label className="block text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
                            </div>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                placeholder="Enter your password"
                                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 transition-all text-gray-800"
                                value={formData.password}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <input type="checkbox" id="remember" className="h-4 w-4 text-orange-800 border-gray-300 rounded" />
                                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">Remember me</label>
                            </div>
                            <a href="#" className="text-sm font-bold text-orange-800 hover:orange-700">Forgot password?</a>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-[#A85517] hover:bg-[#8B4413] text-white font-bold py-3 px-4 rounded-md transition-all uppercase tracking-wide"
                        >
                            Sign In
                        </button>
                    </form>
                    <p className="text-center mt-8 text-sm text-gray-600">
                        Don't have an account? <Link to="/register" className="font-bold text-orange-800 hover:text-orange-700">Create one now</Link>
                    </p>
                </div>
            </div>

            {/* Right Side: Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <img
                    src="/assets/login-bg.jpg"
                    alt="Login Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex flex-col justify-center text-white px-12 xl:px-24">
                    <h1 className="text-5xl font-bold mb-4 leading-tight">Design Your Perfect Space</h1>
                    <p className="text-xl font-medium opacity-90 max-w-md">Visualize furniture in your room before you buy</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
