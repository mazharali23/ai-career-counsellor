import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    interests: user?.profile?.interests?.join(', ') || '',
    skills: user?.profile?.skills?.join(', ') || '',
    education: user?.profile?.education?.level || '',
    location: user?.profile?.location?.city || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const profileData = {
        name: formData.name,
        profile: {
          interests: formData.interests.split(',').map(item => item.trim()).filter(item => item),
          skills: formData.skills.split(',').map(item => item.trim()).filter(item => item),
          education: {
            level: formData.education
          },
          location: {
            city: formData.location
          }
        }
      };

      const result = await updateProfile(profileData);
      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('Failed to update profile. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <span className="avatar-text">{user?.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="profile-info">
            <h1 className="profile-name">{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
          </div>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          {isEditing ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="interests">
                  Interests (comma separated)
                </label>
                <input
                  type="text"
                  id="interests"
                  name="interests"
                  className="form-input"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="e.g., Programming, Design, Music"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="skills">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  className="form-input"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., JavaScript, Problem Solving, Leadership"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="education">
                  Education Level
                </label>
                <select
                  id="education"
                  name="education"
                  className="form-input"
                  value={formData.education}
                  onChange={handleChange}
                >
                  <option value="">Select Education Level</option>
                  <option value="High School">High School</option>
                  <option value="Bachelor">Bachelor's Degree</option>
                  <option value="Master">Master's Degree</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="location">
                  Location (City)
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  className="form-input"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., New York, NY"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </form>
          ) : (
            <div className="profile-display">
              <div className="profile-section">
                <h3 className="section-title">Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name:</span>
                    <span className="info-value">{user?.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{user?.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Education:</span>
                    <span className="info-value">
                      {user?.profile?.education?.level || 'Not specified'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location:</span>
                    <span className="info-value">
                      {user?.profile?.location?.city || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3 className="section-title">Interests</h3>
                <div className="tags-container">
                  {user?.profile?.interests?.length > 0 ? (
                    user.profile.interests.map((interest, index) => (
                      <span key={index} className="tag interest-tag">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="no-data">No interests added yet</p>
                  )}
                </div>
              </div>

              <div className="profile-section">
                <h3 className="section-title">Skills</h3>
                <div className="tags-container">
                  {user?.profile?.skills?.length > 0 ? (
                    user.profile.skills.map((skill, index) => (
                      <span key={index} className="tag skill-tag">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="no-data">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
