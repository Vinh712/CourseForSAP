"""
Script để kiểm tra password trong MongoDB
Chạy: python check_password.py
"""

import hashlib
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# Kết nối MongoDB
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/nls_studio')
client = MongoClient(MONGO_URI)
db = client.get_database()

def hash_password(password, salt):
    """Hash password với salt"""
    password_hash = hashlib.sha256(f"{password}{salt}".encode()).hexdigest()
    return password_hash

def check_user_password(email, test_passwords):
    """Kiểm tra password cho user"""
    user = db.users.find_one({'email': email})
    
    if not user:
        print(f"❌ User '{email}' không tồn tại!")
        return
    
    print(f"\n📧 User: {email}")
    print(f"👤 Name: {user.get('name', 'N/A')}")
    print(f"🔑 Role: {user.get('role', 'N/A')}")
    print(f"\n🔐 Stored Hash: {user.get('password_hash', 'N/A')}")
    print(f"🧂 Stored Salt: {user.get('password_salt', 'N/A')}")
    
    stored_hash = user.get('password_hash', '')
    stored_salt = user.get('password_salt', '')
    
    if not stored_hash or not stored_salt:
        print("\n⚠️  User không có password_hash hoặc password_salt!")
        return
    
    print(f"\n🔍 Kiểm tra các password:")
    print("-" * 50)
    
    for pwd in test_passwords:
        computed_hash = hash_password(pwd, stored_salt)
        match = "✅ KHỚP!" if computed_hash == stored_hash else "❌ Không khớp"
        print(f"  '{pwd}' → {match}")
        if computed_hash == stored_hash:
            print(f"\n🎉 PASSWORD ĐÚNG LÀ: {pwd}")
            return pwd
    
    print("\n❌ Không tìm thấy password khớp trong danh sách test")
    return None

def reset_password(email, new_password):
    """Reset password cho user"""
    import secrets
    salt = secrets.token_hex(16)
    password_hash = hash_password(new_password, salt)
    
    result = db.users.update_one(
        {'email': email},
        {'$set': {
            'password_hash': password_hash,
            'password_salt': salt
        }}
    )
    
    if result.modified_count > 0:
        print(f"\n✅ Đã reset password cho {email}")
        print(f"   New password: {new_password}")
        print(f"   New hash: {password_hash}")
        print(f"   New salt: {salt}")
    else:
        print(f"\n❌ Không thể reset password cho {email}")

def list_all_users():
    """Liệt kê tất cả users"""
    users = db.users.find({}, {'email': 1, 'name': 1, 'role': 1, 'password_hash': 1, 'password_salt': 1})
    
    print("\n📋 Danh sách users:")
    print("-" * 70)
    for user in users:
        has_hash = "✅" if user.get('password_hash') else "❌"
        has_salt = "✅" if user.get('password_salt') else "❌"
        print(f"  {user.get('email', 'N/A'):30} | {user.get('role', 'N/A'):10} | Hash: {has_hash} | Salt: {has_salt}")


if __name__ == "__main__":
    print("=" * 60)
    print("🔐 NLS STUDIO - Password Checker")
    print("=" * 60)
    
    # Liệt kê users
    list_all_users()
    
    # Test password cho user cụ thể
    email = "vinhdam@nls.studio"
    test_passwords = [
        "vinhdam123",
        "admin123", 
        "123456",
        "password",
        "vinhdam",
        "nls123",
        "12345678"
    ]
    
    print("\n" + "=" * 60)
    check_user_password(email, test_passwords)
    
    # Uncomment dòng dưới để reset password
    # reset_password("vinhdam@nls.studio", "newpassword123")
