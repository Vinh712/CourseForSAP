"""
Script tạo admin user trực tiếp vào MongoDB
Chạy: python create_admin.py
"""

import hashlib
import secrets
from datetime import datetime
from pymongo import MongoClient
import os

# MongoDB URI - thay bằng URI của bạn nếu cần
MONGO_URI = os.getenv('MONGODB_URI', 'mongodb+srv://sapngu:sapngungu@cluster0.5ulomev.mongodb.net')
DB_NAME = os.getenv('MONGODB_DB_NAME', 'sapngu')

def hash_password(password, salt=None):
    """Hash password với salt"""
    if salt is None:
        salt = secrets.token_hex(16)
    password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return password_hash, salt

def create_admin():
    print("🔗 Đang kết nối MongoDB...")
    
    try:
        client = MongoClient(MONGO_URI)
        db = client[DB_NAME]
        
        # Test connection
        client.admin.command('ping')
        print("✅ Kết nối MongoDB thành công!")
        
    except Exception as e:
        print(f"❌ Lỗi kết nối MongoDB: {e}")
        return
    
    # Thông tin admin mới
    admin_email = "admin@nls.studio"
    admin_password = "admin123"
    admin_name = "Administrator"
    
    # Kiểm tra admin đã tồn tại chưa
    existing = db.users.find_one({'email': admin_email})
    
    if existing:
        print(f"⚠️  User '{admin_email}' đã tồn tại. Đang reset password...")
        
        # Reset password
        password_hash, salt = hash_password(admin_password)
        db.users.update_one(
            {'email': admin_email},
            {'$set': {
                'password_hash': password_hash,
                'password_salt': salt,
                'role': 'admin',
                'updated_at': datetime.utcnow()
            }}
        )
        print(f"✅ Đã reset password cho {admin_email}")
    else:
        # Tạo mới
        password_hash, salt = hash_password(admin_password)
        
        admin_data = {
            'email': admin_email,
            'password_hash': password_hash,
            'password_salt': salt,
            'name': admin_name,
            'role': 'admin',
            'avatar_url': '',
            'classes': [],
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'created_by': None
        }
        
        db.users.insert_one(admin_data)
        print(f"✅ Đã tạo admin mới!")
    
    print("\n" + "=" * 50)
    print("🔐 THÔNG TIN ĐĂNG NHẬP:")
    print("=" * 50)
    print(f"   Email:    {admin_email}")
    print(f"   Password: {admin_password}")
    print("=" * 50)
    
    # Liệt kê tất cả users
    print("\n📋 Danh sách users trong database:")
    users = db.users.find({}, {'email': 1, 'name': 1, 'role': 1})
    for user in users:
        print(f"   - {user.get('email')} ({user.get('role')})")
    
    client.close()

if __name__ == "__main__":
    create_admin()
