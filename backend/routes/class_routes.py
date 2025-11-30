"""
Class management routes
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime

from database import get_db
from utils.auth import require_auth

class_bp = Blueprint('classes', __name__)


@class_bp.route('/', methods=['GET'])
@require_auth
def get_classes():
    """Get all classes for current user"""
    db = get_db()
    
    # Admin can see all classes
    if g.user_role == 'admin':
        classes = list(db.classes.find().sort('created_at', -1))
    else:
        # Get classes where user is a teacher or student
        classes = list(db.classes.find({
            '$or': [
                {'teacher_id': g.user_id},
                {'students': g.user_id}
            ]
        }).sort('created_at', -1))
    
    for cls in classes:
        cls['_id'] = str(cls['_id'])
        cls['is_teacher'] = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
        cls['member_count'] = len(cls.get('students', [])) + 1
        
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


@class_bp.route('/<class_id>', methods=['GET'])
@require_auth
def get_class(class_id):
    """Get a specific class by ID"""
    db = get_db()
    
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check if user has access (admin can view all)
    if g.user_role != 'admin':
        if cls.get('teacher_id') != g.user_id and g.user_id not in cls.get('students', []):
            return jsonify({'error': 'Access denied'}), 403
    
    cls['_id'] = str(cls['_id'])
    cls['is_teacher'] = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    
    # Get teacher info
    if cls.get('teacher_id'):
        try:
            teacher = db.users.find_one({'_id': ObjectId(cls['teacher_id'])})
            if teacher:
                cls['teacher'] = {
                    '_id': str(teacher['_id']),
                    'name': teacher.get('name', ''),
                    'email': teacher.get('email', ''),
                    'avatar_url': teacher.get('avatar_url', ''),
                    'role': 'teacher'
                }
        except:
            pass
    
    # Get student details and build members list
    members = []
    
    # Add teacher to members
    if cls.get('teacher'):
        members.append(cls['teacher'])
    
    student_ids = cls.get('students', [])
    if student_ids:
        students = list(db.users.find({'_id': {'$in': [ObjectId(sid) for sid in student_ids]}}))
        cls['student_list'] = [{
            '_id': str(s['_id']),
            'name': s.get('name', ''),
            'email': s.get('email', ''),
            'avatar_url': s.get('avatar_url', ''),
            'role': 'student'
        } for s in students]
        members.extend(cls['student_list'])
    else:
        cls['student_list'] = []
    
    cls['members'] = members
    
    return jsonify(cls), 200


@class_bp.route('/<class_id>', methods=['PUT'])
@require_auth
def update_class(class_id):
    """Update a class (teacher or admin only)"""
    db = get_db()
    data = request.get_json()
    
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Only teachers of the class or admin can update
    if g.user_role != 'admin' and cls.get('teacher_id') != g.user_id:
        return jsonify({'error': 'Only teachers or admin can update class'}), 403
    
    allowed_fields = ['name', 'description', 'cover_image', 'color', 'is_active']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.utcnow()
    
    db.classes.update_one(
        {'_id': ObjectId(class_id)},
        {'$set': update_data}
    )
    
    cls = db.classes.find_one({'_id': ObjectId(class_id)})
    cls['_id'] = str(cls['_id'])
    
    return jsonify(cls), 200


@class_bp.route('/<class_id>/members', methods=['GET'])
@require_auth
def get_class_members(class_id):
    """Get all members of a class"""
    db = get_db()
    
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check if user has access (admin can view all)
    if g.user_role != 'admin':
        if cls.get('teacher_id') != g.user_id and g.user_id not in cls.get('students', []):
            return jsonify({'error': 'Access denied'}), 403
    
    members = []
    
    # Add teacher
    if cls.get('teacher_id'):
        try:
            teacher = db.users.find_one({'_id': ObjectId(cls['teacher_id'])})
            if teacher:
                members.append({
                    '_id': str(teacher['_id']),
                    'name': teacher.get('name', ''),
                    'email': teacher.get('email', ''),
                    'avatar_url': teacher.get('avatar_url', ''),
                    'role': 'teacher'
                })
        except:
            pass
    
    # Add students
    student_ids = cls.get('students', [])
    if student_ids:
        students = list(db.users.find({'_id': {'$in': [ObjectId(sid) for sid in student_ids]}}))
        for s in students:
            members.append({
                '_id': str(s['_id']),
                'name': s.get('name', ''),
                'email': s.get('email', ''),
                'avatar_url': s.get('avatar_url', ''),
                'role': 'student'
            })
    
    return jsonify(members), 200
