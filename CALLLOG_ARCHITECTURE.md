# CallLogs Module - Data Flow & Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         React Native App                         │
│                      (Owner Mobile Client)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────────┐          │
│  │ CustomerScreen   │────────>│ CallLogDetailScreen  │          │
│  │                  │         │                       │          │
│  │ • Search         │         │ • Auto mark as read  │          │
│  │ • Filters        │         │ • Call action        │          │
│  │ • Room filters   │         │ • View room          │          │
│  │ • Stats display  │         │ • Full contact info  │          │
│  └────────┬─────────┘         └──────────────────────┘          │
│           │                                                       │
│           v                                                       │
│  ┌──────────────────────────────────┐                           │
│  │   API Service (callLogs.js)      │                           │
│  │                                   │                           │
│  │  • getCallLogs(params)           │                           │
│  │  • markCallLogAsRead(id)         │                           │
│  │  • markAllCallLogsAsRead()       │                           │
│  └────────┬─────────────────────────┘                           │
└───────────┼─────────────────────────────────────────────────────┘
            │
            │ HTTP/HTTPS
            │ Authorization: Bearer <token>
            │
            v
┌─────────────────────────────────────────────────────────────────┐
│                       Backend API Server                         │
│                    (Node.js + Express)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Middlewares                                   │  │
│  │  • protect (JWT authentication)                           │  │
│  │  • authorize('owner') (Role check)                        │  │
│  └────────┬─────────────────────────────────────────────────┘  │
│           v                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Routes (hostCallLogRoutes.js)                    │  │
│  │                                                            │  │
│  │  GET    /api/host/call-logs                              │  │
│  │  PATCH  /api/host/call-logs/:id/read                     │  │
│  │  PATCH  /api/host/call-logs/read-all                     │  │
│  └────────┬─────────────────────────────────────────────────┘  │
│           v                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │        Controller (callLogController.js)                  │  │
│  │                                                            │  │
│  │  • getHostCallLogs()                                      │  │
│  │    - Build query (all/unread/by-room)                    │  │
│  │    - Fetch logs with populate                            │  │
│  │    - Build room stats                                     │  │
│  │    - Calculate summary                                    │  │
│  │    - Format response                                      │  │
│  │                                                            │  │
│  │  • markCallLogAsRead()                                    │  │
│  │    - Validate ID                                          │  │
│  │    - Check ownership                                      │  │
│  │    - Update isRead & readAt                              │  │
│  │                                                            │  │
│  │  • markAllCallLogsAsRead()                               │  │
│  │    - Bulk update all unread logs                         │  │
│  └────────┬─────────────────────────────────────────────────┘  │
│           v                                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             Model (CallLog.js)                            │  │
│  │                                                            │  │
│  │  Schema:                                                  │  │
│  │  • roomId (ref: Room)                                    │  │
│  │  • hostId (ref: User)                                    │  │
│  │  • studentId (ref: User)                                 │  │
│  │  • phoneNumber                                            │  │
│  │  • callerEmail                                            │  │
│  │  • isRead (default: false)                               │  │
│  │  • readAt                                                 │  │
│  │  • createdAt, updatedAt (auto)                           │  │
│  │                                                            │  │
│  │  Indexes:                                                 │  │
│  │  • { roomId: 1, createdAt: -1 }                          │  │
│  │  • { studentId: 1, createdAt: -1 }                       │  │
│  │  • { hostId: 1, isRead: 1 }                              │  │
│  └────────┬─────────────────────────────────────────────────┘  │
└───────────┼─────────────────────────────────────────────────────┘
            │
            v
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB Database                          │
│                                                                   │
│  Collections:                                                     │
│  • calllogs                                                       │
│  • rooms                                                          │
│  • users                                                          │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow Examples

### Example 1: Get All Call Logs

```
User Action: Opens CustomerScreen
     │
     v
[CustomerScreen]
     │ useEffect(() => fetchCallLogs())
     v
[callLogs.getCallLogs()]
     │ axios.get('/api/host/call-logs')
     v
[Backend API] /api/host/call-logs
     │ protect middleware → verify JWT
     │ authorize('owner') → check role
     v
[callLogController.getHostCallLogs()]
     │ hostId = req.user._id
     │ query = { hostId }
     v
[MongoDB] CallLog.find({ hostId }).populate(...)
     │ Returns array of call logs
     v
[Controller] Build stats & format response
     │ Return JSON response
     v
[React Native] Update state
     │ setLogs(data.logs)
     │ setRooms(data.rooms)
     │ setSummary(data.summary)
     v
[UI] Render list with filters
```

### Example 2: Filter Unread Calls

```
User Action: Clicks "Chưa đọc" button
     │
     v
[CustomerScreen]
     │ setSelectedFilter('unread')
     v
[useEffect] Triggers on filter change
     │ fetchCallLogs()
     v
[callLogs.getCallLogs({ filter: 'unread' })]
     │ axios.get('/api/host/call-logs?filter=unread')
     v
[Backend] buildCallLogQuery({ filterType: 'unread' })
     │ Returns: { query: { hostId, isRead: false } }
     v
[MongoDB] CallLog.find({ hostId, isRead: false })
     │ Returns only unread logs
     v
[UI] Displays filtered list
```

### Example 3: View Call Detail & Auto Mark as Read

```
User Action: Clicks on a call log item
     │
     v
[CustomerScreen]
     │ navigation.navigate('CallLogDetail', { callLog })
     v
[CallLogDetailScreen]
     │ useEffect(() => markRead())
     v
[callLogs.markCallLogAsRead(callLog.id)]
     │ axios.patch(`/api/host/call-logs/${id}/read`)
     v
[Backend] markCallLogAsRead()
     │ Find callLog by id and hostId
     │ Update: isRead = true, readAt = now
     v
[MongoDB] CallLog.findOneAndUpdate(...)
     │ Returns updated document
     v
[React Native] setIsRead(true)
     │ UI shows "Đã xem" badge
     v
[User] Sees full contact details
     │ Can click "Gọi lại" or "Xem tin đăng"
```

### Example 4: Search Functionality

```
User Action: Types in search box
     │ Input: "0987"
     v
[CustomerScreen]
     │ setSearchQuery('0987')
     v
[useEffect] Triggers on searchQuery change
     │ Client-side filtering (no API call)
     │
     │ const filtered = logs.filter(log =>
     │   log.phoneNumber.includes('0987') ||
     │   log.studentName.includes('0987') ||
     │   ...
     │ )
     v
[setFilteredLogs(filtered)]
     │
     v
[UI] Displays filtered results instantly
```

## 📈 Data Aggregation Flow

### Summary Statistics Calculation:

```javascript
// Parallel queries for performance
Promise.all([
  CallLog.countDocuments({ hostId }),              // Total
  CallLog.countDocuments({ hostId, isRead: false }), // Unread
  CallLog.countDocuments({ 
    hostId, 
    createdAt: { $gte: last24Hours } 
  })                                                // Today
])
```

### Room Statistics Calculation:

```javascript
// Build room stats from logs
const stats = new Map()
callLogs.forEach(log => {
  const key = log.roomId._id.toString()
  const current = stats.get(key) || { total: 0, unread: 0 }
  current.total++
  if (!log.isRead) current.unread++
  stats.set(key, current)
})
```

## 🎨 UI State Management

### CustomerScreen State:

```javascript
const [logs, setLogs] = useState([])              // All logs from server
const [filteredLogs, setFilteredLogs] = useState([]) // Filtered for display
const [rooms, setRooms] = useState([])            // Room filter options
const [summary, setSummary] = useState({})        // Stats
const [loading, setLoading] = useState(true)      // Loading state
const [refreshing, setRefreshing] = useState(false) // Pull-to-refresh
const [searchQuery, setSearchQuery] = useState('')  // Search input
const [selectedFilter, setSelectedFilter] = useState('all') // Filter type
const [selectedRoom, setSelectedRoom] = useState(null) // Selected room
```

### Filter Logic Priority:

```
1. Backend filter (filter=unread or by-room)
   ↓
2. Fetch filtered data from server
   ↓
3. Apply client-side search
   ↓
4. Display final filtered list
```

## 🔐 Security Flow

```
Request → protect middleware
    │
    ├─ No token? → 401 Unauthorized
    │
    ├─ Invalid token? → 401 Unauthorized
    │
    ├─ Valid token → Extract user from JWT
    │                 Attach to req.user
    │
    v
Request → authorize('owner') middleware
    │
    ├─ req.user.role !== 'owner'? → 403 Forbidden
    │
    ├─ req.user.role === 'owner' → Continue
    │
    v
Request → Controller
    │
    ├─ Use req.user._id as hostId
    ├─ Only fetch logs for this host
    │
    v
Response → Success 200
```

## 📦 Response Data Structure

### GET /api/host/call-logs Response:

```json
{
  "success": true,
  "message": "Lấy lịch sử cuộc gọi thành công",
  "data": {
    "logs": [
      {
        "id": "674c9...",
        "roomId": "674a1...",
        "roomTitle": "Phòng trọ ABC",
        "studentId": "674b2...",
        "studentName": "Nguyễn Văn A",
        "studentAvatar": "https://...",
        "callerEmail": "student@example.com",
        "phoneNumber": "0987654321",
        "createdAt": "2025-12-09T10:30:00.000Z",
        "isRead": false,
        "readAt": null,
        "roomCallCount": 3
      }
    ],
    "rooms": [
      {
        "roomId": "674a1...",
        "title": "Phòng trọ ABC",
        "totalCalls": 5,
        "unreadCalls": 2
      }
    ],
    "summary": {
      "total": 20,
      "unread": 5,
      "callsToday": 3,
      "filter": "all",
      "roomId": null
    }
  }
}
```

## 🎯 Filter Combinations

| Filter Type | RoomId | Query Result |
|-------------|--------|--------------|
| all         | null   | All logs for host |
| unread      | null   | Only unread logs for host |
| by-room     | valid  | All logs for specific room |
| all         | valid  | All logs for specific room (same as by-room) |
| unread      | valid  | Unread logs for specific room |

## ⚡ Performance Optimizations

1. **Database Indexes**: Fast lookups on common queries
2. **Selective Population**: Only populate needed fields
3. **Parallel Queries**: Use Promise.all for summary stats
4. **Client-side Search**: No API call on every keystroke
5. **Efficient State Updates**: Only re-filter when needed
6. **Pull-to-refresh**: No loading screen, smooth UX

---

**Status**: ✅ Fully Implemented and Tested
**Last Updated**: December 9, 2025
