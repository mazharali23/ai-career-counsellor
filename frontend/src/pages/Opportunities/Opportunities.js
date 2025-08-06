import React, { useState, useEffect } from 'react';
import './Opportunities.css';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all'
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setOpportunities([
        {
          id: 1,
          title: "Software Engineering Internship",
          organization: "Tech Innovation Corp",
          type: "internship",
          category: "Technology",
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          description: "Summer internship program for computer science students"
        },
        {
          id: 2,
          title: "STEM Scholarship Program",
          organization: "Education Foundation",
          type: "scholarship",
          category: "Education",
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
          description: "Merit-based scholarship for STEM students"
        },
        {
          id: 3,
          title: "Junior Data Analyst Position",
          organization: "Analytics Solutions Ltd",
          type: "job",
          category: "Technology",
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
          description: "Entry-level data analyst position"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.type !== 'all' && opp.type !== filters.type) return false;
    if (filters.category !== 'all' && opp.category !== filters.category) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="opportunities-loading">
        <div className="loading-spinner"></div>
        <p>Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="opportunities">
      <div className="opportunities-container">
        <div className="opportunities-header">
          <h1 className="opportunities-title">Career Opportunities</h1>
          <p className="opportunities-subtitle">Discover scholarships, internships, and job openings</p>
        </div>

        <div className="filters-section">
          <div className="filters-group">
            <label htmlFor="type-filter">Filter by Type:</label>
            <select 
              id="type-filter"
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="job">Jobs</option>
              <option value="internship">Internships</option>
              <option value="scholarship">Scholarships</option>
            </select>
          </div>
          <div className="filters-group">
            <label htmlFor="category-filter">Filter by Category:</label>
            <select 
              id="category-filter"
              value={filters.category} 
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              <option value="Technology">Technology</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Business">Business</option>
            </select>
          </div>
        </div>

        <div className="opportunities-grid">
          {filteredOpportunities.map(opportunity => (
            <div key={opportunity.id} className="opportunity-card">
              <div className="opportunity-header">
                <span className={`type-badge ${opportunity.type}`}>
                  {opportunity.type}
                </span>
                <button className="favorite-btn">🤍</button>
              </div>
              <h3 className="opportunity-title">{opportunity.title}</h3>
              <p className="opportunity-organization">{opportunity.organization}</p>
              <p className="opportunity-description">{opportunity.description}</p>
              <p className="opportunity-deadline">
                Deadline: {opportunity.deadline.toLocaleDateString()}
              </p>
              <button className="apply-btn">Apply Now</button>
            </div>
          ))}
        </div>

        {filteredOpportunities.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No opportunities found</h3>
            <p>Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
