import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { complaintAPI, departmentAPI, categoryAPI } from '../api';
import { getDepartmentList, getCategories, getDepartmentDescription } from '../lib/departments';

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentId: '',
    categoryId: '',
    priority: 'Medium',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const deptList = getDepartmentList();
        const result = await departmentAPI.getDepartments().catch(() => null);
        
        if (result?.data) {
          setDepartments(result.data);
        } else {
          // Fallback to local departments data
          setDepartments(deptList.map((name, idx) => ({
            id: `dept-${idx}`,
            name
          })));
        }
      } catch (err) {
        console.error('Failed to fetch departments:', err);
      }
    };
    
    fetchDepartments();
  }, []);

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    const dept = departments.find(d => d.id === deptId || d.name === deptId);
    
    if (!dept) return;

    setSelectedDept(deptId);
    setFormData({ ...formData, departmentId: deptId, categoryId: '' });

    try {
      // Try to fetch categories from API
      const result = await categoryAPI.getCategoriesByDepartment(deptId).catch(() => null);
      
      if (result?.data) {
        setCategories(result.data);
      } else {
        // Fallback to local categories data
        const localCategories = getCategories(dept.name);
        setCategories(localCategories.map((cat, idx) => ({
          id: cat.id,
          name: cat.name,
          defaultPriority: cat.priority
        })));
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      const localCategories = getCategories(dept.name);
      setCategories(localCategories.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        defaultPriority: cat.priority
      })));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        });
        setError('');
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable it in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.departmentId) {
      setError('Please select a department');
      return;
    }
    
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);

    try {
      const response = await complaintAPI.createComplaint(formData, files);
      alert('✅ Complaint filed successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '700px', marginTop: '30px', marginBottom: '40px' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1>📋 File New Complaint</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Select your department and complaint type to get started
          </p>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '20px' }}>
            ❌ {error}
          </div>
        )}

        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Department Selection */}
            <div className="form-group">
              <label style={{ fontWeight: '600' }}>🏢 Department *</label>
              <select
                value={selectedDept}
                onChange={handleDepartmentChange}
                required
                style={{ padding: '10px', fontSize: '14px' }}
              >
                <option value="">-- Select a Department --</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id || dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {selectedDept && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                  {getDepartmentDescription(
                    departments.find(d => d.id === selectedDept || d.name === selectedDept)?.name
                  )}
                </p>
              )}
            </div>

            {/* Category Selection */}
            <div className="form-group">
              <label style={{ fontWeight: '600' }}>📁 Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                disabled={!selectedDept}
                style={{ padding: '10px', fontSize: '14px' }}
              >
                <option value="">-- Select a Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.defaultPriority || 'Medium'})
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div className="form-group">
              <label style={{ fontWeight: '600' }}>📝 Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a brief title for your complaint"
                required
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label style={{ fontWeight: '600' }}>📄 Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed information about your complaint"
                required
                style={{ minHeight: '150px' }}
              ></textarea>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label style={{ fontWeight: '600' }}>⚠️ Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                style={{ padding: '10px', fontSize: '14px' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-group">
              <label style={{ fontWeight: '600' }}>📍 Location Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter the location/address of the issue"
              />
            </div>

            {/* Geolocation Button */}
            <div className="form-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGetLocation}
                disabled={loading}
                style={{ marginBottom: '10px', width: '100%', padding: '10px' }}
              >
                {loading ? '📍 Getting Location...' : '📍 Use Current Location'}
              </button>
            </div>

            {/* Coordinates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label style={{ fontWeight: '600' }}>Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="Auto-detected"
                  readOnly={!!formData.latitude}
                  style={{ backgroundColor: formData.latitude ? '#f0f0f0' : '' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '600' }}>Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="Auto-detected"
                  readOnly={!!formData.longitude}
                  style={{ backgroundColor: formData.longitude ? '#f0f0f0' : '' }}
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="form-group">
              <label style={{ fontWeight: '600' }}>📎 Attachments (Optional)</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/*,.pdf"
                style={{ padding: '8px' }}
              />
              {files.length > 0 && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !formData.departmentId || !formData.categoryId}
                style={{ flex: 1 }}
              >
                {loading ? '⏳ Submitting...' : '✅ Submit Complaint'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/dashboard')}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ComplaintForm;

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    priority: 'Medium',
    address: '',
    latitude: '',
    longitude: ''
  });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: 'cat-1', name: 'Water Leak' },
    { id: 'cat-2', name: 'Pothole' },
    { id: 'cat-3', name: 'Power Outage' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData({
          ...formData,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6)
        });
        setError('');
        setLoading(false);
      },
      (error) => {
        let errorMessage = 'Unable to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location permission denied. Please enable it in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'Location request timed out.';
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await complaintAPI.createComplaint(formData, files);
      alert('Complaint filed successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to file complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '600px', marginTop: '30px' }}>
        <h1>File New Complaint</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label>Category *</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter location address"
              />
            </div>

            <div className="form-group">
              <label>Location Coordinates</label>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGetLocation}
                disabled={loading}
                style={{ marginBottom: '10px', width: '100%' }}
              >
                {loading ? '📍 Getting Location...' : '📍 Use Current Location'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="Auto-detected"
                  readOnly={formData.latitude}
                />
              </div>

              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  step="0.0001"
                  placeholder="Auto-detected"
                  readOnly={formData.longitude}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Attachments (Max 5 files, 10MB each)</label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              {files.length > 0 && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Filing...' : 'File Complaint'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ComplaintForm;
