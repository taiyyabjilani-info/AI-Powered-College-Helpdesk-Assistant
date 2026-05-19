# chatbot.py - AI Chatbot Engine
# -*- coding: utf-8 -*-
# Uses Scikit-learn TF-IDF + Naive Bayes for intent classification

import json
import random
import pickle
import os
import re
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
INTENTS_PATH = os.path.join(BASE_DIR, 'data', 'intents.json')
MODEL_DIR    = os.path.join(BASE_DIR, 'model')
MODEL_PATH   = os.path.join(MODEL_DIR, 'trained_model.pkl')

# Built-in stopwords — no NLTK download needed
STOP_WORDS = {
    'i','me','my','we','our','you','your','he','him','his','she','her',
    'it','its','they','them','their','what','which','who','this','that',
    'these','those','am','is','are','was','were','be','been','being',
    'have','has','had','do','does','did','will','would','could','should',
    'may','might','shall','can','a','an','the','and','but','or','nor',
    'in','on','at','to','for','of','with','by','from','about','into',
    'up','out','no','not','so','just','s','t','ll','ve','re'
}

def preprocess(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    tokens = [t for t in text.split() if t not in STOP_WORDS and len(t) > 1]
    return ' '.join(tokens) if tokens else text


class CollegeBot:
    def __init__(self):
        self.intents  = []
        self.pipeline = None
        self.encoder  = LabelEncoder()
        self.tag_map  = {}
        self.load_intents()
        self.load_or_train()

    def load_intents(self):
        with open(INTENTS_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.intents = data['intents']
        for intent in self.intents:
            self.tag_map[intent['tag']] = intent['responses']

    def train(self):
        X, y = [], []
        for intent in self.intents:
            if intent['tag'] == 'fallback':
                continue
            for pattern in intent['patterns']:
                X.append(preprocess(pattern))
                y.append(intent['tag'])

        y_enc = self.encoder.fit_transform(y)
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=5000, sublinear_tf=True)),
            ('clf',   MultinomialNB(alpha=0.3))
        ])
        self.pipeline.fit(X, y_enc)

        os.makedirs(MODEL_DIR, exist_ok=True)
        with open(MODEL_PATH, 'wb') as f:
            pickle.dump({'pipeline': self.pipeline, 'encoder': self.encoder}, f)

        print('[CollegeBot] Model trained on ' + str(len(X)) + ' patterns, ' + str(len(set(y))) + ' intents.')

    def load_or_train(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, 'rb') as f:
                    saved = pickle.load(f)
                self.pipeline = saved['pipeline']
                self.encoder  = saved['encoder']
                print('[CollegeBot] Model loaded from disk.')
                return
            except Exception as e:
                print('[CollegeBot] Retraining: ' + str(e))
        self.train()

    def predict_intent(self, text):
        processed = preprocess(text)
        if not processed:
            return 'fallback', 0.0
        proba      = self.pipeline.predict_proba([processed])[0]
        max_idx    = int(np.argmax(proba))
        confidence = float(proba[max_idx])
        tag        = str(self.encoder.inverse_transform([max_idx])[0])
        if confidence < 0.15:
            return 'fallback', confidence
        return tag, confidence

    def get_response(self, user_input):
        tag, confidence = self.predict_intent(user_input)
        responses = self.tag_map.get(tag, self.tag_map.get('fallback', ['I am unable to answer that.']))
        response  = random.choice(responses)
        return {
            'response':   response,
            'intent':     str(tag),
            'confidence': round(float(confidence) * 100, 1)
        }

    def retrain(self):
        self.train()
        return 'Model retrained successfully.'


_bot_instance = None

def get_bot():
    global _bot_instance
    if _bot_instance is None:
        _bot_instance = CollegeBot()
    return _bot_instance
