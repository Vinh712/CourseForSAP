# NLS Studio LMS

A modern Learning Management System built with React + Vite + TailwindCSS + shadcn/ui for the frontend and Flask + MongoDB for the backend.

![NLS Studio LMS](https://via.placeholder.com/1200x630/8b5cf6/ffffff?text=NLS+Studio+LMS)

## ✨ Features

- **Modern UI** - Beautiful, clean interface inspired by Notion, Linear, and Vercel Dashboard
- **Authentication** - Secure auth powered by Clerk
- **Class Management** - Create and manage classes with modules and course content
- **Assignments** - Create, submit, and grade assignments
- **Schedule** - Interactive calendar with event management
- **Media Uploads** - Image, video, and document uploads via Cloudinary
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark Mode** - Full dark mode support

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS 3.4** - Styling
- **shadcn/ui** - UI component library
- **Radix UI** - Headless UI primitives
- **Zustand** - State management
- **Framer Motion** - Animations
- **React Router DOM** - Routing
- **Clerk** - Authentication

### Backend
- **Flask 3.0** - Python web framework
- **MongoDB Atlas** - Database
- **PyMongo** - MongoDB driver
- **PyJWT** - JWT verification
- **Cloudinary** - Media storage
- **Gunicorn** - WSGI server

## 📁 Project Structure

```
nls-studio-lms/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── config.py           # Configuration
│   ├── database.py         # MongoDB connection
│   ├── requirements.txt    # Python dependencies
│   ├── models/
│   │   └── schemas.py      # Data schemas
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── class_routes.py
│   │   ├── course_routes.py
│   │   ├── assignment_routes.py
│   │   ├── schedule_routes.py
│   │   └── upload_routes.py
│   └── utils/
│       ├── clerk_verifier.py
│       └── cloudinary_utils.py
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── api/           # API client modules
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── stores/        # Zustand stores
│       └── lib/           # Utilities
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MongoDB Atlas account
- Clerk account
- Cloudinary account

### Environment Variables

#### Backend (.env)

```env
FLASK_ENV=development
FLASK_DEBUG=1
SECRET_KEY=your-secret-key-here

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nls_studio?retryWrites=true&w=majority

# Clerk
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_JWT_ISSUER=https://xxx.clerk.accounts.dev

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Frontend (.env)

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
VITE_API_URL=http://localhost:5000/api
```

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create `.env` file with your environment variables (see above)

5. Run the development server:
   ```bash
   flask run
   # or
   python app.py
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your environment variables (see above)

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## 🌐 Deployment

### Deploy Backend to Render

1. Create a new **Web Service** on [Render](https://render.com)

2. Connect your GitHub repository

3. Configure the service:
   - **Name**: `nls-studio-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Root Directory**: `backend`

4. Add environment variables in the Render dashboard:
   - `MONGODB_URI`
   - `CLERK_SECRET_KEY`
   - `CLERK_JWT_ISSUER`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `SECRET_KEY`
   - `FLASK_ENV=production`

5. Deploy!

### Deploy Frontend to Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   ```

2. From the frontend directory:
   ```bash
   vercel
   ```

   Or connect your GitHub repo to [Vercel](https://vercel.com):

3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_URL` (your Render backend URL)

5. Deploy!

## 📝 API Endpoints

### Authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Classes
- `GET /api/classes` - List all classes
- `POST /api/classes` - Create a class
- `GET /api/classes/:id` - Get class details
- `PUT /api/classes/:id` - Update a class
- `DELETE /api/classes/:id` - Delete a class
- `POST /api/classes/:id/join` - Join a class

### Courses
- `GET /api/courses` - List courses in a class
- `POST /api/courses` - Create a course
- `PUT /api/courses/:id` - Update a course
- `DELETE /api/courses/:id` - Delete a course

### Assignments
- `GET /api/assignments` - List assignments
- `POST /api/assignments` - Create an assignment
- `GET /api/assignments/:id` - Get assignment details
- `PUT /api/assignments/:id` - Update an assignment
- `DELETE /api/assignments/:id` - Delete an assignment
- `POST /api/assignments/:id/submit` - Submit an assignment

### Schedule
- `GET /api/schedule` - Get schedule events
- `POST /api/schedule` - Create an event
- `PUT /api/schedule/:id` - Update an event
- `DELETE /api/schedule/:id` - Delete an event

### Uploads
- `POST /api/upload/image` - Upload an image
- `POST /api/upload/video` - Upload a video
- `POST /api/upload/document` - Upload a document

## 🎨 Customization

### Theme Colors

Edit `frontend/tailwind.config.js` to customize the brand colors:

```js
theme: {
  extend: {
    colors: {
      'brand-purple': {
        500: '#8b5cf6', // Primary purple
        // ...
      },
      'brand-blue': {
        500: '#3b82f6', // Primary blue
        // ...
      },
      'brand-green': {
        500: '#22c55e', // Primary green
        // ...
      },
    },
  },
},
```

### Adding New Pages

1. Create a new page component in `frontend/src/pages/`
2. Add the route in `frontend/src/App.jsx`
3. Add navigation link in `frontend/src/components/Sidebar.jsx`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Clerk](https://clerk.com/) for authentication
- [Cloudinary](https://cloudinary.com/) for media management
- [MongoDB Atlas](https://www.mongodb.com/atlas) for database hosting

---

Made with ❤️ by NLS Studio
