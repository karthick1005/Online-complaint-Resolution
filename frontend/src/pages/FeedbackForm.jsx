import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { complaintAPI } from '../api';

const FeedbackForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await complaintAPI.addFeedback(id, rating, comment);
      alert('Thank you for your feedback!');
      navigate(`/complaint/${id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container" style={{ maxWidth: '500px', marginTop: '50px' }}>
        <h1>Provide Feedback</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Rating (1-5 stars)</label>
              <div style={{ display: 'flex', gap: '10px', fontSize: '24px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      opacity: star <= rating ? 1 : 0.3
                    }}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '14px', color: '#666' }}>Selected: {rating} star(s)</p>
            </div>

            <div className="form-group">
              <label>Comments</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your feedback..."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default FeedbackForm;
