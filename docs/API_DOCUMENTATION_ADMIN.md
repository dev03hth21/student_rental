# API DOCUMENTATION - ADMIN ROLE

Complete API reference for Admin operations in the Student Rental Platform.

**Base URL:** `http://192.168.100.45:5000/api/admin`

**Authentication:** All endpoints require JWT token with `role = 'admin'`

---

## TABLE OF CONTENTS

1. [User Management APIs](#user-management-apis)
2. [Host Management APIs](#host-management-apis)
3. [Room Management APIs](#room-management-apis)
4. [Dashboard & Summary APIs](#dashboard--summary-apis)
5. [Admin Profile APIs](#admin-profile-apis)
6. [Error Codes](#error-codes)
7. [Common Error Messages](#common-error-messages)

---

## USER MANAGEMENT APIS

### 1. Get All Users

Get list of all users with filters and pagination.

**Endpoint:** `GET /api/admin/users`

**Auth Required:** Yes (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Number | No | 1 | Page number for pagination |
| limit | Number | No | 20 | Number of items per page |
| role | String | No | - | Filter by role: `student`, `owner`, `admin` |
| search | String | No | - | Search by name, email, or phone |
| sort | String | No | -createdAt | Sort field (prefix with `-` for descending) |
| status | String | No | - | Filter by status: `active`, `inactive` |

**Request Example:**

```bash
GET /api/admin/users?page=1&limit=20&role=student&search=nguyen&sort=-createdAt
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy danh sách người dùng thành công",
  "data": {
    "users": [
      {
        "_id": "65f3c2b1a8e4f5c6d7e8f901",
        "fullName": "Nguyễn Văn A",
        "email": "nguyenvana@gmail.com",
        "phone": "0901234567",
        "role": "student",
        "avatar": "https://res.cloudinary.com/...",
        "isActive": true,
        "createdAt": "2024-03-15T10:30:00.000Z",
        "updatedAt": "2024-03-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 20,
      "totalPages": 8,
      "hasMore": true
    }
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "message": "Lỗi server"
}
```

---

### 2. Get User By ID

Get detailed information of a specific user.

**Endpoint:** `GET /api/admin/users/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | User ObjectId |

**Request Example:**

```bash
GET /api/admin/users/65f3c2b1a8e4f5c6d7e8f901
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy thông tin người dùng thành công",
  "data": {
    "user": {
      "_id": "65f3c2b1a8e4f5c6d7e8f901",
      "fullName": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "phone": "0901234567",
      "role": "student",
      "avatar": "https://res.cloudinary.com/...",
      "isActive": true,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z",
      "statistics": {
        "roomsPosted": 0,
        "bookings": 5,
        "reports": 0
      }
    }
  }
}
```

**Error Response (400/404/500):**

```json
{
  "success": false,
  "message": "ID người dùng không hợp lệ"
}
```

```json
{
  "success": false,
  "message": "Không tìm thấy người dùng"
}
```

---

### 3. Update User

Update user information.

**Endpoint:** `PUT /api/admin/users/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | User ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | No | User's full name |
| email | String | No | User's email (must be unique) |
| phone | String | No | User's phone (must be unique) |
| role | String | No | User role: `student`, `owner`, `admin` |
| isActive | Boolean | No | Account active status |

**Request Example:**

```bash
PUT /api/admin/users/65f3c2b1a8e4f5c6d7e8f901
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A Updated",
  "email": "nguyenvana.updated@gmail.com",
  "phone": "0901234568",
  "role": "owner",
  "isActive": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cập nhật người dùng thành công",
  "data": {
    "user": {
      "_id": "65f3c2b1a8e4f5c6d7e8f901",
      "fullName": "Nguyễn Văn A Updated",
      "email": "nguyenvana.updated@gmail.com",
      "phone": "0901234568",
      "role": "owner",
      "isActive": true,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-20T14:25:00.000Z"
    }
  }
}
```

**Error Response (400/403/404/500):**

```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

```json
{
  "success": false,
  "message": "Bạn không thể thay đổi quyền của chính mình"
}
```

---

### 4. Delete User

Delete or deactivate a user.

**Endpoint:** `DELETE /api/admin/users/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | User ObjectId |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hardDelete | String | No | false | Set to `'true'` for permanent deletion |

**Request Example:**

```bash
# Soft delete (deactivate)
DELETE /api/admin/users/65f3c2b1a8e4f5c6d7e8f901
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Hard delete (permanent)
DELETE /api/admin/users/65f3c2b1a8e4f5c6d7e8f901?hardDelete=true
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200) - Soft Delete:**

```json
{
  "success": true,
  "message": "Vô hiệu hóa người dùng thành công",
  "data": {
    "user": {
      "_id": "65f3c2b1a8e4f5c6d7e8f901",
      "fullName": "Nguyễn Văn A",
      "isActive": false
    }
  }
}
```

**Success Response (200) - Hard Delete:**

```json
{
  "success": true,
  "message": "Xóa người dùng vĩnh viễn thành công",
  "data": {
    "deleted": true,
    "userId": "65f3c2b1a8e4f5c6d7e8f901"
  }
}
```

**Error Response (400/403/404/500):**

```json
{
  "success": false,
  "message": "Bạn không thể xóa tài khoản của chính mình"
}
```

---

## HOST MANAGEMENT APIS

### 5. Get All Hosts

Get list of all hosts (users with role = 'owner') with statistics.

**Endpoint:** `GET /api/admin/hosts`

**Auth Required:** Yes (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Number | No | 1 | Page number for pagination |
| limit | Number | No | 20 | Number of items per page |
| search | String | No | - | Search by name, email, or phone |
| sort | String | No | -createdAt | Sort field |
| status | String | No | - | Filter by status: `active`, `inactive` |

**Request Example:**

```bash
GET /api/admin/hosts?page=1&limit=20&search=nguyen&status=active
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy danh sách chủ nhà thành công",
  "data": {
    "hosts": [
      {
        "_id": "65f3c2b1a8e4f5c6d7e8f902",
        "fullName": "Trần Thị B",
        "email": "tranthib@gmail.com",
        "phone": "0912345678",
        "role": "owner",
        "avatar": "https://res.cloudinary.com/...",
        "isActive": true,
        "createdAt": "2024-03-10T08:20:00.000Z",
        "statistics": {
          "totalRooms": 15,
          "activeRooms": 12,
          "pendingRooms": 3
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3,
      "hasMore": true
    }
  }
}
```

---

### 6. Get Host By ID

Get detailed information of a specific host with statistics.

**Endpoint:** `GET /api/admin/hosts/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Host ObjectId |

**Request Example:**

```bash
GET /api/admin/hosts/65f3c2b1a8e4f5c6d7e8f902
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy thông tin chủ nhà thành công",
  "data": {
    "host": {
      "_id": "65f3c2b1a8e4f5c6d7e8f902",
      "fullName": "Trần Thị B",
      "email": "tranthib@gmail.com",
      "phone": "0912345678",
      "role": "owner",
      "avatar": "https://res.cloudinary.com/...",
      "isActive": true,
      "createdAt": "2024-03-10T08:20:00.000Z",
      "statistics": {
        "totalRooms": 15,
        "roomsByStatus": {
          "pending": 3,
          "approved": 10,
          "rejected": 2
        },
        "totalBookings": 45,
        "totalRevenue": 125000000
      },
      "recentRooms": [
        {
          "_id": "65f3c2b1a8e4f5c6d7e8f903",
          "title": "Phòng trọ sinh viên gần ĐH Thủ Dầu Một",
          "price": 2500000,
          "area": 25,
          "address": {...},
          "images": ["..."],
          "status": "approved",
          "createdAt": "2024-03-18T10:00:00.000Z"
        }
      ]
    }
  }
}
```

---

### 7. Update Host

Update host information.

**Endpoint:** `PUT /api/admin/hosts/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Host ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | No | Host's full name |
| email | String | No | Host's email (must be unique) |
| phone | String | No | Host's phone (must be unique) |
| isActive | Boolean | No | Account active status |

**Request Example:**

```bash
PUT /api/admin/hosts/65f3c2b1a8e4f5c6d7e8f902
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "Trần Thị B Updated",
  "isActive": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cập nhật chủ nhà thành công",
  "data": {
    "host": {
      "_id": "65f3c2b1a8e4f5c6d7e8f902",
      "fullName": "Trần Thị B Updated",
      "email": "tranthib@gmail.com",
      "phone": "0912345678",
      "role": "owner",
      "isActive": true,
      "updatedAt": "2024-03-20T15:00:00.000Z"
    }
  }
}
```

---

### 8. Delete Host

Delete or deactivate a host.

**Endpoint:** `DELETE /api/admin/hosts/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Host ObjectId |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hardDelete | String | No | false | Set to `'true'` for permanent deletion |

**Request Example:**

```bash
DELETE /api/admin/hosts/65f3c2b1a8e4f5c6d7e8f902?hardDelete=false
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Vô hiệu hóa chủ nhà thành công",
  "data": {
    "host": {
      "_id": "65f3c2b1a8e4f5c6d7e8f902",
      "isActive": false
    }
  }
}
```

---

## ROOM MANAGEMENT APIS

### 9. Get All Rooms

Get list of all rooms with admin filters.

**Endpoint:** `GET /api/admin/rooms`

**Auth Required:** Yes (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Number | No | 1 | Page number |
| limit | Number | No | 20 | Items per page |
| status | String | No | - | Filter: `pending`, `approved`, `rejected` |
| ownerId | String | No | - | Filter by owner ObjectId |
| search | String | No | - | Search in title, description, address |
| sort | String | No | -createdAt | Sort field |
| minPrice | Number | No | - | Minimum price filter |
| maxPrice | Number | No | - | Maximum price filter |
| minArea | Number | No | - | Minimum area filter |
| maxArea | Number | No | - | Maximum area filter |

**Request Example:**

```bash
GET /api/admin/rooms?page=1&limit=20&status=pending&sort=-createdAt
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy danh sách phòng thành công",
  "data": {
    "rooms": [
      {
        "_id": "65f3c2b1a8e4f5c6d7e8f903",
        "title": "Phòng trọ sinh viên gần ĐH Thủ Dầu Một",
        "description": "Phòng sạch sẽ, tiện nghi đầy đủ",
        "price": 2500000,
        "area": 25,
        "address": {
          "street": "123 Đường ABC",
          "ward": "Phường Phú Hòa",
          "district": "Thành phố Thủ Dầu Một",
          "city": "Bình Dương"
        },
        "images": ["https://res.cloudinary.com/..."],
        "status": "pending",
        "ownerId": {
          "_id": "65f3c2b1a8e4f5c6d7e8f902",
          "fullName": "Trần Thị B",
          "email": "tranthib@gmail.com",
          "phone": "0912345678",
          "avatar": "https://res.cloudinary.com/..."
        },
        "createdAt": "2024-03-18T10:00:00.000Z",
        "updatedAt": "2024-03-18T10:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 120,
      "page": 1,
      "limit": 20,
      "totalPages": 6,
      "hasMore": true
    }
  }
}
```

---

### 10. Get Room By ID

Get detailed information of a specific room.

**Endpoint:** `GET /api/admin/rooms/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Example:**

```bash
GET /api/admin/rooms/65f3c2b1a8e4f5c6d7e8f903
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy thông tin phòng thành công",
  "data": {
    "room": {
      "_id": "65f3c2b1a8e4f5c6d7e8f903",
      "title": "Phòng trọ sinh viên gần ĐH Thủ Dầu Một",
      "description": "Phòng sạch sẽ, tiện nghi đầy đủ",
      "price": 2500000,
      "area": 25,
      "address": {...},
      "images": ["..."],
      "utilities": ["Wifi", "Điều hòa", "Máy giặt"],
      "status": "pending",
      "ownerId": {
        "_id": "65f3c2b1a8e4f5c6d7e8f902",
        "fullName": "Trần Thị B",
        "email": "tranthib@gmail.com",
        "phone": "0912345678"
      },
      "statistics": {
        "bookings": 5,
        "views": 150,
        "favorites": 20
      },
      "createdAt": "2024-03-18T10:00:00.000Z"
    }
  }
}
```

---

### 11. Approve Room

Approve a pending room.

**Endpoint:** `PATCH /api/admin/rooms/:id/approve`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| note | String | No | Admin note for approval |

**Request Example:**

```bash
PATCH /api/admin/rooms/65f3c2b1a8e4f5c6d7e8f903/approve
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "note": "Phòng đạt tiêu chuẩn, đã duyệt"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Duyệt phòng thành công",
  "data": {
    "room": {
      "_id": "65f3c2b1a8e4f5c6d7e8f903",
      "title": "Phòng trọ sinh viên gần ĐH Thủ Dầu Một",
      "status": "approved",
      "approvedBy": "65f3c2b1a8e4f5c6d7e8f900",
      "approvedAt": "2024-03-20T16:00:00.000Z",
      "adminNote": "Phòng đạt tiêu chuẩn, đã duyệt",
      "ownerId": {
        "_id": "65f3c2b1a8e4f5c6d7e8f902",
        "fullName": "Trần Thị B"
      }
    }
  }
}
```

**Error Response (400/404/500):**

```json
{
  "success": false,
  "message": "Phòng đã được duyệt trước đó"
}
```

---

### 12. Reject Room

Reject a pending room with reason.

**Endpoint:** `PATCH /api/admin/rooms/:id/reject`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | String | Yes | Reason for rejection |

**Request Example:**

```bash
PATCH /api/admin/rooms/65f3c2b1a8e4f5c6d7e8f903/reject
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "reason": "Hình ảnh không rõ ràng, vui lòng cập nhật lại"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Từ chối phòng thành công",
  "data": {
    "room": {
      "_id": "65f3c2b1a8e4f5c6d7e8f903",
      "title": "Phòng trọ sinh viên gần ĐH Thủ Dầu Một",
      "status": "rejected",
      "rejectedBy": "65f3c2b1a8e4f5c6d7e8f900",
      "rejectedAt": "2024-03-20T16:05:00.000Z",
      "adminNote": "Hình ảnh không rõ ràng, vui lòng cập nhật lại",
      "ownerId": {
        "_id": "65f3c2b1a8e4f5c6d7e8f902",
        "fullName": "Trần Thị B"
      }
    }
  }
}
```

**Error Response (400/404/500):**

```json
{
  "success": false,
  "message": "Vui lòng nhập lý do từ chối"
}
```

---

### 13. Delete Room

Delete a room (hard delete).

**Endpoint:** `DELETE /api/admin/rooms/:id`

**Auth Required:** Yes (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Example:**

```bash
DELETE /api/admin/rooms/65f3c2b1a8e4f5c6d7e8f903
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Xóa phòng thành công",
  "data": {
    "deleted": true,
    "roomId": "65f3c2b1a8e4f5c6d7e8f903"
  }
}
```

**Error Response (400/404/500):**

```json
{
  "success": false,
  "message": "Không thể xóa phòng có booking đang hoạt động"
}
```

---

## DASHBOARD & SUMMARY APIS

### 14. Get Summary Statistics

Get comprehensive dashboard summary for admin.

**Endpoint:** `GET /api/admin/summary`

**Auth Required:** Yes (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | Number | No | 30 | Days to look back for statistics |

**Request Example:**

```bash
GET /api/admin/summary?period=30
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy thống kê tổng quan thành công",
  "data": {
    "summary": {
      "users": {
        "total": 1500,
        "new": 150,
        "byRole": {
          "students": 1200,
          "owners": 280,
          "admins": 20
        }
      },
      "hosts": {
        "total": 280,
        "active": 260
      },
      "rooms": {
        "total": 850,
        "pending": 45,
        "approved": 750,
        "rejected": 55,
        "new": 120
      },
      "bookings": {
        "total": 3200,
        "pending": 150,
        "confirmed": 200,
        "completed": 2850
      },
      "payments": {
        "total": 3000,
        "totalRevenue": 8500000000,
        "revenueThisPeriod": 950000000
      },
      "reports": {
        "total": 45,
        "pending": 5
      },
      "period": {
        "days": 30,
        "startDate": "2024-02-20T00:00:00.000Z"
      }
    }
  }
}
```

---

### 15. Get Dashboard (Legacy)

Get comprehensive admin dashboard with detailed analytics.

**Endpoint:** `GET /api/admin/dashboard`

**Auth Required:** Yes (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | Number | No | 30 | Days to look back |

**Request Example:**

```bash
GET /api/admin/dashboard?period=30
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Admin dashboard data retrieved successfully",
  "data": {
    "summary": {...},
    "charts": {...},
    "recentActivity": {...}
  }
}
```

---

## ADMIN PROFILE APIS

### 16. Get Admin Profile

Get current admin's profile and activity statistics.

**Endpoint:** `GET /api/admin/profile`

**Auth Required:** Yes (Admin only)

**Request Example:**

```bash
GET /api/admin/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Lấy thông tin admin thành công",
  "data": {
    "admin": {
      "_id": "65f3c2b1a8e4f5c6d7e8f900",
      "fullName": "Admin User",
      "email": "admin@studentrental.com",
      "phone": "0900000000",
      "role": "admin",
      "avatar": "https://res.cloudinary.com/...",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "statistics": {
        "roomsApproved": 750,
        "roomsRejected": 55,
        "totalActions": 805
      }
    }
  }
}
```

---

### 17. Update Admin Profile

Update current admin's profile information.

**Endpoint:** `PUT /api/admin/profile`

**Auth Required:** Yes (Admin only)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | No | Admin's full name |
| email | String | No | Admin's email (must be unique) |
| phone | String | No | Admin's phone (must be unique) |
| currentPassword | String | No* | Current password (required if changing password) |
| newPassword | String | No* | New password (required if changing password) |

**Request Example:**

```bash
PUT /api/admin/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "Admin User Updated",
  "email": "admin.updated@studentrental.com",
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Cập nhật profile admin thành công",
  "data": {
    "admin": {
      "_id": "65f3c2b1a8e4f5c6d7e8f900",
      "fullName": "Admin User Updated",
      "email": "admin.updated@studentrental.com",
      "phone": "0900000000",
      "role": "admin",
      "updatedAt": "2024-03-20T17:00:00.000Z"
    }
  }
}
```

**Error Response (400/500):**

```json
{
  "success": false,
  "message": "Mật khẩu hiện tại không chính xác"
}
```

```json
{
  "success": false,
  "message": "Mật khẩu mới phải có ít nhất 6 ký tự"
}
```

---

## ERROR CODES

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST (creation) |
| 400 | Bad Request | Invalid parameters, validation errors |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not admin role, insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate data (email, phone) |
| 500 | Server Error | Internal server error |

---

## COMMON ERROR MESSAGES

### Authentication Errors

```json
{
  "success": false,
  "message": "Không có token, truy cập bị từ chối"
}
```

```json
{
  "success": false,
  "message": "Không có quyền truy cập"
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "ID người dùng không hợp lệ"
}
```

```json
{
  "success": false,
  "message": "Email đã được sử dụng"
}
```

```json
{
  "success": false,
  "message": "Số điện thoại đã được sử dụng"
}
```

### Permission Errors

```json
{
  "success": false,
  "message": "Bạn không thể xóa tài khoản của chính mình"
}
```

```json
{
  "success": false,
  "message": "Bạn không thể thay đổi quyền của chính mình"
}
```

### Not Found Errors

```json
{
  "success": false,
  "message": "Không tìm thấy người dùng"
}
```

```json
{
  "success": false,
  "message": "Không tìm thấy phòng"
}
```

---

## NOTES

1. **Authentication**: All admin endpoints require JWT token with `role = 'admin'`. Include token in `Authorization: Bearer <token>` header.

2. **Pagination**: Most list endpoints support pagination with `page` and `limit` parameters. Response includes pagination metadata.

3. **Soft Delete vs Hard Delete**: 
   - Soft delete: Sets `isActive = false`, data remains in database
   - Hard delete: Permanently removes data (use with caution)

4. **Room Approval Workflow**:
   - New rooms start with `status = 'pending'`
   - Admin can approve (status → `'approved'`) or reject (status → `'rejected'`)
   - Rejection requires a reason
   - Approval can include optional note

5. **Search Functionality**: Search parameters use case-insensitive regex matching across multiple fields.

6. **Sort Parameters**: Prefix with `-` for descending order (e.g., `-createdAt`), no prefix for ascending.

7. **Statistics**: Many endpoints include computed statistics (room counts, bookings, revenue) for better admin insights.

8. **TODO Items**: Some endpoints have TODO comments for future enhancements:
   - Cascade delete for related data
   - Notification system for room approval/rejection
   - Admin activity logs

---

## COMPLETE ADMIN WORKFLOW EXAMPLE

### 1. Login as Admin

```bash
POST /api/auth/login
{
  "email": "admin@studentrental.com",
  "password": "adminPassword123"
}
```

### 2. View Dashboard Summary

```bash
GET /api/admin/summary?period=30
Authorization: Bearer <admin_token>
```

### 3. Review Pending Rooms

```bash
GET /api/admin/rooms?status=pending&page=1&limit=10
Authorization: Bearer <admin_token>
```

### 4. Approve a Room

```bash
PATCH /api/admin/rooms/65f3c2b1a8e4f5c6d7e8f903/approve
Authorization: Bearer <admin_token>
{
  "note": "Phòng đạt tiêu chuẩn"
}
```

### 5. View Host Details

```bash
GET /api/admin/hosts/65f3c2b1a8e4f5c6d7e8f902
Authorization: Bearer <admin_token>
```

### 6. Update User Status

```bash
PUT /api/admin/users/65f3c2b1a8e4f5c6d7e8f901
Authorization: Bearer <admin_token>
{
  "isActive": false
}
```

### 7. Update Admin Profile

```bash
PUT /api/admin/profile
Authorization: Bearer <admin_token>
{
  "fullName": "Admin Updated",
  "currentPassword": "oldPass",
  "newPassword": "newPass123"
}
```

---

**End of Admin API Documentation**

For Student/User APIs, see: `API_DOCUMENTATION_USER.md`

For Owner/Host APIs, see: `API_DOCUMENTATION_OWNER.md` (if available)
