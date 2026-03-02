import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import Loader from '../common/Loader';

export default function AdminProtectedRoute({ children }) {
    const { admin, checking } = useAdminAuth();
    const location = useLocation();

    if (checking) return <Loader size="lg" />;
    if (!admin) return <Navigate to="/" replace state={{ from: location }} />;
    return children;
}
