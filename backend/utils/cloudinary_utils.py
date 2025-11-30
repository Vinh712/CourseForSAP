"""
Cloudinary utility functions for file uploads
"""

import cloudinary
import cloudinary.uploader
import cloudinary.api
from config import Config


def init_cloudinary():
    """Initialize Cloudinary configuration"""
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True
    )


def upload_file(file, folder="nls-studio", resource_type="auto"):
    """
    Upload a file to Cloudinary
    
    Args:
        file: File object or file path
        folder: Cloudinary folder to upload to
        resource_type: Type of resource (auto, image, video, raw)
    
    Returns:
        dict: Upload result with secure_url, public_id, etc.
    """
    try:
        init_cloudinary()
        
        # Read file content for Flask file objects
        if hasattr(file, 'read'):
            file_content = file.read()
            file.seek(0)  # Reset file pointer
        else:
            file_content = file
        
        result = cloudinary.uploader.upload(
            file_content,
            folder=folder,
            resource_type=resource_type,
            use_filename=True,
            unique_filename=True
        )
        
        return {
            'success': True,
            'url': result.get('secure_url'),
            'public_id': result.get('public_id'),
            'format': result.get('format'),
            'resource_type': result.get('resource_type'),
            'bytes': result.get('bytes'),
            'width': result.get('width'),
            'height': result.get('height')
        }
        
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        import traceback
        traceback.print_exc()
        return {
            'success': False,
            'error': str(e)
        }


def upload_image(file, folder="nls-studio/images"):
    """Upload an image to Cloudinary"""
    return upload_file(file, folder=folder, resource_type="image")


def upload_video(file, folder="nls-studio/videos"):
    """Upload a video to Cloudinary"""
    return upload_file(file, folder=folder, resource_type="video")


def upload_document(file, folder="nls-studio/documents"):
    """Upload a document to Cloudinary"""
    return upload_file(file, folder=folder, resource_type="raw")


def delete_file(public_id, resource_type="image"):
    """
    Delete a file from Cloudinary
    
    Args:
        public_id: Cloudinary public ID of the file
        resource_type: Type of resource
    
    Returns:
        dict: Deletion result
    """
    try:
        init_cloudinary()
        
        result = cloudinary.uploader.destroy(
            public_id,
            resource_type=resource_type
        )
        
        return {
            'success': result.get('result') == 'ok',
            'result': result
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def get_transformation_url(public_id, transformations=None):
    """
    Get a transformed URL for an image
    
    Args:
        public_id: Cloudinary public ID
        transformations: Dict of transformations
    
    Returns:
        str: Transformed URL
    """
    init_cloudinary()
    
    if transformations is None:
        transformations = {}
    
    return cloudinary.CloudinaryImage(public_id).build_url(**transformations)
