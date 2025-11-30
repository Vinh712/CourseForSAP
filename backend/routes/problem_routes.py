"""
Problem management routes - Coding problems with AI grading
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime
import os
import logging

from database import get_db
from utils.auth import require_auth, require_admin
from models.schemas import create_problem_schema, create_problem_submission_schema

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

problem_bp = Blueprint('problems', __name__)


# ==================== PROBLEM CRUD (Admin) ====================

@problem_bp.route('/', methods=['GET'])
@require_auth
def get_problems():
    """
    Get all problems
    - Admin sees all problems with edit/delete options
    - Students see only published problems
    """
    db = get_db()
    
    is_admin = g.user_role == 'admin'
    
    # Filter: admin sees all, students see only published
    query = {} if is_admin else {'is_published': True}
    
    problems = list(db.problems.find(query).sort('created_at', -1))
    
    for problem in problems:
        problem['_id'] = str(problem['_id'])
        problem['can_edit'] = is_admin
        problem['can_delete'] = is_admin
        
        # Count submissions for this problem
        submission_count = db.problem_submissions.count_documents({'problem_id': str(problem['_id'])})
        problem['submission_count'] = submission_count
        
        # Check if current user has submitted
        user_submission = db.problem_submissions.find_one({
            'problem_id': str(problem['_id']),
            'user_id': g.user_id
        })
        problem['user_submitted'] = user_submission is not None
        if user_submission:
            problem['user_submission'] = {
                '_id': str(user_submission['_id']),
                'status': user_submission.get('status'),
                'score': user_submission.get('score'),
                'submitted_at': user_submission.get('submitted_at')
            }
    
    return jsonify(problems), 200


@problem_bp.route('/<problem_id>', methods=['GET'])
@require_auth
def get_problem(problem_id):
    """Get a specific problem by ID"""
    db = get_db()
    
    try:
        problem = db.problems.find_one({'_id': ObjectId(problem_id)})
    except:
        return jsonify({'error': 'Invalid problem ID'}), 400
    
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    # Check access: admin can see all, students only published
    if g.user_role != 'admin' and not problem.get('is_published', False):
        return jsonify({'error': 'Access denied'}), 403
    
    problem['_id'] = str(problem['_id'])
    problem['can_edit'] = g.user_role == 'admin'
    problem['can_delete'] = g.user_role == 'admin'
    
    # Hide grading criteria from students
    if g.user_role != 'admin':
        problem.pop('grading_criteria', None)
    
    # Get user's submission if exists
    user_submission = db.problem_submissions.find_one({
        'problem_id': problem_id,
        'user_id': g.user_id
    })
    if user_submission:
        user_submission['_id'] = str(user_submission['_id'])
        problem['my_submission'] = user_submission
    
    return jsonify(problem), 200


@problem_bp.route('/', methods=['POST'])
@require_auth
@require_admin
def create_problem():
    """
    Create a new problem (Admin only)
    POST /api/problems
    Body: {title, description, grading_criteria, max_score, difficulty, tags, is_published}
    """
    db = get_db()
    data = request.get_json()
    
    # Validate required fields
    if not data.get('title'):
        return jsonify({'error': 'Problem title is required'}), 400
    
    if not data.get('description'):
        return jsonify({'error': 'Problem description is required'}), 400
    
    if not data.get('grading_criteria'):
        return jsonify({'error': 'Grading criteria is required'}), 400
    
    # Sanitize input
    title = str(data['title']).strip()[:200]
    description = str(data['description']).strip()[:10000]
    grading_criteria = str(data['grading_criteria']).strip()[:5000]
    
    problem_data = create_problem_schema(
        title=title,
        created_by=g.user_id,
        description=description,
        grading_criteria=grading_criteria,
        max_score=int(data.get('max_score', 100)),
        difficulty=data.get('difficulty', 'medium'),
        tags=data.get('tags', []),
        is_published=data.get('is_published', True)
    )
    
    result = db.problems.insert_one(problem_data)
    problem_data['_id'] = str(result.inserted_id)
    
    logger.info(f"Problem created: {problem_data['_id']} by admin {g.user_id}")
    
    return jsonify(problem_data), 201


@problem_bp.route('/<problem_id>', methods=['PUT'])
@require_auth
@require_admin
def update_problem(problem_id):
    """Update a problem (Admin only)"""
    db = get_db()
    data = request.get_json()
    
    try:
        problem = db.problems.find_one({'_id': ObjectId(problem_id)})
    except:
        return jsonify({'error': 'Invalid problem ID'}), 400
    
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    # Update allowed fields
    allowed_fields = ['title', 'description', 'grading_criteria', 'max_score', 
                      'difficulty', 'tags', 'is_published']
    update_data = {}
    
    for field in allowed_fields:
        if field in data:
            if field in ['title', 'description', 'grading_criteria']:
                update_data[field] = str(data[field]).strip()
            elif field == 'max_score':
                update_data[field] = int(data[field])
            else:
                update_data[field] = data[field]
    
    update_data['updated_at'] = datetime.utcnow()
    
    db.problems.update_one(
        {'_id': ObjectId(problem_id)},
        {'$set': update_data}
    )
    
    problem = db.problems.find_one({'_id': ObjectId(problem_id)})
    problem['_id'] = str(problem['_id'])
    
    logger.info(f"Problem updated: {problem_id} by admin {g.user_id}")
    
    return jsonify(problem), 200


@problem_bp.route('/<problem_id>', methods=['DELETE'])
@require_auth
@require_admin
def delete_problem(problem_id):
    """Delete a problem and all its submissions (Admin only)"""
    db = get_db()
    
    try:
        problem = db.problems.find_one({'_id': ObjectId(problem_id)})
    except:
        return jsonify({'error': 'Invalid problem ID'}), 400
    
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    # Delete all submissions for this problem
    deleted_submissions = db.problem_submissions.delete_many({'problem_id': problem_id})
    
    # Delete the problem
    db.problems.delete_one({'_id': ObjectId(problem_id)})
    
    logger.info(f"Problem deleted: {problem_id}, {deleted_submissions.deleted_count} submissions removed")
    
    return jsonify({
        'message': 'Problem deleted successfully',
        'submissions_deleted': deleted_submissions.deleted_count
    }), 200


# ==================== SUBMISSIONS ====================

@problem_bp.route('/<problem_id>/submit', methods=['POST'])
@require_auth
def submit_problem(problem_id):
    """
    Submit a solution to a problem
    POST /api/problems/<problem_id>/submit
    Body: {submission_text, language}
    
    Flow:
    1. Validate problem exists
    2. Create submission with status=pending
    3. Call Gemini API to grade
    4. Update submission with score and feedback
    5. Return result
    """
    db = get_db()
    data = request.get_json()
    
    # Validate problem
    try:
        problem = db.problems.find_one({'_id': ObjectId(problem_id)})
    except:
        return jsonify({'error': 'Invalid problem ID'}), 400
    
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    if not problem.get('is_published', False) and g.user_role != 'admin':
        return jsonify({'error': 'Problem not available'}), 403
    
    # Validate submission
    submission_text = data.get('submission_text', '').strip()
    if not submission_text:
        return jsonify({'error': 'Submission text is required'}), 400
    
    if len(submission_text) > 50000:
        return jsonify({'error': 'Submission too long (max 50000 characters)'}), 400
    
    # Get user info
    user = db.users.find_one({'_id': ObjectId(g.user_id)})
    student_name = user.get('name', user.get('email', 'Unknown'))
    
    # Check if user already submitted (optional: allow multiple submissions)
    existing_submission = db.problem_submissions.find_one({
        'problem_id': problem_id,
        'user_id': g.user_id
    })
    
    if existing_submission:
        # Update existing submission
        submission_id = existing_submission['_id']
        db.problem_submissions.update_one(
            {'_id': submission_id},
            {'$set': {
                'submission_text': submission_text,
                'language': data.get('language', 'none'),
                'status': 'grading',
                'score': None,
                'feedback': None,
                'submitted_at': datetime.utcnow()
            }}
        )
        logger.info(f"Submission updated: {submission_id} for problem {problem_id}")
    else:
        # Create new submission
        submission_data = create_problem_submission_schema(
            problem_id=problem_id,
            user_id=g.user_id,
            student_name=student_name,
            submission_text=submission_text,
            language=data.get('language', 'none')
        )
        submission_data['status'] = 'grading'
        
        result = db.problem_submissions.insert_one(submission_data)
        submission_id = result.inserted_id
        logger.info(f"New submission created: {submission_id} for problem {problem_id}")
    
    # Grade with Gemini API
    try:
        score, feedback = grade_with_gemini(
            problem_title=problem['title'],
            problem_description=problem['description'],
            grading_criteria=problem['grading_criteria'],
            max_score=problem.get('max_score', 100),
            submission_text=submission_text,
            language=data.get('language', 'none')
        )
        
        # Update submission with grade
        db.problem_submissions.update_one(
            {'_id': submission_id},
            {'$set': {
                'status': 'graded',
                'score': score,
                'feedback': feedback,
                'graded_at': datetime.utcnow()
            }}
        )
        
        logger.info(f"Submission graded: {submission_id}, score: {score}")
        
    except Exception as e:
        logger.error(f"Grading error for submission {submission_id}: {str(e)}")
        
        # Mark as error but keep submission
        db.problem_submissions.update_one(
            {'_id': submission_id},
            {'$set': {
                'status': 'error',
                'feedback': f'Grading failed: {str(e)}. Please try again later.'
            }}
        )
        
        return jsonify({
            'error': 'Grading failed',
            'message': str(e),
            'submission_id': str(submission_id)
        }), 500
    
    # Return result
    submission = db.problem_submissions.find_one({'_id': submission_id})
    submission['_id'] = str(submission['_id'])
    
    return jsonify(submission), 200


@problem_bp.route('/submissions/<submission_id>', methods=['GET'])
@require_auth
def get_submission(submission_id):
    """
    Get submission details with score and feedback
    GET /api/problems/submissions/<submission_id>
    """
    db = get_db()
    
    try:
        submission = db.problem_submissions.find_one({'_id': ObjectId(submission_id)})
    except:
        return jsonify({'error': 'Invalid submission ID'}), 400
    
    if not submission:
        return jsonify({'error': 'Submission not found'}), 404
    
    # Check access: only owner or admin can view
    if submission['user_id'] != g.user_id and g.user_role != 'admin':
        return jsonify({'error': 'Access denied'}), 403
    
    submission['_id'] = str(submission['_id'])
    
    # Add problem info
    problem = db.problems.find_one({'_id': ObjectId(submission['problem_id'])})
    if problem:
        submission['problem'] = {
            '_id': str(problem['_id']),
            'title': problem['title'],
            'max_score': problem.get('max_score', 100)
        }
    
    return jsonify(submission), 200


@problem_bp.route('/<problem_id>/submissions', methods=['GET'])
@require_auth
@require_admin
def get_problem_submissions(problem_id):
    """
    Get all submissions for a problem (Admin only)
    GET /api/problems/<problem_id>/submissions
    """
    db = get_db()
    
    try:
        problem = db.problems.find_one({'_id': ObjectId(problem_id)})
    except:
        return jsonify({'error': 'Invalid problem ID'}), 400
    
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404
    
    submissions = list(db.problem_submissions.find({'problem_id': problem_id}).sort('submitted_at', -1))
    
    for sub in submissions:
        sub['_id'] = str(sub['_id'])
        
        # Add user info
        try:
            user = db.users.find_one({'_id': ObjectId(sub['user_id'])})
            if user:
                sub['user'] = {
                    'name': user.get('name', ''),
                    'email': user.get('email', ''),
                    'avatar_url': user.get('avatar_url', '')
                }
        except:
            pass
    
    return jsonify({
        'problem': {
            '_id': str(problem['_id']),
            'title': problem['title'],
            'max_score': problem.get('max_score', 100)
        },
        'submissions': submissions,
        'total': len(submissions)
    }), 200


@problem_bp.route('/my-submissions', methods=['GET'])
@require_auth
def get_my_submissions():
    """Get all submissions by current user"""
    db = get_db()
    
    submissions = list(db.problem_submissions.find({'user_id': g.user_id}).sort('submitted_at', -1))
    
    for sub in submissions:
        sub['_id'] = str(sub['_id'])
        
        # Add problem info
        try:
            problem = db.problems.find_one({'_id': ObjectId(sub['problem_id'])})
            if problem:
                sub['problem'] = {
                    '_id': str(problem['_id']),
                    'title': problem['title'],
                    'max_score': problem.get('max_score', 100)
                }
        except:
            pass
    
    return jsonify(submissions), 200


# ==================== GEMINI GRADING ====================

def grade_with_gemini(problem_title, problem_description, grading_criteria, max_score, submission_text, language='python'):
    """
    Call Google Gemini API to grade a submission
    Returns: (score: int, feedback: str)
    """
    import requests
    
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable not set")
    
    # Construct grading prompt based on language type
    if language == 'none':
        # For non-code submissions (essays, English, etc.)
        prompt = f"""You are an expert teacher and grader. Grade the following student submission.

## Problem Title
{problem_title}

## Problem Description
{problem_description}

## Grading Criteria
{grading_criteria}

## Maximum Score
{max_score} points

## Student Submission
{submission_text}

## Instructions
1. Analyze the submission based on the grading criteria
2. Check for content quality, accuracy, grammar, and completeness
3. Provide a score from 0 to {max_score}
4. Provide detailed, constructive feedback in Vietnamese

## Response Format (JSON)
Return ONLY a valid JSON object with no additional text:
{{
    "score": <integer from 0 to {max_score}>,
    "feedback": "<detailed feedback in Vietnamese, including what was done well and areas for improvement>"
}}
"""
    else:
        # For code submissions
        prompt = f"""You are an expert programming instructor and grader. Grade the following student submission.

## Problem Title
{problem_title}

## Problem Description
{problem_description}

## Grading Criteria
{grading_criteria}

## Maximum Score
{max_score} points

## Programming Language
{language}

## Student Submission
```{language}
{submission_text}
```

## Instructions
1. Analyze the submission based on the grading criteria
2. Check for correctness, code quality, efficiency, and best practices
3. Provide a score from 0 to {max_score}
4. Provide detailed, constructive feedback in Vietnamese

## Response Format (JSON)
Return ONLY a valid JSON object with no additional text:
{{
    "score": <integer from 0 to {max_score}>,
    "feedback": "<detailed feedback in Vietnamese, including what was done well and areas for improvement>"
}}
"""

    # Call Gemini API
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
    
    headers = {
        'Content-Type': 'application/json'
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 2000
        }
    }
    
    response = requests.post(url, headers=headers, json=payload, timeout=60)
    
    if response.status_code != 200:
        logger.error(f"Gemini API error: {response.status_code} - {response.text}")
        raise Exception(f"Gemini API returned status {response.status_code}")
    
    result = response.json()
    
    # Extract text from response
    try:
        text = result['candidates'][0]['content']['parts'][0]['text']
        
        # Parse JSON from response
        import json
        import re
        
        # Try to extract JSON from the response
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            grade_data = json.loads(json_match.group())
            score = int(grade_data.get('score', 0))
            feedback = grade_data.get('feedback', 'No feedback provided')
            
            # Validate score range
            score = max(0, min(score, max_score))
            
            return score, feedback
        else:
            raise ValueError("Could not parse JSON from Gemini response")
            
    except (KeyError, IndexError, json.JSONDecodeError) as e:
        logger.error(f"Error parsing Gemini response: {e}")
        logger.error(f"Response text: {text if 'text' in dir() else 'N/A'}")
        raise Exception(f"Failed to parse grading response: {str(e)}")
