"""
Schedule management routes
"""

from flask import Blueprint, request, jsonify, g
from bson import ObjectId
from datetime import datetime, timedelta
from dateutil import parser as date_parser

from database import get_db
from utils.auth import require_auth
from models.schemas import create_schedule_schema

schedule_bp = Blueprint('schedule', __name__)


@schedule_bp.route('/', methods=['GET'])
@require_auth
def get_schedule():
    """Get schedule events for current user"""
    db = get_db()
    
    # Get query params for date range
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = {'user_id': g.user_id}
    
    if start_date:
        try:
            query['date'] = {'$gte': date_parser.parse(start_date)}
        except:
            pass
    
    if end_date:
        try:
            if 'date' in query:
                query['date']['$lte'] = date_parser.parse(end_date)
            else:
                query['date'] = {'$lte': date_parser.parse(end_date)}
        except:
            pass
    
    events = list(db.schedule.find(query).sort('date', 1))
    
    for event in events:
        event['_id'] = str(event['_id'])
        # Add class info if linked to a class
        if event.get('class_id'):
            cls = db.classes.find_one({'_id': ObjectId(event['class_id'])})
            if cls:
                event['class_name'] = cls.get('name', '')
                event['class_color'] = cls.get('color', '#6366f1')
    
    return jsonify(events), 200


@schedule_bp.route('/today', methods=['GET'])
@require_auth
def get_today_schedule():
    """Get today's schedule for current user"""
    db = get_db()
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    tomorrow = today + timedelta(days=1)
    
    events = list(db.schedule.find({
        'user_id': g.user_id,
        'date': {'$gte': today, '$lt': tomorrow}
    }).sort([('start_time', 1)]))
    
    for event in events:
        event['_id'] = str(event['_id'])
        if event.get('class_id'):
            cls = db.classes.find_one({'_id': ObjectId(event['class_id'])})
            if cls:
                event['class_name'] = cls.get('name', '')
                event['class_color'] = cls.get('color', '#6366f1')
    
    return jsonify(events), 200


@schedule_bp.route('/week', methods=['GET'])
@require_auth
def get_week_schedule():
    """Get this week's schedule for current user"""
    db = get_db()
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    # Get start of week (Monday)
    start_of_week = today - timedelta(days=today.weekday())
    end_of_week = start_of_week + timedelta(days=7)
    
    events = list(db.schedule.find({
        'user_id': g.user_id,
        'date': {'$gte': start_of_week, '$lt': end_of_week}
    }).sort([('date', 1), ('start_time', 1)]))
    
    for event in events:
        event['_id'] = str(event['_id'])
        if event.get('class_id'):
            cls = db.classes.find_one({'_id': ObjectId(event['class_id'])})
            if cls:
                event['class_name'] = cls.get('name', '')
                event['class_color'] = cls.get('color', '#6366f1')
    
    return jsonify(events), 200


@schedule_bp.route('/<event_id>', methods=['GET'])
@require_auth
def get_event(event_id):
    """Get a specific schedule event"""
    db = get_db()
    
    try:
        event = db.schedule.find_one({'_id': ObjectId(event_id)})
    except:
        return jsonify({'error': 'Invalid event ID'}), 400
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    if event['user_id'] != g.user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    event['_id'] = str(event['_id'])
    
    return jsonify(event), 200


@schedule_bp.route('/', methods=['POST'])
@require_auth
def create_event():
    """Create a new schedule event"""
    db = get_db()
    data = request.get_json()
    
    if not data.get('title'):
        return jsonify({'error': 'Event title is required'}), 400
    
    if not data.get('date'):
        return jsonify({'error': 'Event date is required'}), 400
    
    try:
        event_date = date_parser.parse(data['date'])
    except:
        return jsonify({'error': 'Invalid date format'}), 400
    
    event_data = create_schedule_schema(
        user_id=g.user_id,
        title=data['title'],
        date=event_date,
        description=data.get('description', ''),
        start_time=data.get('start_time', '09:00'),
        end_time=data.get('end_time', '10:00'),
        event_type=data.get('event_type', 'other'),
        location=data.get('location', ''),
        is_recurring=data.get('is_recurring', False),
        recurrence_pattern=data.get('recurrence_pattern'),
        color=data.get('color', '#6366f1'),
        reminder=data.get('reminder', True),
        class_id=data.get('class_id')
    )
    
    result = db.schedule.insert_one(event_data)
    event_data['_id'] = str(result.inserted_id)
    
    return jsonify(event_data), 201


@schedule_bp.route('/<event_id>', methods=['PUT'])
@require_auth
def update_event(event_id):
    """Update a schedule event"""
    db = get_db()
    data = request.get_json()
    
    try:
        event = db.schedule.find_one({'_id': ObjectId(event_id)})
    except:
        return jsonify({'error': 'Invalid event ID'}), 400
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    if event['user_id'] != g.user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    allowed_fields = ['title', 'description', 'date', 'start_time', 'end_time',
                      'event_type', 'location', 'is_recurring', 'recurrence_pattern',
                      'color', 'reminder', 'class_id']
    update_data = {}
    
    for field in allowed_fields:
        if field in data:
            if field == 'date':
                try:
                    update_data[field] = date_parser.parse(data[field])
                except:
                    return jsonify({'error': 'Invalid date format'}), 400
            else:
                update_data[field] = data[field]
    
    update_data['updated_at'] = datetime.utcnow()
    
    db.schedule.update_one(
        {'_id': ObjectId(event_id)},
        {'$set': update_data}
    )
    
    event = db.schedule.find_one({'_id': ObjectId(event_id)})
    event['_id'] = str(event['_id'])
    
    return jsonify(event), 200


@schedule_bp.route('/<event_id>', methods=['DELETE'])
@require_auth
def delete_event(event_id):
    """Delete a schedule event"""
    db = get_db()
    
    try:
        event = db.schedule.find_one({'_id': ObjectId(event_id)})
    except:
        return jsonify({'error': 'Invalid event ID'}), 400
    
    if not event:
        return jsonify({'error': 'Event not found'}), 404
    
    if event['user_id'] != g.user_id:
        return jsonify({'error': 'Access denied'}), 403
    
    db.schedule.delete_one({'_id': ObjectId(event_id)})
    
    return jsonify({'message': 'Event deleted successfully'}), 200
