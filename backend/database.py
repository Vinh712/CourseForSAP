"""
Database connection and initialization for MongoDB Atlas
"""

from pymongo import MongoClient
from config import Config

# Global database instance
db = None
client = None


def init_db(app=None):
    """Initialize MongoDB connection"""
    global db, client
    
    try:
        client = MongoClient(Config.MONGODB_URI)
        db = client[Config.MONGODB_DB_NAME]
        
        # Create indexes for better performance
        _create_indexes()
        
        print(f"✅ Connected to MongoDB: {Config.MONGODB_DB_NAME}")
        return db
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        raise e


def _create_indexes():
    """Create necessary indexes for collections"""
    global db
    
    if db is None:
        return
    
    # Users collection indexes - email must be unique
    db.users.create_index("email", unique=True)
    
    # Classes collection indexes
    db.classes.create_index("code", unique=True)
    db.classes.create_index("created_by")
    
    # Courses collection indexes
    db.courses.create_index("class_id")
    
    # Assignments collection indexes
    db.assignments.create_index("class_id")
    db.assignments.create_index("due_date")
    
    # Submissions collection indexes
    db.submissions.create_index([("assignment_id", 1), ("user_id", 1)], unique=True)
    
    # Schedule collection indexes
    db.schedule.create_index("user_id")
    db.schedule.create_index("date")
    
    # Media files collection indexes
    db.media_files.create_index("user_id")


def get_db():
    """Get database instance"""
    global db
    if db is None:
        init_db()
    return db
