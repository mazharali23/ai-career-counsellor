import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDashboardData({
        stats: {
          coursesEnrolled: 3,
          coursesCompleted: 1,
          applicationsSubmitted: 2,
          goalsAchieved: 5
        },
        recommendations: [
          {
            title: "Software Developer",
            description: "Build amazing applications",
            matchScore: 9.2
          },
          {
            title: "Data Scientist", 
            description: "Analyze data for insights",
            matchScore: 8.7
          }
        ],
        recentActivities: [
          {
            type: 'course',
            title: 'Completed JavaScript Fundamentals',
            date: new Date(),
            status: 'completed'
          },
          {
            type: 'application',
            title: 'Applied for Software Intern Position',
            date: new Date(),
            status: 'pending'
          }
        ]
      });
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div className="header-content">
            <div className="welcome-section">
              <h1 className="dashboard-title">Welcome back, {user?.name}! 👋</h1>
              <p className="dashboard-subtitle">Here's your career journey progress</p>
            </div>
            <Link to="/chat" className="chat-shortcut-btn">
              <span className="btn-icon">💬</span>
              Continue Chat
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-content">
              <span className="stat-number">{dashboardData.stats.coursesEnrolled}</span>
              <span className="stat-label">Courses Enrolled</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <span className="stat-number">{dashboardData.stats.applicationsSubmitted}</span>
              <span className="stat-label">Applications</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <span className="stat-number">{dashboardData.stats.goalsAchieved}</span>
              <span className="stat-label">Goals Achieved</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <span className="stat-number">85%</span>
              <span className="stat-label">Profile Score</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content-grid">
          <div className="dashboard-card">
            <h3 className="card-title">Career Recommendations</h3>
            <div className="recommendations-list">
              {dashboardData.recommendations.map((rec, index) => (
                <div key={index} className="recommendation-item">
                  <div className="recommendation-content">
                    <h4 className="recommendation-title">{rec.title}</h4>
                    <p className="recommendation-description">{rec.description}</p>
                    <div className="match-score">
                      Match: {rec.matchScore}/10
                    </div>
                  </div>
                  <button className="explore-btn">Explore</button>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="card-title">Recent Activities</h3>
            <div className="activities-list">
              {dashboardData.recentActivities.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon">
                    {activity.type === 'course' ? '📚' : '📝'}
                  </div>
                  <div className="activity-content">
                    <p className="activity-title">{activity.title}</p>
                    <p className="activity-date">
                      {activity.date.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status-badge ${activity.status}`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
