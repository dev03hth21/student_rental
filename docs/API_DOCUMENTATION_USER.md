# API Documentation - Student/User Role

Complete API documentation for Student/User features in the Student Rental Platform.

**Base URL:** `http://localhost:5000/api`

**Authentication:** Most endpoints require JWT token in Authorization header
```
Authorization: Bearer <your_jwt_token>
```

---

## Table of Contents

1. [Rooms API](#rooms-api)
2. [Favorites API](#favorites-api)
3. [View Logs API](#view-logs-api)
4. [Call Logs API](#call-logs-api)
5. [User Profile API](#user-profile-api)
6. [Error Codes](#error-codes)

---

## Rooms API

### 1. Get Recommended Rooms

Get trending and newly posted rooms.

**Endpoint:** `GET /rooms/recommend`

**Auth:** Not required (Public)

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| limit | Number | No | 10 | Number of rooms to return |

**Request Example:**
```
GET /api/rooms/recommend?limit=6
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách phòng đề xuất thành công",
  "data": {
    "rooms": [
      {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
        "title": "Phòng trọ gần ĐH Bách Khoa",
        "description": "Phòng đẹp, thoáng mát, đầy đủ nội thất",
        "price": 3000000,
        "area": 25,
        "address": "123 Lý Thường Kiệt, Q.10, TP.HCM",
        "images": [
          "https://cloudinary.com/image1.jpg",
          "https://cloudinary.com/image2.jpg"
        ],
        "location": {
          "lat": 10.7769,
          "lng": 106.7009,
          "type": "Point",
          "coordinates": [106.7009, 10.7769]
        },
        "contactPhone": "0901234567",
        "status": "available",
        "ownerId": {
          "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
          "name": "Nguyễn Văn A",
          "phone": "0901234567",
          "avatar": "https://cloudinary.com/avatar.jpg"
        },
        "createdAt": "2024-12-01T10:30:00.000Z",
        "updatedAt": "2024-12-01T10:30:00.000Z"
      }
    ]
  }
}
```

---

### 2. Search/Filter Rooms

Search rooms with filters, sorting, and pagination.

**Endpoint:** `GET /rooms`

**Auth:** Not required (Public)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| keyword | String | No | Search in title, description, address |
| minPrice | Number | No | Minimum price (VND) |
| maxPrice | Number | No | Maximum price (VND) |
| minArea | Number | No | Minimum area (m²) |
| maxArea | Number | No | Maximum area (m²) |
| lat | Number | No | Latitude for geo search |
| lng | Number | No | Longitude for geo search |
| radius | Number | No | Search radius in km (default: 5) |
| sort | String | No | Sort field: `price`, `-price`, `area`, `-area`, `-createdAt` |
| page | Number | No | Page number (default: 1) |
| limit | Number | No | Items per page (default: 10) |

**Request Example:**
```
GET /api/rooms?keyword=bách+khoa&minPrice=2000000&maxPrice=5000000&minArea=20&sort=-createdAt&page=1&limit=10
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách phòng thành công",
  "data": {
    "rooms": [
      {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
        "title": "Phòng trọ gần ĐH Bách Khoa",
        "price": 3000000,
        "area": 25,
        "address": "123 Lý Thường Kiệt, Q.10",
        "images": ["https://cloudinary.com/image1.jpg"],
        "location": {
          "lat": 10.7769,
          "lng": 106.7009
        },
        "status": "available",
        "createdAt": "2024-12-01T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

---

### 3. Get Room Detail

Get detailed information about a specific room.

**Endpoint:** `GET /rooms/:id`

**Auth:** Not required (Public)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Example:**
```
GET /api/rooms/64f5a1b2c3d4e5f6a7b8c9d0
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin phòng thành công",
  "data": {
    "room": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
      "title": "Phòng trọ gần ĐH Bách Khoa",
      "description": "Phòng đẹp, thoáng mát, đầy đủ nội thất. Gần trường, siêu thị, bệnh viện.",
      "price": 3000000,
      "area": 25,
      "address": "123 Lý Thường Kiệt, Q.10, TP.HCM",
      "images": [
        "https://cloudinary.com/image1.jpg",
        "https://cloudinary.com/image2.jpg",
        "https://cloudinary.com/image3.jpg"
      ],
      "location": {
        "lat": 10.7769,
        "lng": 106.7009,
        "type": "Point",
        "coordinates": [106.7009, 10.7769]
      },
      "contactPhone": "0901234567",
      "status": "available",
      "callCount": 15,
      "ownerId": {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d1",
        "name": "Nguyễn Văn A",
        "email": "owner@example.com",
        "phone": "0901234567",
        "avatar": "https://cloudinary.com/avatar.jpg",
        "createdAt": "2023-01-15T08:00:00.000Z"
      },
      "createdAt": "2024-12-01T10:30:00.000Z",
      "updatedAt": "2024-12-05T14:20:00.000Z"
    }
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Không tìm thấy phòng"
}
```

---

## Favorites API

### 1. Add Room to Favorites

Add a room to user's favorite list.

**Endpoint:** `POST /favorites`

**Auth:** Required (Student role)

**Request Body:**
```json
{
  "roomId": "64f5a1b2c3d4e5f6a7b8c9d0"
}
```

**Request Example:**
```bash
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "64f5a1b2c3d4e5f6a7b8c9d0"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích",
  "data": {
    "favorite": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
      "userId": "64f5a1b2c3d4e5f6a7b8c9d3",
      "roomId": "64f5a1b2c3d4e5f6a7b8c9d0",
      "createdAt": "2024-12-09T15:30:00.000Z",
      "updatedAt": "2024-12-09T15:30:00.000Z"
    }
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "roomId không hợp lệ"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Không tìm thấy phòng"
}
```

---

### 2. Remove Room from Favorites

Remove a room from user's favorite list (by room ID).

**Endpoint:** `DELETE /favorites/by-room/:roomId`

**Auth:** Required (Student role)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| roomId | String | Yes | Room ObjectId |

**Request Example:**
```bash
DELETE /api/favorites/by-room/64f5a1b2c3d4e5f6a7b8c9d0
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Đã xoá khỏi danh sách yêu thích"
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Không tìm thấy mục yêu thích"
}
```

---

### 3. Get My Favorites

Get all rooms in user's favorite list.

**Endpoint:** `GET /favorites/my`

**Auth:** Required (Student role)

**Request Example:**
```bash
GET /api/favorites/my
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy danh sách yêu thích thành công",
  "data": {
    "favorites": [
      {
        "_id": "64f5a1b2c3d4e5f6a7b8c9d2",
        "userId": "64f5a1b2c3d4e5f6a7b8c9d3",
        "roomId": {
          "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
          "title": "Phòng trọ gần ĐH Bách Khoa",
          "price": 3000000,
          "area": 25,
          "address": "123 Lý Thường Kiệt, Q.10",
          "images": ["https://cloudinary.com/image1.jpg"],
          "location": {
            "lat": 10.7769,
            "lng": 106.7009
          },
          "status": "available",
          "contactPhone": "0901234567",
          "createdAt": "2024-12-01T10:30:00.000Z"
        },
        "createdAt": "2024-12-09T15:30:00.000Z",
        "updatedAt": "2024-12-09T15:30:00.000Z"
      }
    ]
  }
}
```

---

## View Logs API

### 1. Record Room View

Record that a user viewed a room (for recent views history).

**Endpoint:** `POST /rooms/:id/view`

**Auth:** Required (Student role)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Example:**
```bash
POST /api/rooms/64f5a1b2c3d4e5f6a7b8c9d0/view
Authorization: Bearer <token>
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Đã ghi nhận lượt xem phòng",
  "data": {
    "viewLog": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d4",
      "userId": "64f5a1b2c3d4e5f6a7b8c9d3",
      "roomId": "64f5a1b2c3d4e5f6a7b8c9d0",
      "viewedAt": "2024-12-09T16:00:00.000Z",
      "createdAt": "2024-12-09T16:00:00.000Z",
      "updatedAt": "2024-12-09T16:00:00.000Z"
    }
  }
}
```

**Note:** If user viewed the same room within 5 minutes, the existing log will be updated instead of creating a new one.

---

### 2. Get Recent Views

Get user's recently viewed rooms (last 10 rooms).

**Endpoint:** `GET /users/me/recent-views`

**Auth:** Required (Student role)

**Request Example:**
```bash
GET /api/users/me/recent-views
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy lịch sử phòng đã xem thành công",
  "data": {
    "views": [
      {
        "id": "64f5a1b2c3d4e5f6a7b8c9d4",
        "room": {
          "_id": "64f5a1b2c3d4e5f6a7b8c9d0",
          "title": "Phòng trọ gần ĐH Bách Khoa",
          "price": 3000000,
          "area": 25,
          "address": "123 Lý Thường Kiệt, Q.10",
          "images": ["https://cloudinary.com/image1.jpg"],
          "status": "available",
          "createdAt": "2024-12-01T10:30:00.000Z"
        },
        "viewedAt": "2024-12-09T16:00:00.000Z"
      }
    ]
  }
}
```

---

## Call Logs API

### 1. Record Call to Owner

Record that a user called the room owner (tracks call count).

**Endpoint:** `POST /rooms/:id/call`

**Auth:** Required (Student role)

**URL Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Example:**
```bash
POST /api/rooms/64f5a1b2c3d4e5f6a7b8c9d0/call
Authorization: Bearer <token>
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Đã ghi nhận cuộc gọi",
  "data": {
    "callLog": {
      "_id": "64f5a1b2c3d4e5f6a7b8c9d5",
      "roomId": "64f5a1b2c3d4e5f6a7b8c9d0",
      "hostId": "64f5a1b2c3d4e5f6a7b8c9d1",
      "studentId": "64f5a1b2c3d4e5f6a7b8c9d3",
      "callerEmail": "student@example.com",
      "phoneNumber": "0901234567",
      "isRead": false,
      "createdAt": "2024-12-09T16:30:00.000Z",
      "updatedAt": "2024-12-09T16:30:00.000Z"
    }
  }
}
```

**Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Không tìm thấy phòng"
}
```

---

## User Profile API

### 1. Get My Profile

Get current user's profile information.

**Endpoint:** `GET /users/me`

**Auth:** Required

**Request Example:**
```bash
GET /api/users/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "name": "Nguyễn Văn B",
    "fullName": "Nguyễn Văn B",
    "email": "student@example.com",
    "phone": "0909876543",
    "avatar": "https://cloudinary.com/avatar2.jpg",
    "role": "student",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-12-01T14:30:00.000Z"
  }
}
```

---

### 2. Update My Profile

Update current user's profile information.

**Endpoint:** `PUT /users/me`

**Auth:** Required

**Request Body:**
```json
{
  "name": "Nguyễn Văn C",
  "phone": "0908765432"
}
```

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | String | No | Min 2 characters |
| fullName | String | No | Min 2 characters (alias for name) |
| phone | String | No | Must be unique |
| avatar | String | No | URL string |

**Request Example:**
```bash
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nguyễn Văn C",
  "phone": "0908765432"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "id": "64f5a1b2c3d4e5f6a7b8c9d3",
    "name": "Nguyễn Văn C",
    "fullName": "Nguyễn Văn C",
    "email": "student@example.com",
    "phone": "0908765432",
    "avatar": "https://cloudinary.com/avatar2.jpg",
    "role": "student",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-12-09T17:00:00.000Z"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Tên phải từ 2 ký tự trở lên"
}
```

```json
{
  "success": false,
  "message": "Số điện thoại đã được sử dụng"
}
```

---

### 3. Delete My Account

Request to delete user account (sends deletion request).

**Endpoint:** `DELETE /users/me`

**Auth:** Required

**Request Example:**
```bash
DELETE /api/users/me
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Yêu cầu xóa tài khoản đã được ghi nhận. Chúng tôi sẽ xử lý trong vòng 24h.",
  "data": {
    "userId": "64f5a1b2c3d4e5f6a7b8c9d3",
    "requestedAt": "2024-12-09T17:30:00.000Z"
  }
}
```

**Note:** This endpoint currently only records the deletion request. Full account deletion (including related data) will be implemented in a future version.

---

## Error Codes

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data/parameters |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | User doesn't have permission |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

### Common Error Messages

**Authentication Errors:**
```json
{
  "success": false,
  "message": "Không có token, truy cập bị từ chối"
}
```

```json
{
  "success": false,
  "message": "Token không hợp lệ"
}
```

**Authorization Errors:**
```json
{
  "success": false,
  "message": "Bạn không có quyền truy cập"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "message": "roomId không hợp lệ"
}
```

```json
{
  "success": false,
  "message": "Tên không được để trống"
}
```

**Resource Not Found:**
```json
{
  "success": false,
  "message": "Không tìm thấy phòng"
}
```

```json
{
  "success": false,
  "message": "Không tìm thấy người dùng"
}
```

---

## Notes

1. **JWT Token:** Most endpoints require authentication. Include JWT token in Authorization header.

2. **ObjectId Validation:** All IDs are validated as MongoDB ObjectIds. Invalid IDs return 400 error.

3. **Timestamps:** All resources include `createdAt` and `updatedAt` fields in ISO 8601 format.

4. **Pagination:** Default limit is 10 items per page. Maximum limit may be capped by server.

5. **Geo Search:** When using lat/lng, radius defaults to 5km. Coordinates use GeoJSON format [lng, lat].

6. **Data Relationships:** Most endpoints populate related data (e.g., roomId, ownerId) automatically.

7. **Rate Limiting:** View logs are deduplicated within 5-minute windows to prevent spam.

8. **File Upload:** Avatar upload requires multipart/form-data with field name `avatar`.

---

## Example: Complete User Flow

### 1. Search for rooms
```bash
GET /api/rooms?keyword=bách+khoa&minPrice=2000000&maxPrice=5000000
```

### 2. View room detail
```bash
GET /api/rooms/64f5a1b2c3d4e5f6a7b8c9d0
```

### 3. Record view (automatic)
```bash
POST /api/rooms/64f5a1b2c3d4e5f6a7b8c9d0/view
Authorization: Bearer <token>
```

### 4. Add to favorites
```bash
POST /api/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomId": "64f5a1b2c3d4e5f6a7b8c9d0"
}
```

### 5. Call owner
```bash
POST /api/rooms/64f5a1b2c3d4e5f6a7b8c9d0/call
Authorization: Bearer <token>
```

### 6. View history
```bash
GET /api/users/me/recent-views
Authorization: Bearer <token>
```

### 7. View favorites
```bash
GET /api/favorites/my
Authorization: Bearer <token>
```

---

**Last Updated:** December 9, 2024  
**API Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`
