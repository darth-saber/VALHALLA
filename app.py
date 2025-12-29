from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
import os
import sqlite3
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = os.urandom(24)

# Database configuration
DATABASE = 'app.db'

def init_db():
    """Initialize the database with required tables"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create posts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            user_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Home page route"""
    return render_template('index.html')

@app.route('/about')
def about():
    """About page route"""
    return render_template('about.html')

@app.route('/contact')
def contact():
    """Contact page route"""
    return render_template('contact.html')

@app.route('/api/users', methods=['GET', 'POST'])
def users():
    """Handle user operations"""
    if request.method == 'POST':
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        
        if not username or not email:
            return jsonify({'error': 'Username and email are required'}), 400
        
        try:
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute('INSERT INTO users (username, email) VALUES (?, ?)', 
                         (username, email))
            conn.commit()
            user_id = cursor.lastrowid
            conn.close()
            
            return jsonify({
                'success': True, 
                'message': 'User created successfully',
                'user_id': user_id
            })
        except sqlite3.IntegrityError:
            return jsonify({'error': 'Username or email already exists'}), 400
    
    elif request.method == 'GET':
        conn = get_db_connection()
        users = conn.execute('SELECT * FROM users ORDER BY created_at DESC').fetchall()
        conn.close()
        return jsonify([dict(user) for user in users])

@app.route('/api/posts', methods=['GET', 'POST'])
def posts():
    """Handle post operations"""
    if request.method == 'POST':
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        user_id = data.get('user_id')
        
        if not title or not content:
            return jsonify({'error': 'Title and content are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)', 
                     (title, content, user_id))
        conn.commit()
        post_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Post created successfully',
            'post_id': post_id
        })
    
    elif request.method == 'GET':
        conn = get_db_connection()
        posts = conn.execute('''
            SELECT posts.*, users.username 
            FROM posts 
            JOIN users ON posts.user_id = users.id 
            ORDER BY posts.created_at DESC
        ''').fetchall()
        conn.close()
        return jsonify([dict(post) for post in posts])

@app.route('/api/messages', methods=['GET', 'POST'])
def messages():
    """Handle message operations"""
    if request.method == 'POST':
        data = request.get_json()
        sender = data.get('sender')
        message = data.get('message')
        
        if not sender or not message:
            return jsonify({'error': 'Sender and message are required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO messages (sender, message) VALUES (?, ?)', 
                     (sender, message))
        conn.commit()
        message_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Message sent successfully',
            'message_id': message_id
        })
    
    elif request.method == 'GET':
        conn = get_db_connection()
        messages = conn.execute('SELECT * FROM messages ORDER BY created_at DESC LIMIT 50').fetchall()
        conn.close()
        return jsonify([dict(message) for message in messages])

@app.route('/api/stats')
def stats():
    """Get application statistics"""
    conn = get_db_connection()
    
    user_count = conn.execute('SELECT COUNT(*) as count FROM users').fetchone()['count']
    post_count = conn.execute('SELECT COUNT(*) as count FROM posts').fetchone()['count']
    message_count = conn.execute('SELECT COUNT(*) as count FROM messages').fetchone()['count']
    
    conn.close()
    
    return jsonify({
        'users': user_count,
        'posts': post_count,
        'messages': message_count,
        'timestamp': datetime.now().isoformat()
    })

@app.errorhandler(404)
def not_found(error):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Run the application
    app.run(debug=True, host='0.0.0.0', port=5000)
