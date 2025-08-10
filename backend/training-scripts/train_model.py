import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
import joblib
import os

class CareerRecommendationModel:
    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.vectorizer = TfidfVectorizer(max_features=1000)
        
    def prepare_data(self, df):
        # Combine interests and skills into text features
        df['combined_features'] = df['interests'] + ' ' + df['skills'] + ' ' + df['education']
        
        X = df['combined_features']
        y = self.label_encoder.fit_transform(df['career'])
        
        return X, y
    
    def train(self, df):
        X, y = self.prepare_data(df)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Create pipeline
        self.model = Pipeline([
            ('tfidf', self.vectorizer),
            ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
        ])
        
        # Train model
        self.model.fit(X_train, y_train)
        
        # Evaluate
        accuracy = self.model.score(X_test, y_test)
        print(f"Model accuracy: {accuracy:.2f}")
        
        return accuracy
    
    def predict(self, interests, skills, education):
        combined_features = f"{interests} {skills} {education}"
        prediction = self.model.predict([combined_features])
        career = self.label_encoder.inverse_transform(prediction)[0]
        
        # Get prediction probabilities for confidence
        probabilities = self.model.predict_proba([combined_features])[0]
        confidence = max(probabilities)
        
        return {
            'career': career,
            'confidence': confidence,
            'alternatives': self._get_alternatives(combined_features)
        }
    
    def _get_alternatives(self, features):
        probabilities = self.model.predict_proba([features])[0]
        careers = self.label_encoder.classes_
        
        # Get top 3 recommendations
        top_indices = np.argsort(probabilities)[-3:][::-1]
        alternatives = []
        
        for idx in top_indices:
            alternatives.append({
                'career': careers[idx],
                'confidence': probabilities[idx]
            })
        
        return alternatives
    
    def save_model(self, filepath='career_model.joblib'):
        joblib.dump({
            'model': self.model,
            'label_encoder': self.label_encoder
        }, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath='career_model.joblib'):
        loaded = joblib.load(filepath)
        self.model = loaded['model']
        self.label_encoder = loaded['label_encoder']
        print(f"Model loaded from {filepath}")

if __name__ == "__main__":
    # Load training data
    df = pd.read_csv('../datasets/career_training_data.csv')
    
    # Train model
    model = CareerRecommendationModel()
    accuracy = model.train(df)
    
    # Save model
    model.save_model('../ml-models/career_model.joblib')
    
    # Test prediction
    result = model.predict("technology programming", "problem solving analytical", "bachelor")
    print("Test prediction:", result)
