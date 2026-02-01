# 🚀 Hướng Dẫn Chạy Mobile App với Role Chủ Trọ (Owner)

## 📋 Yêu Cầu Hệ Thống

- Node.js 16+ đã cài đặt
- npm hoặc yarn
- Expo CLI (`npm install -g expo-cli`)
- Điện thoại Android/iOS với Expo Go app, HOẶC
- Android Studio (cho Android emulator), HOẶC
- Xcode (cho iOS simulator - chỉ trên macOS)

## 🔧 Bước 1: Chuẩn Bị Backend

### 1.1. Khởi động Backend Server

```powershell
# Mở terminal mới
cd c:\student-rental-platform\backend
npm install
node server.js
```

**Kết quả mong đợi:**
```
✅ MongoDB Connected: localhost
🚀 Server is running on port 5000
📡 Socket.io is ready for connections
```

> **Lưu ý**: Giữ terminal này mở, server phải chạy trong suốt quá trình test mobile app!

### 1.2. Tạo Tài Khoản Owner (Nếu cần)

Nếu chưa có tài khoản Owner trong database, bạn có 2 cách:

**Cách 1: Sử dụng Demo Login (Đơn giản nhất)**
- App đã có sẵn chức năng login demo với role Owner
- Không cần tạo tài khoản thật

**Cách 2: Tạo tài khoản thật qua API**

```powershell
# Mở terminal mới
cd c:\student-rental-platform\backend

# Chạy script tạo user (nếu có)
node scripts/createOwnerAccount.js

# HOẶC dùng API test
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"fullName\":\"Chu Tro Demo\",\"email\":\"owner@example.com\",\"password\":\"123456\",\"phone\":\"0987654321\",\"role\":\"owner\"}"
```

## 🔧 Bước 2: Cài Đặt và Chạy Mobile App

### 2.1. Cài đặt Dependencies

```powershell
# Mở terminal mới
cd c:\student-rental-platform\mobile
npm install
```

### 2.2. Kiểm tra cấu hình API

Mở file `mobile/src/services/api.js` và xác nhận:
- `baseURL` đang trỏ đúng: `http://localhost:5000/api` (hoặc `http://10.0.2.2:5000/api` cho Android emulator)

### 2.3. Khởi động Expo

```powershell
npm start
# HOẶC
expo start
```

**Kết quả mong đợi:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

## 📱 Bước 3: Chạy App trên Thiết Bị

### Chọn 1 trong 3 phương án:

### **Phương án 1: Điện thoại thật (Khuyến nghị)**

1. Cài **Expo Go** từ Google Play / App Store
2. Kết nối cùng WiFi với máy tính
3. Mở Expo Go → Scan QR code từ terminal
4. App sẽ load và chạy

### **Phương án 2: Android Emulator**

```powershell
# Trong terminal Expo, nhấn 'a'
# Hoặc
npm run android
```

> **Lưu ý**: API URL sẽ tự động dùng `http://10.0.2.2:5000/api` cho Android emulator

### **Phương án 3: iOS Simulator (Chỉ macOS)**

```powershell
# Trong terminal Expo, nhấn 'i'
# Hoặc
npm run ios
```

## 👤 Bước 4: Đăng Nhập với Role Owner

### Cách 1: Login Demo (Đơn giản nhất)

App đã có sẵn chức năng demo login. Tìm và sử dụng:

1. Mở app
2. Màn hình Login
3. Tìm nút **"Demo Owner"** hoặc **"Đăng nhập Demo Chủ Trọ"**
4. Click để đăng nhập ngay với role Owner

### Cách 2: Login với Tài khoản Thật

1. Mở app
2. Màn hình Login
3. Nhập:
   - **Email**: `owner@example.com`
   - **Password**: `123456`
4. Click **Đăng nhập**

## 🎯 Bước 5: Test Các Chức Năng Owner

Sau khi đăng nhập thành công với role Owner, bạn sẽ thấy **Bottom Navigation** với 5 tabs:

### 1. **📊 Tổng quan** (Dashboard)
- Xem thống kê tin đăng
- Xem insights
- Xem suggestions

### 2. **🗂️ Tin đăng** (Listings)
- Xem danh sách tin đăng của bạn
- Tạo tin mới
- Chỉnh sửa tin

### 3. **➕ Đăng tin** (Create)
- Form tạo tin đăng mới
- Upload ảnh
- Điền thông tin phòng

### 4. **👥 Khách hàng** (Customers) ← MODULE MỚI #4
- Xem danh sách cuộc gọi từ khách
- **Tìm kiếm** theo tên/SĐT/email
- **Filter**: Tất cả / Chưa đọc / Theo phòng
- Click vào item → Chi tiết
- Click **"Gọi lại"** → Mở app điện thoại

**Test flow:**
1. Click tab **Khách hàng** (👥)
2. Xem danh sách cuộc gọi
3. Thử search: nhập số điện thoại
4. Thử filter: Click "Chưa đọc"
5. Thử filter theo phòng
6. Click vào 1 cuộc gọi → Xem chi tiết
7. Click "Gọi lại" → App điện thoại sẽ mở

### 5. **⚙️ Tài khoản** (Account) ← MODULE MỚI #5
- Xem profile
- **Upload avatar**: Click vào avatar
- **Cập nhật thông tin**: Sửa tên/SĐT → "Lưu thay đổi"
- **Menu điều hướng**:
  - 🗂️ Quản lý tin đăng
  - 👥 Quản lý khách hàng
  - 💰 Quản lý tài chính
  - ⚙️ Cài đặt
  - 🚪 Đăng xuất

**Test flow:**
1. Click tab **Tài khoản** (⚙️)
2. Click vào **Avatar** → Chọn ảnh từ thư viện
3. Đợi upload → Xem avatar mới
4. Sửa **Họ tên** → Click "Lưu thay đổi"
5. Sửa **SĐT** → Click "Lưu thay đổi"
6. Click "Đồng bộ từ server" để refresh
7. Click menu items để navigate
8. Click "Đăng xuất" để logout

## 🐛 Troubleshooting

### Lỗi: Cannot connect to server

**Giải pháp:**
1. Kiểm tra backend server đang chạy: `http://localhost:5000`
2. Nếu dùng điện thoại thật:
   - Đảm bảo cùng WiFi với máy tính
   - Cập nhật `baseURL` trong `api.js` thành IP máy tính: `http://192.168.x.x:5000/api`
3. Nếu dùng Android emulator:
   - API tự động dùng `http://10.0.2.2:5000/api`

### Lỗi: Metro bundler không start

**Giải pháp:**
```powershell
# Clear cache và restart
expo start -c
```

### Lỗi: Module not found

**Giải pháp:**
```powershell
# Xóa node_modules và reinstall
rm -r node_modules
npm install
```

### Lỗi: Cannot upload avatar

**Giải pháp:**
1. Kiểm tra backend có Cloudinary config không
2. Kiểm tra permissions trong app (Media Library)
3. Xem console logs để debug

### App hiển thị Student mode thay vì Owner mode

**Giải pháp:**
1. Kiểm tra user role trong AppContext
2. Logout và login lại với tài khoản Owner
3. Kiểm tra function `canUseOwnerMode` trong AppContext

## 📊 Test Checklist

Đánh dấu ✅ khi test thành công:

### Module #4 - Khách hàng (CallLogs):
- [ ] Xem danh sách cuộc gọi
- [ ] Stats header (Total/Unread/Today) hiển thị đúng
- [ ] Search box hoạt động
- [ ] Filter "Tất cả" hoạt động
- [ ] Filter "Chưa đọc" hoạt động
- [ ] Filter theo phòng hoạt động
- [ ] Cuộc gọi chưa đọc có indicator (màu xanh + chấm đỏ)
- [ ] Click item → Navigate to detail
- [ ] Detail screen hiển thị đầy đủ thông tin
- [ ] Nút "Gọi lại" mở app điện thoại
- [ ] Tự động đánh dấu đã đọc khi mở detail
- [ ] Pull to refresh hoạt động

### Module #5 - Tài khoản (Account):
- [ ] Profile card hiển thị đúng (avatar, tên, SĐT)
- [ ] Stats hiển thị (Điểm tín nhiệm, Tỷ lệ phản hồi)
- [ ] Click avatar → Chọn ảnh → Upload thành công
- [ ] Avatar mới hiển thị sau khi upload
- [ ] Form sửa tên hoạt động
- [ ] Form sửa SĐT hoạt động
- [ ] Nút "Lưu thay đổi" hoạt động
- [ ] Validation hoạt động (tên/SĐT trống)
- [ ] "Đồng bộ từ server" refresh data
- [ ] Menu "Quản lý tin đăng" navigate đúng
- [ ] Menu "Quản lý khách hàng" navigate đúng
- [ ] Menu "Quản lý tài chính" navigate đúng
- [ ] Menu "Đăng xuất" logout thành công

## 📸 Screenshots Mong Đợi

### CustomerScreen (Khách hàng):
```
┌─────────────────────────────────┐
│ [20] Tổng  [5] Chưa đọc [3] Hôm │
├─────────────────────────────────┤
│ 🔍 Tìm kiếm...              [×] │
├─────────────────────────────────┤
│ [Tất cả] [Chưa đọc] [✓ Đọc tất]│
├─────────────────────────────────┤
│ 👤 Nguyễn Văn A          🔴    │
│ 📞 0987654321                   │
│ 🏠 Phòng trọ ABC                │
│ 🕐 5 phút trước                 │
└─────────────────────────────────┘
```

### OwnerAccountScreen (Tài khoản):
```
┌─────────────────────────────────┐
│ ╔═══════════════════════════╗   │
│ ║ 👤 Verified               ║   │
│ ║ Nguyễn Văn A              ║   │
│ ║ SĐT: 0987654321           ║   │
│ ║ [4.9/5]    [98%]          ║   │
│ ╚═══════════════════════════╝   │
├─────────────────────────────────┤
│ Thông tin cá nhân               │
│ Họ tên: [Nguyễn Văn A      ]   │
│ SĐT:    [0987654321        ]   │
│ [Lưu thay đổi]                  │
├─────────────────────────────────┤
│ 🗂️ Quản lý tin đăng          › │
│ 👥 Quản lý khách hàng         › │
│ 💰 Quản lý tài chính          › │
│ 🚪 Đăng xuất                  › │
└─────────────────────────────────┘
```

## 🎉 Kết Luận

Nếu tất cả các bước trên hoạt động, bạn đã thành công chạy mobile app với role Chủ Trọ (Owner) và test được 2 modules mới:
- ✅ Module #4: Khách hàng liên hệ (CallLogs)
- ✅ Module #5: Tài khoản chủ trọ (Account)

**Happy Testing! 🚀**
