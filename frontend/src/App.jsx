import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StorePage from './pages/StorePage';
import ProductDetailPage from './pages/ProductDetailPage';
import EditorPage from './pages/EditorPage';
import MyDesignsPage from './pages/MyDesignsPage';
import AdminPage from './pages/AdminPage';

const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/store" element={<Layout><StorePage /></Layout>} />
          <Route path="/store/:id" element={<Layout><ProductDetailPage /></Layout>} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/designs" element={<Layout><MyDesignsPage /></Layout>} />
          <Route path="/admin" element={<AdminPage />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
