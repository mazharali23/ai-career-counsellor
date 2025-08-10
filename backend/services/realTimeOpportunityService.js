const axios = require('axios');
const { EventEmitter } = require('events');

class RealTimeOpportunityService extends EventEmitter {
  constructor() {
    super();
    this.opportunitiesCache = new Map();
    this.subscribers = new Set();
    this.updateInterval = null;
    
    // Start real-time updates
    this.startRealTimeUpdates();
  }

  startRealTimeUpdates() {
    // Update opportunities every 30 seconds
    this.updateInterval = setInterval(() => {
      this.fetchAndBroadcastUpdates();
    }, 30000);

    // Initial fetch
    this.fetchAndBroadcastUpdates();
  }

  async fetchAndBroadcastUpdates() {
    try {
      const freshOpportunities = await this.fetchOpportunities();
      const updates = this.detectUpdates(freshOpportunities);
      
      if (updates.length > 0) {
        this.broadcastUpdates(updates);
      }
    } catch (error) {
      console.error('Failed to fetch opportunity updates:', error);
    }
  }

  async fetchOpportunities() {
    // Integration with multiple job/opportunity APIs
    const opportunities = [];
    
    try {
      // Job API integration (replace with real APIs)
      const jobResponse = await this.fetchFromJobAPI();
      opportunities.push(...jobResponse.jobs);
      
      // Scholarship API integration
      const scholarshipResponse = await this.fetchScholarships();
      opportunities.push(...scholarshipResponse.scholarships);
      
      // Course API integration
      const courseResponse = await this.fetchCourses();
      opportunities.push(...courseResponse.courses);
      
      return opportunities;
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      return [];
    }
  }

  async fetchFromJobAPI() {
    // Example integration with job APIs
    try {
      // Using JobsPikr or similar API
      const response = await axios.get('https://api.jobs-api.com/jobs', {
        params: {
          limit: 50,
          sort: 'date_posted',
          order: 'desc'
        },
        headers: {
          'Authorization': `Bearer ${process.env.JOBS_API_KEY}`
        }
      });

      return {
        jobs: response.data.jobs?.map(job => ({
          id: `job_${job.id}`,
          type: 'job',
          title: job.title,
          company: job.company,
          location: job.location,
          salary: job.salary,
          description: job.description,
          requirements: job.requirements,
          deadline: job.application_deadline,
          posted: job.date_posted,
          url: job.application_url,
          tags: job.skills,
          remote: job.remote_ok,
          experience_level: job.experience_level,
          industry: job.industry
        })) || []
      };
    } catch (error) {
      console.error('Job API error:', error);
      
      // Fallback with mock data for development
      return {
        jobs: [
          {
            id: `job_${Date.now()}`,
            type: 'job',
            title: 'Frontend Developer',
            company: 'TechStart Inc',
            location: 'San Francisco, CA',
            salary: '$70k-$90k',
            description: 'Build amazing user interfaces with React and modern JavaScript',
            requirements: ['React', 'JavaScript', '2+ years experience'],
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            posted: new Date(),
            remote: true,
            experience_level: 'Mid-level',
            industry: 'Technology'
          }
        ]
      };
    }
  }

  async fetchScholarships() {
    try {
      // Mock scholarship data (replace with real API)
      return {
        scholarships: [
          {
            id: `scholarship_${Date.now()}`,
            type: 'scholarship',
            title: 'Tech Diversity Scholarship 2024',
            organization: 'Tech Foundation',
            amount: '$10,000',
            description: 'Supporting underrepresented students in technology',
            requirements: ['Computer Science major', 'GPA 3.0+', 'Essay required'],
            deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
            posted: new Date(),
            field: 'Technology',
            level: 'Undergraduate'
          }
        ]
      };
    } catch (error) {
      console.error('Scholarship API error:', error);
      return { scholarships: [] };
    }
  }

  async fetchCourses() {
    try {
      // Integration with course APIs (Coursera, Udemy, edX)
      return {
        courses: [
          {
            id: `course_${Date.now()}`,
            type: 'course',
            title: 'Complete React Developer Bootcamp',
            provider: 'Tech Academy',
            price: '$199',
            description: 'Master React from basics to advanced concepts',
            requirements: ['Basic JavaScript knowledge'],
            duration: '12 weeks',
            rating: 4.8,
            students: 15420,
            certificate: true,
            level: 'Intermediate'
          }
        ]
      };
    } catch (error) {
      console.error('Course API error:', error);
      return { courses: [] };
    }
  }

  detectUpdates(freshOpportunities) {
    const updates = [];
    const currentTimestamp = new Date();
    
    for (const opportunity of freshOpportunities) {
      const cached = this.opportunitiesCache.get(opportunity.id);
      
      if (!cached) {
        // New opportunity
        updates.push({
          type: 'new',
          opportunity,
          timestamp: currentTimestamp
        });
        this.opportunitiesCache.set(opportunity.id, opportunity);
      } else if (JSON.stringify(cached) !== JSON.stringify(opportunity)) {
        // Updated opportunity
        updates.push({
          type: 'updated',
          opportunity,
          previousVersion: cached,
          timestamp: currentTimestamp
        });
        this.opportunitiesCache.set(opportunity.id, opportunity);
      }
    }
    
    return updates;
  }

  broadcastUpdates(updates) {
    const updateMessage = {
      type: 'opportunities_update',
      updates,
      timestamp: new Date(),
      totalCount: updates.length
    };

    // Broadcast to all subscribers
    this.subscribers.forEach(subscriber => {
      try {
        subscriber.emit('opportunity_update', updateMessage);
      } catch (error) {
        console.error('Failed to broadcast to subscriber:', error);
      }
    });
  }

  subscribe(eventEmitter) {
    this.subscribers.add(eventEmitter);
    
    // Send current opportunities to new subscriber
    const currentOpportunities = Array.from(this.opportunitiesCache.values());
    eventEmitter.emit('initial_opportunities', {
      opportunities: currentOpportunities,
      timestamp: new Date()
    });
    
    return () => {
      this.subscribers.delete(eventEmitter);
    };
  }

  async findLiveOpportunities(filters = {}) {
    const { field, location, level, type, limit = 20 } = filters;
    let opportunities = Array.from(this.opportunitiesCache.values());
    
    // Apply filters
    if (field) {
      opportunities = opportunities.filter(opp => 
        opp.industry?.toLowerCase().includes(field.toLowerCase()) ||
        opp.field?.toLowerCase().includes(field.toLowerCase()) ||
        opp.title?.toLowerCase().includes(field.toLowerCase())
      );
    }
    
    if (location) {
      opportunities = opportunities.filter(opp => 
        opp.location?.toLowerCase().includes(location.toLowerCase()) ||
        opp.remote === true
      );
    }
    
    if (level) {
      opportunities = opportunities.filter(opp => 
        opp.experience_level?.toLowerCase().includes(level.toLowerCase()) ||
        opp.level?.toLowerCase().includes(level.toLowerCase())
      );
    }
    
    if (type) {
      opportunities = opportunities.filter(opp => opp.type === type);
    }
    
    // Sort by posting date (newest first)
    opportunities.sort((a, b) => new Date(b.posted) - new Date(a.posted));
    
    return opportunities.slice(0, limit);
  }

  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.subscribers.clear();
    this.opportunitiesCache.clear();
  }
}

module.exports = new RealTimeOpportunityService();
