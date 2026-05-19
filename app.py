# app.py - Flask Backend for AI College Helpdesk Chatbot
# -*- coding: utf-8 -*-

import os
import sqlite3
import traceback
from datetime import datetime
from flask import Flask, render_template, request, jsonify, g
from chatbot import get_bot

app = Flask(__name__)
app.secret_key = 'college_helpdesk_secret_2024'

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH  = os.path.join(BASE_DIR, 'data', 'chat_history.db')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error=None):
    db = g.pop('db', None)
    if db:
        db.close()

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            user_msg   TEXT    NOT NULL,
            bot_reply  TEXT    NOT NULL,
            intent     TEXT,
            confidence REAL,
            timestamp  TEXT    NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def save_chat(user_msg, bot_reply, intent, confidence):
    try:
        db = get_db()
        db.execute(
            'INSERT INTO chat_history (user_msg, bot_reply, intent, confidence, timestamp) VALUES (?,?,?,?,?)',
            (user_msg, bot_reply, intent, confidence, datetime.now().isoformat())
        )
        db.commit()
    except Exception as e:
        print('[DB] Save error: ' + str(e))

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json(force=True, silent=True) or {}
        user_msg = str(data.get('message') or '').strip()
        if not user_msg:
            return jsonify({'error': 'Empty message'}), 400
        bot = get_bot()
        result = bot.get_response(user_msg)
        save_chat(user_msg, result['response'], result['intent'], result['confidence'])
        return jsonify({
            'response':   result['response'],
            'intent':     result['intent'],
            'confidence': result['confidence'],
            'timestamp':  datetime.now().strftime('%I:%M %p')
        })
    except Exception as e:
        print('[CHAT ERROR]')
        traceback.print_exc()
        return jsonify({
            'response':   'Sorry, something went wrong. Please try again!',
            'intent':     'error',
            'confidence': 0,
            'timestamp':  datetime.now().strftime('%I:%M %p')
        }), 200

@app.route('/api/history', methods=['GET'])
def history():
    try:
        db = get_db()
        rows = db.execute('SELECT * FROM chat_history ORDER BY id DESC LIMIT 50').fetchall()
        return jsonify([dict(r) for r in rows])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats', methods=['GET'])
def stats():
    try:
        db = get_db()
        total    = db.execute('SELECT COUNT(*) FROM chat_history').fetchone()[0]
        intents  = db.execute(
            "SELECT intent, COUNT(*) as cnt FROM chat_history GROUP BY intent ORDER BY cnt DESC LIMIT 5"
        ).fetchall()
        avg_conf = db.execute('SELECT AVG(confidence) FROM chat_history').fetchone()[0] or 0
        return jsonify({
            'total_queries':  total,
            'top_intents':    [dict(r) for r in intents],
            'avg_confidence': round(avg_conf, 1)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/retrain', methods=['POST'])
def retrain():
    try:
        bot = get_bot()
        msg = bot.retrain()
        return jsonify({'status': 'success', 'message': msg})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/clear_history', methods=['POST'])
def clear_history():
    try:
        db = get_db()
        db.execute('DELETE FROM chat_history')
        db.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 50)
    print("  AI College Helpdesk Chatbot")
    print("  http://127.0.0.1:5000")
    print("=" * 50)
    init_db()
    get_bot()
    app.run(debug=True, host='0.0.0.0', port=5000)
