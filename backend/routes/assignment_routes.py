"""
Assignment management routes
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime
from dateutil import parser as date_parser

from database import get_db
from utils.auth import require_auth
from models.schemas import create_assignment_schema, create_submission_schema

assignment_bp = Blueprint('assignments', __name__)


@assignment_bp.route('/class/<class_id>', methods=['GET'])
@require_auth
def get_class_assignments(class_id):
    """Get all assignments for a class"""
    db = get_db()
    
    # Verify class access
    try:
        cls = db.classes.find_one({'_id': ObjectId(class_id)})
    except:
        return jsonify({'error': 'Invalid class ID'}), 400
    
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    is_teacher = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    is_student = g.user_id in cls.get('students', [])
    
    if not is_teacher and not is_student:
        return jsonify({'error': 'Access denied'}), 403
    
    # Filter by published status for students
    query = {'class_id': class_id}
    if not is_teacher:
        query['is_published'] = True
    
    assignments = list(db.assignments.find(query).sort('due_date', 1))
    
    for assignment in assignments:
        assignment['_id'] = str(assignment['_id'])
        
        # Add submission status for students
        if not is_teacher:
            submission = db.submissions.find_one({
                'assignment_id': str(assignment['_id']),
                'user_id': g.user_id
            })
            assignment['submitted'] = submission is not None
            assignment['submission'] = None
            if submission:
                submission['_id'] = str(submission['_id'])
                assignment['submission'] = submission
    
    return jsonify(assignments), 200


@assignment_bp.route('/upcoming', methods=['GET'])
@require_auth
def get_upcoming_assignments():
    """Get upcoming assignments for current user across all classes"""
    db = get_db()
    
    # Get user's classes
    classes = list(db.classes.find({
        '$or': [
            {'teacher_id': g.user_id},
            {'students': g.user_id}
        ]
    }))
    
    class_ids = [str(c['_id']) for c in classes]
    
    # Get upcoming assignments
    now = datetime.utcnow()
    assignments = list(db.assignments.find({
        'class_id': {'$in': class_ids},
        'is_published': True,
        'due_date': {'$gte': now}
    }).sort('due_date', 1).limit(10))
    
    for assignment in assignments:
        assignment['_id'] = str(assignment['_id'])
        # Add class info
        cls = next((c for c in classes if str(c['_id']) == assignment['class_id']), None)
        if cls:
            assignment['class_name'] = cls.get('name', '')
            assignment['class_color'] = cls.get('color', '#6366f1')
        
        # Check submission status
        submission = db.submissions.find_one({
            'assignment_id': str(assignment['_id']),
            'user_id': g.user_id
        })
        assignment['submitted'] = submission is not None
    
    return jsonify(assignments), 200


@assignment_bp.route('/<assignment_id>', methods=['GET'])
@require_auth
def get_assignment(assignment_id):
    """Get a specific assignment"""
    db = get_db()
    
    try:
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
    except:
        return jsonify({'error': 'Invalid assignment ID'}), 400
    
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    # Verify class access
    cls = db.classes.find_one({'_id': ObjectId(assignment['class_id'])})
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    is_teacher = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    is_student = g.user_id in cls.get('students', [])
    
    if not is_teacher and not is_student:
        return jsonify({'error': 'Access denied'}), 403
    
    assignment['_id'] = str(assignment['_id'])
    assignment['class_name'] = cls.get('name', '')
    assignment['is_teacher'] = is_teacher
    
    # Get submission for students or all submissions for teachers
    if is_teacher:
        submissions = list(db.submissions.find({'assignment_id': assignment_id}))
        for sub in submissions:
            sub['_id'] = str(sub['_id'])
            # Add user info
            user = db.users.find_one({'_id': ObjectId(sub['user_id'])})
            if user:
                sub['user_name'] = user.get('name', '')
                sub['user_email'] = user.get('email', '')
                sub['user_avatar'] = user.get('avatar_url', '')
        assignment['submissions'] = submissions
    else:
        submission = db.submissions.find_one({
            'assignment_id': assignment_id,
            'user_id': g.user_id
        })
        if submission:
            submission['_id'] = str(submission['_id'])
        assignment['my_submission'] = submission
    
    return jsonify(assignment), 200


@assignment_bp.route('/class/<class_id>', methods=['POST'])
@require_auth
def create_assignment(class_id):
    """Create a new assignment"""
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
        return jsonify({'error': 'Only teachers can create assignments'}), 403
    
    if not data.get('title'):
        return jsonify({'error': 'Assignment title is required'}), 400
    
    # Parse due date
    due_date = None
    if data.get('due_date'):
        try:
            due_date = date_parser.parse(data['due_date'])
        except:
            return jsonify({'error': 'Invalid due date format'}), 400
    
    assignment_data = create_assignment_schema(
        class_id=class_id,
        title=data['title'],
        created_by=g.user_id,
        description=data.get('description', ''),
        instructions=data.get('instructions', ''),
        due_date=due_date,
        points=data.get('points', 100),
        submission_type=data.get('submission_type', 'file'),
        attachments=data.get('attachments', []),
        course_id=data.get('course_id'),
        is_published=data.get('is_published', False)
    )
    
    result = db.assignments.insert_one(assignment_data)
    assignment_data['_id'] = str(result.inserted_id)
    
    return jsonify(assignment_data), 201


@assignment_bp.route('/<assignment_id>', methods=['PUT'])
@require_auth
def update_assignment(assignment_id):
    """Update an assignment"""
    db = get_db()
    data = request.get_json()
    
    try:
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
    except:
        return jsonify({'error': 'Invalid assignment ID'}), 400
    
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(assignment['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can update assignments'}), 403
    
    allowed_fields = ['title', 'description', 'instructions', 'due_date', 'points', 
                      'submission_type', 'attachments', 'is_published']
    update_data = {}
    
    for field in allowed_fields:
        if field in data:
            if field == 'due_date' and data[field]:
                try:
                    update_data[field] = date_parser.parse(data[field])
                except:
                    return jsonify({'error': 'Invalid due date format'}), 400
            else:
                update_data[field] = data[field]
    
    update_data['updated_at'] = datetime.utcnow()
    
    db.assignments.update_one(
        {'_id': ObjectId(assignment_id)},
        {'$set': update_data}
    )
    
    assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
    assignment['_id'] = str(assignment['_id'])
    
    return jsonify(assignment), 200


@assignment_bp.route('/<assignment_id>', methods=['DELETE'])
@require_auth
def delete_assignment(assignment_id):
    """Delete an assignment"""
    db = get_db()
    
    try:
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
    except:
        return jsonify({'error': 'Invalid assignment ID'}), 400
    
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(assignment['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can delete assignments'}), 403
    
    db.assignments.delete_one({'_id': ObjectId(assignment_id)})
    db.submissions.delete_many({'assignment_id': assignment_id})
    
    return jsonify({'message': 'Assignment deleted successfully'}), 200


@assignment_bp.route('/<assignment_id>/submit', methods=['POST'])
@require_auth
def submit_assignment(assignment_id):
    """Submit an assignment"""
    db = get_db()
    data = request.get_json()
    
    try:
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
    except:
        return jsonify({'error': 'Invalid assignment ID'}), 400
    
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    # Verify student access
    cls = db.classes.find_one({'_id': ObjectId(assignment['class_id'])})
    is_teacher = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    is_student = g.user_id in cls.get('students', [])
    
    if not is_student and not is_teacher:
        return jsonify({'error': 'Access denied'}), 403
    
    # Check if already submitted
    existing = db.submissions.find_one({
        'assignment_id': assignment_id,
        'user_id': g.user_id
    })
    
    # Check if late
    is_late = False
    if assignment.get('due_date'):
        is_late = datetime.utcnow() > assignment['due_date']
    
    if existing:
        # Update existing submission
        db.submissions.update_one(
            {'_id': existing['_id']},
            {'$set': {
                'content': data.get('content', ''),
                'attachments': data.get('attachments', []),
                'submitted_at': datetime.utcnow(),
                'is_late': is_late,
                'status': 'submitted'
            }}
        )
        submission = db.submissions.find_one({'_id': existing['_id']})
    else:
        # Create new submission
        submission_data = create_submission_schema(
            assignment_id=assignment_id,
            user_id=g.user_id,
            content=data.get('content', ''),
            attachments=data.get('attachments', []),
            is_late=is_late
        )
        result = db.submissions.insert_one(submission_data)
        submission = submission_data
        submission['_id'] = result.inserted_id
    
    submission['_id'] = str(submission['_id'])
    
    return jsonify(submission), 200


@assignment_bp.route('/<assignment_id>/submissions/<submission_id>/grade', methods=['POST'])
@require_auth
def grade_submission(assignment_id, submission_id):
    """Grade a submission (teacher only)"""
    db = get_db()
    data = request.get_json()
    
    try:
        assignment = db.assignments.find_one({'_id': ObjectId(assignment_id)})
    except:
        return jsonify({'error': 'Invalid assignment ID'}), 400
    
    if not assignment:
        return jsonify({'error': 'Assignment not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(assignment['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can grade submissions'}), 403
    
    try:
        submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
    except:
        return jsonify({'error': 'Invalid submission ID'}), 400
    
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404
    
    db.submissions.update_one(
        {'_id': ObjectId(submission_id)},
        {'$set': {
            'grade': data.get('grade'),
            'feedback': data.get('feedback', ''),
            'graded_by': g.user_id,
            'graded_at': datetime.utcnow(),
            'status': 'graded'
        }}
    )
    
    submission = db.submissions.find_one({'_id': ObjectId(submission_id)})
    submission['_id'] = str(submission['_id'])
    
    return jsonify(submission), 200
