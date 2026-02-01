# 📝 HƯỚNG DẪN SETUP MONGODB VÀ CHẠY SERVER

## 🗄️ CÁCH 1: SỬ DỤNG MONGODB ATLAS (CLOUD - KHUYẾN NGHỊ)

### Bước 1: Tạo tài khoản MongoDB Atlas

1. Truy cập: https://cloud.mongodb.com
2. Click **"Try Free"** để đăng ký miễn phí
3. Đăng ký bằng email hoặc Google

### Bước 2: Tạo Cluster

1. Sau khi đăng nhập, click **"Build a Database"**
2. Chọn **"FREE"** (M0 Sandbox) - Miễn phí 512MB
3. Chọn Provider: **AWS** hoặc **Google Cloud**
4. Chọn Region gần nhất (VD: Singapore)
5. Đặt tên Cluster (VD: `student-rental-cluster`)
6. Click **"Create Cluster"**

### Bước 3: Tạo Database User

1. Trong phần **"Security"** → **"Database Access"**
2. Click **"Add New Database User"**
3. Chọn **"Password"** authentication
4. Username: `studentrental_admin` (tùy chọn)
5. Password: Tạo mật khẩu mạnh (lưu lại để dùng sau)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### Bước 4: Whitelist IP Address

1. Trong phần **"Security"** → **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Lưu ý: Trong production nên giới hạn IP cụ thể
4. Click **"Confirm"**

### Bước 5: Lấy Connection String

1. Quay lại **"Database"** → Click **"Connect"** trên cluster của bạn
2. Chọn **"Connect your application"**
3. Driver: **Node.js** (version 5.5 or later)
4. Copy connection string, ví dụ:
   ```
   mongodb+srv://studentrental_admin:<password>@student-rental-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Thay `<password>` bằng mật khẩu thực tế
6. Thêm tên database sau `.net/`: 
   ```
   mongodb+srv://studentrental_admin:yourpassword@cluster.xxxxx.mongodb.net/student-rental?retryWrites=true&w=majority
   ```

### Bước 6: Cập nhật file .env

Mở file `backend/.env` và cập nhật:

```env
MONGODB_URI=mongodb+srv://youruser:yourpassword@cluster.xxxxx.mongodb.net/student-rental?retryWrites=true&w=majority
```

### Bước 7: Test Connection

```powershell
cd backend
node testConnection.js
```

Nếu thành công, bạn sẽ thấy:
```
✅ Kết nối MongoDB thành công!
📦 Database: student-rental
```

---

## 🖥️ CÁCH 2: SỬ DỤNG MONGODB LOCAL

### Bước 1: Tải MongoDB Community Server

1. Truy cập: https://www.mongodb.com/try/download/community
2. Chọn version mới nhất
3. Platform: Windows
4. Package: MSI
5. Click **"Download"**

### Bước 2: Cài đặt MongoDB

1. Chạy file .msi vừa tải
2. Chọn **"Complete"** installation
3. Chọn **"Install MongoDB as a Service"**
   - Service Name: `MongoDB`
   - Data Directory: `C:\Program Files\MongoDB\Server\7.0\data`
   - Log Directory: `C:\Program Files\MongoDB\Server\7.0\log`
4. **Bỏ check** "Install MongoDB Compass" (GUI tool - không bắt buộc)
5. Click **"Install"**

### Bước 3: Kiểm tra MongoDB Service

Mở PowerShell với quyền **Administrator**:

```powershell
# Kiểm tra service
Get-Service MongoDB

# Start service nếu chưa chạy
Start-Service MongoDB

# Hoặc dùng net command
net start MongoDB
```

### Bước 4: Cập nhật file .env

File `.env` mặc định đã dùng local:

```env
MONGODB_URI=mongodb://localhost:27017/student-rental
```

### Bước 5: Test Connection

```powershell
cd backend
node testConnection.js
```

---

## 🚀 CHẠY SERVER

### 1. Đảm bảo đã cài dependencies

```powershell
cd backend
npm install
```

### 2. Chạy server Development

```powershell
npm run dev
```

Server sẽ chạy tại: `http://localhost:5000`

### 3. Test server

Mở trình duyệt hoặc dùng curl:

```powershell
# Test health endpoint
curl http://localhost:5000/health

# Hoặc dùng Invoke-WebRequest
Invoke-WebRequest -Uri http://localhost:5000/health
```

Kết quả mong đợi:
```json
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-11-25T..."
}
```

---

## 🧪 TEST API AUTHENTICATION

### 1. Đăng ký tài khoản mới

```powershell
# Dùng curl (nếu có)
curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{
    "email": "student@test.com",
    "password": "Test123456",
    "fullName": "Nguyen Van A",
    "phone": "0987654321",
    "role": "student"
  }'
```

Hoặc dùng Postman/Thunder Client/REST Client extension trong VS Code

### 2. Đăng nhập

```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{
    "email": "student@test.com",
    "password": "Test123456"
  }'
```

Response sẽ trả về:
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

### 3. Test protected route

Copy `accessToken` từ response trên và dùng:

```powershell
curl -X GET http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 🛠️ TOOLS KHUYẾN NGHỊ

### VS Code Extensions
- **Thunder Client** - Test API ngay trong VS Code
- **REST Client** - Alternative cho Thunder Client
- **MongoDB for VS Code** - Xem database trực tiếp

### Standalone Tools
- **Postman** - Tool phổ biến nhất để test API
- **MongoDB Compass** - GUI cho MongoDB (đã cài cùng MongoDB)

---

## 📊 THEO DÕI SERVER LOGS

Khi chạy `npm run dev`, bạn sẽ thấy:

```
🚀 Server is running on port 5000
🌍 Environment: development
📡 Socket.io is ready for connections
✅ MongoDB Connected: cluster.xxxxx.mongodb.net
```

---

## ❗ TROUBLESHOOTING

### Lỗi: "Cannot connect to MongoDB"

**MongoDB Atlas:**
- Kiểm tra connection string có đúng không
- Kiểm tra password có đúng không (không có ký tự đặc biệt chưa encode)
- Kiểm tra IP có được whitelist chưa

**MongoDB Local:**
- Kiểm tra service có đang chạy: `Get-Service MongoDB`
- Start service: `Start-Service MongoDB`

### Lỗi: "Port 5000 already in use"

```powershell
# Tìm process đang dùng port 5000
netstat -ano | findstr :5000

# Kill process (thay PID bằng số thực tế)
taskkill /PID <PID> /F
```

### Lỗi: "JWT_SECRET is not defined"

Kiểm tra file `.env` có tồn tại và có giá trị `JWT_SECRET`

---

## ✅ CHECKLIST

- [ ] MongoDB đã kết nối thành công
- [ ] Server chạy được tại port 5000
- [ ] Test health endpoint thành công
- [ ] Đăng ký tài khoản thành công
- [ ] Đăng nhập thành công và nhận được token
- [ ] Test protected route với token thành công

---

Nếu gặp vấn đề, vui lòng kiểm tra lại từng bước hoặc tạo issue!
