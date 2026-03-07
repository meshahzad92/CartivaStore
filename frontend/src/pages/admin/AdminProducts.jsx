import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Plus, Search, MoreVertical, Edit2, Trash2, Package, CheckCircle, EyeOff, FileEdit } from 'lucide-react';
import Loader from '../../components/common/Loader';
import ConfirmDeleteModal from '../../components/admin/ConfirmDeleteModal';

const STATUS_CONFIG = {
    active: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Active' },
    unlisted: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: EyeOff, label: 'Unlisted' },
    draft: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: FileEdit, label: 'Draft' },
};

export default function AdminProducts() {
    const { authFetch } = useAdminAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, productId: null, loading: false });

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                page_size: 20,
            });
            if (debouncedSearch) queryParams.append('search', debouncedSearch);
            if (statusFilter) queryParams.append('status', statusFilter);

            const res = await authFetch(`/api/v1/admin/products?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setProducts(data.items || []);
                setTotalPages(data.total_pages || 1);
            }
        } catch (error) {
            console.error("Error fetching admin products:", error);
        } finally {
            setLoading(false);
        }
    }, [authFetch, currentPage, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const toggleStatus = async (productId, currentStatus) => {
        // Simple cycle: active -> unlisted -> draft -> active
        const nextStatus = currentStatus === 'active' ? 'unlisted' : currentStatus === 'unlisted' ? 'draft' : 'active';

        // Optimistic UI update
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: nextStatus } : p));

        try {
            await authFetch(`/api/v1/admin/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ status: nextStatus })
            });
            // Background re-fetch to ensure sync
            fetchProducts();
        } catch (error) {
            console.error("Error toggling status", error);
            fetchProducts(); // Revert on error
        }
    };

    const handleDeleteClick = (productId) => {
        setDeleteModal({ isOpen: true, productId, loading: false });
    };

    const confirmDelete = async () => {
        const { productId } = deleteModal;
        if (!productId) return;

        setDeleteModal(prev => ({ ...prev, loading: true }));
        try {
            await authFetch(`/api/v1/admin/products/${productId}`, { method: 'DELETE' });
            setProducts(prev => prev.filter(p => p.id !== productId));
        } catch (error) {
            console.error("Error deleting", error);
        } finally {
            setDeleteModal({ isOpen: false, productId: null, loading: false });
            fetchProducts();
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your catalog, pricing, and inventory.</p>
                    </div>
                    <button
                        onClick={() => navigate('/admin/products/new')}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors cursor-pointer shadow-sm"
                    >
                        <Plus size={16} /> Add Product
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Filters Bar */}
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-all bg-white"
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <select
                                value={statusFilter}
                                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                className="w-full sm:w-auto px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white cursor-pointer"
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="unlisted">Unlisted</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Product</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Inventory</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Vendor</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading && products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <Loader size="md" />
                                        </td>
                                    </tr>
                                ) : products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                                            <Package size={40} className="mx-auto mb-3 text-gray-300 stroke-1" />
                                            <p className="font-medium text-gray-900">No products found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters or create a new product.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const statCfg = STATUS_CONFIG[product.status] || STATUS_CONFIG.draft;
                                        const StatIcon = statCfg.icon;
                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                                            {product.image_url ? (
                                                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <Package size={18} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{product.name}</div>
                                                            <div className="text-xs text-gray-500 mt-0.5">Rs. {product.price.toLocaleString()}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => toggleStatus(product.id, product.status)}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border hover:opacity-80 transition-opacity ${statCfg.color}`}
                                                    >
                                                        <StatIcon size={12} />
                                                        {statCfg.label}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={product.stock > 0 ? 'text-gray-900' : 'text-red-500 font-medium'}>
                                                        {product.stock} in stock
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                                                        {product.category || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    {product.vendor || '—'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => navigate(`/admin/products/${product.id}`)}
                                                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(product.id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                                Page {currentPage} of {totalPages}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {deleteModal.isOpen && (
                <ConfirmDeleteModal
                    count={1}
                    loading={deleteModal.loading}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteModal({ isOpen: false, productId: null, loading: false })}
                    itemName="Product"
                />
            )}
        </AdminLayout>
    );
}
