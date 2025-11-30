"""
Clerk Webhook Routes
Handles webhook events from Clerk for user synchronization
"""

from flask import Blueprint, request, jsonify
from database import get_db
from datetime import datetime
import hmac
import hashlib
import json
import os

webhook_bp = Blueprint('webhook', __name__)


def verify_webhook_signature(payload, signature, secret):
    """
    Verify Clerk webhook signature using Svix
    """
    if not secret:
        return False
    
    # Clerk uses Svix for webhooks
    # The signature format is: v1,timestamp,signature
    try:
        # For development, you can skip verification
        if os.getenv('FLASK_DEBUG') == 'True':
            return True
            
        # Parse Svix headers
        svix_id = request.headers.get('svix-id')
        svix_timestamp = request.headers.get('svix-timestamp')
        svix_signature = request.headers.get('svix-signature')
        
        if not all([svix_id, svix_timestamp, svix_signature]):
            return False
        
        # Construct the signed payload
        signed_payload = f"{svix_id}.{svix_timestamp}.{payload}"
        
        # Calculate expected signature
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            signed_payload.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        # Compare signatures (Svix signature format: v1,signature)
        signatures = svix_signature.split(' ')
        for sig in signatures:
            if sig.startswith('v1,'):
                actual_sig = sig[3:]
                if hmac.compare_digest(expected_signature, actual_sig):
                    return True
        
        return False
    except Exception as e:
        print(f"Webhook signature verification error: {e}")
        return False


@webhook_bp.route('', methods=['POST'])
def clerk_webhook():
    """
    Handle Clerk webhook events
    Supported events:
    - user.created: Create new user in MongoDB
    - user.updated: Update user data in MongoDB
    - user.deleted: Delete user from MongoDB
    """
    try:
        # Get raw payload
        payload = request.get_data(as_text=True)
        signature = request.headers.get('svix-signature', '')
        webhook_secret = os.getenv('CLERK_WEBHOOK_SECRET', '')
        
        # Verify signature in production
        if not os.getenv('FLASK_DEBUG') == 'True':
            if not verify_webhook_signature(payload, signature, webhook_secret):
                return jsonify({'error': 'Invalid signature'}), 401
        
        # Parse JSON payload
        data = json.loads(payload)
        event_type = data.get('type')
        event_data = data.get('data', {})
        
        print(f"Received Clerk webhook: {event_type}")
        
        if event_type == 'user.created':
            return handle_user_created(event_data)
        elif event_type == 'user.updated':
            return handle_user_updated(event_data)
        elif event_type == 'user.deleted':
            return handle_user_deleted(event_data)
        else:
            # Acknowledge other events
            return jsonify({'message': f'Event {event_type} received'}), 200
            
    except Exception as e:
        print(f"Webhook error: {e}")
        return jsonify({'error': str(e)}), 500


def handle_user_created(data):
    """
    Handle user.created event
    Creates a new user in MongoDB with default role 'student'
    """
    try:
        clerk_id = data.get('id')
        email_addresses = data.get('email_addresses', [])
        primary_email = next(
            (e['email_address'] for e in email_addresses if e.get('id') == data.get('primary_email_address_id')),
            email_addresses[0]['email_address'] if email_addresses else None
        )
        
        if not clerk_id or not primary_email:
            return jsonify({'error': 'Missing required user data'}), 400
        
        db = get_db()
        
        # Check if user already exists
        existing_user = db.users.find_one({'clerk_id': clerk_id})
        if existing_user:
            return jsonify({'message': 'User already exists'}), 200
        
        # Create new user
        new_user = {
            'clerk_id': clerk_id,
            'email': primary_email,
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'full_name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            'avatar_url': data.get('image_url', ''),
            'role': 'student',  # Default role
            'classes': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'last_login': datetime.utcnow(),
            'metadata': {
                'clerk_created_at': data.get('created_at'),
                'phone_numbers': data.get('phone_numbers', []),
                'username': data.get('username'),
                'external_accounts': data.get('external_accounts', [])
            }
        }
        
        result = db.users.insert_one(new_user)
        print(f"Created user: {primary_email} with clerk_id: {clerk_id}")
        
        return jsonify({
            'message': 'User created successfully',
            'user_id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"Error creating user: {e}")
        return jsonify({'error': str(e)}), 500


def handle_user_updated(data):
    """
    Handle user.updated event
    Updates user data in MongoDB
    """
    try:
        clerk_id = data.get('id')
        if not clerk_id:
            return jsonify({'error': 'Missing clerk_id'}), 400
        
        email_addresses = data.get('email_addresses', [])
        primary_email = next(
            (e['email_address'] for e in email_addresses if e.get('id') == data.get('primary_email_address_id')),
            email_addresses[0]['email_address'] if email_addresses else None
        )
        
        # Prepare update data
        update_data = {
            'updated_at': datetime.utcnow(),
            'first_name': data.get('first_name', ''),
            'last_name': data.get('last_name', ''),
            'full_name': f"{data.get('first_name', '')} {data.get('last_name', '')}".strip(),
            'avatar_url': data.get('image_url', ''),
            'metadata.username': data.get('username'),
            'metadata.phone_numbers': data.get('phone_numbers', [])
        }
        
        if primary_email:
            update_data['email'] = primary_email
        
        db = get_db()
        result = db.users.update_one(
            {'clerk_id': clerk_id},
            {'$set': update_data}
        )
        
        if result.matched_count == 0:
            # User doesn't exist, create them
            print(f"User not found, creating: {clerk_id}")
            return handle_user_created(data)
        
        print(f"Updated user with clerk_id: {clerk_id}")
        
        return jsonify({
            'message': 'User updated successfully',
            'modified_count': result.modified_count
        }), 200
        
    except Exception as e:
        print(f"Error updating user: {e}")
        return jsonify({'error': str(e)}), 500


def handle_user_deleted(data):
    """
    Handle user.deleted event
    Removes user from MongoDB and cleans up references
    """
    try:
        clerk_id = data.get('id')
        if not clerk_id:
            return jsonify({'error': 'Missing clerk_id'}), 400
        
        db = get_db()
        
        # Find user first
        user = db.users.find_one({'clerk_id': clerk_id})
        if not user:
            return jsonify({'message': 'User not found'}), 200
        
        user_id = user['_id']
        
        # Remove user from all classes
        db.classes.update_many(
            {},
            {
                '$pull': {
                    'students': user_id,
                    'teachers': user_id
                }
            }
        )
        
        # Delete user's assignments submissions
        db.submissions.delete_many({'student_id': user_id})
        
        # Delete user
        result = db.users.delete_one({'clerk_id': clerk_id})
        
        print(f"Deleted user with clerk_id: {clerk_id}")
        
        return jsonify({
            'message': 'User deleted successfully',
            'deleted_count': result.deleted_count
        }), 200
        
    except Exception as e:
        print(f"Error deleting user: {e}")
        return jsonify({'error': str(e)}), 500


@webhook_bp.route('/test', methods=['POST'])
def test_webhook():
    """
    Test endpoint to manually trigger webhook events (development only)
    """
    if not os.getenv('FLASK_DEBUG') == 'True':
        return jsonify({'error': 'Only available in development'}), 403
    
    try:
        data = request.get_json()
        event_type = data.get('type')
        event_data = data.get('data', {})
        
        if event_type == 'user.created':
            return handle_user_created(event_data)
        elif event_type == 'user.updated':
            return handle_user_updated(event_data)
        elif event_type == 'user.deleted':
            return handle_user_deleted(event_data)
        else:
            return jsonify({'error': 'Unknown event type'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
