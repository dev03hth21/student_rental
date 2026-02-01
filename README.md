# 🏠 Sàn Giao Dịch Thuê Trọ Cho Sinh Viên

Nền tảng gồm backend API, web quản trị và ứng dụng mobile hỗ trợ sinh viên tìm phòng trọ, chủ trọ đăng tin, quản trị viên giám sát. Các tính năng chính: tìm kiếm phòng, chat realtime, bản đồ, đặt cọc/thanh toán, hợp đồng PDF, thông báo đẩy.

## 👥 Actor
1. Sinh viên (Student)
2. Chủ trọ (Owner)
3. Quản trị viên (Admin)

## 🛠 Công nghệ
- Backend: Node.js, Express, MongoDB (Mongoose), JWT, Socket.io, Firebase Cloud Messaging, PDFKit, Cloudinary/Firebase Storage, thanh toán Momo + ZaloPay, Google Maps/OSM → GeoJSON.
- Web admin: React 18, Vite, React Router, Axios.
- Mobile: React Native (Expo), React Navigation.

## 📁 Cấu trúc
```
student-rental-platform/
├── backend/       # API server
├── admin-web/     # Web quản trị (Vite React)
├── mobile/        # Ứng dụng mobile (Expo)
└── README.md
```

## 🚀 Cài đặt nhanh
Clone repo:
```bash
git clone https://github.com/dev03hth21/student_rental.git
cd student-rental-platform
```

### Backend API
```bash
cd backend
npm install
cp .env.example .env   # nếu có, hoặc tự tạo theo mục Biến môi trường
npm run dev             # hoặc npm start
```
- Mặc định chạy tại http://localhost:5000
- Hướng dẫn chi tiết: [backend/SETUP_GUIDE.md](backend/SETUP_GUIDE.md)

### Web admin (Vite React)
```bash
cd admin-web
npm install
npm run dev -- --host --port 5174
```
- Truy cập: http://localhost:5174

### Mobile (Expo)
```bash
cd mobile
npm install
cp .env.example .env   # điền API_BASE_URL, MAPTILER_API_KEY
npx expo start --tunnel
```
- Mở app Expo Go trên điện thoại hoặc chạy emulator.

## 🔐 Biến môi trường

Backend (.env trong backend/):
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

Mobile (.env trong mobile/):
```
API_BASE_URL=http://<your-ip>:5000/api
MAPTILER_API_KEY=your_maptiler_api_key
```

## ⚙️ Scripts hữu ích (backend)
- `npm run dev`: chạy server với nodemon.
- `npm run seed:data`: nạp dữ liệu mẫu.
- `npm run map:convert`: chuyển file OSM → GeoJSON (dùng `phuongthudaumot.osm`).
- `npm test`: chạy Jest (hiện không bắt buộc có test).

## ✨ Tính năng
- Sinh viên: đăng ký/đăng nhập, tìm kiếm + lọc phòng, gợi ý, xem chi tiết, yêu thích, đánh giá/báo cáo, chat realtime, đặt cọc, nhận hợp đồng PDF, yêu cầu hoàn cọc.
- Chủ trọ: quản lý hồ sơ, đăng/chỉnh sửa/xóa tin, trạng thái phòng, xem yêu cầu thuê, chat, xử lý hoàn cọc, báo cáo vi phạm.
- Admin: duyệt tin, xử lý báo cáo, quản lý tài khoản và hợp đồng, thống kê dashboard, gửi thông báo hệ thống.

## 📄 License
MIT License
