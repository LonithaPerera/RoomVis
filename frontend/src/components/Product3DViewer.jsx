import React, { Suspense, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, Environment, ContactShadows } from '@react-three/drei';

// --- Error Boundary ---
class ModelErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) return (
            <div className="flex items-center justify-center w-full h-full bg-red-50 text-red-400 text-[10px] font-black uppercase p-8 text-center">
                Failed to load 3D Model
            </div>
        );
        return this.props.children;
    }
}

const Model = ({ url }) => {
    const { scene } = useGLTF(url);
    const clonedScene = useMemo(() => scene ? scene.clone() : null, [scene]);

    useEffect(() => {
        if (!clonedScene) return;
        clonedScene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [clonedScene]);

    return clonedScene ? <primitive object={clonedScene} /> : null;
};

const Product3DViewer = ({ modelUrl }) => {
    if (!modelUrl) return null;

    return (
        <div className="w-full h-full bg-[#f8f9fa] rounded-[40px] overflow-hidden border border-gray-100 relative group cursor-grab active:cursor-grabbing">
            <ModelErrorBoundary>
                <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
                    <Suspense fallback={null}>
                        <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.7, blur: 2 }} adjustCamera={true}>
                            <Model url={modelUrl?.startsWith('/') ? encodeURI(`${import.meta.env.VITE_API_URL}${modelUrl}`) : modelUrl} />
                        </Stage>
                        <OrbitControls makeDefault enableDamping autoRotate autoRotateSpeed={0.5} minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
                    </Suspense>
                </Canvas>
            </ModelErrorBoundary>
            
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-[.is-loading]:opacity-100 transition-opacity">
                <div className="w-8 h-8 border-4 border-[#A85517] border-t-transparent rounded-full animate-spin" />
            </div>

            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-black/5 text-[9px] font-black text-[#A85517] uppercase tracking-widest pointer-events-none">
                3D Interactive View
            </div>
        </div>
    );
};

export default Product3DViewer;
