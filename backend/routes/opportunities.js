const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

// Get opportunities (scholarships, jobs, internships)
router.get('/', async (req, res) => {
  try {
    const { type, location, category, page = 1, limit = 10 } = req.query;

    // Sample opportunities data (in real app, this would come from external APIs)
    let opportunities = [
      {
        id: 1,
        title: "Software Engineering Internship",
        organization: "Tech Innovation Corp",
        type: "internship",
        category: "Technology",
        location: "San Francisco, CA",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: "Summer internship program for computer science students",
        requirements: ["Computer Science major", "Programming skills", "GPA 3.0+"],
        benefits: ["Competitive stipend", "Mentorship", "Full-time offer potential"],
        applicationUrl: "https://example.com/apply/1"
      },
      {
        id: 2,
        title: "STEM Scholarship Program",
        organization: "Education Foundation",
        type: "scholarship",
        category: "Education",
        location: "National",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        description: "Merit-based scholarship for STEM students",
        amount: "$5,000",
        requirements: ["STEM major", "GPA 3.5+", "Financial need"],
        benefits: ["Tuition assistance", "Networking opportunities"],
        applicationUrl: "https://example.com/apply/2"
      },
      {
        id: 3,
        title: "Junior Data Analyst Position",
        organization: "Analytics Solutions Ltd",
        type: "job",
        category: "Technology",
        location: "New York, NY",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        description: "Entry-level data analyst position",
        salary: "$55,000 - $65,000",
        requirements: ["Bachelor's degree", "SQL knowledge", "Excel proficiency"],
        benefits: ["Health insurance", "401k", "Professional development"],
        applicationUrl: "https://example.com/apply/3"
      },
      {
        id: 4,
        title: "Healthcare Leadership Program",
        organization: "Medical Center Network",
        type: "internship",
        category: "Healthcare",
        location: "Chicago, IL",
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        description: "Leadership development program in healthcare administration",
        requirements: ["Healthcare administration interest", "Leadership experience"],
        benefits: ["Healthcare exposure", "Leadership training", "Certification"],
        applicationUrl: "https://example.com/apply/4"
      },
      {
        id: 5,
        title: "Creative Arts Grant",
        organization: "Arts Foundation",
        type: "scholarship",
        category: "Arts",
        location: "National",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        description: "Grant for emerging artists and creative professionals",
        amount: "$3,000",
        requirements: ["Arts portfolio", "Creative project proposal"],
        benefits: ["Funding for projects", "Mentorship", "Exhibition opportunities"],
        applicationUrl: "https://example.com/apply/5"
      },
      {
        id: 6,
        title: "Business Development Associate",
        organization: "Growth Ventures Inc",
        type: "job",
        category: "Business",
        location: "Austin, TX",
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        description: "Entry-level business development role in fast-growing startup",
        salary: "$45,000 - $55,000",
        requirements: ["Business degree", "Communication skills", "Sales interest"],
        benefits: ["Equity options", "Flexible work", "Career growth"],
        applicationUrl: "https://example.com/apply/6"
      }
    ];

    // Apply filters
    if (type) {
      opportunities = opportunities.filter(opp => opp.type === type);
    }
    
    if (category) {
      opportunities = opportunities.filter(opp => opp.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    if (location) {
      opportunities = opportunities.filter(opp => 
        opp.location.toLowerCase().includes(location.toLowerCase()) || 
        opp.location.toLowerCase() === 'national'
      );
    }

    // Sort by deadline (closest first)
    opportunities.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    // Pagination
    const startIndex = (page - 1) * limit;
    const paginatedOpportunities = opportunities.slice(startIndex, startIndex + limit);

    res.json({
      success: true,
      opportunities: paginatedOpportunities,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: opportunities.length,
        pages: Math.ceil(opportunities.length / limit)
      },
      filters: {
        types: ['job', 'internship', 'scholarship'],
        categories: ['Technology', 'Healthcare', 'Business', 'Education', 'Arts'],
        locations: ['National', 'San Francisco, CA', 'New York, NY', 'Chicago, IL', 'Austin, TX']
      }
    });

  } catch (error) {
    console.error('Opportunities error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching opportunities', 
      error: error.message 
    });
  }
});

// Get opportunity by ID
router.get('/:id', async (req, res) => {
  try {
    const opportunityId = parseInt(req.params.id);
    
    // In a real app, this would query a database
    const opportunity = {
      id: opportunityId,
      title: "Software Engineering Internship",
      organization: "Tech Innovation Corp",
      type: "internship",
      category: "Technology",
      location: "San Francisco, CA",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: "Comprehensive summer internship program for computer science students interested in full-stack development and emerging technologies.",
      detailedDescription: "This 12-week program offers hands-on experience with modern web technologies, cloud computing, and agile development practices. Interns will work on real projects alongside experienced engineers and receive mentorship throughout the program.",
      requirements: ["Computer Science major", "Programming skills in JavaScript/Python", "GPA 3.0+", "Strong problem-solving abilities"],
      benefits: ["Competitive stipend ($6,000/month)", "Mentorship program", "Full-time offer potential", "Tech talks and workshops", "Networking events"],
      applicationProcess: [
        "Submit online application with resume and cover letter",
        "Complete coding challenge",
        "Phone screening with HR",
        "Technical interview with engineering team",
        "Final interview with hiring manager"
      ],
      applicationUrl: "https://example.com/apply/1",
      contactEmail: "careers@techinnovation.com",
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      startDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      duration: "12 weeks",
      isRemote: false,
      tags: ["Software Development", "Internship", "Full-Stack", "JavaScript", "Python"]
    };

    res.json({
      success: true,
      opportunity
    });

  } catch (error) {
    console.error('Get opportunity error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching opportunity', 
      error: error.message 
    });
  }
});

// Apply to opportunity (mock application)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const opportunityId = parseInt(req.params.id);
    const { coverLetter, additionalInfo } = req.body;
    
    // In a real app, this would save the application to database
    // and potentially integrate with external APIs
    
    // Update user's progress
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (user) {
      user.progress.applicationsSubmitted.push({
        type: 'internship', // This would be dynamic based on opportunity type
        title: 'Software Engineering Internship',
        organization: 'Tech Innovation Corp',
        appliedAt: new Date(),
        status: 'pending'
      });
      await user.save();
    }

    res.json({
      success: true,
      message: 'Application submitted successfully',
      applicationId: `APP_${Date.now()}`,
      status: 'pending',
      nextSteps: [
        'You will receive a confirmation email within 24 hours',
        'Application review typically takes 5-7 business days',
        'If selected, you will be contacted for next steps'
      ]
    });

  } catch (error) {
    console.error('Apply opportunity error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error submitting application', 
      error: error.message 
    });
  }
});

// Get user's applications
router.get('/applications/me', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const applications = user.progress?.applicationsSubmitted || [];

    res.json({
      success: true,
      applications: applications.map(app => ({
        ...app.toObject(),
        submittedAt: app.appliedAt,
        canWithdraw: app.status === 'pending'
      }))
    });

  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching applications', 
      error: error.message 
    });
  }
});

module.exports = router;
