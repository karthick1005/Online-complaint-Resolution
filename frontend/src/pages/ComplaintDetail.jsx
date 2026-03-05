import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { complaintAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [comment, setComment] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      const response = await complaintAPI.getComplaintById(id);
      setComplaint(response.data);
      setNewStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching complaint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (newStatus === complaint.status && !comment) {
      alert('Please provide a comment or change the status');
      return;
    }

    setUpdating(true);
    try {
      await complaintAPI.updateStatus(id, newStatus, comment);
      alert('Status updated successfully');
      setComment('');
      fetchComplaint();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="spinner"></div>;
  if (!complaint) return <p>Complaint not found</p>;

  const canUpdateStatus = ['staff', 'department_manager', 'admin'].includes(user?.role);
  const canProvideFeedback = user?.role === 'complainant' && complaint.status === 'Resolved';

  return (
    <>
      <Navbar />
      <div className="container" style={{ marginTop: '30px' }}>
        <Link to="/dashboard" style={{ marginBottom: '20px', display: 'inline-block' }}>
          ← Back
        </Link>

        <div className="grid grid-2">
          <div>
            <div className="card">
              <h2>{complaint.title}</h2>
              <p><strong>Code:</strong> {complaint.complaintCode}</p>
              <p><strong>Status:</strong> {complaint.status}</p>
              <p><strong>Priority:</strong> <span className={`badge badge-${complaint.priority.toLowerCase()}`}>{complaint.priority}</span></p>
              <p><strong>Department:</strong> {complaint.department.name}</p>
              <p><strong>Category:</strong> {complaint.category.name}</p>
              <p><strong>Filed By:</strong> {complaint.user.name}</p>
              <p><strong>Assigned To:</strong> {complaint.assignedTo?.name || 'Unassigned'}</p>
              <p><strong>Created:</strong> {new Date(complaint.createdAt).toLocaleString()}</p>
              {complaint.slaDeadline && (
                <p><strong>SLA Deadline:</strong> {new Date(complaint.slaDeadline).toLocaleString()}</p>
              )}
              <hr />
              <h4>Description</h4>
              <p>{complaint.description}</p>
              {complaint.address && (
                <p><strong>Address:</strong> {complaint.address}</p>
              )}
              {complaint.latitude && complaint.longitude && (
                <p><strong>Location:</strong> {complaint.latitude}, {complaint.longitude}</p>
              )}
            </div>

            {complaint.attachments.length > 0 && (
              <div className="card">
                <h3>Attachments</h3>
                {complaint.attachments.map((att) => (
                  <p key={att.id}>
                    <a href={att.filePath} target="_blank" rel="noopener noreferrer">
                      📎 {att.filePath.split('/').pop()}
                    </a>
                  </p>
                ))}
              </div>
            )}

            {complaint.feedback && (
              <div className="card">
                <h3>Feedback</h3>
                <p><strong>Rating:</strong> {complaint.feedback.rating}/5 ⭐</p>
                <p><strong>Comment:</strong> {complaint.feedback.comment}</p>
              </div>
            )}

            {canProvideFeedback && !complaint.feedback && (
              <Link to={`/complaint/${id}/feedback`} className="btn btn-success">
                Provide Feedback
              </Link>
            )}
          </div>

          <div>
            {canUpdateStatus && (
              <div className="card">
                <h3>Update Status</h3>
                <form onSubmit={handleStatusUpdate}>
                  <div className="form-group">
                    <label>New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Registered">Registered</option>
                      <option value="Assigned">Assigned</option>
                      <option value="InProgress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      <option value="Escalated">Escalated</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={updating}>
                    {updating ? 'Updating...' : 'Update Status'}
                  </button>
                </form>
              </div>
            )}

            <div className="card">
              <h3>Timeline</h3>
              {complaint.history && complaint.history.map((entry) => (
                <div key={entry.id} style={{ borderLeft: '2px solid #007bff', paddingLeft: '15px', marginBottom: '15px' }}>
                  <p><strong>{entry.status}</strong></p>
                  {entry.comment && <p>{entry.comment}</p>}
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    by {entry.updatedByUser.name} - {new Date(entry.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintDetail;
