# 📚 NLS Studio - Hướng Dẫn Sử Dụng

## Mục Lục
- [Giới Thiệu](#giới-thiệu)
- [Đăng Nhập](#đăng-nhập)
- [Hướng Dẫn Cho Admin](#-hướng-dẫn-cho-admin)
- [Hướng Dẫn Cho Teacher](#-hướng-dẫn-cho-teacher)
- [Hướng Dẫn Cho Student](#-hướng-dẫn-cho-student)

---

## Giới Thiệu

**NLS Studio** là hệ thống quản lý học tập (LMS) hiện đại với giao diện dark theme đẹp mắt, hỗ trợ:
- ✅ Quản lý lớp học và thành viên
- ✅ Tạo và quản lý khóa học với modules
- ✅ Tạo bài tập và chấm điểm
- ✅ Tạo quiz trắc nghiệm tự động chấm
- ✅ Lịch học và sự kiện
- ✅ Upload tài liệu (hỗ trợ video, PDF, hình ảnh)

---

## Đăng Nhập

### Truy cập hệ thống
1. Mở trình duyệt và truy cập: `http://localhost:5173`
2. Nhập **Email** và **Password**
3. Nhấn **Sign In**

### Tài khoản mặc định
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nls.studio | admin123 |

> ⚠️ **Lưu ý**: Sau khi đăng nhập lần đầu, hãy đổi mật khẩu mặc định để bảo mật.

---

## 👑 Hướng Dẫn Cho Admin

Admin có quyền cao nhất trong hệ thống, quản lý toàn bộ users và classes.

### 1. Truy cập Admin Dashboard

1. Đăng nhập với tài khoản Admin
2. Click vào biểu tượng **⚙️ Settings** trên Sidebar hoặc truy cập `/admin`

### 2. Quản Lý Users

#### Xem danh sách Users
1. Từ Admin Dashboard → Click **"Manage Users"**
2. Xem danh sách tất cả users với thông tin: Tên, Email, Role
3. Sử dụng thanh **Search** để tìm kiếm theo tên hoặc email
4. Sử dụng **Filter** để lọc theo role (Student/Teacher/Admin)

#### Tạo User mới
1. Click nút **"+ Add User"** góc trên phải
2. Điền thông tin:
   - **Name**: Tên đầy đủ
   - **Email**: Địa chỉ email (unique)
   - **Password**: Mật khẩu (tối thiểu 6 ký tự)
   - **Role**: Chọn Student / Teacher / Admin
3. Click **"Create User"**

#### Thay đổi Role của User
1. Click vào **Badge role** (Student/Teacher/Admin) của user
2. Chọn role mới từ dropdown menu
3. Role được cập nhật ngay lập tức

#### Reset Password cho User
1. Click vào icon **⋯** (More) bên phải user
2. Chọn **"Reset Password"**
3. Hệ thống tự động tạo password mới
4. Copy password và gửi cho user

#### Xóa User
1. Click vào icon **⋯** (More) bên phải user
2. Chọn **"Delete User"** (màu đỏ)
3. Xác nhận xóa
> ⚠️ Không thể xóa chính tài khoản của mình

### 3. Quản Lý Classes

#### Xem danh sách Classes
1. Từ Admin Dashboard → Click **"Manage Classes"**
2. Xem tất cả lớp học với thông tin: Tên, Teacher, Số thành viên

#### Tạo Class mới
1. Click nút **"+ Create Class"**
2. Điền thông tin:
   - **Class Name**: Tên lớp học
   - **Description**: Mô tả (tùy chọn)
   - **Teacher**: Chọn giáo viên phụ trách
   - **Color**: Chọn màu đại diện
3. Click **"Create Class"**

#### Gán Teacher cho Class
1. Click vào icon **⋯** của class
2. Chọn **"Change Teacher"**
3. Chọn teacher mới từ danh sách
4. Click **"Assign"**

#### Thêm Students vào Class
1. Click vào icon **⋯** của class
2. Chọn **"Add Students"**
3. Tick chọn các students cần thêm
4. Click **"Add Selected"**

#### Xóa Class
1. Click vào icon **⋯** của class
2. Chọn **"Delete Class"**
3. Xác nhận xóa
> ⚠️ Xóa class sẽ xóa luôn tất cả courses, assignments, quizzes liên quan

---

## 👨‍🏫 Hướng Dẫn Cho Teacher

Teacher có thể tạo và quản lý nội dung học tập trong các lớp được phân công.

### 1. Dashboard

Sau khi đăng nhập, Teacher thấy:
- **Upcoming Events**: Các sự kiện sắp tới
- **My Classes**: Danh sách lớp đang dạy
- **Recent Assignments**: Bài tập gần đây

### 2. Quản Lý Lớp Học

#### Xem lớp học của mình
1. Click **"Classes"** trên Sidebar
2. Xem danh sách các lớp đang phụ trách
3. Click vào một lớp để xem chi tiết

#### Trong trang Class Detail

**Tab Courses** - Quản lý khóa học:

##### Tạo Course mới
1. Click **"+ Add Course"**
2. Nhập **Title** và **Description**
3. Click **"Create"**

##### Thêm Module vào Course
1. Click vào course để mở rộng
2. Click **"+ Add Module"**
3. Điền thông tin:
   - **Title**: Tiêu đề module
   - **Content Type**: Text / Video / Document
   - **Content**: Nội dung hoặc mô tả
   - **Media URL**: Link video YouTube/Vimeo (nếu là Video)
   - **Duration**: Thời lượng (phút)
   - **Attachments**: Upload file đính kèm
4. Click **"Add Module"**

**Tab Assignments** - Quản lý bài tập:

##### Tạo Assignment mới
1. Click **"+ Create Assignment"**
2. Điền thông tin:
   - **Title**: Tiêu đề bài tập (bắt buộc)
   - **Description**: Mô tả ngắn
   - **Instructions**: Hướng dẫn chi tiết cho học sinh
   - **Due Date**: Hạn nộp
   - **Points**: Điểm tối đa
   - **Submission Type**: 
     - File Upload: Nộp file
     - Text Entry: Viết trực tiếp
     - URL/Link: Nộp link
     - No Submission: Offline
   - **Attachments**: Upload tài liệu tham khảo
3. Chọn **"Save as Draft"** hoặc **"Publish Assignment"**

##### Xem và chấm bài nộp
1. Click vào assignment
2. Xem danh sách **Submissions** bên phải
3. Xem nội dung từng bài nộp
4. Chấm điểm (tính năng đang phát triển)

**Tab Quizzes** - Quản lý quiz:

##### Tạo Quiz mới
1. Click **"+ Create Quiz"**
2. Điền thông tin cơ bản:
   - **Title**: Tiêu đề quiz
   - **Description**: Mô tả
   - **Time Limit**: Thời gian làm bài (phút)
   - **Passing Score**: Điểm đạt (%)
3. Thêm câu hỏi:
   - Nhập **Question**: Nội dung câu hỏi
   - Nhập 4 **Options** (A, B, C, D)
   - Chọn **Correct Answer**: Đáp án đúng
   - Click **"+ Add Question"** để thêm câu hỏi mới
4. Click **"Create Quiz"**

##### Quản lý Quiz
- **Publish/Unpublish**: Bật/tắt hiển thị quiz cho học sinh
- **View Results**: Xem kết quả làm bài của học sinh
- **Delete**: Xóa quiz

##### Xem kết quả Quiz
1. Click **"View Results"** trên quiz
2. Xem thống kê:
   - Tổng số lượt nộp
   - Tỷ lệ đạt
   - Điểm trung bình
   - Điểm cao nhất
3. Xem chi tiết từng học sinh: Điểm, Trạng thái Pass/Fail, Thời gian nộp
4. **Export CSV**: Xuất kết quả ra file Excel

**Tab Members** - Xem thành viên:
- Xem danh sách tất cả thành viên trong lớp
- Phân biệt Teacher và Students

### 3. Quản Lý Lịch (Schedule)

1. Click **"Schedule"** trên Sidebar
2. Xem lịch theo tuần
3. Click **"+ Add Event"** để tạo sự kiện mới:
   - **Title**: Tiêu đề
   - **Description**: Mô tả
   - **Date**: Ngày
   - **Start/End Time**: Thời gian
   - **Event Type**: Class / Meeting / Other
   - **Location**: Địa điểm
   - **Class**: Lớp liên quan (tùy chọn)
4. Click **"Create Event"**

### 4. Hồ Sơ Cá Nhân (Profile)

1. Click **"Profile"** trên Sidebar hoặc avatar góc trên phải
2. Xem thông tin cá nhân
3. Click **"Edit Profile"** để cập nhật:
   - Tên
   - Avatar (upload hình)
4. Đổi mật khẩu (nếu cần)

---

## 👨‍🎓 Hướng Dẫn Cho Student

Student có thể học tập, làm bài tập và quiz trong các lớp được tham gia.

### 1. Dashboard

Sau khi đăng nhập, Student thấy:
- **Upcoming Events**: Lịch học sắp tới
- **My Classes**: Các lớp đang tham gia
- **Pending Assignments**: Bài tập chưa nộp

### 2. Tham Gia Lớp Học

#### Tham gia bằng mã lớp
1. Click **"Classes"** trên Sidebar
2. Click **"+ Join Class"**
3. Nhập **Class Code** (mã 6 ký tự, ví dụ: ABC123)
4. Click **"Join"**

### 3. Học Tập Trong Lớp

1. Click vào lớp học để vào trang chi tiết
2. Xem thông tin lớp: Tên, Mô tả, Số thành viên

#### Tab Courses - Xem khóa học
1. Click vào course để mở rộng
2. Xem danh sách các modules
3. Click vào module để xem nội dung:
   - **Text**: Đọc nội dung trực tiếp
   - **Video**: Xem video bài giảng
   - **Document**: Download tài liệu

#### Tab Assignments - Làm bài tập

##### Xem danh sách bài tập
- **Pending**: Chưa nộp
- **Submitted**: Đã nộp
- **Overdue**: Quá hạn

##### Nộp bài tập
1. Click vào assignment
2. Đọc **Instructions** hướng dẫn
3. Download **Attachments** nếu có
4. Làm bài:
   - **Text Entry**: Nhập nội dung vào ô text
   - **File Upload**: Click "Attach Files" và chọn file
   - **URL**: Nhập link bài làm
5. Click **"Submit"**
6. Có thể **Resubmit** nếu muốn nộp lại

#### Tab Quizzes - Làm quiz

##### Xem danh sách quiz
- Chỉ hiển thị quiz đã được Publish
- Xem thông tin: Số câu hỏi, Thời gian, Điểm đạt

##### Làm quiz
1. Click **"Take Quiz"** trên quiz muốn làm
2. Đọc thông tin:
   - Thời gian làm bài
   - Số câu hỏi
   - Điểm cần để đạt
3. Click **"Start Quiz"**
4. Làm bài:
   - Chọn đáp án cho mỗi câu hỏi
   - Dùng nút **Previous/Next** để di chuyển
   - Click số câu hỏi để nhảy đến câu đó
   - Xem thời gian còn lại ở góc trên phải
5. Click **"Submit"** khi hoàn thành
6. Xem kết quả ngay:
   - Điểm số (%)
   - Trạng thái: Pass ✅ / Fail ❌
   - Số câu đúng
   - Có thể **Try Again** nếu chưa đạt

> ⚠️ Quiz sẽ **tự động nộp** khi hết thời gian!

### 4. Xem Lịch Học (Schedule)

1. Click **"Schedule"** trên Sidebar
2. Xem lịch theo tuần
3. Các sự kiện hiển thị theo màu:
   - Lớp học
   - Cuộc họp
   - Sự kiện khác

### 5. Xem Tất Cả Bài Tập (Assignments)

1. Click **"Assignments"** trên Sidebar
2. Xem tất cả bài tập từ mọi lớp
3. Filter theo trạng thái: All / Pending / Submitted / Overdue
4. Click vào assignment để xem chi tiết và nộp bài

### 6. Hồ Sơ Cá Nhân (Profile)

1. Click **"Profile"** trên Sidebar
2. Xem thông tin cá nhân và thống kê:
   - Số lớp tham gia
   - Số bài tập đã hoàn thành
3. Click **"Edit Profile"** để cập nhật thông tin

---

## ❓ Câu Hỏi Thường Gặp (FAQ)

### Q: Quên mật khẩu thì làm sao?
**A:** Liên hệ Admin để reset password. Admin sẽ tạo password mới và gửi cho bạn.

### Q: Không thể tham gia lớp học?
**A:** Kiểm tra:
1. Mã lớp có đúng không (6 ký tự, phân biệt hoa thường)
2. Có thể bạn đã tham gia lớp này rồi
3. Liên hệ Teacher hoặc Admin nếu vẫn lỗi

### Q: Quiz bị tự động nộp khi chưa làm xong?
**A:** Quiz có giới hạn thời gian. Khi hết giờ, hệ thống sẽ tự động nộp bài với các câu đã trả lời.

### Q: Có thể làm lại quiz không?
**A:** Có, nếu bạn chưa đạt điểm Pass, có thể click "Try Again" để làm lại.

### Q: File upload bị lỗi?
**A:** Kiểm tra:
1. Kích thước file < 10MB
2. Định dạng file được hỗ trợ
3. Kết nối internet ổn định

### Q: Làm sao để đổi avatar?
**A:** Vào Profile → Edit Profile → Click vào avatar → Chọn hình mới → Save

---

## 📞 Hỗ Trợ Kỹ Thuật

Nếu gặp vấn đề kỹ thuật, vui lòng liên hệ:
- **Email**: support@nls.studio
- **Hotline**: 1900-xxxx

---

## 📝 Ghi Chú Phiên Bản

**Version 1.0.0** (Tháng 11/2025)
- ✅ Hệ thống xác thực JWT tùy chỉnh
- ✅ Quản lý Users (Admin)
- ✅ Quản lý Classes
- ✅ Courses và Modules
- ✅ Assignments và Submissions
- ✅ Quizzes với tự động chấm điểm
- ✅ Schedule và Events
- ✅ Dark Theme Modern UI
- ✅ Upload files với Cloudinary

---

*© 2025 NLS Studio. All rights reserved.*

---

# 🚀 Hướng Dẫn Deploy NLS Studio

## Mục Lục Deploy
- [Chuẩn Bị Trước Khi Deploy](#chuẩn-bị-trước-khi-deploy)
- [Deploy Backend lên Railway](#-deploy-backend-lên-railway)
- [Deploy Frontend lên Vercel](#-deploy-frontend-lên-vercel)
- [Cấu Hình Sau Deploy](#cấu-hình-sau-deploy)
- [Troubleshooting](#troubleshooting)

---

## Chuẩn Bị Trước Khi Deploy

### 1. Tài khoản cần có
- [GitHub](https://github.com) - Lưu trữ source code
- [Railway](https://railway.app) - Deploy backend (có free tier)
- [Vercel](https://vercel.com) - Deploy frontend (free)
- [MongoDB Atlas](https://cloud.mongodb.com) - Database (đã có)
- [Cloudinary](https://cloudinary.com) - Upload files (đã có)

### 2. Push code lên GitHub

```bash
# Trong thư mục project
cd /Users/admin/Documents/newNLS

# Khởi tạo git (nếu chưa có)
git init

# Tạo .gitignore
cat > .gitignore << 'EOF'
# Python
backend/venv/
backend/__pycache__/
backend/**/__pycache__/
*.pyc
*.pyo
.env

# Node
frontend/node_modules/
frontend/dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
EOF

# Add và commit
git add .
git commit -m "Initial commit - NLS Studio LMS"

# Tạo repo trên GitHub và push
git remote add origin https://github.com/YOUR_USERNAME/nls-studio.git
git branch -M main
git push -u origin main
```

---

## 🚂 Deploy Backend lên Railway

### Bước 1: Chuẩn bị Backend

#### 1.1 Tạo file `Procfile` trong thư mục `backend/`

```bash
cd backend
cat > Procfile << 'EOF'
web: gunicorn app:app
EOF
```

#### 1.2 Cập nhật `requirements.txt`

```bash
cat > requirements.txt << 'EOF'
Flask==3.0.0
Flask-Cors==4.0.0
pymongo==4.6.1
PyJWT==2.8.0
python-dotenv==1.0.0
cloudinary==1.38.0
gunicorn==21.2.0
dnspython==2.4.2
EOF
```

#### 1.3 Tạo file `railway.json` trong thư mục `backend/`

```bash
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn app:app",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

#### 1.4 Cập nhật `app.py` để hỗ trợ production

Mở file `backend/app.py` và sửa phần cuối:

```python
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
```

### Bước 2: Deploy lên Railway

#### 2.1 Đăng nhập Railway
1. Truy cập [railway.app](https://railway.app)
2. Click **"Login"** → Đăng nhập bằng GitHub

#### 2.2 Tạo Project mới
1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repository **nls-studio**
4. Railway sẽ hỏi thư mục → Chọn **"backend"** hoặc cấu hình Root Directory

#### 2.3 Cấu hình Root Directory (Quan trọng!)
1. Vào **Settings** của service
2. Tìm **"Root Directory"**
3. Nhập: `backend`

#### 2.4 Thêm Environment Variables
1. Vào tab **"Variables"**
2. Click **"+ New Variable"** và thêm các biến sau:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | `mongodb+srv://sapngu:sapngungu@cluster0.5ulomev.mongodb.net/sapngu?retryWrites=true&w=majority` |
| `JWT_SECRET` | `nls-studio-super-secret-key-2024-production` |
| `CLOUDINARY_CLOUD_NAME` | `dd8vteuqz` |
| `CLOUDINARY_API_KEY` | `YOUR_API_KEY` |
| `CLOUDINARY_API_SECRET` | `YOUR_API_SECRET` |
| `FLASK_DEBUG` | `False` |
| `FRONTEND_URL` | `https://your-app.vercel.app` (cập nhật sau) |

#### 2.5 Deploy
1. Railway sẽ tự động deploy khi detect code
2. Chờ build hoàn tất (2-5 phút)
3. Sau khi deploy xong, vào **Settings** → **Networking**
4. Click **"Generate Domain"** để lấy URL
5. URL sẽ có dạng: `https://nls-backend-production.up.railway.app`

#### 2.6 Verify Backend
Truy cập: `https://YOUR-RAILWAY-URL/api/health`

Nếu thấy response OK là backend đã chạy!

---

## ▲ Deploy Frontend lên Vercel

### Bước 1: Chuẩn bị Frontend

#### 1.1 Cập nhật API URL

Tạo file `frontend/.env.production`:

```bash
cd frontend
cat > .env.production << 'EOF'
VITE_API_URL=https://YOUR-RAILWAY-URL.up.railway.app/api
EOF
```

#### 1.2 Cập nhật `axiosClient.js`

Mở file `frontend/src/api/axiosClient.js` và đảm bảo:

```javascript
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  // ...
})
```

#### 1.3 Tạo file `vercel.json` trong thư mục `frontend/`

```bash
cat > vercel.json << 'EOF'
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}
EOF
```

### Bước 2: Deploy lên Vercel

#### 2.1 Đăng nhập Vercel
1. Truy cập [vercel.com](https://vercel.com)
2. Click **"Login"** → Đăng nhập bằng GitHub

#### 2.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Chọn **"Import Git Repository"**
3. Chọn repository **nls-studio**

#### 2.3 Cấu hình Project
1. **Framework Preset**: Chọn **Vite**
2. **Root Directory**: Click **"Edit"** → Nhập `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

#### 2.4 Thêm Environment Variables
1. Mở rộng **"Environment Variables"**
2. Thêm:

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://YOUR-RAILWAY-URL.up.railway.app/api` |

#### 2.5 Deploy
1. Click **"Deploy"**
2. Chờ build hoàn tất (1-3 phút)
3. Sau khi deploy xong, Vercel cung cấp URL
4. URL có dạng: `https://nls-studio.vercel.app`

---

## Cấu Hình Sau Deploy

### 1. Cập nhật CORS trên Backend

Sau khi có URL của Vercel, cập nhật biến môi trường trên Railway:

1. Vào Railway → Project → Variables
2. Cập nhật `FRONTEND_URL` = `https://nls-studio.vercel.app`
3. Railway sẽ tự động redeploy

### 2. Cập nhật `app.py` để hỗ trợ CORS động

```python
# Trong app.py
import os

FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://localhost:5173')

CORS(app, resources={
    r"/api/*": {
        "origins": [FRONTEND_URL, "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

### 3. Test toàn bộ hệ thống

1. Truy cập: `https://nls-studio.vercel.app`
2. Đăng nhập: `admin@nls.studio` / `admin123`
3. Kiểm tra các chức năng:
   - ✅ Đăng nhập/Đăng xuất
   - ✅ Tạo user mới
   - ✅ Tạo class
   - ✅ Upload file
   - ✅ Tạo quiz

---

## Cấu Hình Custom Domain (Tùy chọn)

### Vercel - Custom Domain cho Frontend

1. Vào Vercel → Project → **Settings** → **Domains**
2. Click **"Add"**
3. Nhập domain: `learn.yourdomain.com`
4. Cấu hình DNS theo hướng dẫn của Vercel:
   - **Type**: CNAME
   - **Name**: learn
   - **Value**: cname.vercel-dns.com

### Railway - Custom Domain cho Backend

1. Vào Railway → Project → **Settings** → **Networking**
2. Click **"+ Custom Domain"**
3. Nhập domain: `api.yourdomain.com`
4. Cấu hình DNS:
   - **Type**: CNAME
   - **Name**: api
   - **Value**: (Railway cung cấp)

---

## Troubleshooting

### ❌ Lỗi: "CORS error" khi gọi API

**Nguyên nhân**: Frontend URL chưa được allow trong CORS

**Giải pháp**:
1. Kiểm tra `FRONTEND_URL` trên Railway
2. Đảm bảo URL chính xác (không có `/` ở cuối)
3. Redeploy backend

### ❌ Lỗi: "502 Bad Gateway" trên Railway

**Nguyên nhân**: App không start được

**Giải pháp**:
1. Kiểm tra Logs trên Railway
2. Đảm bảo `gunicorn` có trong `requirements.txt`
3. Kiểm tra `Procfile` đúng format
4. Kiểm tra PORT binding: `0.0.0.0`

### ❌ Lỗi: "Module not found" khi build

**Nguyên nhân**: Dependencies chưa được cài

**Giải pháp**:
1. Kiểm tra `requirements.txt` (backend) hoặc `package.json` (frontend)
2. Đảm bảo tất cả dependencies đã được list

### ❌ Lỗi: "MongoServerError: bad auth"

**Nguyên nhân**: MongoDB connection string sai

**Giải pháp**:
1. Kiểm tra `MONGODB_URI` trên Railway
2. Đảm bảo username/password đúng
3. Kiểm tra IP whitelist trên MongoDB Atlas (cho phép `0.0.0.0/0`)

### ❌ Lỗi: Upload file không hoạt động

**Nguyên nhân**: Cloudinary credentials sai

**Giải pháp**:
1. Kiểm tra 3 biến Cloudinary trên Railway
2. Verify credentials tại Cloudinary Dashboard

### ❌ Frontend không load sau deploy

**Nguyên nhân**: SPA routing không được cấu hình

**Giải pháp**:
1. Đảm bảo có `vercel.json` với rewrites config
2. Redeploy

---

## 📊 Chi Phí Ước Tính

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Railway** | $5 credit/tháng | $5-20/tháng |
| **Vercel** | Unlimited (Hobby) | $20/tháng (Pro) |
| **MongoDB Atlas** | 512MB free | $9+/tháng |
| **Cloudinary** | 25GB bandwidth | $89+/tháng |

> 💡 **Tip**: Với free tier của tất cả services, bạn có thể chạy LMS cho ~50-100 users mà không mất phí!

---

## 🔄 CI/CD Tự Động

Sau khi setup xong, mỗi khi push code lên GitHub:
- **Railway**: Tự động redeploy backend
- **Vercel**: Tự động redeploy frontend

```bash
# Push code mới
git add .
git commit -m "Update feature X"
git push origin main

# Railway và Vercel sẽ tự động deploy!
```

---

## 📝 Checklist Deploy

- [ ] Push code lên GitHub
- [ ] Tạo `Procfile` cho backend
- [ ] Cập nhật `requirements.txt` với gunicorn
- [ ] Deploy backend lên Railway
- [ ] Cấu hình environment variables trên Railway
- [ ] Lấy Railway URL
- [ ] Tạo `.env.production` cho frontend
- [ ] Tạo `vercel.json`
- [ ] Deploy frontend lên Vercel
- [ ] Cấu hình `VITE_API_URL` trên Vercel
- [ ] Cập nhật `FRONTEND_URL` trên Railway
- [ ] Test toàn bộ chức năng
- [ ] (Tùy chọn) Cấu hình custom domain

---

**🎉 Chúc mừng! NLS Studio của bạn đã online!**
