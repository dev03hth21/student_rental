# API DOCUMENTATION - ADMIN ROLE

Complete API reference for Admin operations in the Student Rental Platform.

**Base URL:** `http://localhost:5000/api/admin`

**Authentication:** All endpoints require JWT token with `role = 'admin'`

**Authorization Header:**
```
Authorization: Bearer <your_jwt_token>
```

---

## TABLE OF CONTENTS

1. [Users Management](#users-management)
2. [Hosts Management](#hosts-management)
3. [Rooms Management](#rooms-management)
4. [Dashboard](#dashboard)
5. [Admin Profile](#admin-profile)
6. [Error Responses](#error-responses)

---

# USERS MANAGEMENT

## GET /api/admin/users

Trả về danh sách toàn bộ users với phân trang và filter.

**Method:** `GET`

**URL:** `/api/admin/users`

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Number | No | 1 | Số trang |
| limit | Number | No | 20 | Số lượng item mỗi trang |
| role | String | No | - | Filter theo role: `student`, `owner`, `admin` |
| search | String | No | - | Tìm kiếm theo tên, email, phone |
| sort | String | No | -createdAt | Sắp xếp (thêm `-` để DESC) |
| status | String | No | - | Filter theo status: `active`, `inactive` |

**Request Example:**

```bash
GET /api/admin/users?page=1&limit=20&role=student&search=nguyen
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
      },
      {
        "_id": "65f3c2b1a8e4f5c6d7e8f902",
        "fullName": "Trần Thị B",
        "email": "tranthib@gmail.com",
        "phone": "0912345678",
        "role": "owner",
        "avatar": "https://res.cloudinary.com/...",
        "isActive": true,
        "createdAt": "2024-03-14T08:20:00.000Z",
        "updatedAt": "2024-03-14T08:20:00.000Z"
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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 401 | Authentication required | Không có token hoặc token không hợp lệ |
| 403 | Access denied: admin only | User không phải admin |
| 500 | Lỗi server | Internal server error |

---

## GET /api/admin/users/{id}

Chi tiết thông tin một user cụ thể kèm statistics.

**Method:** `GET`

**URL:** `/api/admin/users/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | User ObjectId (24 ký tự hex) |

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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | ID người dùng không hợp lệ | ObjectId format không đúng |
| 401 | Authentication required | Không có token |
| 403 | Access denied: admin only | Không phải admin |
| 404 | Không tìm thấy người dùng | User không tồn tại |
| 500 | Lỗi server | Internal server error |

---

## PUT /api/admin/users/{id}

Cập nhật thông tin user (tên, email, phone, role, status).

**Method:** `PUT`

**URL:** `/api/admin/users/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | User ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | No | Tên đầy đủ của user |
| email | String | No | Email (phải unique) |
| phone | String | No | Số điện thoại (phải unique) |
| role | String | No | Role: `student`, `owner`, `admin` |
| isActive | Boolean | No | Trạng thái active/inactive |

**Request Example:**

```bash
PUT /api/admin/users/65f3c2b1a8e4f5c6d7e8f901
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A Updated",
  "email": "nguyenvana.updated@gmail.com",
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
      "phone": "0901234567",
      "role": "owner",
      "isActive": true,
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-20T14:25:00.000Z"
    }
  }
}
```

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Email đã được sử dụng | Email đã tồn tại |
| 400 | Số điện thoại đã được sử dụng | Phone đã tồn tại |
| 400 | ID người dùng không hợp lệ | ObjectId không đúng format |
| 403 | Bạn không thể thay đổi quyền của chính mình | Admin không thể tự demote |
| 404 | Không tìm thấy người dùng | User không tồn tại |
| 500 | Lỗi server | Internal server error |

---

## DELETE /api/admin/users/{id}

Xóa user (soft delete hoặc hard delete).

**Method:** `DELETE`

**URL:** `/api/admin/users/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | User ObjectId |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hardDelete | String | No | false | Set `'true'` để xóa vĩnh viễn |

**Request Example (Soft Delete):**

```bash
DELETE /api/admin/users/65f3c2b1a8e4f5c6d7e8f901
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Example (Hard Delete):**

```bash
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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | ID người dùng không hợp lệ | ObjectId không đúng format |
| 403 | Bạn không thể xóa tài khoản của chính mình | Admin không thể tự xóa |
| 404 | Không tìm thấy người dùng | User không tồn tại |
| 500 | Lỗi server | Internal server error |

---

# HOSTS MANAGEMENT

## GET /api/admin/hosts

Danh sách tất cả hosts (users có role = 'owner') kèm statistics.

**Method:** `GET`

**URL:** `/api/admin/hosts`

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Number | No | 1 | Số trang |
| limit | Number | No | 20 | Số lượng item mỗi trang |
| search | String | No | - | Tìm kiếm theo tên, email, phone |
| sort | String | No | -createdAt | Sắp xếp |
| status | String | No | - | Filter: `active`, `inactive` |

**Request Example:**

```bash
GET /api/admin/hosts?page=1&limit=20&search=tran&status=active
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

**Error Responses:**

Same as Users Management endpoints.

---

## GET /api/admin/hosts/{id}

Chi tiết thông tin một host kèm statistics và danh sách phòng gần đây.

**Method:** `GET`

**URL:** `/api/admin/hosts/:id`

**Authentication:** Required (Admin only)

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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | ID chủ nhà không hợp lệ | ObjectId không đúng format |
| 404 | Không tìm thấy chủ nhà | Host không tồn tại hoặc không phải owner |
| 500 | Lỗi server | Internal server error |

---

## PUT /api/admin/hosts/{id}

Cập nhật thông tin host.

**Method:** `PUT`

**URL:** `/api/admin/hosts/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Host ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | No | Tên đầy đủ |
| email | String | No | Email (phải unique) |
| phone | String | No | Số điện thoại (phải unique) |
| isActive | Boolean | No | Trạng thái active/inactive |

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

**Error Responses:**

Same as PUT /api/admin/users/:id

---

## DELETE /api/admin/hosts/{id}

Xóa host (soft delete hoặc hard delete).

**Method:** `DELETE`

**URL:** `/api/admin/hosts/:id`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Host ObjectId |

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| hardDelete | String | No | false | Set `'true'` để xóa vĩnh viễn |

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

**Error Responses:**

Same as DELETE /api/admin/users/:id

---

# ROOMS MANAGEMENT

## GET /api/admin/rooms

Danh sách tất cả phòng với filters cho admin.

**Method:** `GET`

**URL:** `/api/admin/rooms`

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| page | Number | No | 1 | Số trang |
| limit | Number | No | 20 | Số lượng item mỗi trang |
| status | String | No | - | Filter: `pending`, `approved`, `rejected` |
| ownerId | String | No | - | Filter theo chủ nhà (ObjectId) |
| search | String | No | - | Tìm trong title, description, address |
| sort | String | No | -createdAt | Sắp xếp |
| minPrice | Number | No | - | Giá tối thiểu |
| maxPrice | Number | No | - | Giá tối đa |
| minArea | Number | No | - | Diện tích tối thiểu |
| maxArea | Number | No | - | Diện tích tối đa |

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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 401 | Authentication required | Không có token |
| 403 | Access denied: admin only | Không phải admin |
| 500 | Lỗi server | Internal server error |

---

## GET /api/admin/rooms/{id}

Chi tiết một phòng kèm statistics.

**Method:** `GET`

**URL:** `/api/admin/rooms/:id`

**Authentication:** Required (Admin only)

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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | ID phòng không hợp lệ | ObjectId không đúng format |
| 404 | Không tìm thấy phòng | Room không tồn tại |
| 500 | Lỗi server | Internal server error |

---

## PUT /api/admin/rooms/{id}/approve

Duyệt tin đăng phòng (chuyển status từ 'pending' → 'approved').

**Method:** `PUT`

**URL:** `/api/admin/rooms/:id/approve`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| note | String | No | Ghi chú của admin khi duyệt |

**Request Example:**

```bash
PUT /api/admin/rooms/65f3c2b1a8e4f5c6d7e8f903/approve
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
        "fullName": "Trần Thị B",
        "email": "tranthib@gmail.com",
        "phone": "0912345678"
      }
    }
  }
}
```

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | ID phòng không hợp lệ | ObjectId không đúng format |
| 400 | Phòng đã được duyệt trước đó | Room đã có status = 'approved' |
| 404 | Không tìm thấy phòng | Room không tồn tại |
| 500 | Lỗi server | Internal server error |

---

## PUT /api/admin/rooms/{id}/reject

Từ chối tin đăng phòng (chuyển status từ 'pending' → 'rejected').

**Method:** `PUT`

**URL:** `/api/admin/rooms/:id/reject`

**Authentication:** Required (Admin only)

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | Room ObjectId |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| reason | String | **Yes** | Lý do từ chối (bắt buộc) |

**Request Example:**

```bash
PUT /api/admin/rooms/65f3c2b1a8e4f5c6d7e8f903/reject
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
        "fullName": "Trần Thị B",
        "email": "tranthib@gmail.com",
        "phone": "0912345678"
      }
    }
  }
}
```

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Vui lòng nhập lý do từ chối | Thiếu field `reason` hoặc reason rỗng |
| 400 | ID phòng không hợp lệ | ObjectId không đúng format |
| 400 | Phòng đã bị từ chối trước đó | Room đã có status = 'rejected' |
| 404 | Không tìm thấy phòng | Room không tồn tại |
| 500 | Lỗi server | Internal server error |

---

## DELETE /api/admin/rooms/{id}

Xóa phòng vĩnh viễn (hard delete).

**Method:** `DELETE`

**URL:** `/api/admin/rooms/:id`

**Authentication:** Required (Admin only)

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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | ID phòng không hợp lệ | ObjectId không đúng format |
| 400 | Không thể xóa phòng có booking đang hoạt động | Room có booking status = 'pending' hoặc 'confirmed' |
| 404 | Không tìm thấy phòng | Room không tồn tại |
| 500 | Lỗi server | Internal server error |

---

# DASHBOARD

## GET /api/admin/dashboard/summary

Trả về tổng quan thống kê toàn hệ thống.

**Method:** `GET`

**URL:** `/api/admin/dashboard/summary`

**Authentication:** Required (Admin only)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| period | Number | No | 30 | Số ngày để tính statistics (lookback period) |

**Request Example:**

```bash
GET /api/admin/dashboard/summary?period=30
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

**Response Fields Description:**

| Field | Type | Description |
|-------|------|-------------|
| users.total | Number | Tổng số users |
| users.new | Number | Users mới trong khoảng thời gian period |
| users.byRole | Object | Phân loại users theo role |
| hosts.total | Number | Tổng số hosts (role = 'owner') |
| hosts.active | Number | Số hosts đang active |
| rooms.total | Number | Tổng số phòng |
| rooms.pending | Number | Số phòng đang chờ duyệt |
| rooms.approved | Number | Số phòng đã được duyệt |
| rooms.rejected | Number | Số phòng bị từ chối |
| rooms.new | Number | Phòng mới trong khoảng period |
| bookings.total | Number | Tổng số bookings |
| bookings.pending | Number | Bookings đang chờ xác nhận |
| bookings.confirmed | Number | Bookings đã xác nhận |
| bookings.completed | Number | Bookings đã hoàn thành |
| payments.total | Number | Tổng số payments |
| payments.totalRevenue | Number | Tổng doanh thu (VND) |
| payments.revenueThisPeriod | Number | Doanh thu trong period (VND) |
| reports.total | Number | Tổng số reports |
| reports.pending | Number | Reports chưa xử lý |

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 401 | Authentication required | Không có token |
| 403 | Access denied: admin only | Không phải admin |
| 500 | Lỗi server | Internal server error |

---

# ADMIN PROFILE

## GET /api/admin/profile

Lấy thông tin profile của admin hiện tại kèm statistics hoạt động.

**Method:** `GET`

**URL:** `/api/admin/profile`

**Authentication:** Required (Admin only)

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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 401 | Authentication required | Không có token |
| 403 | Access denied: admin only | Không phải admin |
| 404 | Không tìm thấy admin | Admin không tồn tại (lỗi hiếm) |
| 500 | Lỗi server | Internal server error |

---

## PUT /api/admin/profile

Cập nhật thông tin profile của admin hiện tại.

**Method:** `PUT`

**URL:** `/api/admin/profile`

**Authentication:** Required (Admin only)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fullName | String | No | Tên đầy đủ |
| email | String | No | Email mới (phải unique) |
| phone | String | No | Số điện thoại mới (phải unique) |
| currentPassword | String | No* | Mật khẩu hiện tại (bắt buộc nếu đổi password) |
| newPassword | String | No* | Mật khẩu mới (tối thiểu 6 ký tự) |

**Request Example (Update Basic Info):**

```bash
PUT /api/admin/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "fullName": "Admin User Updated",
  "email": "admin.updated@studentrental.com"
}
```

**Request Example (Change Password):**

```bash
PUT /api/admin/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
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

**Error Responses:**

| Status Code | Message | Description |
|-------------|---------|-------------|
| 400 | Email đã được sử dụng | Email đã tồn tại |
| 400 | Số điện thoại đã được sử dụng | Phone đã tồn tại |
| 400 | Mật khẩu hiện tại không chính xác | currentPassword sai |
| 400 | Mật khẩu mới phải có ít nhất 6 ký tự | newPassword quá ngắn |
| 401 | Authentication required | Không có token |
| 403 | Access denied: admin only | Không phải admin |
| 404 | Không tìm thấy admin | Admin không tồn tại |
| 500 | Lỗi server | Internal server error |

---

# ERROR RESPONSES

## Common Error Response Format

Tất cả error responses đều có format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## HTTP Status Codes Summary

| Status Code | Meaning | Usage |
|-------------|---------|-------|
| 200 | OK | Request thành công (GET, PUT, DELETE) |
| 201 | Created | Tạo mới thành công (POST) |
| 400 | Bad Request | Dữ liệu không hợp lệ, thiếu field bắt buộc |
| 401 | Unauthorized | Không có token hoặc token không hợp lệ |
| 403 | Forbidden | Không có quyền (không phải admin) |
| 404 | Not Found | Resource không tồn tại |
| 409 | Conflict | Dữ liệu trùng lặp (email, phone) |
| 500 | Internal Server Error | Lỗi server |

## Common Error Messages

### Authentication Errors

```json
{
  "success": false,
  "message": "Authentication required"
}
```

```json
{
  "success": false,
  "message": "Access denied: admin only"
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
  "message": "Vui lòng nhập lý do từ chối"
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
  "message": "Không thể xóa phòng có booking đang hoạt động"
}
```

---

## NOTES

1. **Authentication**: Tất cả endpoints yêu cầu JWT token với `role = 'admin'`. Token được gửi qua header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

2. **Pagination**: Hầu hết list endpoints hỗ trợ pagination với `page` và `limit`. Response bao gồm `pagination` metadata.

3. **Soft Delete vs Hard Delete**:
   - **Soft delete**: Đặt `isActive = false`, dữ liệu vẫn còn trong database
   - **Hard delete**: Xóa vĩnh viễn khỏi database (cẩn thận khi sử dụng)

4. **Room Approval Workflow**:
   - Phòng mới có `status = 'pending'`
   - Admin có thể **approve** (status → `'approved'`) hoặc **reject** (status → `'rejected'`)
   - Reject yêu cầu `reason` (bắt buộc)
   - Approve có thể có `note` (tùy chọn)

5. **Search**: Tham số `search` sử dụng regex case-insensitive trên nhiều fields.

6. **Sort**: Prefix `-` để sắp xếp giảm dần (ví dụ: `-createdAt`), không có prefix là tăng dần.

7. **Statistics**: Nhiều endpoints trả về computed statistics (room counts, revenue, bookings) để admin có insight tốt hơn.

---

**End of Admin API Documentation**

For Student/User APIs, see: `API_DOCUMENTATION_USER.md`

For Owner/Host APIs, see: `API_DOCUMENTATION_OWNER.md` (if available)
