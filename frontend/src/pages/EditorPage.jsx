import React, { useState, Suspense, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Canvas, useThree } from '@react-three/fiber';
import { toPng } from 'html-to-image';
import { OrbitControls, Grid, Environment, ContactShadows, PerspectiveCamera, useGLTF } from '@react-three/drei';
import {
    LayoutGrid,
    Box as BoxIcon,
    ChevronDown,
    Search,
    Trash2,
    RotateCcw,
    Save,
    Magnet,
    Sun,
    Camera,
    Undo2,
    Redo2,
    Ruler,
    Palette,
    Plus,
    Home
} from 'lucide-react';

// --- 3D Components ---

// 3D Wall Component
const Wall = React.memo(({ position, rotation, length, color }) => (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
        <planeGeometry args={[length, 3]} />
        <meshStandardMaterial color={color} side={THREE.FrontSide} />
    </mesh>
));

const Room = React.memo(({ width, depth, wallColor, floorColor, shape = 'rectangle' }) => {
    const W = width;
    const D = depth;

    const renderShape = () => {
        if (shape === 'l-shape') {
            const tlW = W * 0.55;
            const rmW = W * 0.45;
            const tlD = D * 0.45;
            const rmD = D * 0.55;

            return (
                <group>
                    {/* Floor Slabs */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-W/2 + tlW/2, -0.01, -D/2 + tlD/2]} receiveShadow>
                        <planeGeometry args={[tlW, tlD]} />
                        <meshStandardMaterial color={floorColor} />
                    </mesh>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, tlD/2]} receiveShadow>
                        <planeGeometry args={[W, rmD]} />
                        <meshStandardMaterial color={floorColor} />
                    </mesh>

                    {/* Outer Boundary Walls */}
                    <Wall position={[-W/2 + tlW/2, 1.5, -D/2]} rotation={[0, 0, 0]} length={tlW} color={wallColor} />
                    <Wall position={[-W/2, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} length={D} color={wallColor} />
                    <Wall position={[0, 1.5, D/2]} rotation={[0, Math.PI, 0]} length={W} color={wallColor} />
                    <Wall position={[W/2, 1.5, tlD/2]} rotation={[0, -Math.PI / 2, 0]} length={rmD} color={wallColor} />
                    
                    {/* Inner Step Walls (L-cutout boundaries) */}
                    <Wall position={[tlW/2, 1.5, -D/2 + tlD]} rotation={[0, 0, 0]} length={rmW} color={wallColor} />
                    <Wall position={[-W/2 + tlW, 1.5, -D/2 + tlD/2]} rotation={[0, -Math.PI / 2, 0]} length={tlD} color={wallColor} />
                </group>
            );
        }

        // default: rectangle
        return (
            <group>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                    <planeGeometry args={[W, D]} />
                    <meshStandardMaterial color={floorColor} />
                </mesh>
                
                {/* 4 Walls forming the room box */}
                <Wall position={[0, 1.5, -D / 2]} rotation={[0, 0, 0]} length={W} color={wallColor} />
                <Wall position={[0, 1.5, D / 2]} rotation={[0, Math.PI, 0]} length={W} color={wallColor} />
                <Wall position={[-W / 2, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} length={D} color={wallColor} />
                <Wall position={[W / 2, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} length={D} color={wallColor} />
            </group>
        );
    };

    return (
        <group>
            {renderShape()}
            <Grid
                infiniteGrid
                fadeDistance={50}
                fadeStrength={5}
                cellSize={1}
                sectionSize={5}
                sectionThickness={1.5}
                sectionColor="#A85517"
                cellColor="#ddd"
                position={[0, 0, 0]}
            />
        </group>
    );
});


// --- Error Boundary for 3D Models ---
class ModelErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}


// --- 3D Model Loader ---
const GLBModel = ({ url, scaleX, scaleY, targetWidth, targetDepth, targetHeight, color }) => {
    const fullUrl = url?.startsWith('/') ? `${import.meta.env.VITE_API_URL}${url}` : url;
    const { scene } = useGLTF(fullUrl);
    const clonedScene = useMemo(() => {
        if (!scene) return null;
        const s = scene.clone();
        
        // 1. Calculate actual bounding box of the model to get dimensions
        const box = new THREE.Box3().setFromObject(s);
        const size = box.getSize(new THREE.Vector3());

        // 2. Calculate and apply Scale FIRST
        // This ensures subsequent position calculations account for the new size
        const ratioX = targetWidth / (size.x || 1);
        const ratioZ = targetDepth / (size.z || 1);
        const baseScale = Math.min(ratioX, ratioZ);
        
        s.scale.set(
            baseScale * (scaleX / 100),
            baseScale, // Proportional Y scale
            baseScale * (scaleY / 100)
        );

        // 3. Calculate box of the SCALED model to get correct grounding/centering offsets
        const scaledBox = new THREE.Box3().setFromObject(s);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());

        // 4. Center X, Z and ground the bottom at Y=0
        s.position.x = -scaledCenter.x;
        s.position.z = -scaledCenter.z;
        s.position.y = -scaledBox.min.y;

        s.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        return s;
    }, [scene, targetWidth, targetDepth, scaleX, scaleY]);

    // Optimize: Update color via useEffect to avoid re-cloning the entire model
    useEffect(() => {
        if (!clonedScene) return;
        clonedScene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => {
                        if (!m._isCloned) { m = m.clone(); m._isCloned = true; }
                        m.color.set(color);
                    });
                } else {
                    if (!child.material._isCloned) {
                        child.material = child.material.clone();
                        child.material._isCloned = true;
                    }
                    child.material.color.set(color);
                }
            }
        });
    }, [clonedScene, color]);

    if (!clonedScene) return null;
    return <primitive object={clonedScene} />;
};


const FurnitureModel = React.memo(({ item }) => {
    const { 
        width = 1, 
        depth = 1, 
        height = 0.75,
        scaleX = 100, 
        scaleY = 100, 
        color = "#ccc", 
        category = "Other", 
        modelUrl 
    } = item;
    const finalWidth = width * (scaleX / 100);
    const finalDepth = depth * (scaleY / 100);

    const renderManualModel = () => {
        switch (category) {
            case 'Sofas':
                return (
                    <group>
                        <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
                            <boxGeometry args={[finalWidth, 0.4, finalDepth]} />
                            <meshStandardMaterial color={color} roughness={0.8} />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 0.5, -finalDepth / 2 + 0.1]}>
                            <boxGeometry args={[finalWidth * 0.98, 0.6, 0.2]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        <mesh castShadow receiveShadow position={[-finalWidth / 2 + 0.1, 0.35, 0]}>
                            <boxGeometry args={[0.2, 0.5, finalDepth]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        <mesh castShadow receiveShadow position={[finalWidth / 2 - 0.1, 0.35, 0]}>
                            <boxGeometry args={[0.2, 0.5, finalDepth]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                    </group>
                );
            case 'Tables':
                return (
                    <group>
                        <mesh castShadow receiveShadow position={[0, 0.75, 0]}>
                            <boxGeometry args={[finalWidth, 0.05, finalDepth]} />
                            <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
                        </mesh>
                        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
                            <mesh key={i} castShadow position={[x * (finalWidth / 2 - 0.1), 0.375, z * (finalDepth / 2 - 0.1)]}>
                                <boxGeometry args={[0.06, 0.75, 0.06]} />
                                <meshStandardMaterial color="#333" />
                            </mesh>
                        ))}
                    </group>
                );
            case 'Beds':
                return (
                    <group>
                        <mesh castShadow receiveShadow position={[0, 0.15, 0]}>
                            <boxGeometry args={[finalWidth, 0.3, finalDepth]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 0.4, 0]}>
                            <boxGeometry args={[finalWidth * 0.95, 0.25, finalDepth * 0.98]} />
                            <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 0.7, -finalDepth / 2 + 0.05]}>
                            <boxGeometry args={[finalWidth, 1.1, 0.1]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                    </group>
                );
            case 'Chairs':
                return (
                    <group>
                        <mesh castShadow receiveShadow position={[0, 0.45, 0]}>
                            <boxGeometry args={[finalWidth, 0.1, finalDepth]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        <mesh castShadow receiveShadow position={[0, 0.8, -finalDepth / 2 + 0.05]}>
                            <boxGeometry args={[finalWidth, 0.7, 0.05]} />
                            <meshStandardMaterial color={color} />
                        </mesh>
                        {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, z], i) => (
                            <mesh key={i} castShadow position={[x * (finalWidth / 2 - 0.05), 0.225, z * (finalDepth / 2 - 0.05)]}>
                                <boxGeometry args={[0.04, 0.45, 0.04]} />
                                <meshStandardMaterial color="#222" />
                            </mesh>
                        ))}
                    </group>
                );
            case 'Storage':
                return (
                    <mesh castShadow receiveShadow position={[0, width / 2, 0]}>
                        <boxGeometry args={[finalWidth, width, finalDepth]} />
                        <meshStandardMaterial color={color} />
                    </mesh>
                );
            default:
                return (
                    <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                        <boxGeometry args={[finalWidth, 1, finalDepth]} />
                        <meshStandardMaterial color={color} opacity={0.6} transparent />
                    </mesh>
                );
        }
    };

    return modelUrl ? (
        <ModelErrorBoundary fallback={renderManualModel()}>
            <Suspense fallback={null}>
                <GLBModel 
                    url={modelUrl} 
                    scaleX={scaleX} 
                    scaleY={scaleY} 
                    targetWidth={finalWidth}
                    targetDepth={finalDepth}
                    targetHeight={height}
                    color={color}
                />
            </Suspense>
        </ModelErrorBoundary>
    ) : renderManualModel();
});

const Furniture3D = React.memo(({ 
    item, 
    setSelectedId, 
    setIsDragging3D, 
    setDragOffset, 
    isDragging3D, 
    selectedId, 
    dragOffset, 
    setPlacedItems, 
    roomConfig, 
    clampPosition, 
    saveToHistory,
    snapEnabled
}) => {
    const { 
        rotation = 0,
    } = item;
    const rotRad = -(rotation * Math.PI) / 180;

    return (
        <group
            position={[item.x, 0, item.y]}
            rotation={[0, rotRad, 0]}
            onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedId(item.instanceId);
                
                const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                const hitPoint = new THREE.Vector3();
                e.ray.intersectPlane(plane, hitPoint);
                
                setDragOffset({
                    x: hitPoint.x - item.x,
                    z: hitPoint.z - item.y
                });
                setIsDragging3D(true);
                saveToHistory();
                if (e.target.setPointerCapture) e.target.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
                if (!isDragging3D || selectedId !== item.instanceId) return;
                
                const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
                const target = new THREE.Vector3();
                e.ray.intersectPlane(plane, target);
                
                let newX = target.x - dragOffset.x;
                let newZ = target.z - dragOffset.z;

                if (snapEnabled) {
                    newX = Math.round(newX * 10) / 10;
                    newZ = Math.round(newZ * 10) / 10;
                }
                
                setPlacedItems(prev => prev.map(p => {
                    if (p.instanceId !== item.instanceId) return p;
                    const updated = { ...p, x: newX, y: newZ };
                    const clamped = clampPosition(updated, roomConfig.width, roomConfig.depth, roomConfig.shape);
                    return { ...p, ...clamped };
                }));
            }}
            onPointerUp={(e) => {
                if (!isDragging3D) return;
                e.stopPropagation();
                setIsDragging3D(false);
                if (e.target.releasePointerCapture) e.target.releasePointerCapture(e.pointerId);
            }}
        >
            <FurnitureModel item={item} />
        </group>
    );
});

// ── Room Shape Definitions ──────────────────────────────────────────────────
const ROOM_SHAPES = [
    {
        id: 'rectangle',
        label: 'Rectangle',
        clip: null, // No clip = full box
        // SVG path for the mini icon (viewBox 0 0 40 30)
        svg: 'M2,2 h36 v26 h-36 Z',
    },
    {
        id: 'l-shape',
        label: 'L-Shape',
        clip: 'polygon(0% 0%, 55% 0%, 55% 45%, 100% 45%, 100% 100%, 0% 100%)',
        svg: 'M2,2 h20 v10 h16 v18 h-36 Z',
    },
];

// --- Sub-components for Optimization ---

const LibraryItem = React.memo(({ item, onClick }) => {
    const imageUrl = item.imageUrl?.startsWith('/') 
        ? `${import.meta.env.VITE_API_URL}${item.imageUrl}` 
        : item.imageUrl;

    return (
        <div
            className="p-3 bg-white border border-gray-100 rounded-2xl hover:border-[#A85517] hover:shadow-md transition-all group cursor-pointer"
            onClick={() => onClick(item)}
            role="button"
            aria-label={`Add ${item.name} to room`}
            title={`Add ${item.name} ($${item.price})`}
        >
            <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">{item.category}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-[#A85517]">${item.price}</span>
                        <div className="bg-gray-100 p-1 rounded-lg group-hover:bg-[#A85517] transition-all">
                            <Plus className="w-3 h-3 text-gray-400 group-hover:text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

const FurnitureLibrary = React.memo(({ items, onAddItem }) => (
    <div className="space-y-3">
        {items.map(item => (
            <LibraryItem key={item._id} item={item} onClick={onAddItem} />
        ))}
        {items.length === 0 && (
            <div className="text-center py-8">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No items found</p>
            </div>
        )}
    </div>
));

const ThrottledColorPicker = React.memo(({ value, onChange, onFocus }) => {
    const [localValue, setLocalValue] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        
        if (!timeoutRef.current) {
            timeoutRef.current = setTimeout(() => {
                onChange(newVal);
                timeoutRef.current = null;
            }, 32); // ~30fps for smooth interactive updates
        }
    };

    return (
        <input
            type="color"
            value={localValue}
            onFocus={onFocus}
            onChange={handleChange}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
    );
});

const OrthographicCameraUpdater = ({ width, depth }) => {
    const { camera } = useThree();
    useEffect(() => {
        if (camera.isOrthographicCamera) {
            camera.left = -width / 2;
            camera.right = width / 2;
            camera.top = depth / 2;
            camera.bottom = -depth / 2;
            camera.updateProjectionMatrix();
        }
    }, [width, depth, camera]);
    return null;
};

const ThreeDTopDownItems = React.memo(({ roomConfig, placedItems }) => {
    // Use deferredValue to prevent the expensive 3D render from blocking the main UI thread during dragging
    const deferredItems = React.useDeferredValue(placedItems);
    
    return (
        <div className="absolute inset-0 pointer-events-none">
            <Canvas
                orthographic
                camera={{
                    left: -roomConfig.width / 2,
                    right: roomConfig.width / 2,
                    top: roomConfig.depth / 2,
                    bottom: -roomConfig.depth / 2,
                    near: 0.1,
                    far: 1000,
                    position: [0, 50, 0],
                    up: [0, 0, -1]
                }}
                gl={{ alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: true }}
                style={{ background: 'transparent' }}
            >
                <OrthographicCameraUpdater width={roomConfig.width} depth={roomConfig.depth} />
                <ambientLight intensity={1.8} />
                <directionalLight position={[0, 50, 0]} intensity={1.5} />
                <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={0.5} />
                <pointLight position={[roomConfig.width/2, 10, roomConfig.depth/2]} intensity={0.8} />
                {deferredItems.map(item => (
                    <group 
                        key={item.instanceId} 
                        position={[item.x, 0, item.y]} 
                        rotation={[0, -(item.rotation * Math.PI) / 180, 0]}
                    >
                        <FurnitureModel item={item} />
                    </group>
                ))}
            </Canvas>
        </div>
    );
});

const Room2DViewport = React.memo(({ 
    roomConfig, 
    placedItems, 
    selectedId, 
    setSelectedId, 
    handleMouseDown, 
    isDragging, 
    PIXELS_PER_METER,
    ROOM_SHAPES,
    roomRef
}) => {
    return (
        <div className="w-full h-full p-20 flex items-center justify-center relative select-none overflow-auto animate-in fade-in duration-700">
            <div
                ref={roomRef}
                className="relative shadow-2xl border-4 border-white overflow-hidden"
                style={{
                    width: `${roomConfig.width * PIXELS_PER_METER}px`,
                    height: `${roomConfig.depth * PIXELS_PER_METER}px`,
                    backgroundColor: roomConfig.floorColor,
                    backgroundImage: 'radial-gradient(rgba(0,0,0,0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px',
                    clipPath: ROOM_SHAPES.find(s => s.id === roomConfig.shape)?.clip || 'none',
                }}
                onClick={() => setSelectedId(null)}
            >
                <div className="absolute inset-0 pointer-events-none" style={{ outline: '4px solid white', border: '3px solid rgba(255,255,255,0.6)' }} />
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[11px] font-black text-gray-400 uppercase tracking-widest">{roomConfig.width}m</div>
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 -rotate-90 text-[11px] font-black text-gray-400 uppercase tracking-widest">{roomConfig.depth}m</div>

                <ThreeDTopDownItems roomConfig={roomConfig} placedItems={placedItems} />

                {placedItems.map(item => (
                    <div
                        key={item.instanceId}
                        onMouseDown={(e) => handleMouseDown(e, item.instanceId)}
                        onClick={(e) => { e.stopPropagation(); setSelectedId(item.instanceId); }}
                        className={`absolute cursor-move flex flex-col items-center justify-center group overflow-hidden ${isDragging && selectedId === item.instanceId ? '' : 'transition-all'} ${selectedId === item.instanceId ? 'ring-2 ring-[#A85517] z-20 shadow-xl scale-[1.01]' : 'hover:ring-1 hover:ring-white/50 z-10'}`}
                        style={{
                            left: `calc(50% + ${(item.x - (item.width * (item.scaleX / 100)) / 2) * PIXELS_PER_METER}px)`,
                            top: `calc(50% + ${(item.y - (item.depth * (item.scaleY / 100)) / 2) * PIXELS_PER_METER}px)`,
                            width: `${item.width * (item.scaleX / 100) * PIXELS_PER_METER}px`,
                            height: `${item.depth * (item.scaleY / 100) * PIXELS_PER_METER}px`,
                            backgroundColor: selectedId === item.instanceId ? 'rgba(168, 85, 23, 0.05)' : 'transparent',
                            transform: `rotate(${item.rotation}deg)`,
                            borderRadius: '2px'
                        }}
                    >
                        <div className={`text-[8px] font-black uppercase text-center leading-tight truncate px-1 pointer-events-none transition-opacity ${selectedId === item.instanceId ? 'text-[#A85517] opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                            {item.name.split(' ')[0]}
                        </div>
                    </div>
                ))}

                {placedItems.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none opacity-20">
                        <div className="p-4 border-2 border-dashed border-white rounded-3xl"><LayoutGrid className="w-12 h-12 text-white" /></div>
                        <p className="text-xs font-black text-white uppercase tracking-widest px-12 text-center">Add furniture from the left panel<br />Click the + button on any item to place it</p>
                    </div>
                )}
            </div>
        </div>
    );
});

const EditorPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // 1. Scene State
    const [viewMode, setViewMode] = useState('2D');
    const [snapEnabled, setSnapEnabled] = useState(true);
    const [shadowsEnabled, setShadowsEnabled] = useState(true);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'success'
    const [isDragging3D, setIsDragging3D] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, z: 0 });
    const [toast, setToast] = useState({ visible: false, message: '' });

    const showToast = useCallback((message) => {
        setToast({ visible: true, message });
        setTimeout(() => setToast({ visible: false, message: '' }), 2000);
    }, []);

    // 2. Room Configuration
    const [roomConfig, setRoomConfig] = useState({
        width: 10,
        depth: 8,
        wallColor: '#F2F2F2',
        floorColor: '#C4A484',
        shape: 'rectangle',
    });

    // 3. Furniture Data State
    const [libraryItems, setLibraryItems] = useState([]);
    const [placedItems, setPlacedItems] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // 4. Design save/load state
    const [currentDesignId, setCurrentDesignId] = useState(null);   // if null = new design
    const [currentDesignName, setCurrentDesignName] = useState('Untitled Design');
    const [searchParams] = useSearchParams();

    // 5. History & Utilities
    const [history, setHistory] = useState([]);
    const [redoStack, setRedoStack] = useState([]);
    const viewportRef = useRef(null);
    const roomRef = useRef(null);
    const orbitControlsRef = useRef(null);

    const resetCamera = () => {
        if (orbitControlsRef.current) {
            orbitControlsRef.current.reset();
        }
    };

    // --- Memoized Computations ---
    const filteredLibrary = useMemo(() => {
        return libraryItems.filter(item =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [libraryItems, searchQuery]);

    const clampPosition = useCallback((item, w, d, shape = 'rectangle') => {
        const isRotated = Math.abs(item.rotation % 180) === 90;
        const itemW = item.width * (item.scaleX / 100);
        const itemD = item.depth * (item.scaleY / 100);
        const effW = isRotated ? itemD : itemW;
        const effD = isRotated ? itemW : itemD;

        const marginX = (w / 2) - (effW / 2);
        const marginY = (d / 2) - (effD / 2);

        let newX = Math.max(-marginX, Math.min(marginX, item.x));
        let newY = Math.max(-marginY, Math.min(marginY, item.y));

        if (shape === 'l-shape') {
            const cutX = (0.05 * w); // X boundary of the cutout
            const cutY = (-0.05 * d); // Y boundary of the cutout
            
            // Check if item infringes on the empty top-right cutout
            // Region: X > cutX AND Y < cutY
            if (newX + (effW / 2) > cutX && newY - (effD / 2) < cutY) {
                // Determine the shortest path to push it back into the room
                const overlapX = (newX + effW / 2) - cutX;
                const overlapY = cutY - (newY - effD / 2);
                
                if (overlapX < overlapY) {
                    newX = cutX - (effW / 2); // Push left
                } else {
                    newY = cutY + (effD / 2); // Push down
                }
            }
        }

        return { x: newX, y: newY };
    }, []);

    const updateItemProperty = useCallback((id, field, value) => {
        setPlacedItems(prev => prev.map(item => {
            if (item.instanceId !== id) return item;
            const updated = { ...item, [field]: value };
            const { x, y } = clampPosition(updated, roomConfig.width, roomConfig.depth, roomConfig.shape);
            return { ...updated, x, y };
        }));
    }, [clampPosition, roomConfig.width, roomConfig.depth, roomConfig.shape]);

    const saveToHistory = useCallback(() => {
        setHistory(prev => [...prev.slice(-19), {
            placedItems: JSON.parse(JSON.stringify(placedItems)),
            roomConfig: { ...roomConfig }
        }]);
        setRedoStack([]);
    }, [placedItems, roomConfig]);

    const handleUndo = useCallback(() => {
        if (history.length === 0) return;
        
        // Save current to redo stack
        setRedoStack(prev => [...prev, {
            placedItems: JSON.parse(JSON.stringify(placedItems)),
            roomConfig: { ...roomConfig }
        }]);

        const lastState = history[history.length - 1];
        setPlacedItems(lastState.placedItems);
        setRoomConfig(lastState.roomConfig);
        setHistory(prev => prev.slice(0, -1));
        showToast('Undo successful');
    }, [history, placedItems, roomConfig, showToast]);

    const handleRedo = useCallback(() => {
        if (redoStack.length === 0) return;

        // Save current to history
        setHistory(prev => [...prev, {
            placedItems: JSON.parse(JSON.stringify(placedItems)),
            roomConfig: { ...roomConfig }
        }]);

        const nextState = redoStack[redoStack.length - 1];
        setPlacedItems(nextState.placedItems);
        setRoomConfig(nextState.roomConfig);
        setRedoStack(prev => prev.slice(0, -1));
        showToast('Redo successful');
    }, [redoStack, placedItems, roomConfig, showToast]);

    const clearRoom = () => {
        if (window.confirm('Are you sure you want to clear all items in the room?')) {
            saveToHistory();
            setPlacedItems([]);
            setSelectedId(null);
            showToast('Room cleared');
        }
    };

    const takeScreenshot = async () => {
        if (!viewportRef.current) return;
        try {
            // Give a small delay for UI boxes to settle if any
            const dataUrl = await toPng(viewportRef.current, {
                backgroundColor: '#FAF9F6',
                quality: 1,
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `room-design-${currentDesignName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
            showToast('Screenshot saved');
        } catch (err) {
            console.error('Screenshot failed:', err);
            alert('Failed to take screenshot. Please try again.');
        }
    };

    const [isDragging, setIsDragging] = useState(false);
    const PIXELS_PER_METER = 60;

    const wallColors = ['#F2F2F2', '#E5E7EB', '#D1D5DB', '#FDE68A', '#FEE2E2', '#DBEAFE'];
    const floorColors = ['#C4A484', '#8B4513', '#A0522D', '#D2B48C', '#DEB887', '#5D4037'];
    const materialColors = ['#111827', '#4B5563', '#2D3E50', '#8B4513', '#A0522D', '#D2B48C', '#ffffff'];

    const [isLibraryFetched, setIsLibraryFetched] = useState(false);

    useEffect(() => {
        const fetchFurniture = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/furniture`);
                setLibraryItems(res.data);
                setIsLibraryFetched(true);
            } catch (err) {
                console.error('Error fetching furniture:', err);
            }
        };
        fetchFurniture();
    }, []);

    // Handle auto-add from URL only AFTER library is loaded
    useEffect(() => {
        if (!isLibraryFetched || libraryItems.length === 0) return;

        const itemId = searchParams.get('item');
        if (itemId) {
            // Check if item is already placed to avoid duplicates
            const isAlreadyPlaced = placedItems.some(i => i.furnitureId === itemId);
            if (!isAlreadyPlaced) {
                const item = libraryItems.find(f => f._id === itemId);
                if (item) {
                    addFurnitureToRoom(item);
                    setViewMode('2D');
                    // Clean up URL
                    navigate('/editor', { replace: true });
                }
            } else {
                // If it was already there, just clean the URL and set view
                setViewMode('2D');
                navigate('/editor', { replace: true });
            }
        }
    }, [isLibraryFetched, libraryItems, searchParams, navigate]);

    // Load an existing design when ?design=ID is in the URL
    useEffect(() => {
        const designId = searchParams.get('design');
        if (!designId) return;
        const loadDesign = async () => {
            try {
                // Fetch all user designs then find the matching one
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/designs`);
                const design = res.data.find(d => d._id === designId);
                if (!design) return;

                // Restore room config
                setRoomConfig({
                    width: design.roomSettings?.width || 10,
                    depth: design.roomSettings?.depth || 8,
                    wallColor: design.roomSettings?.wallColor || '#F2F2F2',
                    floorColor: design.roomSettings?.floorColor || '#C4A484',
                });

                // Restore placed items — map back from DB schema to editor schema
                const restoredItems = (design.furnitureItems || []).map(item => ({
                    instanceId: Math.random().toString(36).substr(2, 9),
                    furnitureId: item.furnitureId,
                    name: item.name || 'Item',
                    category: item.category || 'Other',
                    imageUrl: null,
                    width: item.width || 1,
                    depth: item.depth || 1,
                    height: item.height || (item.category === 'Tables' ? 0.75 : 0.5),
                    x: item.position?.x || 0,
                    y: item.position?.z || 0,
                    rotation: item.rotation?.y || 0,
                    scaleX: item.scaleX || 100,
                    scaleY: item.scaleY || 100,
                    color: item.color || '#ffffff',
                    modelUrl: item.modelUrl || null,
                }));
                setPlacedItems(restoredItems);
                setCurrentDesignName(design.name);

                // Task: Save as Copy logic
                // If the user didn't create this design AND is not an admin, we clear the ID
                // so that when they click "Save", it creates a NEW design for them instead of updating
                const creatorId = design.creator?._id || design.creator;
                const isCreator = creatorId === user?.id;
                const isAdmin = user?.role === 'admin';

                if (isCreator || isAdmin) {
                    setCurrentDesignId(designId);
                    console.log('Loaded design for editing (Owner/Admin access)');
                } else {
                    setCurrentDesignId(null); // Clear ID to trigger creation on save
                    console.log('Loaded design as template (will save as new copy)');
                }
            } catch (err) {
                console.error('Error loading design:', err);
            }
        };
        loadDesign();
    }, [searchParams, user]);

    const handleRoomInput = (field, value) => {
        if (roomConfig[field] !== value) {
            saveToHistory();
            setRoomConfig(prev => ({ ...prev, [field]: value }));
        }
    };

    const saveDesign = async () => {
        console.log('Save Design clicked. User:', user);
        if (!user) {
            console.log('No user found, redirecting to login...');
            navigate('/login');
            return;
        }

        const payload = {
            name: currentDesignName || 'Untitled Design',
            roomSettings: roomConfig,
            placedItems,
        };

        // If editing a saved design, update it directly
        if (currentDesignId) {
            try {
                setSaveStatus('saving');
                console.log('Updating design:', currentDesignId, payload);
                await axios.put(`${import.meta.env.VITE_API_URL}/designs/${currentDesignId}`, payload);
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 2500);
            } catch (err) {
                console.error('Error updating design:', err);
                setSaveStatus('idle');
                alert('Failed to update design: ' + (err.response?.data?.msg || err.message));
            }
            return;
        }

        try {
            setSaveStatus('saving');
            console.log('Creating new design:', payload);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/designs`, payload);
            
            // Lock editor to update this design from now on
            setCurrentDesignId(res.data._id);
            setCurrentDesignName(res.data.name);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2500);
        } catch (err) {
            console.error('Error saving design:', err);
            setSaveStatus('idle');
            alert('Failed to save design: ' + (err.response?.data?.msg || err.message));
        }
    };

    const addFurnitureToRoom = useCallback((item) => {
        saveToHistory();
        const newItem = {
            instanceId: Math.random().toString(36).substr(2, 9),
            furnitureId: item._id,
            name: item.name || 'Untitled',
            category: item.category || 'Other',
            imageUrl: item.imageUrl,
            width: (item.dimensions?.width || 100) / 100,
            depth: (item.dimensions?.depth || 100) / 100,
            height: (item.dimensions?.height || 75) / 100,
            x: 0,
            y: 0,
            rotation: 0,
            scaleX: 100,
            scaleY: 100,
            color: (item.colors && item.colors.length > 0) ? item.colors[0] : '#ffffff',
            modelUrl: item.modelUrl
        };
        setPlacedItems(prev => [...prev, newItem]);
        setSelectedId(newItem.instanceId);
        showToast(`${newItem.name} added to room`);
    }, [saveToHistory, showToast]);

    // Item management logic removed (now handled by memoized updateItemProperty)

    // Task: Re-clamp all items when room size changes
    useEffect(() => {
        setPlacedItems(prev => prev.map(item => {
            const { x, y } = clampPosition(item, roomConfig.width, roomConfig.depth, roomConfig.shape);
            return { ...item, x, y };
        }));
    }, [roomConfig.width, roomConfig.depth, roomConfig.shape, clampPosition]);

    const removeItem = (id) => {
        saveToHistory();
        setPlacedItems(prev => prev.filter(item => item.instanceId !== id));
        if (selectedId === id) setSelectedId(null);
        showToast('Item removed');
    };

    // --- Drag & Drop Handlers ---

    const handleMouseDown = (e, id) => {
        if (viewMode !== '2D') return;
        e.stopPropagation();
        saveToHistory();
        setSelectedId(id);
        setIsDragging(true);
    };

    const handleMouseMove = useCallback((e) => {
        if (!isDragging || !selectedId || !roomRef.current) return;

        const rect = roomRef.current.getBoundingClientRect();

        // Calculate raw position in pixels relative to center of room container
        let rawX = e.clientX - rect.left - (rect.width / 2);
        let rawY = e.clientY - rect.top - (rect.height / 2);

        // Convert to meters
        let meterX = rawX / PIXELS_PER_METER;
        let meterY = rawY / PIXELS_PER_METER;

        // Snapping (0.1m grid)
        if (snapEnabled) {
            meterX = Math.round(meterX * 10) / 10;
            meterY = Math.round(meterY * 10) / 10;
        }

        // Apply bounds using clampPosition directly
        const currentItem = placedItems.find(i => i.instanceId === selectedId);
        if (!currentItem) return;

        const tempItem = { ...currentItem, x: meterX, y: meterY };
        const clamped = clampPosition(tempItem, roomConfig.width, roomConfig.depth, roomConfig.shape);
        
        // Prevent redundant state updates if position hasn't changed (especially after snapping/clamping)
        if (currentItem.x === clamped.x && currentItem.y === clamped.y) return;

        setPlacedItems(prev => prev.map(item => 
            item.instanceId === selectedId ? { ...item, x: clamped.x, y: clamped.y } : item
        ));
    }, [isDragging, selectedId, placedItems, snapEnabled, roomConfig.width, roomConfig.depth, roomConfig.shape, clampPosition, PIXELS_PER_METER]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Undo/Redo
            if (e.ctrlKey && e.key.toLowerCase() === 'z') { e.preventDefault(); handleUndo(); }
            if (e.ctrlKey && e.key.toLowerCase() === 'y') { e.preventDefault(); handleRedo(); }
            // Delete
            if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                removeItem(selectedId);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleUndo, handleRedo, selectedId]);

    const selectedItem = useMemo(() => placedItems.find(i => i.instanceId === selectedId), [placedItems, selectedId]);

    return (
        <div className="flex flex-col h-screen bg-[#FDFCF9] overflow-hidden">

            {/* 1. Editor Top Bar */}
            <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 border-r border-gray-100 pr-4">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-[#A85517] p-1.5 rounded-lg shadow-md group-hover:bg-[#8B4413] transition-colors">
                                <Home className="text-white w-4 h-4" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                Room<span className="text-[#A85517]">Vis</span>
                            </span>
                        </Link>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <Link 
                            to="/designs" 
                            aria-label="View My Designs"
                            title="My Designs"
                            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#A85517] transition-all group"
                        >
                            <LayoutGrid className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            My Designs
                        </Link>
                        <div className="h-4 w-px bg-gray-100 mx-1" />
                        <input
                            type="text"
                            value={currentDesignName}
                            onChange={(e) => setCurrentDesignName(e.target.value)}
                            aria-label="Design Name"
                            title="Edit design name"
                            className="text-xl font-serif font-black text-gray-900 tracking-tight bg-transparent border-b-2 border-transparent hover:border-gray-100 focus:border-[#A85517] focus:outline-none transition-all px-1 w-64"
                            placeholder="Design Name"
                        />
                        {currentDesignId ? (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-orange-50 text-[#A85517] border border-orange-100 rounded-full px-2.5 py-0.5">
                                Editing saved
                            </span>
                        ) : searchParams.get('design') && (
                            <span className="text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-2.5 py-0.5 flex items-center gap-1.5">
                                <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
                                Official Template
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Switcher */}
                    <div className="bg-gray-100/80 p-1 rounded-xl flex items-center mr-6">
                        <button
                            onClick={() => setViewMode('2D')}
                            aria-label="Switch to 2D Layout View"
                            title="2D Layout"
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === '2D' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <LayoutGrid className="w-3.5 h-3.5" /> 2D Layout
                        </button>
                        <button
                            onClick={() => setViewMode('3D')}
                            aria-label="Switch to 3D Perspective View"
                            title="3D View"
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === '3D' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <BoxIcon className="w-3.5 h-3.5" /> 3D View
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 mr-4">
                        <button
                            onClick={() => setSnapEnabled(!snapEnabled)}
                            aria-label={snapEnabled ? "Disable Grid Snapping" : "Enable Grid Snapping"}
                            className={`p-2 rounded-lg border transition-all ${snapEnabled ? 'bg-orange-50 border-orange-200 text-[#A85517]' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            title="Toggle Snap (0.1m Grid)"
                        >
                            <Magnet className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShadowsEnabled(!shadowsEnabled)}
                            aria-label={shadowsEnabled ? "Disable Shadows" : "Enable Shadows"}
                            className={`p-2 rounded-lg border transition-all ${shadowsEnabled ? 'bg-orange-50 border-orange-200 text-[#A85517]' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            title="Toggle Shadows & Lighting Effects"
                        >
                            <Sun className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleUndo}
                            disabled={history.length === 0}
                            aria-label="Undo last action"
                            className={`p-2 rounded-lg border transition-all ${history.length === 0 ? 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            title="Undo (Ctrl+Z)"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleRedo}
                            disabled={redoStack.length === 0}
                            aria-label="Redo last action"
                            className={`p-2 rounded-lg border transition-all ${redoStack.length === 0 ? 'bg-gray-50 border-gray-100 text-gray-200 cursor-not-allowed' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            title="Redo (Ctrl+Y)"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={clearRoom}
                            aria-label="Clear all items from the room"
                            className="p-2 rounded-lg border border-gray-100 bg-white text-gray-400 hover:border-gray-300 transition-all"
                            title="Clear Room"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={takeScreenshot}
                            aria-label="Take a screenshot of the current design"
                            className="p-2 rounded-lg border border-gray-100 bg-white text-gray-400 hover:border-gray-300 transition-all"
                            title="Export Design (PNG)"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={saveDesign}
                        disabled={saveStatus === 'saving'}
                        aria-label="Save current design to account"
                        className={`px-6 py-2 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center gap-2 ${saveStatus === 'success'
                            ? 'bg-green-500 text-white shadow-green-200'
                            : 'bg-[#A85517] hover:bg-[#8B4413] text-white shadow-orange-900/10'
                            }`}
                    >
                        <Save className="w-4 h-4" />
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Design'}
                    </button>
                </div>
            </header>

            {/* 2. Editor Main Content */}
            <div className="flex flex-1 overflow-hidden">

                {/* Left Sidebar */}
                <aside className="w-72 bg-white border-r border-gray-100 overflow-y-auto p-6 flex flex-col gap-8 shrink-0">

                    {/* Room Setup */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest">
                                <Ruler className="w-4 h-4 text-[#A85517]" /> Room Setup
                            </h3>
                            <ChevronDown className="w-4 h-4 text-gray-300" />
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Room Dimensions</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">Width (m)</label>
                                    <input
                                        type="number"
                                        value={roomConfig.width}
                                        aria-label="Room Width in meters"
                                        title="Set room width"
                                        onChange={(e) => handleRoomInput('width', Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-500 ml-1">Depth (m)</label>
                                    <input
                                        type="number"
                                        value={roomConfig.depth}
                                        aria-label="Room Depth in meters"
                                        title="Set room depth"
                                        onChange={(e) => handleRoomInput('depth', Number(e.target.value))}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm font-bold focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <div className="bg-orange-50/50 p-3 rounded-xl border border-orange-100">
                                <span className="text-[10px] font-bold text-[#A85517]/70 uppercase">Total Area: </span>
                                <span className="text-xs font-black text-[#A85517]">{(roomConfig.width * roomConfig.depth).toFixed(1)} m²</span>
                            </div>
                        </div>

                        {/* Room Shape Selector */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Room Shape</p>
                            <div className="grid grid-cols-2 gap-2">
                                {ROOM_SHAPES.map(shape => (
                                    <button
                                        key={shape.id}
                                        onClick={() => handleRoomInput('shape', shape.id)}
                                        aria-label={`Select ${shape.label} room shape`}
                                        title={`${shape.label} Layout`}
                                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${roomConfig.shape === shape.id
                                            ? 'border-[#A85517] bg-orange-50'
                                            : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                                            }`}
                                    >
                                        <svg viewBox="0 0 40 30" className="w-10 h-8">
                                            <path
                                                d={shape.svg}
                                                fill={roomConfig.shape === shape.id ? '#A85517' : '#D1D5DB'}
                                                stroke={roomConfig.shape === shape.id ? '#8B4413' : '#9CA3AF'}
                                                strokeWidth="1.5"
                                            />
                                        </svg>
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${roomConfig.shape === shape.id ? 'text-[#A85517]' : 'text-gray-400'
                                            }`}>{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette className="w-3 h-3" /> Wall Color
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {/* Custom Color Picker */}
                                <div className="relative group">
                                    <div
                                        className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden ${!wallColors.includes(roomConfig.wallColor) ? 'border-[#A85517] scale-110 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                                        style={{ background: !wallColors.includes(roomConfig.wallColor) ? roomConfig.wallColor : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                                    >
                                        <input
                                            type="color"
                                            value={roomConfig.wallColor}
                                            aria-label="Pick custom wall color"
                                            title="Custom Wall Color"
                                            onChange={(e) => handleRoomInput('wallColor', e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                        {wallColors.includes(roomConfig.wallColor) && <Plus className="w-3 h-3 text-white/80" />}
                                    </div>
                                </div>

                                {wallColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleRoomInput('wallColor', color)}
                                        aria-label={`Set wall color to ${color}`}
                                        title={`Color: ${color}`}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${roomConfig.wallColor === color ? 'border-[#A85517] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette className="w-3 h-3" /> Floor Color
                            </p>
                            <div className="flex flex-wrap gap-2.5">
                                {/* Custom Color Picker */}
                                <div className="relative group">
                                    <div
                                        className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden ${!floorColors.includes(roomConfig.floorColor) ? 'border-[#A85517] scale-110 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                                        style={{ background: !floorColors.includes(roomConfig.floorColor) ? roomConfig.floorColor : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                                    >
                                        <input
                                            type="color"
                                            value={roomConfig.floorColor}
                                            aria-label="Pick custom floor color"
                                            title="Custom Floor Color"
                                            onChange={(e) => handleRoomInput('floorColor', e.target.value)}
                                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                        />
                                        {floorColors.includes(roomConfig.floorColor) && <Plus className="w-3 h-3 text-white/80" />}
                                    </div>
                                </div>

                                {floorColors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => handleRoomInput('floorColor', color)}
                                        aria-label={`Set floor color to ${color}`}
                                        title={`Color: ${color}`}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${roomConfig.floorColor === color ? 'border-[#A85517] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-gray-50" />

                    {/* Furniture Library */}
                    <div className="space-y-6 flex flex-col">
                        <div className="flex items-center justify-between">
                            <h3 className="flex items-center gap-2 text-sm font-black text-gray-900 uppercase tracking-widest">
                                <BoxIcon className="w-4 h-4 text-[#A85517]" /> Furniture Library
                            </h3>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search furniture..."
                                value={searchQuery}
                                aria-label="Search furniture library"
                                title="Search items"
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                            />
                        </div>

                        <FurnitureLibrary items={filteredLibrary} onAddItem={addFurnitureToRoom} />
                    </div>
                </aside>

                {/* Viewport Area */}
                <main ref={viewportRef} className="flex-1 bg-[#FAF9F6] relative overflow-hidden">

                    {/* Header Info Overlay */}
                    <div className="absolute top-6 left-6 z-10 flex gap-4">
                        <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Items placed</span>
                                <span className="text-sm font-black text-gray-900 leading-none">{placedItems.length}</span>
                            </div>
                            <div className="w-px h-6 bg-gray-100" />
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Room Size</span>
                                <span className="text-sm font-black text-gray-900 leading-none">{roomConfig.width}m × {roomConfig.depth}m</span>
                            </div>
                        </div>
                    </div>

                    {viewMode === '3D' ? (
                        /* 3D Scene View */
                        <div className="w-full h-full bg-[#D8DDE5] cursor-move animate-in fade-in duration-700">
                            <Canvas
                                shadows={{ type: THREE.PCFShadowMap }}
                                gl={{ antialias: true, toneMapping: 4, toneMappingExposure: 0.85, preserveDrawingBuffer: true }}
                                dpr={[1, 1.5]}
                            >
                                <Suspense fallback={null}>
                                    <PerspectiveCamera makeDefault position={[12, 12, 12]} fov={40} />
                                    <OrbitControls
                                        ref={orbitControlsRef}
                                        makeDefault
                                        enabled={!isDragging3D}
                                        minPolarAngle={0}
                                        maxPolarAngle={Math.PI / 2.1}
                                        enableDamping={true}
                                        dampingFactor={0.05}
                                    />

                                    {/* Task 12: Full Professional Lighting Rig */}
                                    <directionalLight position={[8, 12, 6]} intensity={shadowsEnabled ? 1.8 : 0.8} castShadow={shadowsEnabled} shadow-mapSize={[4096, 4096]} shadow-camera-near={0.1} shadow-camera-far={50} shadow-camera-left={-15} shadow-camera-right={15} shadow-camera-top={15} shadow-camera-bottom={-15} shadow-bias={-0.0005} color="#fff5e4" />
                                    <directionalLight position={[-6, 8, -4]} intensity={shadowsEnabled ? 0.6 : 0.3} color="#cce0ff" />
                                    <directionalLight position={[0, 6, -10]} intensity={0.3} color="#ffecd2" />
                                    <hemisphereLight skyColor="#dce8f8" groundColor="#a0785a" intensity={shadowsEnabled ? 0.5 : 0.8} />
                                    <ambientLight intensity={shadowsEnabled ? 0.2 : 0.6} />
                                    <Environment preset="apartment" />

                                    <Room {...roomConfig} shape={roomConfig.shape} />

                                    {placedItems.map(item => (
                                        <Furniture3D 
                                            key={item.instanceId} 
                                            item={item} 
                                            setSelectedId={setSelectedId}
                                            setIsDragging3D={setIsDragging3D}
                                            setDragOffset={setDragOffset}
                                            isDragging3D={isDragging3D}
                                            selectedId={selectedId}
                                            dragOffset={dragOffset}
                                            setPlacedItems={setPlacedItems}
                                            roomConfig={roomConfig}
                                            clampPosition={clampPosition}
                                            saveToHistory={saveToHistory}
                                            snapEnabled={snapEnabled}
                                        />
                                    ))}

                                    {shadowsEnabled && (
                                        <ContactShadows opacity={0.5} scale={Math.max(roomConfig.width, roomConfig.depth) * 2} blur={1.5} far={5} resolution={512} color="#1a0f00" />
                                    )}
                                </Suspense>
                            </Canvas>

                            <div className="absolute bottom-6 left-6 flex items-center gap-4">
                                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-3 pointer-events-none">
                                    <span>Drag to Orbit</span>
                                    <div className="w-px h-2 bg-white/20" />
                                    <span>Scroll to Zoom</span>
                                </div>
                                <button
                                    onClick={resetCamera}
                                    className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 hover:bg-[#A85517] hover:text-white transition-all shadow-lg border border-white/20"
                                    aria-label="Reset 3D camera view"
                                    title="Reset View"
                                >
                                    <RotateCcw className="w-3 h-3" /> Reset View
                                </button>
                            </div>
                        </div>
                    ) : (
                        <Room2DViewport 
                            roomConfig={roomConfig}
                            placedItems={placedItems}
                            selectedId={selectedId}
                            setSelectedId={setSelectedId}
                            handleMouseDown={handleMouseDown}
                            isDragging={isDragging}
                            PIXELS_PER_METER={PIXELS_PER_METER}
                            ROOM_SHAPES={ROOM_SHAPES}
                            roomRef={roomRef}
                        />
                    )}

                    {/* Toast Notification Overlay */}
                    {toast.visible && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-2 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300 z-[100] flex items-center gap-3 border border-white/10">
                            <div className="w-1.5 h-1.5 bg-[#A85517] rounded-full animate-pulse" />
                            {toast.message}
                        </div>
                    )}
                </main>

                {/* Right Sidebar - Properties */}
                <aside className="w-80 bg-white border-l border-gray-100 p-8 flex flex-col gap-8 shrink-0 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-xl">
                                <BoxIcon className={`w-5 h-5 ${selectedItem ? 'text-[#A85517]' : 'text-gray-400'}`} />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 font-serif">
                                {selectedItem ? selectedItem.name : 'Properties'}
                            </h3>
                        </div>
                        {selectedItem && (
                            <button
                                onClick={() => removeItem(selectedId)}
                                aria-label={`Delete ${selectedItem.name}`}
                                title="Delete Item"
                                className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {selectedItem ? (
                        <div className="space-y-10 animate-in fade-in slide-in-from-right duration-300">
                            {/* Color Selector */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Palette className="w-3 h-3" /> Material Color
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    {/* Custom Color Picker */}
                                    <div className="relative group">
                                        <div
                                            className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center overflow-hidden ${!materialColors.includes(selectedItem.color) ? 'border-[#A85517] scale-110 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
                                            style={{ background: !materialColors.includes(selectedItem.color) ? selectedItem.color : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}
                                        >
                                            <ThrottledColorPicker 
                                                value={selectedItem.color}
                                                onFocus={saveToHistory}
                                                onChange={(val) => updateItemProperty(selectedId, 'color', val)}
                                            />
                                            {materialColors.includes(selectedItem.color) && <Plus className="w-3 h-3 text-white/80" />}
                                        </div>
                                    </div>

                                    {materialColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                saveToHistory();
                                                updateItemProperty(selectedId, 'color', color);
                                            }}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${selectedItem.color === color ? 'border-[#A85517] scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Rotation */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rotation</p>
                                    <span className="text-[10px] font-black text-gray-900">{selectedItem.rotation}°</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="360"
                                    value={selectedItem.rotation}
                                    onMouseDown={saveToHistory}
                                    onChange={(e) => updateItemProperty(selectedId, 'rotation', Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#A85517]"
                                />
                                <div className="grid grid-cols-4 gap-2">
                                    {[0, 90, 180, 270].map(deg => (
                                        <button
                                            key={deg}
                                            onClick={() => {
                                                saveToHistory();
                                                updateItemProperty(selectedId, 'rotation', deg);
                                            }}
                                            className={`text-[10px] font-bold py-1.5 rounded-lg border transition-all ${selectedItem.rotation === deg ? 'bg-[#111827] text-white border-[#111827]' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-300'}`}
                                        >
                                            {deg}°
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Scaling */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Scaling</p>
                                    <button
                                        onClick={() => {
                                            saveToHistory();
                                            setPlacedItems(prev => prev.map(item => 
                                                item.instanceId === selectedId ? { ...item, scaleX: 100, scaleY: 100 } : item
                                            ));
                                        }}
                                        className="text-[9px] font-black text-[#A85517] uppercase tracking-widest hover:underline"
                                    >
                                        Reset All
                                    </button>
                                </div>
                                
                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                            <span>Scale (%)</span>
                                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-900">{selectedItem.scaleX}%</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="30"
                                            max="300"
                                            value={selectedItem.scaleX}
                                            onMouseDown={saveToHistory}
                                            aria-label="Adjust uniform scale"
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                setPlacedItems(prev => prev.map(item => {
                                                    if (item.instanceId !== selectedId) return item;
                                                    const updated = { ...item, scaleX: val, scaleY: val };
                                                    const { x, y } = clampPosition(updated, roomConfig.width, roomConfig.depth, roomConfig.shape);
                                                    return { ...updated, x, y };
                                                }));
                                            }}
                                            className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#A85517]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Position */}
                            <div className="space-y-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Position (X / Y)</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={selectedItem.x.toFixed(1)}
                                            onFocus={saveToHistory}
                                            aria-label="Item X position"
                                            title="Position X (Meters)"
                                            onChange={(e) => updateItemProperty(selectedId, 'x', Number(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold transition-all focus:ring-1 focus:ring-orange-100 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={selectedItem.y.toFixed(1)}
                                            onFocus={saveToHistory}
                                            aria-label="Item Y position"
                                            title="Position Y (Meters)"
                                            onChange={(e) => updateItemProperty(selectedId, 'y', Number(e.target.value))}
                                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-bold transition-all focus:ring-1 focus:ring-orange-100 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Actual Size</p>
                                <p className="text-xs font-black text-gray-900">
                                    {((selectedItem.width || 1) * (selectedItem.scaleX || 100) / 100 * 100).toFixed(0)} × {((selectedItem.depth || 1) * (selectedItem.scaleY || 100) / 100 * 100).toFixed(0)} × {((selectedItem.height || 0.75) * (selectedItem.scaleX || 100) / 100 * 100).toFixed(0)} cm
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200 p-8">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                                <BoxIcon className="w-6 h-6 text-gray-200" />
                            </div>
                            <p className="text-sm font-bold text-gray-400 max-w-[160px] leading-relaxed uppercase tracking-wider">
                                Select a furniture item to edit its properties
                            </p>
                        </div>
                    )}

                    <div className="mt-auto space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            <LayoutGrid className="w-3.5 h-3.5" /> In Room
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {placedItems.length > 0 ? placedItems.map(item => (
                                <div
                                    key={item.instanceId}
                                    onClick={() => setSelectedId(item.instanceId)}
                                    className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer transition-all border ${selectedId === item.instanceId ? 'bg-white border-[#A85517] text-gray-900 shadow-sm' : 'bg-gray-50 border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        {item.name}
                                    </div>
                                </div>
                            )) : (
                                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-center py-4 bg-gray-50 rounded-xl">
                                    No items in the room
                                </div>
                            )}
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default EditorPage;
