const { EventEmitter } = require('events');
const User = require('../models/User');

class RealTimeProgressService extends EventEmitter {
  constructor() {
    super();
    this.userProgress = new Map();
    this.subscribers = new Map(); // userId -> Set of subscribers
  }

  async trackProgress(userId, progressData) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const currentProgress = this.getUserProgress(userId);
      const updatedProgress = this.calculateProgressUpdate(currentProgress, progressData);

      // Update database
      await User.findByIdAndUpdate(userId, {
        'progress': updatedProgress,
        'lastProgressUpdate': new Date()
      });

      // Update cache
      this.userProgress.set(userId, updatedProgress);

      // Broadcast real-time update
      this.broadcastProgressUpdate(userId, updatedProgress);

      return updatedProgress;
    } catch (error) {
      console.error('Progress tracking error:', error);
      throw error;
    }
  }

  getUserProgress(userId) {
    if (this.userProgress.has(userId)) {
      return this.userProgress.get(userId);
    }

    // Initialize default progress structure
    const defaultProgress = {
      overallScore: 0,
      skillsProgress: {
        technical: { current: 0, target: 100, milestones: [] },
        communication: { current: 0, target: 100, milestones: [] },
        leadership: { current: 0, target: 100, milestones: [] },
        problemSolving: { current: 0, target: 100, milestones: [] }
      },
      careerMilestones: {
        profileCompleted: false,
        firstAssessment: false,
        firstRecommendation: false,
        firstApplication: false,
        skillsCertified: false
      },
      activities: {
        coursesEnrolled: 0,
        coursesCompleted: 0,
        applicationsSubmitted: 0,
        interviewsScheduled: 0,
        offersReceived: 0
      },
      streaks: {
        dailyLogin: 0,
        weeklyGoals: 0,
        monthlyTargets: 0
      },
      achievements: [],
      level: 1,
      experiencePoints: 0,
      badges: [],
      lastActive: new Date()
    };

    this.userProgress.set(userId, defaultProgress);
    return defaultProgress;
  }

  calculateProgressUpdate(currentProgress, newData) {
    const updated = { ...currentProgress };
    const now = new Date();

    // Update activities
    if (newData.activity) {
      switch (newData.activity.type) {
        case 'course_enrolled':
          updated.activities.coursesEnrolled += 1;
          updated.experiencePoints += 10;
          this.checkForAchievements(updated, 'course_enrolled');
          break;

        case 'course_completed':
          updated.activities.coursesCompleted += 1;
          updated.experiencePoints += 50;
          updated.skillsProgress[newData.activity.skillArea].current += 10;
          this.checkForAchievements(updated, 'course_completed');
          break;

        case 'application_submitted':
          updated.activities.applicationsSubmitted += 1;
          updated.experiencePoints += 25;
          updated.careerMilestones.firstApplication = true;
          this.checkForAchievements(updated, 'application_submitted');
          break;

        case 'interview_scheduled':
          updated.activities.interviewsScheduled += 1;
          updated.experiencePoints += 75;
          this.checkForAchievements(updated, 'interview_scheduled');
          break;

        case 'offer_received':
          updated.activities.offersReceived += 1;
          updated.experiencePoints += 200;
          this.checkForAchievements(updated, 'offer_received');
          break;

        case 'profile_updated':
          updated.careerMilestones.profileCompleted = true;
          updated.experiencePoints += 15;
          break;

        case 'assessment_taken':
          updated.careerMilestones.firstAssessment = true;
          updated.experiencePoints += 30;
          break;

        case 'daily_login':
          updated.streaks.dailyLogin += 1;
          updated.experiencePoints += 5;
          break;
      }
    }

    // Update skills if provided
    if (newData.skillUpdate) {
      const { skill, points } = newData.skillUpdate;
      if (updated.skillsProgress[skill]) {
        updated.skillsProgress[skill].current = Math.min(
          updated.skillsProgress[skill].current + points,
          updated.skillsProgress[skill].target
        );
      }
    }

    // Calculate overall score
    updated.overallScore = this.calculateOverallScore(updated);

    // Update level based on experience points
    updated.level = Math.floor(updated.experiencePoints / 100) + 1;

    // Update last active
    updated.lastActive = now;

    return updated;
  }

  calculateOverallScore(progress) {
    const skillsAverage = Object.values(progress.skillsProgress).reduce((sum, skill) => {
      return sum + (skill.current / skill.target) * 100;
    }, 0) / 4;

    const milestonesCompleted = Object.values(progress.careerMilestones).filter(Boolean).length;
    const milestonesScore = (milestonesCompleted / 5) * 100;

    const activitiesScore = Math.min((
      progress.activities.coursesCompleted * 10 +
      progress.activities.applicationsSubmitted * 15 +
      progress.activities.offersReceived * 50
    ), 100);

    return Math.round((skillsAverage + milestonesScore + activitiesScore) / 3);
  }

  checkForAchievements(progress, activityType) {
    const newAchievements = [];

    switch (activityType) {
      case 'course_completed':
        if (progress.activities.coursesCompleted === 1) {
          newAchievements.push({
            id: 'first_course',
            title: 'Learning Starter',
            description: 'Completed your first course',
            icon: '🎓',
            earnedAt: new Date()
          });
        } else if (progress.activities.coursesCompleted === 5) {
          newAchievements.push({
            id: 'course_enthusiast',
            title: 'Course Enthusiast',
            description: 'Completed 5 courses',
            icon: '📚',
            earnedAt: new Date()
          });
        }
        break;

      case 'application_submitted':
        if (progress.activities.applicationsSubmitted === 1) {
          newAchievements.push({
            id: 'first_application',
            title: 'Job Hunter',
            description: 'Submitted your first application',
            icon: '🎯',
            earnedAt: new Date()
          });
        }
        break;

      case 'offer_received':
        newAchievements.push({
          id: 'offer_received',
          title: 'Success!',
          description: 'Received a job offer',
          icon: '🎉',
          earnedAt: new Date()
        });
        break;
    }

    progress.achievements.push(...newAchievements);
    return newAchievements;
  }

  subscribeToProgress(userId, subscriber) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    
    this.subscribers.get(userId).add(subscriber);

    // Send current progress immediately
    const currentProgress = this.getUserProgress(userId);
    subscriber.emit('progress_update', {
      type: 'initial_progress',
      userId,
      progress: currentProgress,
      timestamp: new Date()
    });

    // Return unsubscribe function
    return () => {
      const userSubscribers = this.subscribers.get(userId);
      if (userSubscribers) {
        userSubscribers.delete(subscriber);
        if (userSubscribers.size === 0) {
          this.subscribers.delete(userId);
        }
      }
    };
  }

  broadcastProgressUpdate(userId, progress) {
    const userSubscribers = this.subscribers.get(userId);
    if (!userSubscribers) return;

    const updateMessage = {
      type: 'progress_update',
      userId,
      progress,
      timestamp: new Date()
    };

    userSubscribers.forEach(subscriber => {
      try {
        subscriber.emit('progress_update', updateMessage);
      } catch (error) {
        console.error('Failed to broadcast progress update:', error);
      }
    });
  }

  async getLeaderboard(limit = 10) {
    try {
      const users = await User.find()
        .select('name progress.overallScore progress.level progress.experiencePoints')
        .sort({ 'progress.overallScore': -1 })
        .limit(limit);

      return users.map((user, index) => ({
        rank: index + 1,
        name: user.name,
        score: user.progress?.overallScore || 0,
        level: user.progress?.level || 1,
        experiencePoints: user.progress?.experiencePoints || 0
      }));
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      return [];
    }
  }
}

module.exports = new RealTimeProgressService();
