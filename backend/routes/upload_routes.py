"""
File upload routes using Cloudinary
"""

from flask import Blueprint, request, jsonify, g
from datetime import datetime

from database import get_db
from utils.auth import require_auth
from utils.cloudinary_utils import upload_image, upload_video, upload_document, delete_file
from models.schemas import create_media_file_schema

upload_bp = Blueprint('upload', __name__)


@upload_bp.route('/file', methods=['POST'])
@require_auth
def upload_any_file():
    """Upload any file to Cloudinary (auto-detect type)"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        folder = request.form.get('folder', 'files')
        
        # Detect file type from mime type
        mime_type = file.content_type or ''
        print(f"Uploading file: {file.filename}, mime: {mime_type}")
        
        if mime_type.startswith('image/'):
            result = upload_image(file, folder=f"nls-studio/{folder}")
            file_type = 'image'
        elif mime_type.startswith('video/'):
            result = upload_video(file, folder=f"nls-studio/{folder}")
            file_type = 'video'
        else:
            result = upload_document(file, folder=f"nls-studio/{folder}")
            file_type = 'document'
        
        print(f"Upload result: {result}")
        
        if not result['success']:
            return jsonify({'error': result.get('error', 'Upload failed')}), 500
        
        # Save to database
        db = get_db()
        media_data = create_media_file_schema(
            user_id=g.user_id,
            url=result['url'],
            public_id=result['public_id'],
            filename=file.filename,
            file_type=file_type,
            mime_type=mime_type,
            size=result.get('bytes', 0),
            width=result.get('width'),
            height=result.get('height'),
            folder=folder
        )
        db.media_files.insert_one(media_data)
        
        return jsonify({
            'url': result['url'],
            'public_id': result['public_id'],
            'filename': file.filename,
            'file_type': file_type
        }), 200
    except Exception as e:
        print(f"Upload error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


@upload_bp.route('/image', methods=['POST'])
@require_auth
def upload_image_file():
    """Upload an image to Cloudinary"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    folder = request.form.get('folder', 'images')
    
    result = upload_image(file, folder=f"nls-studio/{folder}")
    
    if not result['success']:
        return jsonify({'error': result['error']}), 500
    
    # Save to database
    db = get_db()
    media_data = create_media_file_schema(
        user_id=g.user_id,
        url=result['url'],
        public_id=result['public_id'],
        filename=file.filename,
        file_type='image',
        mime_type=file.content_type,
        size=result.get('bytes', 0),
        width=result.get('width'),
        height=result.get('height'),
        folder=folder
    )
    db.media_files.insert_one(media_data)
    
    return jsonify({
        'url': result['url'],
        'public_id': result['public_id'],
        'filename': file.filename
    }), 200


@upload_bp.route('/video', methods=['POST'])
@require_auth
def upload_video_file():
    """Upload a video to Cloudinary"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    folder = request.form.get('folder', 'videos')
    
    result = upload_video(file, folder=f"nls-studio/{folder}")
    
    if not result['success']:
        return jsonify({'error': result['error']}), 500
    
    # Save to database
    db = get_db()
    media_data = create_media_file_schema(
        user_id=g.user_id,
        url=result['url'],
        public_id=result['public_id'],
        filename=file.filename,
        file_type='video',
        mime_type=file.content_type,
        size=result.get('bytes', 0),
        folder=folder
    )
    db.media_files.insert_one(media_data)
    
    return jsonify({
        'url': result['url'],
        'public_id': result['public_id'],
        'filename': file.filename
    }), 200


@upload_bp.route('/document', methods=['POST'])
@require_auth
def upload_document_file():
    """Upload a document to Cloudinary"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    folder = request.form.get('folder', 'documents')
    
    result = upload_document(file, folder=f"nls-studio/{folder}")
    
    if not result['success']:
        return jsonify({'error': result['error']}), 500
    
    # Save to database
    db = get_db()
    media_data = create_media_file_schema(
        user_id=g.user_id,
        url=result['url'],
        public_id=result['public_id'],
        filename=file.filename,
        file_type='document',
        mime_type=file.content_type,
        size=result.get('bytes', 0),
        folder=folder
    )
    db.media_files.insert_one(media_data)
    
    return jsonify({
        'url': result['url'],
        'public_id': result['public_id'],
        'filename': file.filename
    }), 200


@upload_bp.route('/avatar', methods=['POST'])
@require_auth
def upload_avatar():
    """Upload user avatar"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    result = upload_image(file, folder="nls-studio/avatars")
    
    if not result['success']:
        return jsonify({'error': result['error']}), 500
    
    # Update user profile
    db = get_db()
    from bson import ObjectId
    db.users.update_one(
        {'_id': ObjectId(g.user_id)},
        {'$set': {
            'avatar_url': result['url'],
            'updated_at': datetime.utcnow()
        }}
    )
    
    return jsonify({
        'url': result['url'],
        'public_id': result['public_id']
    }), 200


@upload_bp.route('/<public_id>', methods=['DELETE'])
@require_auth
def delete_uploaded_file(public_id):
    """Delete a file from Cloudinary"""
    db = get_db()
    
    # Verify ownership
    media_file = db.media_files.find_one({
        'public_id': public_id,
        'user_id': g.user_id
    })
    
    if not media_file:
        return jsonify({'error': 'File not found or access denied'}), 404
    
    resource_type = 'image'
    if media_file.get('file_type') == 'video':
        resource_type = 'video'
    elif media_file.get('file_type') == 'document':
        resource_type = 'raw'
    
    result = delete_file(public_id, resource_type=resource_type)
    
    if result['success']:
        db.media_files.delete_one({'_id': media_file['_id']})
        return jsonify({'message': 'File deleted successfully'}), 200
    else:
        return jsonify({'error': result.get('error', 'Failed to delete file')}), 500


@upload_bp.route('/my-files', methods=['GET'])
@require_auth
def get_my_files():
    """Get all files uploaded by current user"""
    db = get_db()
    
    file_type = request.args.get('type')  # image, video, document
    folder = request.args.get('folder')
    
    query = {'user_id': g.user_id}
    if file_type:
        query['file_type'] = file_type
    if folder:
        query['folder'] = folder
    
    files = list(db.media_files.find(query).sort('created_at', -1).limit(100))
    
    for f in files:
        f['_id'] = str(f['_id'])
    
    return jsonify(files), 200
