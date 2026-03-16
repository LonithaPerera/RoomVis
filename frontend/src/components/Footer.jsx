import { Link } from 'react-router-dom';
import { Home, ShoppingBag, Box, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#111827] text-white pt-16 pb-8 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Logo & Tagline */}
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-2">
                            <div className="bg-[#A85517] p-1.5 rounded-lg">
                                <Home className="text-white w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold">Room<span className="text-[#A85517]">Vis</span></span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                            Visualize your perfect room with our interactive 2D and 3D design platform. Make confident furniture decisions.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#A85517] transition-all border border-white/5">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#A85517] transition-all border border-white/5">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#A85517] transition-all border border-white/5">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#A85517] transition-all border border-white/5">
                                <Linkedin className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-medium">
                            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                            <li><Link to="/store" className="hover:text-white transition-colors">Furniture Store</Link></li>
                            <li><Link to="/editor" className="hover:text-white transition-colors">Room Editor</Link></li>
                            <li><Link to="/designs" className="hover:text-white transition-colors">My Designs</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Support</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-medium">
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-lg font-bold mb-6">Contact</h4>
                        <ul className="space-y-4 text-gray-400 text-sm font-medium">
                            <li className="flex gap-3">
                                <MapPin className="w-5 h-5 text-[#A85517] shrink-0" />
                                <span>123 Design Street, Creative City, CC 12345</span>
                            </li>
                            <li className="flex gap-3">
                                <Phone className="w-5 h-5 text-[#A85517] shrink-0" />
                                <span>+1 (555) 123-4567</span>
                            </li>
                            <li className="flex gap-3">
                                <Mail className="w-5 h-5 text-[#A85517] shrink-0" />
                                <span>hello@roomvis.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-gray-500 font-medium">
                    <p>© 2026 RoomVis. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
