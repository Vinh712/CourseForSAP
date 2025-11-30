"""
Clerk JWT verification utility
"""

import jwt
import requests
from functools import wraps
from flask import request, jsonify, g
from config import Config


def get_clerk_jwks():
    """Fetch Clerk's JWKS (JSON Web Key Set)"""
    try:
        issuer = Config.CLERK_JWT_ISSUER
        if not issuer:
            return None
        jwks_url = f"{issuer}/.well-known/jwks.json"
        response = requests.get(jwks_url)
        return response.json()
    except Exception as e:
        print(f"Error fetching JWKS: {e}")
        return None


def verify_clerk_token(token):
    """Verify Clerk JWT token"""
    try:
        issuer = Config.CLERK_JWT_ISSUER
        
        # For development, allow bypass if no issuer configured
        if not issuer:
            # Return mock user for development
            return {
                'sub': 'dev_user_123',
                'email': 'dev@example.com',
                'name': 'Dev User'
            }
        
        # Get JWKS
        jwks = get_clerk_jwks()
        if not jwks:
            return None
        
        # Get the unverified header to find the key id
        unverified_header = jwt.get_unverified_header(token)
        
        # Find the matching key
        rsa_key = None
        for key in jwks.get('keys', []):
            if key['kid'] == unverified_header['kid']:
                rsa_key = jwt.algorithms.RSAAlgorithm.from_jwk(key)
                break
        
        if not rsa_key:
            return None
        
        # Verify and decode the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=['RS256'],
            issuer=issuer,
            options={"verify_aud": False}
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Invalid token: {e}")
        return None
    except Exception as e:
        print(f"Token verification error: {e}")
        return None


def get_user_role(user_id):
    """Get user role from database"""
    from database import get_db
    db = get_db()
    user = db.users.find_one({'clerk_id': user_id})
    if user:
        return user.get('role', 'student')
    return 'student'


def require_auth(f):
    """Decorator to require authentication on routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return jsonify({'error': 'Authorization header missing'}), 401
        
        # Extract token from "Bearer <token>"
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({'error': 'Invalid authorization header format'}), 401
        
        token = parts[1]
        
        # Verify token
        payload = verify_clerk_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Store user info in Flask's g object
        g.user_id = payload.get('sub')
        g.user_email = payload.get('email')
        g.user_name = payload.get('name', '')
        g.user_role = get_user_role(g.user_id)
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user_role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function


def require_teacher(f):
    """Decorator to require teacher or admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if g.user_role not in ['teacher', 'admin']:
            return jsonify({'error': 'Teacher access required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function


def optional_auth(f):
    """Decorator for optional authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        g.user_id = None
        g.user_email = None
        g.user_name = None
        
        if auth_header:
            parts = auth_header.split()
            if len(parts) == 2 and parts[0].lower() == 'bearer':
                payload = verify_clerk_token(parts[1])
                if payload:
                    g.user_id = payload.get('sub')
                    g.user_email = payload.get('email')
                    g.user_name = payload.get('name', '')
        
        return f(*args, **kwargs)
    
    return decorated_function
