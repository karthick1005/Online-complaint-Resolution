import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, UserCog, Mail, Phone, Building2, Search, Shield } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import api from '@/api';

export default function ManagerManagement() {
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    departmentId: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [managersRes, deptsRes] = await Promise.all([
        api.get('/users?role=department_manager'),
        api.get('/departments')
      ]);
      setManagers(managersRes.data.data || []);
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
      if (editingManager) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editingManager.id}`, updateData);
        addToast('Manager updated successfully', 'success');
      } else {
        await api.post('/users/create-manager', formData);
        addToast('Manager created successfully', 'success');
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      addToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      name: manager.name,
      email: manager.email,
      phone: manager.phone || '',
      password: '',
      departmentId: manager.departmentId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this manager?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      addToast('Manager deleted successfully', 'success');
      fetchManagers();
    } catch (error) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingManager(null);
    setFormData({ name: '', email: '', phone: '', password: '', departmentId: '' });
  };

  const filteredManagers = managers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg sm:rounded-xl shadow-lg w-fit flex-shrink-0">
              <UserCog className="w-5 sm:w-6 lg:w-8 h-5 sm:h-6 lg:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Manager Management
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                Manage department managers
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-6">
          <div className="stats-card bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-3 sm:p-4 rounded-lg overflow-hidden">
            <div className="relative z-10">
              <p className="text-cyan-100 text-xs font-medium mb-1">Total Managers</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{managers.length}</p>
            </div>
            <Shield className="absolute -bottom-1 -right-1 sm:bottom-1 sm:right-1 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 opacity-20" />
          </div>
          <div className="stats-card bg-gradient-to-br from-purple-500 to-pink-600 text-white p-3 sm:p-4 rounded-lg overflow-hidden">
            <div className="relative z-10">
              <p className="text-purple-100 text-xs font-medium mb-1">Departments</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{departments.length}</p>
            </div>
            <Building2 className="absolute -bottom-1 -right-1 sm:bottom-1 sm:right-1 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 opacity-20" />
          </div>
          <div className="stats-card bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-3 sm:p-4 rounded-lg overflow-hidden col-span-2 md:col-span-1">
            <div className="relative z-10">
              <p className="text-emerald-100 text-xs font-medium mb-1">Active</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{managers.filter(m => m.isActive).length}</p>
            </div>
            <UserCog className="absolute -bottom-1 -right-1 sm:bottom-1 sm:right-1 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 opacity-20" />
          </div>
        </div>

        {/* Action Bar */}
        <div className="modern-card p-3 sm:p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col gap-2 sm:gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input pl-10 text-xs sm:text-sm w-full h-9 sm:h-10"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary hover-lift w-full"
            >
              <Plus className="w-4 h-4" />
              Add Manager
            </button>
          </div>
        </div>

        {/* Managers Table */}
        {loading ? (
          <div className="modern-card overflow-hidden">
            <div className="p-4 sm:p-6 space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="modern-card p-8 sm:p-12 text-center">
            <UserCog className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No managers found
            </h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first manager'}
            </p>
            {!searchTerm && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                <Plus className="w-5 h-5" />
                Create Manager
              </button>
            )}
          </div>
        ) : (
          <div className="modern-card overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="modern-table w-full">
                <thead>
                  <tr>
                    <th>Manager</th>
                    <th>Contact</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredManagers.map((manager, index) => (
                    <tr key={manager.id} className="animate-slideIn" style={{ animationDelay: `${index * 50}ms` }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                            {manager.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white text-sm">
                              {manager.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {manager.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{manager.email}</span>
                          </div>
                          {manager.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Phone className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{manager.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        {manager.department ? (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {manager.department.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge text-xs ${manager.isActive ? 'status-resolved' : 'status-rejected'}`}>
                          {manager.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEdit(manager)}
                            className="btn-icon text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(manager.id)}
                            className="btn-icon text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-2 sm:space-y-3 p-3 sm:p-4">
              {filteredManagers.map((manager) => (
                <div key={manager.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
                        {manager.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">
                          {manager.name}
                        </p>
                        <span className={`inline-block text-xs mt-1 px-2 py-0.5 rounded ${manager.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                          {manager.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(manager)}
                        className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(manager.id)}
                        className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 overflow-hidden">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{manager.email}</span>
                    </div>
                    {manager.phone && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 overflow-hidden">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{manager.phone}</span>
                      </div>
                    )}
                    {manager.department && (
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 overflow-hidden">
                        <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{manager.department.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 animate-fadeIn">
          <div className="modern-card w-full sm:max-w-md p-4 sm:p-6 rounded-t-2xl sm:rounded-2xl animate-scaleIn">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
              {editingManager ? 'Edit Manager' : 'Create Manager'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="modern-input text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="modern-input text-sm"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="modern-input text-sm"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Department *
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="modern-select text-sm"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password {editingManager && '(Leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingManager}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="modern-input text-sm"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn btn-secondary w-full sm:flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full sm:flex-1"
                >
                  {editingManager ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
