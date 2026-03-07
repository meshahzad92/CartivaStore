import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    Save, ArrowLeft, Image as ImageIcon, CheckCircle,
    Truck, PackageSearch, Tag, Loader2, Trash2, X
} from 'lucide-react';

const DEFAULT_FORM = {
    name: '',
    description: '',
    status: 'draft',
    price: '',
    original_price: '',
    weight_kg: 0,
    category: '',
    vendor: '',
    product_type: '',
    organization: '',
    seo_title: '',
    seo_desc: '',
    stock: 0,
    image_url: '',
    images: [],
    tags: []
};

// Simple tag input component
function TagInput({ tags, setTags }) {
    const [input, setInput] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const val = input.trim().replace(/,/g, '');
            if (val && !tags.includes(val)) {
                setTags([...tags, val]);
                setInput('');
            }
        }
    };

    const removeTag = (index) => {
        setTags(tags.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full border border-gray-200 rounded-xl p-2 bg-white flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-900 transition-all">
            {tags.map((tag, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                    {tag}
                    <button type="button" onClick={() => removeTag(idx)} className="hover:text-red-500 cursor-pointer text-gray-400">
                        <X size={12} />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={tags.length === 0 ? "Add tags (press Enter)..." : ""}
                className="flex-1 min-w-[120px] text-sm focus:outline-none bg-transparent"
            />
        </div>
    );
}

export default function AdminProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { authFetch, token } = useAdminAuth();

    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState(DEFAULT_FORM);
    const [originalForm, setOriginalForm] = useState(DEFAULT_FORM);

    const isModified = JSON.stringify(form) !== JSON.stringify(originalForm);

    useEffect(() => {
        if (isEditing) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await authFetch(`/api/v1/admin/products/${id}`);
            if (res.ok) {
                const product = await res.json();
                const productData = {
                    name: product.name || '',
                    description: product.description || '',
                    status: product.status || 'draft',
                    price: product.price || '',
                    original_price: product.original_price || '',
                    weight_kg: product.weight_kg || 0,
                    category: product.category || '',
                    vendor: product.vendor || '',
                    product_type: product.product_type || '',
                    organization: product.organization || '',
                    seo_title: product.seo_title || '',
                    seo_desc: product.seo_desc || '',
                    stock: product.stock || 0,
                    image_url: product.image_url || '',
                    images: product.images || [],
                    tags: product.tags || []
                };
                setForm(productData);
                setOriginalForm(productData);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load product details.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        setUploadingImage(true);
        setError('');

        try {
            const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
            let primaryUrl = form.image_url;
            const extraImages = [...(form.images || [])];

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch(`${API_BASE}/admin/products/upload-image`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!res.ok) {
                    throw new Error(`Failed to upload image: ${file.name}`);
                }

                const data = await res.json();
                if (!primaryUrl) {
                    primaryUrl = data.url;
                } else {
                    extraImages.push(data.url);
                }
            }

            setForm(prev => ({
                ...prev,
                image_url: primaryUrl,
                images: extraImages
            }));

        } catch (err) {
            console.error(err);
            setError(err.message || 'Image upload failed.');
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = '';
        }
    };

    const removeExtraImage = (indexToRemove) => {
        setForm(prev => ({
            ...prev,
            images: prev.images.filter((_, idx) => idx !== indexToRemove)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            // Ensure numbers are correct type
            const payload = {
                ...form,
                price: parseFloat(form.price) || 0,
                original_price: form.original_price ? parseFloat(form.original_price) : null,
                weight_kg: parseFloat(form.weight_kg) || 0,
                stock: parseInt(form.stock) || 0,
            };

            const url = isEditing ? `/api/v1/admin/products/${id}` : '/api/v1/admin/products';
            const method = isEditing ? 'PUT' : 'POST';

            const res = await authFetch(url, {
                method,
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const text = await res.text();
                let errMsg = 'Failed to save product';
                try {
                    const data = JSON.parse(text);
                    if (data.detail) {
                        if (Array.isArray(data.detail)) {
                            errMsg = data.detail.map(e => `${e.loc?.join('.')} - ${e.msg}`).join(', ');
                        } else {
                            errMsg = data.detail;
                        }
                    }
                } catch (e) {
                    errMsg = text || errMsg;
                }
                throw new Error(errMsg);
            }

            navigate('/admin/products');
        } catch (err) {
            console.error(err);
            setError(err.message || 'An error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={32} />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto pb-12">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin/products')} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 transition-colors cursor-pointer">
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {isEditing ? form.name || 'Edit Product' : 'Add New Product'}
                            </h1>
                            {isEditing && (
                                <p className="text-sm text-gray-500 mt-0.5">Edit mode — ID: {id}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button onClick={() => navigate('/admin/products')} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                            Discard
                        </button>
                        <button onClick={handleSubmit} disabled={saving || !isModified} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-sm">
                            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            {saving ? 'Saving...' : (isModified ? 'Save Product' : 'No Changes')}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Main Info) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Basic Details Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Basic Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Product Title</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Wireless Noise-Cancelling Headphones"
                                        value={form.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1 flex justify-between">
                                        <span>Description</span>
                                        <span className="text-gray-400 font-normal">Supports basic HTML</span>
                                    </label>
                                    <textarea
                                        rows={6}
                                        placeholder="Detailed product capabilities and features..."
                                        value={form.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors resize-y"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Media Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Media</h2>
                            {form.image_url ? (
                                <div className="space-y-4">
                                    <div className="w-full relative group">
                                        <img src={form.image_url} alt="Product Preview" className="w-full h-56 object-contain bg-gray-50 rounded-xl border border-gray-200 shadow-sm" />
                                        <button
                                            onClick={() => handleChange('image_url', '')}
                                            className="absolute top-3 right-3 bg-white/90 backdrop-blur border border-gray-200 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                            title="Remove Primary Image"
                                            type="button"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Additional Images Grid */}
                                    <div className="grid grid-cols-4 gap-3">
                                        {form.images?.map((imgUrl, idx) => (
                                            <div key={idx} className="relative group aspect-square">
                                                <img src={imgUrl} alt="Extra" className="w-full h-full object-cover rounded-lg border border-gray-200 shadow-sm" />
                                                <button
                                                    onClick={() => removeExtraImage(idx)}
                                                    className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                                    type="button"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                        {/* Small Add Button for Extra Images */}
                                        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:text-indigo-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer group">
                                            {uploadingImage ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                                            <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} />
                                        </label>
                                    </div>
                                </div>
                            ) : (
                                <label className="border-2 border-dashed border-gray-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer w-full group">
                                    {uploadingImage ? (
                                        <>
                                            <Loader2 size={32} className="animate-spin text-indigo-500 mb-3" />
                                            <p className="text-sm font-bold text-gray-900">Uploading Images...</p>
                                            <p className="text-xs text-gray-500 mt-1">Please wait</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-105 transition-transform">
                                                <ImageIcon size={24} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 mb-1">Click to upload images</p>
                                            <p className="text-xs text-gray-500">You can select multiple images</p>
                                        </>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} />
                                </label>
                            )}
                        </div>

                        {/* Pricing & Inventory Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Pricing & Inventory</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Selling Price (Rs)</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        placeholder="0.00"
                                        value={form.price}
                                        onChange={(e) => handleChange('price', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Compare-at Price (Rs)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="0.00"
                                        value={form.original_price}
                                        onChange={(e) => handleChange('original_price', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Stock Quantity</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.stock}
                                        onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Shipping Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Shipping</h2>
                            <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                                <Truck size={16} className="text-indigo-500" />
                                <span>This is a physical product that requires shipping.</span>
                            </div>
                            <div className="max-w-xs">
                                <label className="block text-xs font-bold text-gray-600 mb-1">Weight (kg) — PostEx</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={form.weight_kg}
                                    onChange={(e) => handleChange('weight_kg', e.target.value)}
                                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors"
                                />
                            </div>
                        </div>

                        {/* SEO Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Search Engine Optimization</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">SEO Title</label>
                                    <input
                                        type="text"
                                        placeholder="Customize how the title appears on Google..."
                                        value={form.seo_title}
                                        onChange={(e) => handleChange('seo_title', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">SEO Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Meta description for search results..."
                                        value={form.seo_desc}
                                        onChange={(e) => handleChange('seo_desc', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors resize-y"
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Sidebar Setup) */}
                    <div className="space-y-6">

                        {/* Status Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Product Status</h2>
                            <select
                                value={form.status}
                                onChange={(e) => handleChange('status', e.target.value)}
                                className="w-full text-sm font-medium px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 cursor-pointer mb-2"
                            >
                                <option value="active">Active (Visible)</option>
                                <option value="unlisted">Unlisted (Hidden from search)</option>
                                <option value="draft">Draft (Not published)</option>
                            </select>
                            <p className="text-xs text-gray-500">
                                Draft products are not visible anywhere to customers. Unlisted products are visible only via direct link.
                            </p>
                        </div>

                        {/* Organization Box */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4">Organization</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Category (Primary)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Electronics, Clothing..."
                                        value={form.category}
                                        onChange={(e) => handleChange('category', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Product Type</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Headphones"
                                        value={form.product_type}
                                        onChange={(e) => handleChange('product_type', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Vendor / Brand</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Sony, Nike..."
                                        value={form.vendor}
                                        onChange={(e) => handleChange('vendor', e.target.value)}
                                        className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1 flex items-center gap-1.5">
                                        <Tag size={12} className="text-gray-400" /> Tags
                                    </label>
                                    <TagInput
                                        tags={form.tags}
                                        setTags={(newTags) => handleChange('tags', newTags)}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AdminLayout >
    );
}
