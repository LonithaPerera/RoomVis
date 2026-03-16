import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'customer'
    });
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const setRole = (role) => setFormData({ ...formData, role });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }
        const res = await register({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role
        });
        if (res.success) {
            navigate('/');
        } else {
            setError(res.msg);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Side: Image */}
            <div className="hidden lg:block lg:w-1/2 relative h-screen">
                <img
                    src="/assets/register-bg.jpg"
                    alt="Register Background"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-center text-white p-12 lg:p-24">
                    <h1 className="text-5xl font-bold mb-4 leading-tight">Join RoomVis Today</h1>
                    <p className="text-xl font-medium opacity-90 max-w-sm">Start creating beautiful room designs in minutes</p>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
                <div className="max-w-md w-full">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                    <p className="text-gray-500 mb-8 font-medium">Join thousands of users designing their perfect spaces</p>

                    <form onSubmit={onSubmit}>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="mb-4 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="name">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="John Doe"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 transition-all text-gray-800"
                                    value={formData.name}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                            <div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        id="password"
                                        placeholder="Min 8 chars, upper+lower+digit+special"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 transition-all text-sm text-gray-800"
                                        value={formData.password}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1" htmlFor="confirm">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        id="confirm"
                                        placeholder="Re-enter your password"
                                        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-800 transition-all text-sm text-gray-800"
                                        value={formData.confirmPassword}
                                        onChange={onChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Account Type</label>
                                <div className="flex gap-2 p-1 bg-gray-50 rounded-lg border border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setRole('customer')}
                                        className={`flex-1 flex items-center justify-center p-3 rounded-md transition-all font-bold text-sm ${formData.role === 'customer'
                                                ? 'bg-orange-50 text-orange-800 border-2 border-orange-200'
                                                : 'bg-white text-gray-500 hover:bg-gray-100 border border-transparent'
                                            }`}
                                    >
                                        <span className="mr-2">👤</span> Customer
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setRole('admin')}
                                        className={`flex-1 flex items-center justify-center p-3 rounded-md transition-all font-bold text-sm ${formData.role === 'admin'
                                                ? 'bg-orange-50 text-orange-800 border-2 border-orange-200'
                                                : 'bg-white text-gray-500 hover:bg-gray-100 border border-transparent'
                                            }`}
                                    >
                                        <span className="mr-2">💼</span> Designer
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#A85517] hover:bg-[#8B4413] text-white font-bold py-3 px-4 rounded-md transition-all uppercase tracking-wide mt-6 shadow-md"
                        >
                            Create Account
                        </button>
                    </form>
                    <p className="text-center mt-6 text-sm text-gray-600">
                        Already have an account? <Link to="/login" className="font-bold text-orange-800 hover:text-orange-700">Sign in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
