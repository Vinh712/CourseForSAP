"""
NLS Studio LMS - Backend Application
Flask + MongoDB Atlas + JWT Auth + Cloudinary
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from database import init_db

# Import routes
from routes.auth_routes import auth_bp
from routes.class_routes import class_bp
from routes.course_routes import course_bp
from routes.assignment_routes import assignment_bp
from routes.schedule_routes import schedule_bp
from routes.upload_routes import upload_bp
from routes.admin_routes import admin_bp
from routes.quiz_routes import quiz_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Enable CORS with all necessary headers
    CORS(app, 
         origins=Config.CORS_ORIGINS, 
         supports_credentials=True,
         allow_headers=['Content-Type', 'Authorization'],
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    )
    
    # Initialize database
    init_db(app)
    
    # Create default admin account
    from utils.auth import create_default_admin
    create_default_admin()
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(class_bp, url_prefix='/api/classes')
    app.register_blueprint(course_bp, url_prefix='/api/courses')
    app.register_blueprint(assignment_bp, url_prefix='/api/assignments')
    app.register_blueprint(schedule_bp, url_prefix='/api/schedule')
    app.register_blueprint(upload_bp, url_prefix='/api/upload')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(quiz_bp, url_prefix='/api/quizzes')
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'healthy', 'message': 'NLS Studio LMS API is running'}
    
    return app


app = create_app()

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
