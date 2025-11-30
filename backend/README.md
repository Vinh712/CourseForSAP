# NLS Studio LMS Backend

## Environment Variables Required

Create a `.env` file or set these variables in Railway:

```
MONGODB_URI=mongodb+srv://sapngu:sapngungu@cluster0.5ulomev.mongodb.net/sapngu?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-production
CLOUDINARY_CLOUD_NAME=dd8vteuqz
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
FLASK_DEBUG=False
```

## Deploy to Railway

1. Connect your GitHub repository
2. Set Root Directory to `backend`
3. Add environment variables above
4. Railway will auto-detect Python and deploy

## Local Development

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```
