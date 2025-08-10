const { spawn } = require('child_process');
const path = require('path');

class MLService {
  constructor() {
    this.modelPath = path.join(__dirname, '../ml-models/career_model.joblib');
  }

  async getCareerRecommendations(userProfile) {
    return new Promise((resolve, reject) => {
      const { interests, skills, education } = userProfile;
      
      // Prepare Python script arguments
      const scriptPath = path.join(__dirname, '../ml-models/predict.py');
      const args = [
        scriptPath,
        interests.join(' '),
        skills.join(' '),
        education || 'bachelor'
      ];

      // Execute Python prediction script
      const pythonProcess = spawn('python', args);
      let dataString = '';

      pythonProcess.stdout.on('data', (data) => {
        dataString += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('Python error:', data.toString());
        reject(new Error('ML prediction failed'));
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}`));
          return;
        }

        try {
          const result = JSON.parse(dataString);
          resolve(this.formatRecommendations(result));
        } catch (error) {
          reject(new Error('Failed to parse ML results'));
        }
      });
    });
  }

  formatRecommendations(mlResult) {
    return {
      primaryCareer: {
        title: mlResult.career,
        confidence: Math.round(mlResult.confidence * 100),
        description: this.getCareerDescription(mlResult.career),
        requirements: this.getCareerRequirements(mlResult.career),
        salary: this.getCareerSalary(mlResult.career)
      },
      alternatives: mlResult.alternatives.map(alt => ({
        title: alt.career,
        confidence: Math.round(alt.confidence * 100),
        description: this.getCareerDescription(alt.career)
      }))
    };
  }

  getCareerDescription(career) {
    const descriptions = {
      'Software Developer': 'Design and build software applications using programming languages and frameworks.',
      'Data Scientist': 'Analyze complex data to extract insights and build predictive models.',
      'Doctor': 'Diagnose and treat patients, providing medical care and health advice.',
      'Teacher': 'Educate students and help them develop knowledge and skills.',
      'Graphic Designer': 'Create visual content for digital and print media.',
      'Business Analyst': 'Analyze business processes and recommend improvements.',
      'Engineer': 'Design and build systems, structures, and technology solutions.',
      'Nurse': 'Provide patient care and support in healthcare settings.'
    };
    
    return descriptions[career] || 'Exciting career opportunity in this field.';
  }

  getCareerRequirements(career) {
    const requirements = {
      'Software Developer': ['Programming skills', 'Problem solving', 'Bachelor\'s degree in CS'],
      'Data Scientist': ['Statistics', 'Python/R', 'Machine learning knowledge'],
      'Doctor': ['Medical degree', 'Residency training', 'Strong communication skills'],
      'Teacher': ['Education degree', 'Teaching certification', 'Subject expertise'],
      'Graphic Designer': ['Design software skills', 'Creativity', 'Portfolio'],
      'Business Analyst': ['Business knowledge', 'Analytical skills', 'Communication'],
      'Engineer': ['Engineering degree', 'Problem solving', 'Technical skills'],
      'Nurse': ['Nursing degree', 'Certification', 'Compassion']
    };
    
    return requirements[career] || ['Relevant education', 'Professional skills', 'Experience'];
  }

  getCareerSalary(career) {
    const salaries = {
      'Software Developer': { min: 60000, max: 120000, currency: '$' },
      'Data Scientist': { min: 70000, max: 150000, currency: '$' },
      'Doctor': { min: 150000, max: 300000, currency: '$' },
      'Teacher': { min: 35000, max: 65000, currency: '$' },
      'Graphic Designer': { min: 35000, max: 75000, currency: '$' },
      'Business Analyst': { min: 50000, max: 90000, currency: '$' },
      'Engineer': { min: 55000, max: 110000, currency: '$' },
      'Nurse': { min: 50000, max: 85000, currency: '$' }
    };
    
    return salaries[career] || { min: 40000, max: 80000, currency: '$' };
  }
}

module.exports = new MLService();
