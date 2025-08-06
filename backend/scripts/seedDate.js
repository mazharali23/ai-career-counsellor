const mongoose = require('mongoose');
const Career = require('../models/Career');
require('dotenv').config();

const sampleCareers = [
  {
    title: "Software Developer",
    category: "Technology",
    description: "Design, develop, and maintain software applications and systems using various programming languages and frameworks.",
    requiredSkills: ["Programming", "Problem Solving", "Logical Thinking", "JavaScript", "Python", "Git"],
    requiredEducation: { 
      level: "Bachelor", 
      subjects: ["Computer Science", "Software Engineering", "Mathematics"],
      duration: "4 years"
    },
    averageSalary: { min: 60000, max: 120000, currency: "$" },
    jobOutlook: { 
      growth: "22% (much faster than average)", 
      demand: "High", 
      stability: "Very stable" 
    },
    pathways: [{
      education: "Bachelor's in Computer Science",
      duration: "4 years",
      cost: 40000,
      providers: ["Universities", "Coding Bootcamps"]
    }],
    relatedCareers: ["Web Developer", "Mobile Developer", "DevOps Engineer"],
    workEnvironment: {
      setting: "Office/Remote",
      schedule: "Full-time",
      travelRequired: false,
      teamWork: true
    },
    tags: ["coding", "technology", "programming", "software", "development"]
  },
  {
    title: "Data Scientist",
    category: "Technology",
    description: "Analyze complex data to help organizations make informed business decisions using statistical analysis and machine learning.",
    requiredSkills: ["Statistics", "Python", "R", "Machine Learning", "Data Visualization", "SQL"],
    requiredEducation: { 
      level: "Bachelor", 
      subjects: ["Data Science", "Statistics", "Mathematics", "Computer Science"],
      duration: "4 years"
    },
    averageSalary: { min: 70000, max: 150000, currency: "$" },
    jobOutlook: { 
      growth: "35% (much faster than average)", 
      demand: "Very High", 
      stability: "Very stable" 
    },
    workEnvironment: {
      setting: "Office/Remote",
      schedule: "Full-time",
      travelRequired: false,
      teamWork: true
    },
    tags: ["data", "analytics", "machine learning", "statistics", "python"]
  },
  {
    title: "Registered Nurse",
    category: "Healthcare",
    description: "Provide patient care, educate patients about health conditions, and provide advice and emotional support.",
    requiredSkills: ["Patient Care", "Communication", "Critical Thinking", "Attention to Detail", "Empathy"],
    requiredEducation: { 
      level: "Bachelor", 
      subjects: ["Nursing", "Biology", "Chemistry", "Anatomy"],
      duration: "4 years"
    },
    averageSalary: { min: 55000, max: 85000, currency: "$" },
    jobOutlook: { 
      growth: "9% (faster than average)", 
      demand: "High", 
      stability: "Very stable" 
    },
    workEnvironment: {
      setting: "Hospital/Clinic",
      schedule: "Shifts (including nights/weekends)",
      travelRequired: false,
      teamWork: true
    },
    tags: ["healthcare", "nursing", "patient care", "medical", "helping others"]
  },
  {
    title: "Elementary School Teacher",
    category: "Education",
    description: "Teach academic and social skills to elementary school students in a classroom setting.",
    requiredSkills: ["Teaching", "Communication", "Patience", "Creativity", "Classroom Management"],
    requiredEducation: { 
      level: "Bachelor", 
      subjects: ["Education", "Child Development", "Subject Specialization"],
      duration: "4 years"
    },
    averageSalary: { min: 40000, max: 65000, currency: "$" },
    jobOutlook: { 
      growth: "4% (as fast as average)", 
      demand: "Moderate", 
      stability: "Stable" 
    },
    workEnvironment: {
      setting: "School",
      schedule: "School hours with evenings for planning",
      travelRequired: false,
      teamWork: true
    },
    tags: ["teaching", "education", "children", "learning", "classroom"]
  },
  {
    title: "Graphic Designer",
    category: "Arts",
    description: "Create visual concepts to communicate ideas that inspire, inform, and captivate consumers.",
    requiredSkills: ["Creativity", "Adobe Creative Suite", "Typography", "Color Theory", "Communication"],
    requiredEducation: { 
      level: "Bachelor", 
      subjects: ["Graphic Design", "Visual Arts", "Digital Media"],
      duration: "4 years"
    },
    averageSalary: { min: 35000, max: 65000, currency: "$" },
    jobOutlook: { 
      growth: "3% (slower than average)", 
      demand: "Moderate", 
      stability: "Stable" 
    },
    workEnvironment: {
      setting: "Office/Studio/Remote",
      schedule: "Full-time with possible overtime for deadlines",
      travelRequired: false,
      teamWork: true
    },
    tags: ["design", "creative", "visual", "art", "branding"]
  },
  {
    title: "Marketing Manager",
    category: "Business",
    description: "Plan, implement, and monitor marketing strategies to promote products or services.",
    requiredSkills: ["Marketing Strategy", "Communication", "Analytics", "Leadership", "Creativity"],
    requiredEducation: { 
      level: "Bachelor", 
      subjects: ["Marketing", "Business Administration", "Communications"],
      duration: "4 years"
    },
    averageSalary: { min: 50000, max: 90000, currency: "$" },
    jobOutlook: { 
      growth: "6% (faster than average)", 
      demand: "High", 
      stability: "Stable" 
    },
    workEnvironment: {
      setting: "Office",
      schedule: "Full-time",
      travelRequired: true,
      teamWork: true
    },
    tags: ["marketing", "business", "strategy", "communication", "leadership"]
  }
];

const seedCareers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing careers
    await Career.deleteMany({});
    console.log('Cleared existing careers');
    
    // Insert sample careers
    const insertedCareers = await Career.insertMany(sampleCareers);
    console.log(`✅ Successfully seeded ${insertedCareers.length} careers`);
    
    // Display seeded careers
    insertedCareers.forEach(career => {
      console.log(`- ${career.title} (${career.category})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeder
if (require.main === module) {
  seedCareers();
}

module.exports = { seedCareers, sampleCareers };
