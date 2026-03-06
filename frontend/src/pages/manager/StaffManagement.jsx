import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Mail, Phone, Search, Shield, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import api from '@/api';

export default function StaffManagement() {
  const { user } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const { addToast } = useToast();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      // Fetch staff from manager's department
      const response = await api.get(`/users?role=staff&departmentId=${user.departmentId}`);
      setStaff(response.data.data || []);
    } catch (error) {
      addToast('Failed to fetch staff', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        role: 'staff',
        departmentId: user.departmentId
      };

      if (editingStaff) {
        const updateData = { ...submitData };
        if (!updateData.password) delete updateData.password;
        await api.put(`/users/${editingStaff.id}`, updateData);
        addToast('Staff member updated successfully', 'success');
      } else {
        await api.post('/users/create-staff', submitData);
        addToast('Staff member created successfully', 'success');
      }
      fetchStaff();
      handleCloseModal();
    } catch (error) {
      addToast(error.response?.data?.message || 'Operation failed', 'error');
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      addToast('Staff member deleted successfully', 'success');
      fetchStaff();
    } catch (error) {
      addToast(error.response?.data?.message || 'Delete failed', 'error');
    }
  };

  const handleToggleStatus = async (staffMember) => {
    try {
      await api.put(`/users/${staffMember.id}`, {
        isActive: !staffMember.isActive
      });
      addToast(`Staff member ${staffMember.isActive ? 'deactivated' : 'activated'} successfully`, 'success');
      fetchStaff();
    } catch (error) {
      addToast(error.response?.data?.message || 'Status update failed', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({ name: '', email: '', phone: '', password: '' });
  };

  const filteredStaff = staff.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeStaff = staff.filter(s => s.isActive).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Staff Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage staff members in your department
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="stats-card bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="relative z-10">
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Staff</p>
              <p className="text-3xl font-bold">{staff.length}</p>
            </div>
            <Users className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
          </div>
          <div className="stats-card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="relative z-10">
              <p className="text-green-100 text-sm font-medium mb-1">Active Staff</p>
              <p className="text-3xl font-bold">{activeStaff}</p>
            </div>
            <CheckCircle className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
          </div>
          <div className="stats-card bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
            <div className="relative z-10">
              <p className="text-yellow-100 text-sm font-medium mb-1">Inactive Staff</p>
              <p className="text-3xl font-bold">{staff.length - activeStaff}</p>
            </div>
            <XCircle className="absolute bottom-4 right-4 w-16 h-16 opacity-20" />
          </div>
        </div>

        {/* Action Bar */}
        <div className="modern-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search staff members..."
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
              Add Staff
            </button>
          </div>
        </div>

        {/* Staff Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="modern-card p-6 animate-pulse">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-full w-16 mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="modern-card p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No staff members found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first staff member'}
            </p>
            {!searchTerm && (
              <button onClick={() => setShowModal(true)} className="btn btn-primary">
                <Plus className="w-5 h-5" />
                Add Staff
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staffMember, index) => (
              <div
                key={staffMember.id}
                className="modern-card p-6 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                    {staffMember.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {staffMember.name}
                    </h3>
                    <span className={`status-badge ${staffMember.isActive ? 'status-resolved' : 'status-rejected'} text-xs`}>
                      {staffMember.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{staffMember.email}</span>
                  </div>
                  {staffMember.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <span>{staffMember.phone}</span>
                    </div>
                  )}
                </div>

                {staffMember._count && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {staffMember._count.assignedComplaints || 0} assigned complaints
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(staffMember)}
                    className="btn btn-ghost btn-sm flex-1"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleStatus(staffMember)}
                    className={`btn btn-ghost btn-sm flex-1 ${
                      staffMember.isActive 
                        ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                        : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                    }`}
                  >
                    {staffMember.isActive ? (
                      <>
                        <XCircle className="w-4 h-4" />
                        Disable
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Enable
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(staffMember.id)}
                    className="btn-icon text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
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
              {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
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
                  Password {editingStaff && '(Leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={!editingStaff}
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
                  {editingStaff ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
