"""
Quiz management routes - Simplified for frontend compatibility
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime

from database import get_db
from utils.auth import require_auth

quiz_bp = Blueprint('quizzes', __name__)


@quiz_bp.route('/class/<class_id>', methods=['GET'])
@require_auth
def get_class_quizzes(class_id):
    """Get all quizzes for a class"""
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
    
    quizzes = list(db.quizzes.find(query).sort('created_at', -1))
    
    for quiz in quizzes:
        quiz['_id'] = str(quiz['_id'])
        
        # Don't send questions/answers in list view for students
        if not is_teacher:
            quiz.pop('questions', None)
    
    return jsonify(quizzes), 200


@quiz_bp.route('/<quiz_id>', methods=['GET'])
@require_auth
def get_quiz(quiz_id):
    """Get a specific quiz"""
    db = get_db()
    
    try:
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
    except:
        return jsonify({'error': 'Invalid quiz ID'}), 400
    
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Verify class access
    cls = db.classes.find_one({'_id': ObjectId(quiz['class_id'])})
    if not cls:
        return jsonify({'error': 'Class not found'}), 404
    
    is_teacher = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    is_student = g.user_id in cls.get('students', [])
    
    if not is_teacher and not is_student:
        return jsonify({'error': 'Access denied'}), 403
    
    quiz['_id'] = str(quiz['_id'])
    quiz['is_teacher'] = is_teacher
    
    # For students taking quiz, hide correct answers
    if not is_teacher:
        # Check submission count and best score
        submissions = list(db.quiz_submissions.find({
            'quiz_id': quiz_id,
            'user_id': g.user_id
        }).sort('score', -1))
        
        max_attempts = quiz.get('max_attempts', 1)
        attempts_used = len(submissions)
        
        quiz['max_attempts'] = max_attempts
        quiz['attempts_used'] = attempts_used
        quiz['can_retake'] = attempts_used < max_attempts
        
        if submissions:
            best_submission = submissions[0]  # Highest score
            quiz['already_submitted'] = True
            quiz['submission_score'] = best_submission.get('score')
            quiz['submission_passed'] = best_submission.get('passed')
            quiz['best_score'] = best_submission.get('score')
            quiz['all_attempts'] = [{
                'attempt': s.get('attempt_number', i+1),
                'score': s.get('score'),
                'passed': s.get('passed'),
                'completed_at': s.get('completed_at')
            } for i, s in enumerate(submissions)]
        
        # Hide correct answers
        for q in quiz.get('questions', []):
            q.pop('correct_answer', None)
    
    return jsonify(quiz), 200


@quiz_bp.route('/class/<class_id>', methods=['POST'])
@require_auth
def create_quiz(class_id):
    """Create a new quiz"""
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
        return jsonify({'error': 'Only teachers can create quizzes'}), 403
    
    if not data.get('title'):
        return jsonify({'error': 'Quiz title is required'}), 400
    
    # Create quiz document
    # Frontend sends: {title, description, time_limit, passing_score, max_attempts, questions: [{question, options: [], correct_answer: 0}]}
    quiz_data = {
        'class_id': class_id,
        'title': data['title'],
        'description': data.get('description', ''),
        'time_limit': data.get('time_limit', 30),
        'passing_score': data.get('passing_score', 60),
        'max_attempts': data.get('max_attempts', 1),  # Số lần nộp tối đa
        'questions': data.get('questions', []),
        'is_published': data.get('is_published', False),
        'created_by': g.user_id,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }
    
    result = db.quizzes.insert_one(quiz_data)
    quiz_data['_id'] = str(result.inserted_id)
    
    return jsonify(quiz_data), 201


@quiz_bp.route('/<quiz_id>', methods=['PUT'])
@require_auth
def update_quiz(quiz_id):
    """Update a quiz"""
    db = get_db()
    data = request.get_json()
    
    try:
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
    except:
        return jsonify({'error': 'Invalid quiz ID'}), 400
    
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(quiz['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can update quizzes'}), 403
    
    allowed_fields = ['title', 'description', 'questions', 'time_limit', 'passing_score', 'max_attempts', 'is_published']
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data['updated_at'] = datetime.utcnow()
    
    db.quizzes.update_one(
        {'_id': ObjectId(quiz_id)},
        {'$set': update_data}
    )
    
    quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
    quiz['_id'] = str(quiz['_id'])
    
    return jsonify(quiz), 200


@quiz_bp.route('/<quiz_id>', methods=['DELETE'])
@require_auth
def delete_quiz(quiz_id):
    """Delete a quiz"""
    db = get_db()
    
    try:
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
    except:
        return jsonify({'error': 'Invalid quiz ID'}), 400
    
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(quiz['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can delete quizzes'}), 403
    
    # Delete quiz submissions
    db.quiz_submissions.delete_many({'quiz_id': quiz_id})
    
    # Delete quiz
    db.quizzes.delete_one({'_id': ObjectId(quiz_id)})
    
    return jsonify({'message': 'Quiz deleted successfully'}), 200


@quiz_bp.route('/<quiz_id>/submit', methods=['POST'])
@require_auth
def submit_quiz(quiz_id):
    """Submit quiz answers"""
    db = get_db()
    data = request.get_json()
    
    # Frontend sends: {answers: [0, 1, 2, ...]} - array of selected option indices
    answers = data.get('answers', [])
    
    try:
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
    except:
        return jsonify({'error': 'Invalid quiz ID'}), 400
    
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Verify student access
    cls = db.classes.find_one({'_id': ObjectId(quiz['class_id'])})
    is_student = g.user_id in cls.get('students', [])
    is_teacher = cls.get('teacher_id') == g.user_id or g.user_role == 'admin'
    
    if not is_student and not is_teacher:
        return jsonify({'error': 'Access denied'}), 403
    
    # Check number of attempts
    attempt_count = db.quiz_submissions.count_documents({
        'quiz_id': quiz_id,
        'user_id': g.user_id
    })
    max_attempts = quiz.get('max_attempts', 1)
    
    if attempt_count >= max_attempts:
        return jsonify({
            'error': f'Đã hết số lần nộp ({max_attempts} lần)',
            'attempts_used': attempt_count,
            'max_attempts': max_attempts
        }), 400
    
    # Grade the quiz
    questions = quiz.get('questions', [])
    correct_count = 0
    
    for i, q in enumerate(questions):
        if i < len(answers):
            user_answer = answers[i]
            correct_answer = q.get('correct_answer', 0)
            if user_answer == correct_answer:
                correct_count += 1
    
    total_questions = len(questions)
    score = round((correct_count / total_questions * 100)) if total_questions > 0 else 0
    passed = score >= quiz.get('passing_score', 60)
    
    # Save submission
    submission = {
        'quiz_id': quiz_id,
        'user_id': g.user_id,
        'answers': answers,
        'score': score,
        'correct_count': correct_count,
        'total_questions': total_questions,
        'passed': passed,
        'attempt_number': attempt_count + 1,
        'completed_at': datetime.utcnow()
    }
    
    result = db.quiz_submissions.insert_one(submission)
    submission['_id'] = str(result.inserted_id)
    
    return jsonify(submission), 200


@quiz_bp.route('/<quiz_id>/results', methods=['GET'])
@require_auth
def get_quiz_results(quiz_id):
    """Get all submissions for a quiz (teacher only)"""
    db = get_db()
    
    try:
        quiz = db.quizzes.find_one({'_id': ObjectId(quiz_id)})
    except:
        return jsonify({'error': 'Invalid quiz ID'}), 400
    
    if not quiz:
        return jsonify({'error': 'Quiz not found'}), 404
    
    # Verify teacher access
    cls = db.classes.find_one({'_id': ObjectId(quiz['class_id'])})
    if cls.get('teacher_id') != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Only teachers can view results'}), 403
    
    # Get all submissions
    submissions = list(db.quiz_submissions.find({'quiz_id': quiz_id}))
    
    # Add user info to each submission
    for sub in submissions:
        sub['_id'] = str(sub['_id'])
        try:
            user = db.users.find_one({'_id': ObjectId(sub['user_id'])})
            if user:
                sub['user'] = {
                    'name': user.get('name', ''),
                    'email': user.get('email', ''),
                    'avatar_url': user.get('avatar_url', '')
                }
        except:
            sub['user'] = None
    
    return jsonify(submissions), 200
