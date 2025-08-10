import pandas as pd
import numpy as np

# Sample career dataset - expand this with real data
career_data = {
    'interests': ['technology', 'math', 'science', 'art', 'helping others', 'business'],
    'skills': ['problem solving', 'communication', 'creativity', 'leadership', 'analytical'],
    'education': ['high school', 'bachelor', 'master', 'phd'],
    'work_environment': ['office', 'remote', 'outdoor', 'hospital', 'lab'],
    'career_paths': [
        'Software Developer', 'Data Scientist', 'Doctor', 'Teacher', 
        'Graphic Designer', 'Business Analyst', 'Engineer', 'Nurse'
    ]
}

def create_training_data():
    # Generate synthetic training data (replace with real data later)
    data = []
    for i in range(1000):
        interests = np.random.choice(career_data['interests'], 3)
        skills = np.random.choice(career_data['skills'], 3)
        education = np.random.choice(career_data['education'])
        
        # Simple rule-based career matching for training
        if 'technology' in interests and 'problem solving' in skills:
            career = 'Software Developer'
        elif 'math' in interests and 'analytical' in skills:
            career = 'Data Scientist'
        elif 'helping others' in interests:
            career = 'Nurse' if education in ['bachelor', 'master'] else 'Teacher'
        else:
            career = np.random.choice(career_data['career_paths'])
        
        data.append({
            'interests': ','.join(interests),
            'skills': ','.join(skills),
            'education': education,
            'career': career
        })
    
    return pd.DataFrame(data)

if __name__ == "__main__":
    df = create_training_data()
    df.to_csv('career_training_data.csv', index=False)
    print("Training data created successfully!")
