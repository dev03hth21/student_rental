# 📱 HƯỚNG DẪN CHẠY MOBILE APP

## ✅ ĐÃ HOÀN THÀNH

Mobile app đã được thiết lập hoàn chỉnh với:

- ✅ React Native + Expo
- ✅ React Navigation (Stack + Bottom Tabs)
- ✅ Screens: Login, Register, Home, Profile
- ✅ Components: Button, Input, RoomCard, LoadingSpinner
- ✅ Constants: Colors, Spacing, Fonts
- ✅ Mock data cho testing

## 🚀 CÁCH CHẠY APP

### 1. Khởi động Expo Server (Đã chạy)

```bash
cd mobile
npm start
```

### 2. Xem App trên điện thoại

**Android:**
1. Tải app **Expo Go** từ Google Play Store
2. Mở Expo Go
3. Scan QR code trong terminal

**iOS:**
1. Tải app **Expo Go** từ App Store
2. Mở Camera app
3. Scan QR code trong terminal

### 3. Xem App trên Web (Nhanh nhất)

Nhấn **`w`** trong terminal để mở web browser

### 4. Xem App trên Android Emulator

Nhấn **`a`** trong terminal (cần có Android Studio + Emulator)

## 📁 CẤU TRÚC PROJECT

```
mobile/
├── src/
│   ├── components/          # Components tái sử dụng
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── RoomCard.js
│   │   └── LoadingSpinner.js
│   ├── constants/           # Theme, Colors, Fonts
│   │   ├── colors.js
│   │   ├── spacing.js
│   │   └── fonts.js
│   ├── navigation/          # Navigation setup
│   │   └── AppNavigator.js
│   └── screens/             # Các màn hình
│       ├── auth/
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       ├── home/
│       │   └── HomeScreen.js
│       └── profile/
│           └── ProfileScreen.js
├── App.js                   # Entry point
└── package.json
```

## 🎨 CHỨC NĂNG ĐÃ CÓ

### Authentication Screens
- ✅ **Login Screen**: Form đăng nhập với validation
- ✅ **Register Screen**: Form đăng ký với chọn role (Sinh viên/Chủ trọ)

### Main App (Bottom Tabs)
- ✅ **Home Screen**: Tìm kiếm và danh sách phòng trọ
- ✅ **Favorites Tab**: (Placeholder)
- ✅ **Messages Tab**: (Placeholder)
- ✅ **Profile Screen**: Thông tin user và menu

### Components
- ✅ **Button**: Primary, Secondary, Outline, Ghost variants
- ✅ **Input**: Text input với label, error, icons
- ✅ **RoomCard**: Card hiển thị thông tin phòng
- ✅ **LoadingSpinner**: Loading indicator

## 🎯 TIẾP THEO CẦN LÀM

### Kết nối Backend
- [ ] Setup Axios
- [ ] Create API service
- [ ] Implement Authentication flow
- [ ] Connect to backend API

### Thêm Screens
- [ ] Room Detail Screen
- [ ] Favorites Screen  
- [ ] Chat Screen
- [ ] Booking Screen
- [ ] Payment Screen

### Thêm Features
- [ ] Image picker (cho avatar & room photos)
- [ ] Map integration (Google Maps)
- [ ] Push notifications
- [ ] Deep linking

## 📝 LƯU Ý

1. **App đang dùng Mock Data**: Cần connect backend để có dữ liệu thật
2. **Authentication**: Hiện tại chỉ là UI, cần implement JWT logic
3. **Navigation**: Có thể chuyển giữa Auth và Main tabs bằng cách sửa `isAuthenticated` trong `AppNavigator.js`

## 🐛 XỬ LÝ LỖI

### Nếu gặp lỗi về package versions:
```bash
cd mobile
npm install react-native-screens@4.16.0
```

### Nếu metro bundler lỗi:
```bash
npm start -- --reset-cache
```

### Clear cache:
```bash
expo start -c
```

## 🎉 KẾT QUẢ

App đã có đầy đủ:
- ✅ UI/UX hoàn chỉnh
- ✅ Navigation hoạt động
- ✅ Không có lỗi xung đột
- ✅ Chạy mượt mà trên Expo

**App sẵn sàng để develop tiếp các tính năng!** 🚀
