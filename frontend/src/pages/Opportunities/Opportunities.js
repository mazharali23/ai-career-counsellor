import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { apiConfig, apiCall } from '../../config/api.js';

const Opportunities = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [filters, setFilters] = useState({
    jobType: 'all',
    location: 'all',
    experience: 'all',
    salary: 'all'
  });
  const eventSourceRef = useRef(null);

  useEffect(() => {
    initializeOpportunities();
    setupRealTimeOpportunities();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const initializeOpportunities = async () => {
    try {
      // Try to fetch real opportunities
      const data = await apiCall('/api/opportunities');
      if (data.success && Array.isArray(data.opportunities)) {
        setOpportunities(data.opportunities);
        setIsConnected(true);
      }
    } catch (error) {
      console.warn('Using mock opportunities data');
      // Mock opportunities data with proper error handling
      const mockOpportunities = [
        {
          id: 1,
          title: 'Frontend Developer',
          company: 'TechCorp',
          location: 'Remote',
          salary: '$70k - $90k',
          type: 'Full-time',
          experience: 'Mid-level',
          skills: ['React', 'JavaScript', 'CSS'],
          description: 'Build amazing user interfaces with our dynamic team.',
          postedDate: new Date(Date.now() - 86400000),
          isNew: true,
          matchScore: 95,
          hasApplied: false
        },
        {
          id: 2,
          title: 'Data Scientist',
          company: 'DataFlow Inc',
          location: 'New York, NY',
          salary: '$85k - $110k',
          type: 'Full-time',
          experience: 'Senior',
          skills: ['Python', 'Machine Learning', 'SQL'],
          description: 'Analyze complex data to drive business decisions.',
          postedDate: new Date(Date.now() - 172800000),
          isNew: false,
          matchScore: 87,
          hasApplied: false
        },
        {
          id: 3,
          title: 'Product Manager',
          company: 'InnovateNow',
          location: 'San Francisco, CA',
          salary: '$90k - $120k',
          type: 'Full-time',
          experience: 'Mid-level',
          skills: ['Strategy', 'Analytics', 'Leadership'],
          description: 'Lead product development from concept to launch.',
          postedDate: new Date(Date.now() - 259200000),
          isNew: false,
          matchScore: 78,
          hasApplied: false
        },
        {
          id: 4,
          title: 'UX Designer',
          company: 'DesignStudio',
          location: 'Remote',
          salary: '$65k - $85k',
          type: 'Contract',
          experience: 'Mid-level',
          skills: ['Figma', 'User Research', 'Prototyping'],
          description: 'Create intuitive and beautiful user experiences.',
          postedDate: new Date(Date.now() - 345600000),
          isNew: false,
          matchScore: 82,
          hasApplied: false
        },
        {
          id: 5,
          title: 'DevOps Engineer',
          company: 'CloudTech',
          location: 'Austin, TX',
          salary: '$80k - $105k',
          type: 'Full-time',
          experience: 'Senior',
          skills: ['AWS', 'Docker', 'Kubernetes'],
          description: 'Build and maintain scalable cloud infrastructure.',
          postedDate: new Date(Date.now() - 432000000),
          isNew: false,
          matchScore: 73,
          hasApplied: false
        }
      ];
      setOpportunities(mockOpportunities);
      setIsConnected(false);
    }
    setLoading(false);
  };

  const setupRealTimeOpportunities = () => {
    try {
      const eventSource = new EventSource(`${apiConfig.endpoints.opportunities}/stream`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ Real-time opportunities connection established');
        setIsConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'new_opportunity') {
            setOpportunities(prev => Array.isArray(prev) ? [{ ...data.opportunity, isNew: true }, ...prev] : [{ ...data.opportunity, isNew: true }]);
            
            // Show notification for highly matched opportunities
            if (data.opportunity?.matchScore > 85) {
              showNotification(`🎯 High match found: ${data.opportunity.title} at ${data.opportunity.company}`);
            }
          } else if (data.type === 'opportunity_update') {
            setOpportunities(prev => 
              Array.isArray(prev) ? prev.map(opp => 
                opp.id === data.opportunity.id ? { ...opp, ...data.opportunity } : opp
              ) : []
            );
          }
        } catch (error) {
          console.error('Error parsing opportunity data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.warn('Real-time opportunities connection failed, using mock data');
        setIsConnected(false);
        
        // Simulate new opportunities periodically
        setTimeout(() => {
          simulateNewOpportunity();
        }, 10000);
      };
    } catch (error) {
      console.warn('EventSource not available, using mock data');
      setIsConnected(false);
      
      // Simulate new opportunities
      setTimeout(() => {
        simulateNewOpportunity();
      }, 15000);
    }
  };

  const simulateNewOpportunity = () => {
    const mockNewOpportunities = [
      {
        id: Date.now(),
        title: 'Senior Software Engineer',
        company: 'NextGen Solutions',
        location: 'Remote',
        salary: '$95k - $125k',
        type: 'Full-time',
        experience: 'Senior',
        skills: ['React', 'Node.js', 'TypeScript'],
        description: 'Join our team building next-generation software solutions.',
        postedDate: new Date(),
        isNew: true,
        matchScore: 92,
        hasApplied: false
      },
      {
        id: Date.now() + 1,
        title: 'Marketing Specialist',
        company: 'BrandBoost',
        location: 'Chicago, IL',
        salary: '$55k - $70k',
        type: 'Full-time',
        experience: 'Entry-level',
        skills: ['Digital Marketing', 'Analytics', 'Content Creation'],
        description: 'Drive brand awareness through innovative marketing campaigns.',
        postedDate: new Date(),
        isNew: true,
        matchScore: 76,
        hasApplied: false
      }
    ];

    const newOpportunity = mockNewOpportunities[Math.floor(Math.random() * mockNewOpportunities.length)];
    setOpportunities(prev => Array.isArray(prev) ? [newOpportunity, ...prev] : [newOpportunity]);
    
    if (newOpportunity.matchScore > 85) {
      showNotification(`🎯 New high match: ${newOpportunity.title} at ${newOpportunity.company}`);
    }
  };

  const showNotification = (message) => {
    // This would typically integrate with a notification system
    console.log('📢 Notification:', message);
  };

  // Safe filtering with default empty array
  const filteredOpportunities = Array.isArray(opportunities) ? opportunities.filter(opp => {
    if (!opp) return false;
    if (filters.jobType !== 'all' && opp.type?.toLowerCase() !== filters.jobType) return false;
    if (filters.experience !== 'all' && opp.experience?.toLowerCase() !== filters.experience.toLowerCase()) return false;
    // Add more filters as needed
    return true;
  }) : [];

  const handleApply = async (opportunityId) => {
    try {
      await apiCall(`/api/opportunities/${opportunityId}/apply`, {
        method: 'POST',
        body: JSON.stringify({ userId: user?._id })
      });
      
      // Update opportunity as applied
      setOpportunities(prev =>
        Array.isArray(prev) ? prev.map(opp =>
          opp?.id === opportunityId ? { ...opp, hasApplied: true } : opp
        ) : []
      );
      
      alert('Application submitted successfully!');
    } catch (error) {
      console.log('Application simulated for opportunity:', opportunityId);
      setOpportunities(prev =>
        Array.isArray(prev) ? prev.map(opp =>
          opp?.id === opportunityId ? { ...opp, hasApplied: true } : opp
        ) : []
      );
      alert('Application submitted! (Demo mode)');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Finding opportunities for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-xl">🚀</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Career Opportunities</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-lg text-gray-600">{filteredOpportunities.length} opportunities found</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                    <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-orange-600'}`}>
                      {isConnected ? 'Live Updates' : 'Demo Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg">
                Create Job Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Opportunities</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.jobType}
              onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full-time</option>
              <option value="contract">Contract</option>
              <option value="part-time">Part-time</option>
            </select>
            <select
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Locations</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
            <select
              value={filters.experience}
              onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="entry-level">Entry Level</option>
              <option value="mid-level">Mid Level</option>
              <option value="senior">Senior</option>
            </select>
            <select
              value={filters.salary}
              onChange={(e) => setFilters(prev => ({ ...prev, salary: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Salaries</option>
              <option value="50k-75k">$50k - $75k</option>
              <option value="75k-100k">$75k - $100k</option>
              <option value="100k+">$100k+</option>
            </select>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-6">
          {Array.isArray(filteredOpportunities) && filteredOpportunities.map((opportunity) => {
            // Safety check for opportunity object
            if (!opportunity) return null;
            
            return (
              <div key={opportunity.id || Math.random()} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-bold text-gray-900">{opportunity.title || 'Job Title'}</h3>
                        {opportunity.isNew && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full animate-pulse">
                            New
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-medium text-blue-600">{opportunity.matchScore || 0}% match</span>
                          <div className={`w-2 h-2 rounded-full ${
                            (opportunity.matchScore || 0) >= 90 ? 'bg-green-500' :
                            (opportunity.matchScore || 0) >= 75 ? 'bg-yellow-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <span className="mr-1">🏢</span> {opportunity.company || 'Company'}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">📍</span> {opportunity.location || 'Location'}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">💰</span> {opportunity.salary || 'Salary'}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">⏰</span> {opportunity.type || 'Type'}
                      </span>
                      <span className="flex items-center">
                        <span className="mr-1">📊</span> {opportunity.experience || 'Experience'}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-4">{opportunity.description || 'Job description not available.'}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(opportunity.skills) && opportunity.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                          {skill || 'Skill'}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Posted {opportunity.postedDate ? new Date(opportunity.postedDate).toLocaleDateString() : 'Recently'}
                      </span>
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200">
                          Save
                        </button>
                        <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200">
                          Share
                        </button>
                        {opportunity.hasApplied ? (
                          <span className="bg-green-100 text-green-800 text-sm font-medium px-4 py-2 rounded-lg">
                            ✓ Applied
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApply(opportunity.id)}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {(!Array.isArray(filteredOpportunities) || filteredOpportunities.length === 0) && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Opportunities;
