import sys
import json
import joblib
import numpy as np

def predict_career(interests, skills, education, model_path='career_model.joblib'):
    try:
        # Load trained model
        loaded = joblib.load(model_path)
        model = loaded['model']
        label_encoder = loaded['label_encoder']
        
        # Prepare input
        combined_features = f"{interests} {skills} {education}"
        
        # Make prediction
        prediction = model.predict([combined_features])
        probabilities = model.predict_proba([combined_features])[0]
        
        # Get primary career
        career = label_encoder.inverse_transform(prediction)[0]
        confidence = max(probabilities)
        
        # Get alternatives
        careers = label_encoder.classes_
        top_indices = np.argsort(probabilities)[-3:][::-1]
        alternatives = []
        
        for idx in top_indices:
            alternatives.append({
                'career': careers[idx],
                'confidence': float(probabilities[idx])
            })
        
        result = {
            'career': career,
            'confidence': float(confidence),
            'alternatives': alternatives
        }
        
        return result
        
    except Exception as e:
        return {'error': str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(json.dumps({'error': 'Invalid arguments'}))
        sys.exit(1)
    
    interests = sys.argv[1]
    skills = sys.argv[2] 
    education = sys.argv[3]
    
    result = predict_career(interests, skills, education)
    print(json.dumps(result))
