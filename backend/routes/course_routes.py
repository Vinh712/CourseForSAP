"""
Course and module management routes
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime

from database import get_db
from utils.auth import require_auth
from models.schemas import create_course_schema, create_module_schema

course_bp = Blueprint('courses', __name__)


@course_bp.route('/class/<class_id>', methods=['GET'])
@require_auth
def get_courses(class_id):
    """Get all courses for a class"""
    db = get_db()
    
    # Verify class access
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    # Check access - teacher_id or in students list
    is_teacher = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    is_student = g.user_id in cls.get('students', [])
    
    if not is_teacher and not is_student:
        return jsonify({'error': 'Access denied'}), 403
    
    # Filter by published status for students
    query = {'class_id': class_id}
    if not is_teacher:
        query['is_published'] = True
    
    courses = list(db.courses.find(query).sort('order', 1))
    
    for course in courses:
        course['_id'] = str(course['_id'])
        if not is_teacher:
            # Filter unpublished modules for students
            course['modules'] = [m for m in course.get('modules', []) if m.get('is_published', False)]
    
    return jsonify(courses), 200


@course_bp.route('/<course_id>', methods=['GET'])
@require_auth
def get_course(course_id):
    """Get a specific course"""
    db = get_db()
    
    try:
        course = db.courses.find_one({'_id': ObjectId(course_id)})
    except:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Verify class access
    cls = db.classes.find_one({'_id': ObjectId(course['class_id'])})
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    is_teacher = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    is_student = g.user_id in cls.get('students', [])
    
    if not is_teacher and not is_student:
        return jsonify({'error': 'Access denied'}), 403
    
    course['_id'] = str(course['_id'])
    
    return jsonify(course), 200


@course_bp.route('/class/<class_id>', methods=['POST'])
@require_auth
def create_course(class_id):
    """Create a new course in a class"""
    db = get_db()
    data = request.get_json()
    
    # Verify teacher access
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can create courses'}), 403
    
    if not data.get('title'):
        return jsonify({'error': 'Course title is required'}), 400
    
    # Get max order
    max_order_course = db.courses.find_one(
        {'class_id': class_id},
        sort=[('order', -1)]
    )
    next_order = (max_order_course.get('order', 0) + 1) if max_order_course else 0
    
    course_data = create_course_schema(
        class_id=class_id,
        title=data['title'],
        description=data.get('description', ''),
        order=next_order,
        is_published=data.get('is_published', False)
    )
    
    result = db.courses.insert_one(course_data)
    course_data['_id'] = str(result.inserted_id)
    
    return jsonify(course_data), 201


@course_bp.route('/<course_id>', methods=['PUT'])
@require_auth
def update_course(course_id):
    """Update a course"""
    db = get_db()
    data = request.get_json()
    
    try:
        course = db.courses.find_one({'_id': ObjectId(course_id)})
    except:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(course['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can update courses'}), 403
    
    allowed_fields = ['title', 'description', 'order', 'is_published']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.utcnow()
    
    db.courses.update_one(
        {'_id': ObjectId(course_id)},
        {'$set': update_data}
    )
    
    course = db.courses.find_one({'_id': ObjectId(course_id)})
    course['_id'] = str(course['_id'])
    
    return jsonify(course), 200


@course_bp.route('/<course_id>', methods=['DELETE'])
@require_auth
def delete_course(course_id):
    """Delete a course"""
    db = get_db()
    
    try:
        course = db.courses.find_one({'_id': ObjectId(course_id)})
    except:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(course['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can delete courses'}), 403
    
    db.courses.delete_one({'_id': ObjectId(course_id)})
    
    return jsonify({'message': 'Course deleted successfully'}), 200


@course_bp.route('/<course_id>/modules', methods=['POST'])
@require_auth
def add_module(course_id):
    """Add a module to a course"""
    db = get_db()
    data = request.get_json()
    
    try:
        course = db.courses.find_one({'_id': ObjectId(course_id)})
    except:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(course['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can add modules'}), 403
    
    if not data.get('title'):
        return jsonify({'error': 'Module title is required'}), 400
    
    # Get max order
    modules = course.get('modules', [])
    next_order = max([m.get('order', 0) for m in modules], default=-1) + 1
    
    module_data = create_module_schema(
        title=data['title'],
        content=data.get('content', ''),
        content_type=data.get('content_type', 'text'),
        media_url=data.get('media_url', ''),
        duration=data.get('duration', 0),
        order=next_order,
        is_published=data.get('is_published', False)
    )
    
    db.courses.update_one(
        {'_id': ObjectId(course_id)},
        {
            '$push': {'modules': module_data},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )
    
    return jsonify(module_data), 201


@course_bp.route('/<course_id>/modules/<module_id>', methods=['PUT'])
@require_auth
def update_module(course_id, module_id):
    """Update a module"""
    db = get_db()
    data = request.get_json()
    
    try:
        course = db.courses.find_one({'_id': ObjectId(course_id)})
    except:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(course['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can update modules'}), 403
    
    # Find and update module
    modules = course.get('modules', [])
    module_index = None
    for i, m in enumerate(modules):
        if m.get('id') == module_id:
            module_index = i
            break
    
    if module_index is None:
        return jsonify({'error': 'Module not found'}), 404
    
    allowed_fields = ['title', 'content', 'content_type', 'media_url', 'duration', 'order', 'is_published']
    for field in allowed_fields:
        if field in data:
            modules[module_index][field] = data[field]
    
    db.courses.update_one(
        {'_id': ObjectId(course_id)},
        {
            '$set': {
                'modules': modules,
                'updated_at': datetime.utcnow()
            }
        }
    )
    
    return jsonify(modules[module_index]), 200


@course_bp.route('/<course_id>/modules/<module_id>', methods=['DELETE'])
@require_auth
def delete_module(course_id, module_id):
    """Delete a module from a course"""
    db = get_db()
    
    try:
        course = db.courses.find_one({'_id': ObjectId(course_id)})
    except:
        return jsonify({'error': 'Invalid course ID'}), 400
    
    if not course:
        return jsonify({'error': 'Course not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(course['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can delete modules'}), 403
    
    db.courses.update_one(
        {'_id': ObjectId(course_id)},
        {
            '$pull': {'modules': {'id': module_id}},
            '$set': {'updated_at': datetime.utcnow()}
        }
    )
    
    return jsonify({'message': 'Module deleted successfully'}), 200
