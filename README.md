# 🛋️ RoomVis

A web-based furniture room designer application developed as part of the PUSL3122 HCI, Computer Graphics and Visualisation module at Plymouth University, Sri Lanka.

## 📌 Overview
RoomVis allows designers and customers to visualise how furniture items would look in a room. Users can create room layouts in 2D, convert them to a realistic 3D view, customise colours and shading, and save their designs for future use.

## 🔗 Project Links
- 🎨 Figma UI Design: https://www.figma.com/design/ebJiwM8lyOoqWNlUFTkVjc/RoomVis?node-id=0-1&p=f&t=dxCHzi8inwd80vOw-0
- 📄 Report: *To be added*
- 🎥 Video Presentation: *To be added*

## 👥 Group Members & Roles

| Name | Student ID | Role | Pages |
|------|------------|------|-------|
| Konara Bandara | 10952449 | Project Vision & User Identity | HomePage, LoginPage, RegisterPage, StorePage, ProductDetailPage |
| Mudiyanselage Herath | 10952432 | 2D Architectural Engineer | EditorPage (2D Layout Module) |
| Thennakoon Thennakoon | 10953085 | 3D Visualisation Lead | EditorPage (3D Viewport Module) |
| Jothikalananthan Janusha | 10952971 | Interaction Designer (HCI) | CartPage, CheckoutPage, OrdersPage |
| Dasanayaka Seneviratne | 10953043 | Portfolio Manager | MyDesignsPage |
| Bethmage Perera | 10952829 | Inventory & Store Manager | AdminPage |

## 🛠️ Tech Stack

### 💻 Frontend
- **Framework:** React (v19) + Vite
- **3D Engine:** Three.js + React-Three-Fiber + React-Three-Drei
- **Styling:** Tailwind CSS (v4)
- **Icons:** Lucide React
- **Routing:** React Router (v7)
- **HTTP Client:** Axios

### ⚙️ Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Auth:** JWT + Bcryptjs
- **API:** RESTful

### 🗄️ Database
- **Database:** MongoDB Atlas (NoSQL)
- **ODM:** Mongoose

### 🛠️ Utilities
- **Image Processing:** html-to-image
- **3D Models:** GLTF/GLB loader

## 🚀 Features
- Secure user login and registration (JWT-based)
- Admin and regular user account types
- Room setup — Rectangle, L-Shape with custom dimensions and wall colours
- Structural elements — doors and windows support
- 2D top-down floor plan with drag-and-drop, grid snapping, and boundary clamping
- 3D perspective visualisation with realistic lighting, shadows, and orbit controls
- Furniture scaling, rotation, movement, and colour customisation
- Undo/Redo with keyboard shortcuts (Ctrl+Z / Ctrl+Y)
- Toast notifications and system feedback
- Save, rename, edit, and delete designs with auto-generated thumbnails
- Admin furniture inventory management (.glb model uploads)
- Furniture catalog with product details and category filtering
- Template system (Admin official templates + user private designs)
- Cart, Checkout, and Orders management

## 📁 Project Structure
```
RoomVis/
├── frontend/        # React frontend (Vite)
│   ├── src/
│   │   ├── pages/   # HomePage, LoginPage, RegisterPage, EditorPage, etc.
│   │   ├── components/
│   │   └── context/
├── backend/         # Node.js + Express backend
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   └── middleware/
├── docs/            # Report, wireframes, design documents
└── README.md
```

## 📦 External Resources
- Three.js — https://threejs.org/ (MIT License)
- React Three Fiber — https://docs.pmnd.rs/react-three-fiber (MIT License)
- React Three Drei — https://github.com/pmndrs/drei (MIT License)
- Tailwind CSS — https://tailwindcss.com/ (MIT License)
- Lucide React — https://lucide.dev/ (ISC License)
- html-to-image — https://github.com/bubkoo/html-to-image (MIT License)
- Mongoose — https://mongoosejs.com/ (MIT License)
- Bcryptjs — https://github.com/dcodeIO/bcrypt.js (MIT License)
- All GLTF/GLB 3D furniture models used in the catalog are credited within the application

## 📅 Submission Deadline
19th March 2026 — PUSL3122 Plymouth University Sri Lanka
