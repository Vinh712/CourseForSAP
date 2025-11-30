"""
Admin management routes - Only accessible by admin users
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime
import random
import string

from database import get_db
from utils.auth import require_auth, require_admin, hash_password

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/users', methods=['GET'])
@require_auth
@require_admin
def get_all_users():
    """Get all users (admin only)"""
    db = get_db()
    
    role_filter = request.args.get('role')
    search = request.args.get('search', '')
    
    query = {}
    if role_filter:
        query['role'] = role_filter
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'email': {'$regex': search, '$options': 'i'}}
        ]
    
    users = list(db.users.find(query).sort('created_at', -1))
    
    for user in users:
        user['_id'] = str(user['_id'])
        # Remove sensitive data
        user.pop('password_hash', None)
        user.pop('password_salt', None)
    
    return jsonify(users), 200


@admin_bp.route('/users', methods=['POST'])
@require_auth
@require_admin
def create_user():
    """Create a new user (admin only)"""
    db = get_db()
    data = request.get_json()
    
    email = data.get('email', '').strip().lower()
    name = data.get('name', '').strip()
    role = data.get('role', 'student')
    password = data.get('password', '')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    if role not in ['student', 'teacher', 'admin']:
        return jsonify({'error': 'Invalid role'}), 400
    
    # Check if email already exists
    if db.users.find_one({'email': email}):
        return jsonify({'error': 'Email already exists'}), 400
    
    # Generate random password if not provided
    if not password:
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    # Hash password
    password_hash, salt = hash_password(password)
    
    user_data = {
        'email': email,
        'name': name,
        'role': role,
        'password_hash': password_hash,
        'password_salt': salt,
        'avatar_url': '',
        'classes': [],
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'created_by': g.user_id
    }
    
    result = db.users.insert_one(user_data)
    
    return jsonify({
        '_id': str(result.inserted_id),
        'email': email,
        'name': name,
        'role': role,
        'password': password,  # Return generated password (only shown once)
        'message': 'User created successfully'
    }), 201


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_user(user_id):
    """Delete a user (admin only)"""
    db = get_db()
    
    try:
        user = db.users.find_one({'_id': ObjectId(user_id)})
    except:
        return jsonify({'error': 'Invalid user ID'}), 400
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Prevent deleting yourself
    if str(user['_id']) == g.user_id:
        return jsonify({'error': 'Cannot delete your own account'}), 400
    
    # Remove user from all classes (both as student and teacher)
    db.classes.update_many(
        {'students': user_id},
        {'$pull': {'students': user_id}}
    )
    db.classes.update_many(
        {'teacher_id': user_id},
        {'$set': {'teacher_id': None}}
    )
    
    # Delete user's submissions
    db.submissions.delete_many({'user_id': user_id})
    
    # Delete user's quiz results
    db.quiz_results.delete_many({'user_id': user_id})
    
    # Delete user
    db.users.delete_one({'_id': ObjectId(user_id)})
    
    return jsonify({'message': 'User deleted successfully'}), 200


@admin_bp.route('/users/<user_id>/role', methods=['PUT'])
@require_auth
@require_admin
def update_user_role(user_id):
    """Update a user's role (admin only)"""
    db = get_db()
    data = request.get_json()
    
    new_role = data.get('role')
    if new_role not in ['student', 'teacher', 'admin']:
        return jsonify({'error': 'Invalid role. Must be student, teacher, or admin'}), 400
    
    try:
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'role': new_role, 'updated_at': datetime.utcnow()}}
        )
    except:
        return jsonify({'error': 'Invalid user ID'}), 400
    
    if result.matched_count == 0:
        return jsonify({'error': 'User not found'}), 404
    
    user = db.users.find_one({'_id': ObjectId(user_id)})
    user['_id'] = str(user['_id'])
    user.pop('password_hash', None)
    user.pop('password_salt', None)
    
    return jsonify(user), 200


@admin_bp.route('/users/<user_id>/reset-password', methods=['POST'])
@require_auth
@require_admin
def reset_user_password(user_id):
    """Reset a user's password (admin only)"""
    db = get_db()
    data = request.get_json()
    
    new_password = data.get('password', '')
    
    # Generate random password if not provided
    if not new_password:
        new_password = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    try:
        user = db.users.find_one({'_id': ObjectId(user_id)})
    except:
        return jsonify({'error': 'Invalid user ID'}), 400
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Hash new password
    password_hash, salt = hash_password(new_password)
    
    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {
            'password_hash': password_hash,
            'password_salt': salt,
            'updated_at': datetime.utcnow()
        }}
    )
    
    return jsonify({
        'message': 'Password reset successfully',
        'password': new_password  # Return new password (only shown once)
    }), 200


@admin_bp.route('/classes', methods=['GET'])
@require_auth
@require_admin
def get_all_classes():
    """Get all classes in the system (admin only)"""
    db = get_db()
    
    search = request.args.get('search', '')
    
    query = {}
    if search:
        query['$or'] = [
            {'name': {'$regex': search, '$options': 'i'}},
            {'code': {'$regex': search, '$options': 'i'}}
        ]
    
    classes = list(db.classes.find(query).sort('created_at', -1))
    
    for cls in classes:
        cls['_id'] = str(cls['_id'])
        cls['member_count'] = len(cls.get('students', [])) + 1  # +1 for teacher
        
        # Get teacher info
        if cls.get('teacher_id'):
            try:
                teacher = db.users.find_one({'_id': ObjectId(cls['teacher_id'])})
                if teacher:
                    cls['teacher'] = {
                        '_id': str(teacher['_id']),
                        'name': teacher.get('name', ''),
                        'email': teacher.get('email', '')
                    }
            except:
                pass
    
    return jsonify(classes), 200


@admin_bp.route('/classes', methods=['POST'])
@require_auth
@require_admin
def admin_create_class():
    """Create a new class and assign teacher (admin only)"""
    db = get_db()
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'error': 'Class name is required'}), 400
    
    # Validate teacher if provided
    teacher_id = data.get('teacher_id')
    if teacher_id:
        try:
            teacher = db.users.find_one({'_id': ObjectId(teacher_id)})
        except:
            return jsonify({'error': 'Invalid teacher ID'}), 400
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        if teacher.get('role') not in ['teacher', 'admin']:
            return jsonify({'error': 'Selected user is not a teacher'}), 400
    else:
        teacher_id = g.user_id  # Admin becomes teacher if none specified
    
    # Generate unique code
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    while db.classes.find_one({'code': code}):
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    
    class_data = {
        'name': data['name'],
        'code': code,
        'description': data.get('description', ''),
        'cover_image': data.get('cover_image', ''),
        'color': data.get('color', '#6366f1'),
        'teacher_id': teacher_id,
        'students': [],
        'created_by': g.user_id,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = db.classes.insert_one(class_data)
    class_data['_id'] = str(result.inserted_id)
    class_data['member_count'] = 1
    
    return jsonify(class_data), 201


@admin_bp.route('/classes/<class_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_class(class_id):
    """Delete a class (admin only)"""
    db = get_db()
    
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Delete related data
    db.assignments.delete_many({'class_id': class_id})
    db.courses.delete_many({'class_id': class_id})
    
    # Delete class
    db.classes.delete_one({'_id': ObjectId(class_id)})
    
    return jsonify({'message': 'Class deleted successfully'}), 200


@admin_bp.route('/classes/<class_id>/assign-teacher', methods=['POST'])
@require_auth
@require_admin
def assign_teacher_to_class(class_id):
    """Assign a teacher to a class (admin only)"""
    db = get_db()
    data = request.get_json()
    
    teacher_id = data.get('teacher_id')
    if not teacher_id:
        return jsonify({'error': 'Teacher ID is required'}), 400
    
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Get teacher by _id
    try:
        teacher = db.users.find_one({'_id': ObjectId(teacher_id)})
    except:
        return jsonify({'error': 'Invalid teacher ID'}), 400
    
    if not teacher:
        return jsonify({'error': 'Teacher not found'}), 404
    
    if teacher.get('role') not in ['teacher', 'admin']:
        return jsonify({'error': 'Selected user is not a teacher'}), 400
    
    # Update teacher
    db.classes.update_one(
        {'_id': ObjectId(class_id)},
        {
            '$set': {
                'teacher_id': teacher_id,
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    # Remove from students if present
    db.classes.update_one(
        {'_id': ObjectId(class_id)},
        {'$pull': {'students': teacher_id}}
    )
    
    cls = db.classes.find_one({'_id': ObjectId(class_id)})
    cls['_id'] = str(cls['_id'])
    
    return jsonify(cls), 200


@admin_bp.route('/classes/<class_id>/assign-students', methods=['POST'])
@require_auth
@require_admin
def assign_students_to_class(class_id):
    """Assign students to a class (admin only)"""
    db = get_db()
    data = request.get_json()
    
    student_ids = data.get('student_ids', [])
    if not student_ids:
        return jsonify({'error': 'Student IDs are required'}), 400
    
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Validate all student IDs exist
    valid_ids = []
    for sid in student_ids:
        try:
            student = db.users.find_one({'_id': ObjectId(sid)})
            if student:
                valid_ids.append(sid)
        except:
            continue
    
    if not valid_ids:
        return jsonify({'error': 'No valid students found'}), 400
    
    # Add students to class
    db.classes.update_one(
        {'_id': ObjectId(class_id)},
        {
            '$addToSet': {'students': {'$each': valid_ids}},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )
    
    cls = db.classes.find_one({'_id': ObjectId(class_id)})
    cls['_id'] = str(cls['_id'])
    cls['member_count'] = len(cls.get('students', [])) + 1
    
    return jsonify(cls), 200


@admin_bp.route('/classes/<class_id>/remove-member', methods=['POST'])
@require_auth
@require_admin
def remove_member_from_class(class_id):
    """Remove a member from a class (admin only)"""
    db = get_db()
    data = request.get_json()
    
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400
    
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Remove from students
    db.classes.update_one(
        {'_id': ObjectId(class_id)},
        {
            '$pull': {'students': user_id},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )
    
    cls = db.classes.find_one({'_id': ObjectId(class_id)})
    cls['_id'] = str(cls['_id'])
    
    return jsonify(cls), 200


@admin_bp.route('/stats', methods=['GET'])
@require_auth
@require_admin
def get_admin_stats():
    """Get system statistics (admin only)"""
    db = get_db()
    
    total_users = db.users.count_documents({})
    total_students = db.users.count_documents({'role': 'student'})
    total_teachers = db.users.count_documents({'role': 'teacher'})
    total_admins = db.users.count_documents({'role': 'admin'})
    total_classes = db.classes.count_documents({})
    total_assignments = db.assignments.count_documents({})
    total_submissions = db.submissions.count_documents({})
    
    # Get recent users
    recent_users = list(db.users.find().sort('created_at', -1).limit(5))
    for user in recent_users:
        user['_id'] = str(user['_id'])
        user.pop('password_hash', None)
        user.pop('password_salt', None)
    
    return jsonify({
        'total_users': total_users,
        'total_students': total_students,
        'total_teachers': total_teachers,
        'total_admins': total_admins,
        'total_classes': total_classes,
        'total_assignments': total_assignments,
        'total_submissions': total_submissions,
        'recent_users': recent_users
    }), 200
