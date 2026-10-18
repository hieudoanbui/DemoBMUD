import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import LoginPage from './pages/LoginPage';
import ProductsPage from './pages/ProductsPage';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return <BrowserRouter><ThemeProvider><AuthProvider><Layout><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route element={<ProtectedRoute />}><Route path="/products" element={<ProductsPage />} /></Route>
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes></Layout><Toaster position="bottom-right" toastOptions={{ duration: 3500, className: 'app-toast' }} /></AuthProvider></ThemeProvider></BrowserRouter>;
}
