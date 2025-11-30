"""
JWT Authentication utility - Custom auth without Clerk
"""

import jwt
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g
from config import Config


def hash_password(password, salt=None):
    """Hash password with salt using SHA-256"""
    if salt is None:
        salt = secrets.token_hex(16)
    
    # Combine password and salt, then hash
    password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return password_hash, salt


def verify_password(password, stored_hash, salt):
    """Verify password against stored hash"""
    password_hash, _ = hash_password(password, salt)
    return password_hash == stored_hash


def generate_token(user_id, email, role, expires_hours=24):
    """Generate JWT token"""
    payload = {
        'user_id': str(user_id),
        'email': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=expires_hours),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
    return token


def decode_token(token):
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def require_auth(f):
    """Decorator to require authentication on routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header missing'}), 401
        
        # Extract token from "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        token = parts[1]
        
        # Verify token
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Store user info in Flask's g object
        g.user_id = payload.get('user_id')
        g.user_email = payload.get('email')
        g.user_role = payload.get('role', 'student')
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user_role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function


def require_teacher(f):
    """Decorator to require teacher or admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user_role not in ['teacher', 'admin']:
            return jsonify({'error': 'Teacher access required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function


def create_default_admin():
    """Create default admin account if not exists"""
    from database import get_db
    
    db = get_db()
    
    # Check if admin exists
    admin = db.users.find_one({'email': 'admin@nls.studio'})
    if admin:
        print("✅ Default admin already exists")
        return
    
    # Create default admin
    password_hash, salt = hash_password('admin123')
    
    admin_data = {
        'email': 'admin@nls.studio',
        'password_hash': password_hash,
        'password_salt': salt,
        'name': 'Administrator',
        'role': 'admin',
        'avatar_url': '',
        'classes': [],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'created_by': None  # Self-created
    }
    
    db.users.insert_one(admin_data)
    print("✅ Default admin created: admin@nls.studio / admin123")
