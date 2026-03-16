import { useNavigate } from 'react-router-dom';
import { ArrowRight, Box, Layers, ShoppingCart, CheckCircle, Database, Server, Smartphone } from 'lucide-react';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col w-full">
            {/* 1. Hero Section */}
            <section className="relative h-screen min-h-[700px] flex items-center justify-center pt-16">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/assets/home-bg.jpg"
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <p className="text-white font-bold tracking-[0.3em] uppercase mb-4 text-xs sm:text-sm animate-fade-in">
                        Visualize Before You Buy
                    </p>
                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight max-w-4xl mx-auto drop-shadow-xl">
                        Design Your Perfect Room <br />
                        <span className="text-[#A85517]">In Real-Time 3D</span>
                    </h1>
                    <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-medium">
                        Experience furniture in your space before purchasing with our advanced real-time 3D visualization technology.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/editor')}
                            className="w-full sm:w-auto bg-white text-gray-900 group px-8 py-4 rounded-full font-bold text-lg hover:bg-[#A85517] hover:text-white transition-all transform hover:scale-105 flex items-center justify-center gap-3 shadow-2xl"
                        >
                            Start Designing
                            <div className="bg-gray-900 group-hover:bg-white text-white group-hover:text-[#A85517] rounded-full p-1 transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </button>
                        <button
                            onClick={() => navigate('/store')}
                            className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center"
                        >
                            Explore Store
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. Powerful Features Section */}
            <section className="py-24 bg-[#F9F8F4]">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-serif">Powerful Features</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
                            Everything you need to design, visualize, and shop for furniture with complete confidence
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {/* Card 1: 2D Blueprint */}
                        <div className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start text-left group">
                            <div className="bg-[#A85517]/5 p-5 rounded-2xl mb-8 group-hover:bg-[#A85517] transition-colors duration-300">
                                <Layers className="w-8 h-8 text-[#A85517] group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">2D Blueprint Builder</h3>
                            <p className="text-gray-500 leading-relaxed mb-8 flex-grow text-[15px]">
                                Create accurate floor plans with our intuitive drag-and-drop interface. Input exact room dimensions and arrange furniture with precision using snap-to-grid tools.
                            </p>
                            <button className="text-[#A85517] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Learn More <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Card 2: 3D Visualizer */}
                        <div className="bg-white p-10 rounded-[40px] shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-start text-left group border-2 border-[#A85517]/10">
                            <div className="bg-[#A85517]/5 p-5 rounded-2xl mb-8 group-hover:bg-[#A85517] transition-colors duration-300">
                                <Box className="w-8 h-8 text-[#A85517] group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">3D Real-Time Visualizer</h3>
                            <p className="text-gray-500 leading-relaxed mb-8 flex-grow text-[15px]">
                                Walk through your virtual room in stunning 3D. Scale furniture, change colors and materials in real-time, and see exactly how everything fits together.
                            </p>
                            <button className="text-[#A85517] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Learn More <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Card 3: Integrated Store */}
                        <div className="bg-white p-10 rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start text-left group">
                            <div className="bg-[#A85517]/5 p-5 rounded-2xl mb-8 group-hover:bg-[#A85517] transition-colors duration-300">
                                <ShoppingCart className="w-8 h-8 text-[#A85517] group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Integrated Furniture Store</h3>
                            <p className="text-gray-500 leading-relaxed mb-8 flex-grow text-[15px]">
                                Browse our complete catalog and instantly visualize any item in your room. Shop with confidence knowing exactly how furniture will look in your space.
                            </p>
                            <button className="text-[#A85517] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                                Learn More <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Final CTA */}
            <section className="py-24 bg-gray-50 text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Design Your Perfect Room?</h2>
                    <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
                        Join thousands of users who have transformed their design confidence with our 3D visualization platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-[#A85517] hover:bg-[#8B4413] text-white px-10 py-4 rounded-full font-bold text-lg transition-all shadow-lg"
                        >
                            Start Free Trial
                        </button>
                        <button
                            onClick={() => navigate('/store')}
                            className="bg-white border-2 border-gray-200 text-gray-900 hover:border-gray-900 px-10 py-4 rounded-full font-bold text-lg transition-all"
                        >
                            Browse Furniture
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomePage;
