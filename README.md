# AI-Powered-College-Helpdesk-Assistant
# 🎓 NexusEdu — AI College Helpdesk Chatbot

> An intelligent, ML-powered college assistant with a futuristic glassmorphism UI

![Python](https://img.shields.io/badge/Python-3.8+-blue?style=flat-square&logo=python)
![Flask](https://img.shields.io/badge/Flask-2.3+-green?style=flat-square&logo=flask)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-ML-orange?style=flat-square)
![SQLite](https://img.shields.io/badge/SQLite-Database-lightblue?style=flat-square)

---

## 🌟 Features

| Feature | Description |
|---|---|
| 🧠 AI/ML Engine | TF-IDF + Multinomial Naive Bayes intent classifier |
| 🔤 NLP Preprocessing | NLTK tokenization, lemmatization, stopword removal |
| 📊 Analytics | Real-time dashboard showing query stats & top intents |
| 💾 Chat History | SQLite database with full conversation logging |
| 🎨 Futuristic UI | Dark mode glassmorphism with smooth animations |
| 📱 Responsive | Works on desktop and mobile browsers |
| 🌗 Theme Toggle | Dark/Light mode switcher |
| ⚡ Quick Topics | One-click topic chips in sidebar |
| 🔄 Admin Retrain | Retrain the AI model via the web UI |

---

## 🚀 Quick Start

### 1. Clone / Download the project

```bash
git clone <repo-url>
cd ai_college_helpdesk
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the app

```bash
python app.py
```

### 4. Open in browser

```
http://127.0.0.1:5000
```

---

## 📁 Project Structure

```
ai_college_helpdesk/
├── app.py              # Flask backend & API routes
├── chatbot.py          # AI/ML chatbot engine (NLP + classifier)
├── requirements.txt    # Python dependencies
├── README.md           # Documentation
├── data/
│   ├── intents.json    # Training data (15+ intents, 100+ patterns)
│   └── chat_history.db # SQLite DB (auto-created at runtime)
├── model/
│   └── trained_model.pkl  # Saved ML model (auto-created)
├── templates/
│   └── index.html      # Main HTML template (Flask/Jinja2)
└── static/
    ├── style.css       # Futuristic glassmorphism stylesheet
    └── script.js       # Frontend JS logic
```

---

## 🧠 AI Architecture

```
User Input
    │
    ▼
NLP Preprocessing (NLTK)
  • Lowercase & clean
  • Tokenize (word_tokenize)
  • Remove stopwords
  • Lemmatize (WordNetLemmatizer)
    │
    ▼
TF-IDF Vectorizer
  • Bigram features (1,2)
  • 5000 max features
  • Sublinear TF scaling
    │
    ▼
Multinomial Naive Bayes Classifier
  • 15+ intent categories
  • Confidence scoring
  • Low-confidence → fallback
    │
    ▼
Response Selection (random from pool)
```

---

## 💬 Supported Intents

| Intent | Example Query |
|---|---|
| `admission` | "How to apply for admission?" |
| `courses` | "What courses are available?" |
| `exams` | "When are the semester exams?" |
| `fees` | "What is the fee structure?" |
| `hostel` | "Tell me about hostel facilities" |
| `library` | "What are library timings?" |
| `faculty` | "Who is the HOD of CSE?" |
| `timings` | "What time does college open?" |
| `placements` | "What is the highest package?" |
| `campus` | "What sports facilities are available?" |
| `transport` | "What are the bus routes?" |
| `events` | "When is the tech fest?" |
| `contact` | "What is the college phone number?" |
| `greeting` | "Hello!", "Hi", "Hey" |
| `goodbye` | "Bye", "Thanks bye" |

---

## 🛠️ API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Main web interface |
| `/api/chat` | POST | Send message, get AI response |
| `/api/history` | GET | Fetch last 50 chat records |
| `/api/stats` | GET | Query analytics dashboard |
| `/api/retrain` | POST | Force retrain ML model |
| `/api/clear_history` | POST | Delete all history from DB |

---

## 🎨 Tech Stack

- **Backend:** Python, Flask
- **AI/ML:** Scikit-learn (TF-IDF + Naive Bayes), NLTK
- **Database:** SQLite (via Python sqlite3)
- **Frontend:** HTML5, CSS3 (Glassmorphism), Vanilla JavaScript
- **Fonts:** Syne (display) + DM Sans (body)

---

## 📈 Future Enhancements

- [ ] OpenAI GPT API integration (optional upgrade)
- [ ] Voice input support (Web Speech API)
- [ ] Admin dashboard with login system
- [ ] Multi-language support (Hindi + English)
- [ ] WhatsApp/Telegram bot integration

---
🧪 Example Queries
• How do I apply for admission?
• What are the hostel fees?
• When will exams start?
• Tell me about placement records
• What are the college timings?

---
👨‍💻 Author
Taiyyab Jilani
AI Enthusiast • Full-Stack Developer • ML Learner

Passionate about building intelligent applications using:

Artificial Intelligence
Machine Learning
Modern Web Technologies
Automation Systems

---


*Made with ❤️ for the AI/ML community*
