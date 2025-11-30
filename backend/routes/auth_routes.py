"""
Authentication routes - Login, Profile management
Custom JWT-based authentication (no Clerk)
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime

from database import get_db
from utils.auth import (
    hash_password, 
    verify_password, 
    generate_token, 
    require_auth,
    require_admin
)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login with email and password"""
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    db = get_db()
    user = db.users.find_one({'email': email})
    
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Verify password
    if not verify_password(password, user.get('password_hash', ''), user.get('password_salt', '')):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # Update last login
    db.users.update_one(
        {'_id': user['_id']},
        {'$set': {'last_login': datetime.utcnow()}}
    )
    
    # Generate token
    token = generate_token(
        user_id=str(user['_id']),
        email=user['email'],
        role=user.get('role', 'student')
    )
    
    return jsonify({
        'token': token,
        'user': {
            '_id': str(user['_id']),
            'email': user['email'],
            'name': user.get('name', ''),
            'role': user.get('role', 'student'),
            'avatar_url': user.get('avatar_url', '')
        }
    }), 200


@auth_bp.route('/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get current user's profile"""
    db = get_db()
    
    user = db.users.find_one({'_id': ObjectId(g.user_id)})
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    user['_id'] = str(user['_id'])
    
    # Remove sensitive data
    user.pop('password_hash', None)
    user.pop('password_salt', None)
    
    # Add stats
    enrolled_classes = db.classes.count_documents({
        '$or': [
            {'teacher_id': g.user_id},
            {'students': g.user_id}
        ]
    })
    completed_assignments = db.submissions.count_documents({
        'user_id': g.user_id,
        'status': 'graded'
    })
    
    user['stats'] = {
        'classesEnrolled': enrolled_classes,
        'assignmentsCompleted': completed_assignments,
        'totalHours': 0,
        'streak': 0
    }
    
    return jsonify(user), 200


@auth_bp.route('/profile', methods=['PUT'])
@require_auth
def update_profile():
    """Update current user's profile"""
    db = get_db()
    data = request.get_json()
    
    allowed_fields = ['name', 'avatar_url', 'bio']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.utcnow()
    
    result = db.users.update_one(
        {'_id': ObjectId(g.user_id)},
        {'$set': update_data}
    )
    
    user = db.users.find_one({'_id': ObjectId(g.user_id)})
    user['_id'] = str(user['_id'])
    user.pop('password_hash', None)
    user.pop('password_salt', None)
    
    return jsonify(user), 200


@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    """Change current user's password"""
    db = get_db()
    data = request.get_json()
    
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')
    
    if not current_password or not new_password:
        return jsonify({'error': 'Current and new password are required'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400
    
    user = db.users.find_one({'_id': ObjectId(g.user_id)})
    
    # Verify current password
    if not verify_password(current_password, user.get('password_hash', ''), user.get('password_salt', '')):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Hash new password
    password_hash, salt = hash_password(new_password)
    
    db.users.update_one(
        {'_id': ObjectId(g.user_id)},
        {'$set': {
            'password_hash': password_hash,
            'password_salt': salt,
            'updated_at': datetime.utcnow()
        }}
    )
    
    return jsonify({'message': 'Password changed successfully'}), 200


@auth_bp.route('/verify', methods=['GET'])
@require_auth
def verify_token():
    """Verify if token is valid"""
    return jsonify({
        'valid': True,
        'user_id': g.user_id,
        'email': g.user_email,
        'role': g.user_role
    }), 200
