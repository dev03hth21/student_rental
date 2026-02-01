# 🏠 Sàn Giao Dịch Thuê Trọ Cho Sinh Viên

## 📋 Mô tả dự án
Nền tảng mobile + backend API giúp sinh viên tìm kiếm phòng trọ nhanh chóng, minh bạch. Chủ trọ có thể đăng tin, quản lý phòng trọ dễ dàng. Hệ thống hỗ trợ giao tiếp realtime (chat), định vị bản đồ, thanh toán đặt cọc, hợp đồng điện tử.

## 👥 3 Actor chính
1. **Sinh viên (Student)** - Tìm kiếm và thuê phòng
2. **Chủ trọ (Owner)** - Đăng tin và quản lý phòng
3. **Quản trị viên (Admin)** - Giám sát và quản lý hệ thống

## 🛠 Công nghệ sử dụng

### Frontend (Mobile)
- **Mobile App**: React Native + Expo + React Navigation

### Backend
- **API Server**: NodeJS + Express
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Realtime**: Socket.io + Firebase Cloud Messaging
- **File Storage**: Firebase Storage
- **Payment**: Momo & ZaloPay Integration
- **PDF Generation**: PDFKit
- **Maps**: Google Maps API

## 📁 Cấu trúc dự án

```
student-rental-platform/
├── backend/           # NodeJS Backend API
├── mobile/           # React Native Mobile App
└── README.md         # Documentation
```

Lưu ý: Web frontend đã được gỡ khỏi repository, chỉ còn backend và mobile.

## 🚀 Cài đặt và chạy dự án

### ⚡ Quick Start

**Bước 1: Clone repository**
```bash
git clone <repository-url>
cd student-rental-platform
```

**Bước 2: Setup MongoDB**

📖 Xem hướng dẫn chi tiết: [backend/SETUP_GUIDE.md](backend/SETUP_GUIDE.md)

- **MongoDB Atlas (Cloud - Khuyến nghị)**: Miễn phí, không cần cài đặt
- **MongoDB Local**: Cài đặt trên máy

**Bước 3: Chạy Backend**
```bash
cd backend
npm install
# Cập nhật MONGODB_URI trong file .env
npm run dev
```

Server chạy tại: `http://localhost:5000`

**Bước 4: Test API**
- Import file `postman_collection.json` vào Postman
- Hoặc dùng Thunder Client trong VS Code
- Test endpoints: `/health`, `/api/auth/register`, `/api/auth/login`

### Mobile App (Coming soon)
```bash
cd mobile
npm install
npx expo start
```

## ✨ Tính năng chính

### 🟦 Sinh viên
- ✅ Đăng ký/Đăng nhập/Quên mật khẩu
- ✅ Quản lý hồ sơ cá nhân
- ✅ Tìm kiếm & lọc phòng nâng cao
- ✅ Gợi ý phòng thông minh dựa trên hành vi
- ✅ Xem chi tiết phòng (ảnh, video, bản đồ)
- ✅ Lưu phòng yêu thích
- ✅ Bình luận & đánh giá
- ✅ Báo cáo vi phạm
- ✅ Chat realtime với chủ trọ
- ✅ Thanh toán đặt cọc (Momo/ZaloPay)
- ✅ Nhận hợp đồng PDF
- ✅ Yêu cầu hoàn tiền cọc

### 🟧 Chủ trọ
- ✅ Đăng ký/Đăng nhập chủ trọ
- ✅ Quản lý hồ sơ
- ✅ Đăng tin phòng trọ (ảnh, video, mô tả)
- ✅ Chỉnh sửa/Ẩn/Xóa tin
- ✅ Quản lý trạng thái phòng (available/pending/rented)
- ✅ Xem yêu cầu thuê
- ✅ Chat với sinh viên
- ✅ Xử lý yêu cầu hoàn cọc
- ✅ Báo cáo sinh viên vi phạm

### 🟥 Admin
- ✅ Đăng nhập admin
- ✅ Duyệt tin đăng
- ✅ Xử lý báo cáo vi phạm
- ✅ Quản lý tài khoản (chủ trọ + sinh viên)
- ✅ Quản lý hợp đồng
- ✅ Xử lý tranh chấp hoàn cọc
- ✅ Khóa/Mở khóa tài khoản
- ✅ Dashboard thống kê
- ✅ Gửi thông báo toàn hệ thống

## 🔐 Biến môi trường

Tạo file `.env` trong thư mục backend:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-rental
JWT_SECRET=your_jwt_secret_key
FIREBASE_CONFIG=your_firebase_config
GOOGLE_MAPS_API_KEY=your_google_maps_key
MOMO_PARTNER_CODE=your_momo_partner_code
MOMO_ACCESS_KEY=your_momo_access_key
MOMO_SECRET_KEY=your_momo_secret_key
ZALOPAY_APP_ID=your_zalopay_app_id
ZALOPAY_KEY1=your_zalopay_key1
ZALOPAY_KEY2=your_zalopay_key2
```

## 📱 Screenshots & Demo
Coming soon...

## 📄 License
MIT License

## 👨‍💻 Developers
- Fullstack Developer Team
