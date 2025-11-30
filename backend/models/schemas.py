"""
Schema templates for MongoDB collections
These are dict-based schema templates for reference
"""

from datetime import datetime
from bson import ObjectId


def create_user_schema(clerk_id, email, **kwargs):
    """User document schema"""
    return {
        '_id': ObjectId(),
        'clerk_id': clerk_id,
        'email': email,
        'name': kwargs.get('name', ''),
        'avatar_url': kwargs.get('avatar_url', ''),
        'bio': kwargs.get('bio', ''),
        'role': kwargs.get('role', 'student'),  # student, teacher, admin
        'enrolled_classes': [],  # List of class IDs
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }


def create_class_schema(name, code, created_by, **kwargs):
    """Class document schema"""
    return {
        '_id': ObjectId(),
        'name': name,
        'code': code,
        'description': kwargs.get('description', ''),
        'cover_image': kwargs.get('cover_image', ''),
        'color': kwargs.get('color', '#6366f1'),
        'created_by': created_by,  # User ID
        'teachers': [created_by],  # List of teacher user IDs
        'students': [],  # List of student user IDs
        'courses': [],  # List of course IDs
        'is_active': True,
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }


def create_course_schema(class_id, title, **kwargs):
    """Course/Module document schema"""
    return {
        '_id': ObjectId(),
        'class_id': class_id,
        'title': title,
        'description': kwargs.get('description', ''),
        'order': kwargs.get('order', 0),
        'modules': [],  # List of module objects
        'is_published': kwargs.get('is_published', False),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }


def create_module_schema(title, **kwargs):
    """Module schema (embedded in course)"""
    return {
        'id': str(ObjectId()),
        'title': title,
        'content': kwargs.get('content', ''),
        'content_type': kwargs.get('content_type', 'text'),  # text, video, file, document, quiz
        'media_url': kwargs.get('media_url', ''),
        'attachments': kwargs.get('attachments', []),  # List of {name, url, type, size}
        'quiz_id': kwargs.get('quiz_id'),  # Reference to quiz if content_type is quiz
        'duration': kwargs.get('duration', 0),
        'order': kwargs.get('order', 0),
        'is_published': kwargs.get('is_published', False)
    }


def create_quiz_schema(class_id, course_id, title, created_by, **kwargs):
    """Quiz document schema"""
    return {
        '_id': ObjectId(),
        'class_id': class_id,
        'course_id': course_id,
        'title': title,
        'description': kwargs.get('description', ''),
        'questions': kwargs.get('questions', []),  # List of question objects
        'time_limit': kwargs.get('time_limit', 0),  # In minutes, 0 = no limit
        'passing_score': kwargs.get('passing_score', 60),  # Percentage
        'max_attempts': kwargs.get('max_attempts', 1),
        'shuffle_questions': kwargs.get('shuffle_questions', False),
        'show_answers': kwargs.get('show_answers', True),  # Show correct answers after submission
        'created_by': created_by,
        'is_published': kwargs.get('is_published', False),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }


def create_question_schema(question_text, question_type, **kwargs):
    """Question schema (embedded in quiz)"""
    return {
        'id': str(ObjectId()),
        'question_text': question_text,
        'question_type': question_type,  # multiple_choice, true_false, short_answer
        'options': kwargs.get('options', []),  # List of {id, text, is_correct}
        'correct_answer': kwargs.get('correct_answer', ''),  # For short_answer
        'points': kwargs.get('points', 1),
        'explanation': kwargs.get('explanation', ''),
        'order': kwargs.get('order', 0)
    }


def create_quiz_attempt_schema(quiz_id, user_id, **kwargs):
    """Quiz attempt document schema"""
    return {
        '_id': ObjectId(),
        'quiz_id': quiz_id,
        'user_id': user_id,
        'answers': kwargs.get('answers', []),  # List of {question_id, answer, is_correct}
        'score': kwargs.get('score', 0),
        'total_points': kwargs.get('total_points', 0),
        'percentage': kwargs.get('percentage', 0),
        'passed': kwargs.get('passed', False),
        'time_taken': kwargs.get('time_taken', 0),  # In seconds
        'started_at': datetime.utcnow(),
        'completed_at': kwargs.get('completed_at'),
        'status': 'in_progress'  # in_progress, completed
    }


def create_assignment_schema(class_id, title, created_by, **kwargs):
    """Assignment document schema"""
    return {
        '_id': ObjectId(),
        'class_id': class_id,
        'course_id': kwargs.get('course_id'),  # Optional course reference
        'title': title,
        'description': kwargs.get('description', ''),
        'instructions': kwargs.get('instructions', ''),
        'due_date': kwargs.get('due_date'),
        'points': kwargs.get('points', 100),
        'submission_type': kwargs.get('submission_type', 'file'),  # file, text, link
        'attachments': kwargs.get('attachments', []),
        'created_by': created_by,
        'is_published': kwargs.get('is_published', False),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }


def create_submission_schema(assignment_id, user_id, **kwargs):
    """Submission document schema"""
    return {
        '_id': ObjectId(),
        'assignment_id': assignment_id,
        'user_id': user_id,
        'content': kwargs.get('content', ''),
        'attachments': kwargs.get('attachments', []),
        'submitted_at': datetime.utcnow(),
        'grade': kwargs.get('grade'),
        'feedback': kwargs.get('feedback', ''),
        'graded_by': kwargs.get('graded_by'),
        'graded_at': kwargs.get('graded_at'),
        'status': 'submitted',  # submitted, graded, returned
        'is_late': kwargs.get('is_late', False)
    }


def create_schedule_schema(user_id, title, date, **kwargs):
    """Schedule event document schema"""
    return {
        '_id': ObjectId(),
        'user_id': user_id,
        'class_id': kwargs.get('class_id'),  # Optional class reference
        'title': title,
        'description': kwargs.get('description', ''),
        'date': date,
        'start_time': kwargs.get('start_time', '09:00'),
        'end_time': kwargs.get('end_time', '10:00'),
        'event_type': kwargs.get('event_type', 'class'),  # class, assignment, exam, meeting, other
        'location': kwargs.get('location', ''),
        'is_recurring': kwargs.get('is_recurring', False),
        'recurrence_pattern': kwargs.get('recurrence_pattern'),
        'color': kwargs.get('color', '#6366f1'),
        'reminder': kwargs.get('reminder', True),
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow()
    }


def create_media_file_schema(user_id, url, public_id, **kwargs):
    """Media file document schema"""
    return {
        '_id': ObjectId(),
        'user_id': user_id,
        'url': url,
        'public_id': public_id,
        'filename': kwargs.get('filename', ''),
        'file_type': kwargs.get('file_type', 'image'),
        'mime_type': kwargs.get('mime_type', ''),
        'size': kwargs.get('size', 0),
        'width': kwargs.get('width'),
        'height': kwargs.get('height'),
        'folder': kwargs.get('folder', 'general'),
        'created_at': datetime.utcnow()
    }
