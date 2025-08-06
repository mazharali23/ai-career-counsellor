const express = require('express');
const Career = require('../models/Career');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all careers with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'title',
      order = 'asc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const careers = await Career.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Career.countDocuments(query);

    res.json({
      success: true,
      careers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get careers error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching careers', 
      error: error.message 
    });
  }
});

// Get career by ID
router.get('/:id', async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    
    if (!career) {
      return res.status(404).json({ 
        success: false,
        message: 'Career not found' 
      });
    }

    res.json({
      success: true,
      career
    });

  } catch (error) {
    console.error('Get career error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching career', 
      error: error.message 
    });
  }
});

// Get career recommendations for user
router.get('/recommendations/me', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Simple recommendation logic based on interests
    const interests = user.profile?.interests || [];
    const skills = user.profile?.skills || [];

    const recommendations = await getCareerRecommendations(interests, skills);

    res.json({
      success: true,
      recommendations,
      based_on: {
        interests,
        skills
      }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting recommendations', 
      error: error.message 
    });
  }
});

// Get career categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Career.distinct('category');
    
    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching categories', 
      error: error.message 
    });
  }
});

// Simple recommendation function
async function getCareerRecommendations(interests, skills) {
  try {
    // Create search terms from interests and skills
    const searchTerms = [...interests, ...skills].join(' ');
    
    let query = { isActive: true };
    
    if (searchTerms) {
      query.$or = [
        { requiredSkills: { $in: [...interests, ...skills] } },
        { tags: { $in: [...interests, ...skills] } },
        { $text: { $search: searchTerms } }
      ];
    }

    const careers = await Career.find(query).limit(10);
    
    // Add match scores (simplified)
    const recommendations = careers.map(career => ({
      ...career.toObject(),
      matchScore: calculateMatchScore(career, interests, skills)
    }));

    return recommendations.sort((a, b) => b.matchScore - a.matchScore);

  } catch (error) {
    console.error('Recommendation function error:', error);
    return [];
  }
}

// Simple match score calculation
function calculateMatchScore(career, interests, skills) {
  let score = 0;
  
  // Check interest matches
  interests.forEach(interest => {
    if (career.requiredSkills.some(skill => 
      skill.toLowerCase().includes(interest.toLowerCase())
    )) {
      score += 2;
    }
    if (career.tags && career.tags.some(tag => 
      tag.toLowerCase().includes(interest.toLowerCase())
    )) {
      score += 1;
    }
  });
  
  // Check skill matches
  skills.forEach(skill => {
    if (career.requiredSkills.some(reqSkill => 
      reqSkill.toLowerCase().includes(skill.toLowerCase())
    )) {
      score += 3;
    }
  });
  
  return Math.min(score, 10); // Cap at 10
}

module.exports = router;
