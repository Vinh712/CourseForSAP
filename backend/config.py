"""
Configuration settings for NLS Studio LMS Backend
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Application configuration"""
    
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    # MongoDB Atlas
    MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb://localhost:27017')
    MONGODB_DB_NAME = os.getenv('MONGODB_DB_NAME', 'nls_studio_lms')
    
    # Clerk Authentication
    CLERK_SECRET_KEY = os.getenv('CLERK_SECRET_KEY', '')
    CLERK_PUBLISHABLE_KEY = os.getenv('CLERK_PUBLISHABLE_KEY', '')
    CLERK_JWT_ISSUER = os.getenv('CLERK_JWT_ISSUER', '')
    
    # Cloudinary
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', '')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', '')
    
    # CORS - Allow multiple frontend ports during development and production
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,https://www.sapcenter.vn,https://sapcenter.vn').split(',')
    
    # JWT Secret for custom auth
    JWT_SECRET = os.getenv('JWT_SECRET', 'nls-studio-secret-key-change-in-production')
