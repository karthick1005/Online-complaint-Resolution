import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Tag, Search, Layers } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/api';

export default function CategoryManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    departmentId: '',
    defaultPriority: 'Medium',
    color: '#3B82F6'
  });
  const { addToast } = useToast();

  const colorPresets = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Yellow', value: '#EAB308' },
    { name: 'Green', value: '#10B981' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Indigo', value: '#6366F1' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, deptsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/departments')
      ]);
      setCategories(categoriesRes.data.data || []);
      setDepartments(deptsRes.data || []);
    } catch (error) {
      addToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
        addToast('Category updated successfully', 'success');
      } else {
        await api.post('/categories', formData);
        addToast('Category created successfully', 'success');
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      addToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      departmentId: category.departmentId || '',
      defaultPriority: category.defaultPriority || 'Medium',
      color: category.color || '#3B82F6'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.delete(`/categories/${id}`);
      addToast('Category deleted successfully', 'success');
      fetchData();
    } catch (error) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    // Pre-fill department for managers
    const defaultDeptId = user?.role === 'department_manager' ? user.departmentId : '';
    setFormData({ 
      name: '', 
      departmentId: defaultDeptId, 
      defaultPriority: 'Medium', 
      color: '#3B82F6' 
    });
  };

  const handleOpenModal = () => {
    // Pre-fill department for managers
    if (user?.role === 'department_manager') {
      setFormData(prev => ({ ...prev, departmentId: user.departmentId }));
    }
    setShowModal(true);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Layers className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Category Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage complaint categories and tags
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="modern-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input pl-10"
              />
            </div>
            <button
              onClick={handleOpenModal}
              className="btn btn-primary hover-lift"
            >
              <Plus className="w-5 h-5" />
              Add Category
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="modern-card p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="modern-card p-12 text-center">
            <Layers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first category'}
            </p>
            {!searchTerm && (
              <button onClick={handleOpenModal} className="btn btn-primary">
                <Plus className="w-5 h-5" />
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCategories.map((category, index) => (
              <div
                key={category.id}
                className="modern-card-hover p-6 group relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Color accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: category.color || '#3B82F6' }}
                />

                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: `${category.color || '#3B82F6'}20`,
                      color: category.color || '#3B82F6'
                    }}
                  >
                    <Tag className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Department:</span> {category.department?.name || 'N/A'}
                  </div>
                  <div className="text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      category.defaultPriority === 'Critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      category.defaultPriority === 'High' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      category.defaultPriority === 'Medium' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {category.defaultPriority || 'Medium'} Priority
                    </span>
                  </div>
                </div>

                {category._count?.complaints > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                    {category._count.complaints} {category._count.complaints === 1 ? 'complaint' : 'complaints'}
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleEdit(category)}
                    className="btn btn-ghost btn-sm flex-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="btn btn-ghost btn-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="modern-card max-w-md w-full p-6 animate-scaleIn">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingCategory ? 'Edit Category' : 'Create Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="modern-input"
                  placeholder="e.g., Technical Issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="modern-select"
                  disabled={user?.role === 'department_manager'}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {user?.role === 'department_manager' && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    You can only create categories for your department
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Priority *
                </label>
                <select
                  required
                  value={formData.defaultPriority}
                  onChange={(e) => setFormData({ ...formData, defaultPriority: e.target.value })}
                  className="modern-select"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Color
                </label>
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: preset.value })}
                      className={`w-12 h-12 rounded-lg transition-transform hover:scale-110 ${
                        formData.color === preset.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: preset.value }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
