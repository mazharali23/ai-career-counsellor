import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { apiConfig, apiCall } from '../../config/api.js';

const Dashboard = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState({
    level: 1,
    experiencePoints: 0,
    overallScore: 0,
    skillsProgress: {},
    activities: {},
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [stats, setStats] = useState({
    weeklyGoals: { completed: 0, total: 7 },
    timeSpent: '0h 0m',
    streak: 0,
    nextMilestone: 'Level 1'
  });
  const eventSourceRef = useRef(null);

  useEffect(() => {
    if (user) {
      initializeDashboard();
      initializeProgressTracking();
      fetchLeaderboard();
      
      // Simulate real-time updates every 30 seconds
      const interval = setInterval(() => {
        updateDashboardData();
      }, 30000);

      return () => {
        clearInterval(interval);
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
        }
      };
    } else {
      // Initialize with default data even without user
      initializeDashboard();
    }
  }, [user]);

  const initializeDashboard = async () => {
    try {
      // Initialize with comprehensive mock data
      const mockProgress = {
        level: Math.floor(Math.random() * 5) + 1,
        experiencePoints: Math.floor(Math.random() * 1000) + 200,
        overallScore: Math.floor(Math.random() * 40) + 60,
        skillsProgress: {
          technical: { current: Math.floor(Math.random() * 80) + 20, target: 100 },
          communication: { current: Math.floor(Math.random() * 70) + 30, target: 100 },
          leadership: { current: Math.floor(Math.random() * 60) + 40, target: 100 },
          problemSolving: { current: Math.floor(Math.random() * 90) + 10, target: 100 }
        },
        activities: {
          coursesEnrolled: Math.floor(Math.random() * 10) + 2,
          coursesCompleted: Math.floor(Math.random() * 5) + 1,
          applicationsSubmitted: Math.floor(Math.random() * 15) + 5,
          interviewsScheduled: Math.floor(Math.random() * 8) + 2,
          offersReceived: Math.floor(Math.random() * 3) + 1
        },
        achievements: [
          {
            id: 1,
            title: "First Chat Completed",
            description: "Started your AI career counseling journey",
            icon: "🎉",
            earnedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 2,
            title: "Profile Expert",
            description: "Completed your career profile",
            icon: "👤",
            earnedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: 3,
            title: "Knowledge Seeker",
            description: "Asked 10+ career-related questions",
            icon: "🧠",
            earnedAt: new Date(Date.now() - 259200000).toISOString()
          }
        ]
      };

      setProgress(mockProgress);
      
      // Set recent activity
      setRecentActivity([
        { type: 'chat', description: 'Discussed career path in Software Engineering', time: '2 hours ago', icon: '💬' },
        { type: 'opportunity', description: 'Applied to Frontend Developer position', time: '1 day ago', icon: '🚀' },
        { type: 'skill', description: 'Improved Technical Skills by 15 points', time: '2 days ago', icon: '⚡' },
        { type: 'achievement', description: 'Unlocked "Knowledge Seeker" badge', time: '3 days ago', icon: '🏆' }
      ]);

      setStats({
        weeklyGoals: { completed: 4, total: 7 },
        timeSpent: '12h 34m',
        streak: 5,
        nextMilestone: 'Level ' + (mockProgress.level + 1)
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      setLoading(false);
    }
  };

  const initializeProgressTracking = () => {
    try {
      // Try to establish real-time connection
      const eventSource = new EventSource(`${apiConfig.endpoints.progress}/stream/${user?._id || 'demo'}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        console.log('✅ Real-time connection established');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'initial_progress':
            case 'progress_update':
              setProgress(prev => ({ ...prev, ...data.progress }));
              if (data.progress.achievements && Array.isArray(data.progress.achievements)) {
                checkForNewAchievements(data.progress.achievements);
              }
              break;
            case 'heartbeat':
              // Connection health check
              break;
          }
        } catch (error) {
          console.error('Error parsing progress data:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.warn('Real-time connection failed, using mock data');
        setIsConnected(false);
        
        // Simulate connection with mock updates
        setTimeout(() => {
          setIsConnected(true);
          simulateRealtimeUpdates();
        }, 2000);
      };
    } catch (error) {
      console.warn('EventSource not available, using mock updates');
      setIsConnected(true);
      simulateRealtimeUpdates();
    }
  };

  const simulateRealtimeUpdates = () => {
    setInterval(() => {
      setProgress(prev => {
        if (!prev || !prev.skillsProgress) return prev;
        
        const newProgress = { ...prev };
        
        // Randomly update experience points
        if (Math.random() > 0.7) {
          newProgress.experiencePoints += Math.floor(Math.random() * 10) + 1;
        }
        
        // Randomly update skill progress
        const skills = Object.keys(newProgress.skillsProgress || {});
        if (skills.length > 0) {
          const randomSkill = skills[Math.floor(Math.random() * skills.length)];
          if (Math.random() > 0.8 && newProgress.skillsProgress[randomSkill]?.current < newProgress.skillsProgress[randomSkill]?.target) {
            newProgress.skillsProgress[randomSkill].current += 1;
          }
        }
        
        return newProgress;
      });
    }, 45000); // Update every 45 seconds
  };

  const fetchLeaderboard = async () => {
    try {
      // Try to fetch real leaderboard
      const data = await apiCall('/api/progress/leaderboard?limit=5');
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.warn('Using mock leaderboard data');
      // Mock leaderboard data
      const mockLeaderboard = [
        { name: user?.name || 'You', rank: Math.floor(Math.random() * 5) + 1, level: Math.floor(Math.random() * 5) + 1, score: Math.floor(Math.random() * 500) + 300 },
        { name: 'Alex Chen', rank: 1, level: 6, score: 850 },
        { name: 'Sarah Johnson', rank: 2, level: 5, score: 720 },
        { name: 'Mike Rodriguez', rank: 3, level: 5, score: 690 },
        { name: 'Emma Wilson', rank: 4, level: 4, score: 580 },
        { name: 'David Kim', rank: 5, level: 4, score: 520 }
      ].sort((a, b) => b.score - a.score).map((entry, index) => ({ ...entry, rank: index + 1 }));

      setLeaderboard(mockLeaderboard.slice(0, 5));
    }
  };

  const updateDashboardData = () => {
    // Simulate new activity
    const activities = [
      { type: 'chat', description: 'Discussed career opportunities in Data Science', time: 'Just now', icon: '💬' },
      { type: 'skill', description: 'Communication skills improved', time: 'Just now', icon: '📈' },
      { type: 'opportunity', description: 'New job match found', time: 'Just now', icon: '🎯' }
    ];
    
    const newActivity = activities[Math.floor(Math.random() * activities.length)];
    setRecentActivity(prev => Array.isArray(prev) ? [newActivity, ...prev.slice(0, 4)] : [newActivity]);
  };

  const checkForNewAchievements = (achievements) => {
    if (!Array.isArray(achievements)) return;
    
    achievements.forEach(achievement => {
      if (achievement && achievement.earnedAt && new Date() - new Date(achievement.earnedAt) < 5000) {
        showAchievementNotification(achievement);
      }
    });
  };

  const showAchievementNotification = (achievement) => {
    if (!achievement) return;
    
    const notification = {
      id: Date.now() + Math.random(),
      type: 'achievement',
      achievement
    };
    
    setNotifications(prev => Array.isArray(prev) ? [...prev, notification] : [notification]);
    
    setTimeout(() => {
      setNotifications(prev => Array.isArray(prev) ? prev.filter(n => n.id !== notification.id) : []);
    }, 5000);
  };

  const trackActivity = async (activityType, extraData = {}) => {
    try {
      await apiCall('/api/progress/track', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?._id || 'demo-user',
          progressData: {
            activity: {
              type: activityType,
              ...extraData
            }
          }
        })
      });
    } catch (error) {
      console.log('Activity tracking simulated:', activityType);
    }
  };

  const CircularProgress = ({ percentage, size = 120, strokeWidth = 8, color = '#3b82f6' }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
          <span className="text-xs text-gray-500 mt-1">Complete</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">Loading your dynamic dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Achievement Notifications */}
      {Array.isArray(notifications) && notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-4 rounded-lg shadow-lg animate-bounce max-w-sm"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{notification.achievement?.icon || '🏆'}</span>
                <div>
                  <div className="font-bold">Achievement Unlocked!</div>
                  <div className="text-sm">{notification.achievement?.title || 'New Achievement'}</div>
                  <div className="text-xs opacity-90">{notification.achievement?.description || 'Keep up the great work!'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header with Real-Time Status */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg relative">
                {progress?.level && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full">
                    L{progress.level}
                  </div>
                )}
                {user?.avatar || '👤'}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Career Seeker'}! 👋</h1>
                <div className="flex items-center space-x-4 mt-2">
                  <p className="text-lg text-gray-600">Level {progress?.level || 1} • {progress?.experiencePoints || 0} XP</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
                    <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-orange-600'}`}>
                      {isConnected ? 'Live Tracking' : 'Demo Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 flex items-center space-x-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-blue-600">{stats?.streak || 5}</div>
                  <div className="text-xs text-gray-500">Day Streak</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-green-600">{stats?.weeklyGoals?.completed || 4}/{stats?.weeklyGoals?.total || 7}</div>
                  <div className="text-xs text-gray-500">Weekly Goals</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-purple-600">{stats?.timeSpent || '12h 34m'}</div>
                  <div className="text-xs text-gray-500">Time Spent</div>
                </div>
              </div>
              <Link
                to="/chat"
                onClick={() => trackActivity('daily_login')}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
              >
                <span>💬</span>
                Continue Learning
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Overall Progress Circle */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-8 shadow-lg text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Overall Progress</h3>
            <CircularProgress 
              percentage={progress?.overallScore || 75}
              size={140}
              color={progress?.overallScore >= 80 ? '#10b981' : progress?.overallScore >= 60 ? '#f59e0b' : '#3b82f6'}
            />
            <div className="mt-4 space-y-2">
              <div className="text-sm text-gray-600">{progress?.experiencePoints || 0} Experience Points</div>
              <div className="text-sm text-gray-600">{Array.isArray(progress?.achievements) ? progress.achievements.length : 0} Achievements</div>
              <div className="text-xs text-blue-600 font-medium">Next: {stats?.nextMilestone || 'Level 2'}</div>
            </div>
          </div>
          
          {/* Skills Progress */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Skills Development</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {progress?.skillsProgress && typeof progress.skillsProgress === 'object' && Object.entries(progress.skillsProgress).map(([skillName, skillData], index) => {
                const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
                const icons = { technical: '⚡', communication: '💬', leadership: '👑', problemSolving: '🧠' };
                const percentage = skillData && skillData.current && skillData.target ? Math.round((skillData.current / skillData.target) * 100) : 0;
                
                return (
                  <div key={skillName} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-2xl">{icons[skillName] || '📊'}</span>
                      <h4 className="font-semibold text-gray-900 text-lg capitalize">
                        {skillName.replace(/([A-Z])/g, ' $1')}
                      </h4>
                    </div>
                    <CircularProgress 
                      percentage={percentage}
                      size={100}
                      strokeWidth={6}
                      color={colors[index % colors.length]}
                    />
                    <div className="text-sm text-gray-600 mt-2">{skillData?.current || 0}/{skillData?.target || 100} points</div>
                    <div className="text-xs text-gray-500">
                      {percentage >= 80 ? '🔥 Expert Level' : percentage >= 60 ? '📈 Progressing' : '🌱 Learning'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities & Achievements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Activity Stats */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Activity</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {progress?.activities && typeof progress.activities === 'object' && Object.entries(progress.activities).map(([key, value], index) => {
                  const icons = {
                    coursesEnrolled: '📚',
                    coursesCompleted: '✅',
                    applicationsSubmitted: '📝',
                    interviewsScheduled: '🗓️',
                    offersReceived: '🎉'
                  };
                  const colors = [
                    'from-blue-500 to-blue-600',
                    'from-green-500 to-green-600',
                    'from-purple-500 to-purple-600',
                    'from-orange-500 to-orange-600',
                    'from-pink-500 to-pink-600'
                  ];
                  
                  return (
                    <div
                      key={key}
                      className="text-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer transform hover:scale-105"
                      onClick={() => trackActivity(key.replace(/s$/, '') + '_clicked')}
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colors[index % colors.length]} flex items-center justify-center mb-3 mx-auto`}>
                        <span className="text-xl">{icons[key] || '📊'}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{value || 0}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Recent Activity Timeline */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {Array.isArray(recentActivity) && recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{activity?.icon || '📊'}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity?.description || 'Activity'}</p>
                      <p className="text-sm text-gray-500">{activity?.time || 'Unknown time'}</p>
                    </div>
                    <div className="text-blue-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Achievements</h3>
              {Array.isArray(progress?.achievements) && progress.achievements.length > 0 ? (
                <div className="space-y-4">
                  {progress.achievements.slice(-3).reverse().map((achievement, index) => (
                    <div key={achievement?.id || index} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                      <span className="text-3xl">{achievement?.icon || '🏆'}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{achievement?.title || 'Achievement'}</h4>
                        <p className="text-sm text-gray-600">{achievement?.description || 'Great work!'}</p>
                        <p className="text-xs text-gray-500 mt-1">{achievement?.earnedAt ? new Date(achievement.earnedAt).toLocaleDateString() : 'Recently'}</p>
                      </div>
                      <div className="text-2xl animate-pulse">🏆</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-4">🏆</div>
                  <p>No achievements yet. Keep learning to unlock your first achievement!</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">🏆</span>
                Global Leaderboard
              </h3>
              <div className="space-y-3">
                {Array.isArray(leaderboard) && leaderboard.length > 0 ? leaderboard.map((entry, index) => {
                  const isCurrentUser = entry?.name === (user?.name || 'You');
                  return (
                    <div
                      key={entry?.name || index}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${isCurrentUser ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'} transition-all duration-200 hover:shadow-md`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index < 3 ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-700'}`}>
                        {entry?.rank || (index + 1)}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${isCurrentUser ? 'text-blue-900' : 'text-gray-900'}`}>
                          {entry?.name || 'User'} {isCurrentUser && '(You)'}
                        </p>
                        <p className="text-xs text-gray-500">Level {entry?.level || 1} • {entry?.score || 0} pts</p>
                      </div>
                      {index < 3 && <span className="text-lg">{'🥇🥈🥉'[index]}</span>}
                    </div>
                  );
                }) : (
                  <div className="text-center py-4 text-gray-500">
                    <div className="text-2xl mb-2">⏳</div>
                    <p className="text-sm">Loading leaderboard...</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="space-y-3">
                {[
                  { icon: '💬', label: 'Chat with AI', href: '/chat', activity: 'chat_opened' },
                  { icon: '🔍', label: 'Find Opportunities', href: '/opportunities', activity: 'opportunities_viewed' },
                  { icon: '👤', label: 'Update Profile', href: '/profile', activity: 'profile_viewed' }
                ].map((action, index) => (
                  <Link
                    key={index}
                    to={action.href}
                    onClick={() => trackActivity(action.activity)}
                    className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group w-full"
                  >
                    <span className="text-xl">{action.icon}</span>
                    <span className="font-medium group-hover:translate-x-1 transition-transform duration-200">{action.label}</span>
                    <svg className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Goals</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Complete 3 chat sessions</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Apply to 5 positions</span>
                  <span className="text-green-600 font-medium">✓</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Improve 2 skills</span>
                  <span className="text-orange-600 font-medium">3/2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Network with professionals</span>
                  <span className="text-gray-400">○</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{stats?.weeklyGoals?.completed || 4}/{stats?.weeklyGoals?.total || 7}</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${((stats?.weeklyGoals?.completed || 4) / (stats?.weeklyGoals?.total || 7)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
