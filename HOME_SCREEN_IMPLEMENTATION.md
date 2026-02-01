# HOME SCREEN - STUDENT MODULE IMPLEMENTATION

## 📋 Tổng quan

Module trang chủ cho **Người Thuê Trọ (Student)** với các tính năng:
- ✅ Search bar
- ✅ Filter chips (Giá, Diện tích, Tiện ích)
- ✅ Phòng đề xuất (Recommend)
- ✅ Tin đã xem (Recent Views)
- ✅ UI 2 cột cho danh sách phòng
- ✅ Nút yêu thích ❤️

---

## 🎯 Backend APIs

### 1. **GET /api/rooms/recommend**
Lấy danh sách phòng đề xuất (trending + mới nhất)

**Request:**
```http
GET /api/rooms/recommend?limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy phòng đề xuất thành công",
  "data": {
    "rooms": [...],
    "total": 20
  }
}
```

### 2. **GET /api/users/me/recent-views**
Lấy danh sách phòng đã xem (cần đăng nhập với role student)

**Request:**
```http
GET /api/users/me/recent-views
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy lịch sử phòng đã xem thành công",
  "data": {
    "views": [
      {
        "id": "...",
        "room": { ...room object... },
        "viewedAt": "2025-12-09T..."
      }
    ]
  }
}
```

### 3. **GET /api/rooms?minPrice=&maxPrice=&minArea=&maxArea=**
Lọc phòng theo giá và diện tích

**Request:**
```http
GET /api/rooms?minPrice=2000000&maxPrice=3000000&minArea=20&maxArea=30
```

**Response:**
```json
{
  "success": true,
  "message": "Lấy danh sách phòng thành công",
  "data": {
    "rooms": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

## 📱 Frontend Components

### 1. **HomeScreen.js**
File: `mobile/src/screens/home/HomeScreen.js`

**Features:**
- Search bar với icon
- Filter chips (Price & Area)
- Horizontal slider cho "Tin đã xem"
- Grid 2 cột cho "Bất động sản dành cho bạn"
- Pull-to-refresh
- Loading states

**Usage:**
```javascript
import HomeScreen from './screens/home/HomeScreen';

// Navigation
<Stack.Screen name="Home" component={HomeScreen} />
```

### 2. **RoomCard.js**
File: `mobile/src/components/RoomCard.js`

**Props:**
- `room`: Object - Thông tin phòng
- `onPress`: Function - Callback khi bấm card
- `onToggleFavorite`: Function - Callback khi bấm nút ❤️
- `isFavorite`: Boolean - Trạng thái yêu thích

**Usage:**
```javascript
<RoomCard
  room={room}
  onPress={(room) => navigation.navigate('RoomDetail', { roomId: room._id })}
  onToggleFavorite={(room) => toggleFavorite(room._id)}
  isFavorite={favoriteIds.includes(room._id)}
/>
```

### 3. **API Services**

#### rooms.js
File: `mobile/src/api/rooms.js`

```javascript
import { getRecommendedRooms, getPublicRooms, getRoomDetail } from './api/rooms';

// Lấy phòng đề xuất
const rooms = await getRecommendedRooms(20);

// Lọc phòng
const { rooms, pagination } = await getPublicRooms({
  minPrice: 2000000,
  maxPrice: 3000000,
  minArea: 20,
  maxArea: 30
});

// Chi tiết phòng
const room = await getRoomDetail(roomId);
```

#### viewlogs.js
File: `mobile/src/api/viewlogs.js`

```javascript
import { getRecentViews, recordView } from './api/viewlogs';

// Lấy tin đã xem
const views = await getRecentViews();

// Ghi nhận lượt xem
await recordView(roomId);
```

---

## 🎨 UI Design

### Search Bar
```
┌─────────────────────────────────┐
│ 🔍 Tìm kiếm phòng trọ...      ✕ │
└─────────────────────────────────┘
```

### Filter Chips
```
┌──────┬──────┬──────┬──────┬──────┐
│ 💰   │ Dưới │ 2-3  │ 3-5  │ Trên │
│ Tất  │ 2 tr │ tr   │ tr   │ 5 tr │
└──────┴──────┴──────┴──────┴──────┘

┌──────┬──────┬──────┬──────┬──────┐
│ 📐   │ <20  │ 20-30│ 30-50│ >50  │
│ Tất  │ m²   │ m²   │ m²   │ m²   │
└──────┴──────┴──────┴──────┴──────┘
```

### Recent Views (Horizontal)
```
Tin đã xem                    Xem tất cả >

┌────────┐  ┌────────┐  ┌────────┐
│ [IMG]  │  │ [IMG]  │  │ [IMG]  │
│ 3 tr/th│  │ 4.5tr/t│  │ 2.5tr/t│
│ Phòng..│  │ Căn...│  │ Nhà...│
└────────┘  └────────┘  └────────┘
```

### Recommended Rooms (2 Columns)
```
Bất động sản dành cho bạn

┌────────────┐  ┌────────────┐
│ [IMG]   ❤ │  │ [IMG]   ♡ │
│ Phòng trọ  │  │ Căn hộ    │
│            │  │            │
│ 3 triệu/th │  │ 4.5 tr/th  │
│ 25m² Quận 1│  │ 30m² Q.3   │
└────────────┘  └────────────┘

┌────────────┐  ┌────────────┐
│ [IMG]   ♡ │  │ [IMG]   ❤ │
│ ...        │  │ ...        │
└────────────┘  └────────────┘
```

---

## 🔧 Configuration

### API Base URL

File: `mobile/src/services/api.js`

```javascript
const baseURL = Platform.select({
  android: 'http://10.0.2.2:5000/api',      // Android Emulator
  ios: 'http://localhost:5000/api',          // iOS Simulator
  default: 'http://192.168.100.45:5000/api'  // Physical Device (thay bằng IP máy)
});
```

**Lưu ý:**
- **Android Emulator**: Dùng `10.0.2.2` để truy cập localhost của máy host
- **iOS Simulator**: Dùng `localhost`
- **Physical Device**: Dùng IP LAN của máy (ví dụ: `192.168.1.100`)

Để lấy IP máy:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

---

## 🧪 Testing

### 1. Test Backend APIs

```bash
# Phòng đề xuất
curl http://localhost:5000/api/rooms/recommend

# Lọc phòng
curl "http://localhost:5000/api/rooms?minPrice=2000000&maxPrice=3000000"

# Tin đã xem (cần token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/users/me/recent-views
```

### 2. Test Mobile App

1. **Chạy backend:**
```bash
cd backend
npm start
```

2. **Chạy mobile:**
```bash
cd mobile
npx expo start
```

3. **Test flow:**
   - Mở app → Xem trang chủ
   - Bấm filter chips → Kiểm tra danh sách phòng thay đổi
   - Scroll xuống → Xem "Tin đã xem" (nếu đã đăng nhập)
   - Bấm vào phòng → Navigate tới RoomDetail
   - Bấm nút ❤️ → Toggle favorite

---

## 📊 Mock Data (for demo)

Nếu backend chưa có data, dùng mock:

```javascript
const mockRecommendedRooms = [
  {
    _id: '1',
    title: 'Phòng trọ cao cấp gần ĐH Bách Khoa',
    price: 3000000,
    area: 25,
    type: 'Phòng trọ',
    address: '123 Lý Thường Kiệt, Quận 10, TP.HCM',
    images: ['https://picsum.photos/300/200?random=1'],
  },
  {
    _id: '2',
    title: 'Căn hộ mini 1PN đầy đủ nội thất',
    price: 4500000,
    area: 30,
    type: 'Căn hộ',
    address: '456 Nguyễn Trãi, Quận 5, TP.HCM',
    images: ['https://picsum.photos/300/200?random=2'],
  },
];
```

---

## ✅ Checklist Implementation

- [x] Backend: GET /rooms/recommend
- [x] Backend: GET /users/me/recent-views
- [x] Backend: Filter rooms by price & area
- [x] Frontend: HomeScreen UI
- [x] Frontend: RoomCard component (2 columns)
- [x] Frontend: Search bar
- [x] Frontend: Filter chips
- [x] Frontend: Recent views slider
- [x] Frontend: API integration
- [x] Frontend: Pull-to-refresh
- [x] Frontend: Loading states
- [x] Frontend: Favorite toggle

---

## 🚀 Next Steps

1. ✅ Test với backend thật
2. ⏳ Thêm filter "Tiện ích" (amenities)
3. ⏳ Implement SearchResultsScreen
4. ⏳ Thêm pagination cho danh sách phòng
5. ⏳ Cache data với AsyncStorage
6. ⏳ Thêm animations (Animated API)

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs (Metro bundler)
2. Verify backend running (`http://localhost:5000/api/rooms`)
3. Check API baseURL đúng với device
4. Verify token nếu dùng APIs cần auth

**Logs để debug:**
```
📡 API baseURL: ...
📤 Request: GET /rooms/recommend
✅ Response: /rooms/recommend 200
❌ Response error: 401 {...}
```
