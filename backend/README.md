# 🏠 Student Rental Platform - Backend

Backend API cho nền tảng thuê trọ sinh viên, được xây dựng với Node.js, Express và MongoDB.

## 📋 Mục lục

- [Tính năng](#tính-năng)
- [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
- [Cấu hình](#cấu-hình)
- [Chạy ứng dụng](#chạy-ứng-dụng)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [API Documentation](#api-documentation)

## ✨ Tính năng

### 🔐 Authentication & Authorization
- Đăng ký, đăng nhập, đăng xuất
- JWT tokens (Access & Refresh)
- Quên mật khẩu & xác thực email
- Phân quyền (Student, Owner, Admin)

### 👤 User Management
- Quản lý profile
- Upload avatar
- Lịch sử hoạt động

### 🏠 Room Management
- CRUD phòng trọ
- Upload hình ảnh/video
- Tìm kiếm & lọc nâng cao
- Định vị bản đồ (Google Maps)

### 💬 Chat & Notifications
- Chat realtime (Socket.io)
- Thông báo realtime
- Typing indicators

### 💰 Payment & Contracts
- Thanh toán đặt cọc (Momo/ZaloPay)
- Tạo hợp đồng PDF tự động
- Quản lý giao dịch

### ⭐ Reviews & Favorites
- Đánh giá & bình luận
- Lưu phòng yêu thích
- Gợi ý phòng thông minh

### 🛡️ Admin Features
- Quản lý người dùng
- Duyệt tin đăng
- Xử lý vi phạm
- Dashboard thống kê

## 🛠️ Công nghệ sử dụng

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT, bcryptjs
- **Realtime:** Socket.io
- **File Upload:** Multer, Cloudinary
- **PDF Generation:** PDFKit
- **Payment:** Momo, ZaloPay
- **Email:** Nodemailer
- **Validation:** Express-validator
- **Maps:** Google Maps API

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js >= 16.x
- MongoDB >= 5.x (hoặc MongoDB Atlas)
- npm hoặc yarn

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd student-rental-platform/backend
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình MongoDB

#### Cách 1: MongoDB Atlas (Khuyến nghị - Miễn phí)

1. Truy cập [MongoDB Atlas](https://cloud.mongodb.com)
2. Đăng ký/Đăng nhập
3. Tạo cluster mới (chọn Free tier)
4. Tạo Database User (username & password)
5. Whitelist IP (chọn "Allow Access from Anywhere" cho development)
6. Lấy connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Thay `<password>` bằng mật khẩu thực tế

**Connection string mẫu:**
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/student-rental?retryWrites=true&w=majority
```

#### Cách 2: MongoDB Local

1. Tải MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Cài đặt MongoDB
3. Chạy MongoDB service:
   ```bash
   # Windows (PowerShell với quyền Admin)
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```
4. Connection string:
   ```
   mongodb://localhost:27017/student-rental
   ```

## ⚙️ Cấu hình

### Tạo file .env

Copy file `.env.example` thành `.env`:
```bash
cp .env.example .env
```

### Cập nhật file .env

```env
# Server
PORT=5000
NODE_ENV=development

# Database - CẬP NHẬT CONNECTION STRING CỦA BẠN
MONGODB_URI=mongodb://localhost:27017/student-rental
# Hoặc MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/student-rental

# JWT
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE=30d

# ... (các cấu hình khác)
```

### Test kết nối Database

```bash
node testConnection.js
```

Nếu thành công, bạn sẽ thấy:
```
✅ Kết nối MongoDB thành công!
📦 Database: student-rental
```

## 🚀 Chạy ứng dụng

### Development mode (với nodemon)
```bash
npm run dev
```

### Production mode
```bash
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

### Kiểm tra health
```bash
curl http://localhost:5000/health
```

### Migration đồng bộ ownerId

Các thay đổi mới yêu cầu chuyển toàn bộ `hostId` → `ownerId`, thêm `contactPhone` cho phòng và đảm bảo index truy vấn.

Chạy script sau trước khi deploy để cập nhật dữ liệu hiện tại:

```bash
npm run migrate:rooms-owner
```

Script sẽ:

- Đổi tên trường `hostId` thành `ownerId` trong `rooms`.
- Backfill `contactPhone` dựa trên `phone` của owner tương ứng.
- Tạo index `ownerId_status_idx` giúp dashboard và bộ lọc chạy nhanh hơn.

## 📁 Cấu trúc thư mục

```
backend/
├── config/              # Cấu hình (database, firebase, etc.)
│   ├── database.js
│   └── firebase.js
├── controllers/         # Business logic
│   ├── authController.js
│   ├── userController.js
│   └── ...
├── models/             # Mongoose models
│   ├── User.js
│   ├── Room.js
│   └── ...
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── ...
├── middlewares/        # Custom middlewares
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── ...
├── utils/              # Utility functions
│   ├── responseHandler.js
│   ├── generateToken.js
│   └── ...
├── socket/             # Socket.io handlers
│   └── socketHandler.js
├── uploads/            # Temporary upload folder
├── .env                # Environment variables
├── .env.example        # Environment template
├── server.js           # Entry point
└── package.json
```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### User Endpoints
- `GET /api/users/me` - Lấy thông tin user
- `PUT /api/users/me` - Cập nhật profile
- `POST /api/users/avatar` - Upload avatar

### Room Endpoints
- `GET /api/rooms` - Lấy danh sách phòng
- `GET /api/rooms/:id` - Lấy chi tiết phòng
- `POST /api/rooms` - Tạo phòng mới (Owner)
- `PUT /api/rooms/:id` - Cập nhật phòng (Owner)
- `DELETE /api/rooms/:id` - Xóa phòng (Owner)

*(Tài liệu đầy đủ sẽ được bổ sung sau)*

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts

- `npm start` - Chạy server production
- `npm run dev` - Chạy server development với nodemon
- `npm test` - Chạy tests
- `node testConnection.js` - Test kết nối database

## 🔒 Bảo mật

- JWT authentication
- Password hashing với bcrypt
- Input validation với express-validator
- CORS configuration
- Rate limiting (sẽ thêm sau)
- Helmet.js (sẽ thêm sau)

## 🤝 Contributing

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

MIT License

## 👥 Authors

Student Rental Platform Team

## 📞 Support

Nếu có vấn đề, vui lòng tạo issue trên GitHub.
