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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg">
              <UserCog className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Manager Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage department managers and their assignments
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="stats-card bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
            <div className="relative z-10">
              <p className="text-cyan-100 text-sm font-medium mb-1">Total Managers</p>
              <p className="text-3xl font-bold">{managers.length}</p>
            </div>
            <Shield className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
          </div>
          <div className="stats-card bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="relative z-10">
              <p className="text-purple-100 text-sm font-medium mb-1">Total Departments</p>
              <p className="text-3xl font-bold">{departments.length}</p>
            </div>
            <Building2 className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
          </div>
          <div className="stats-card bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="relative z-10">
              <p className="text-emerald-100 text-sm font-medium mb-1">Active Managers</p>
              <p className="text-3xl font-bold">{managers.filter(m => m.isActive).length}</p>
            </div>
            <UserCog className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
          </div>
        </div>

        {/* Action Bar */}
        <div className="modern-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search managers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modern-input pl-10"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary hover-lift"
            >
              <Plus className="w-5 h-5" />
              Add Manager
            </button>
          </div>
        </div>

        {/* Managers Table */}
        {loading ? (
          <div className="modern-card overflow-hidden">
            <div className="p-6 space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ) : filteredManagers.length === 0 ? (
          <div className="modern-card p-12 text-center">
            <UserCog className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No managers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
            <table className="modern-table">
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                          {manager.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
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
                          <Mail className="w-4 h-4" />
                          {manager.email}
                        </div>
                        {manager.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            {manager.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {manager.department ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {manager.department.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${manager.isActive ? 'status-resolved' : 'status-rejected'}`}>
                        {manager.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleEdit(manager)}
                          className="btn-icon text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(manager.id)}
                          className="btn-icon text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
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
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="modern-card max-w-md w-full p-6 animate-scaleIn">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingManager ? 'Edit Manager' : 'Create Manager'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="modern-input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="modern-input"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="modern-input"
                  placeholder="+1 (555) 000-0000"
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
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password {editingManager && '(Leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingManager}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="modern-input"
                  placeholder="••••••••"
                  minLength={6}
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
