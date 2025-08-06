const express = require('express');
const User = require('../models/User');
const Career = require('../models/Career');
const auth = require('../middleware/auth');
const router = express.Router();

// Get dashboard data
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get recommendations
    const interests = user.profile?.interests || [];
    const skills = user.profile?.skills || [];
    
    let recommendations = [];
    if (interests.length > 0 || skills.length > 0) {
      recommendations = await getSimpleRecommendations(interests, skills);
    }

    // Create recent activities from user data
    const recentActivities = [];
    
    // Add course activities
    if (user.progress?.coursesEnrolled) {
      user.progress.coursesEnrolled.forEach(course => {
        recentActivities.push({
          type: 'course',
          title: `${course.completed ? 'Completed' : 'Enrolled in'} ${course.courseName}`,
          date: course.completed ? course.completedAt : course.enrolledAt,
          status: course.completed ? 'completed' : 'in-progress'
        });
      });
    }

    // Add application activities
    if (user.progress?.applicationsSubmitted) {
      user.progress.applicationsSubmitted.forEach(app => {
        recentActivities.push({
          type: 'application',
          title: `Applied for ${app.title}`,
          date: app.appliedAt,
          status: app.status
        });
      });
    }

    // Add goal achievements
    if (user.progress?.goalsAchieved) {
      user.progress.goalsAchieved.forEach(goal => {
        recentActivities.push({
          type: 'achievement',
          title: `Achieved: ${goal.goal}`,
          date: goal.achievedAt,
          status: 'completed'
        });
      });
    }

    // Sort by date
    recentActivities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Sample opportunities (in real app, this would come from external APIs)
    const opportunities = [
      {
        title: "Software Engineering Internship",
        organization: "Tech Innovation Corp",
        type: "internship",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        description: "Summer internship program for computer science students"
      },
      {
        title: "STEM Scholarship Program",
        organization: "Education Foundation",
        type: "scholarship",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        description: "Merit-based scholarship for STEM students"
      },
      {
        title: "Junior Data Analyst Position",
        organization: "Analytics Solutions Ltd",
        type: "job",
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        description: "Entry-level data analyst position"
      }
    ];

    // Progress chart data (sample)
    const progressChart = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Learning Progress',
        data: [10, 25, 40, 55, 70, 85],
        borderColor: '#3182ce',
        backgroundColor: 'rgba(49, 130, 206, 0.1)',
        tension: 0.4
      }]
    };

    res.json({
      success: true,
      progress: user.progress || {
        coursesEnrolled: [],
        applicationsSubmitted: [],
        goalsAchieved: []
      },
      recommendations: recommendations.slice(0, 5),
      recentActivities: recentActivities.slice(0, 10),
      opportunities: opportunities,
      progressChart,
      overallScore: calculateOverallScore(user),
      stats: {
        coursesEnrolled: user.progress?.coursesEnrolled?.length || 0,
        coursesCompleted: user.progress?.coursesEnrolled?.filter(c => c.completed).length || 0,
        applicationsSubmitted: user.progress?.applicationsSubmitted?.length || 0,
        goalsAchieved: user.progress?.goalsAchieved?.length || 0
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
});

// Update user progress
router.post('/progress', auth, async (req, res) => {
  try {
    const { type, data } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    switch (type) {
      case 'course_enrollment':
        user.progress.coursesEnrolled.push({
          courseId: data.courseId,
          courseName: data.courseName,
          provider: data.provider,
          enrolledAt: new Date()
        });
        break;

      case 'course_completion':
        const course = user.progress.coursesEnrolled.id(data.courseId);
        if (course) {
          course.completed = true;
          course.completedAt = new Date();
        }
        break;

      case 'application':
        user.progress.applicationsSubmitted.push({
          type: data.type,
          title: data.title,
          organization: data.organization,
          appliedAt: new Date(),
          status: 'pending'
        });
        break;

      case 'goal_achievement':
        user.progress.goalsAchieved.push({
          goal: data.goal,
          achievedAt: new Date()
        });
        break;

      default:
        return res.status(400).json({ 
          success: false,
          message: 'Invalid progress type' 
        });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      progress: user.progress
    });

  } catch (error) {
    console.error('Progress update error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating progress', 
      error: error.message 
    });
  }
});

// Helper function for simple recommendations
async function getSimpleRecommendations(interests, skills) {
  try {
    const searchTerms = [...interests, ...skills];
    
    const careers = await Career.find({
      $or: [
        { requiredSkills: { $in: searchTerms } },
        { tags: { $in: searchTerms } }
      ]
    }).limit(8);

    return careers.map(career => ({
      ...career.toObject(),
      matchScore: Math.random() * 3 + 7 // Simple random score between 7-10
    }));

  } catch (error) {
    return [];
  }
}

// Calculate overall profile score
function calculateOverallScore(user) {
  let score = 0;
  
  // Profile completeness
  if (user.profile?.interests?.length > 0) score += 20;
  if (user.profile?.skills?.length > 0) score += 20;
  if (user.profile?.education?.level) score += 15;
  if (user.profile?.location?.city) score += 10;
  
  // Activity score
  if (user.progress?.coursesEnrolled?.length > 0) score += 15;
  if (user.progress?.applicationsSubmitted?.length > 0) score += 10;
  if (user.progress?.goalsAchieved?.length > 0) score += 10;
  
  return Math.min(score, 100);
}

module.exports = router;
