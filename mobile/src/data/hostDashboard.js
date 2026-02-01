export const hostStatsMock = {
  summary: {
    totalRooms: 12,
    pendingRooms: 2,
    approvedRooms: 8,
    rejectedRooms: 1,
    availableRooms: 6,
    rentedRooms: 3,
    totalCalls: 128,
    callsToday: 6,
  },
  insights: [
    { id: 'live', label: 'Tin đang hiển thị', value: 6, icon: '📢' },
    { id: 'calls', label: 'Liên hệ 30 ngày', value: 54, icon: '📞' },
  ],
  suggestionTabs: ['Quan trọng', 'Thông tin', 'Gợi ý'],
  suggestions: {
    'Quan trọng': [
      { id: 'important-1', message: 'Nên cập nhật mô tả phòng để đạt đủ 300 ký tự.' },
      { id: 'important-2', message: 'Tin của bạn chưa đủ 3 hình ảnh, dễ bị từ chối.' },
      { id: 'important-3', message: 'Giá phòng đang thấp hơn khu vực 15%.' },
    ],
    'Thông tin': [
      { id: 'info-1', message: 'Hồ sơ nhà trọ đã được xác thực 90%.' },
      { id: 'info-2', message: 'Bạn còn 2 tin sắp hết hạn trong 3 ngày tới.' },
    ],
    'Gợi ý': [
      { id: 'tip-1', message: 'Thêm video ngắn giúp tăng 40% lượt xem.' },
      { id: 'tip-2', message: 'Phản hồi chat trong 5 phút đầu cải thiện tỉ lệ chốt 25%.' },
    ],
  },
  highlightedGuide: {
    title: 'Mẹo đăng tin hiệu quả',
    caption: 'Xem chi tiết →',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=60',
  },
  rooms: [
    {
      id: 'room-1',
      title: 'Căn hộ mini TDM',
      price: 4500000,
      status: 'Đang hiển thị',
      views: 320,
      updatedAt: '2025-12-01T09:40:00Z',
      thumbnail: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=60',
    },
    {
      id: 'room-2',
      title: 'Phòng studio Bến Cát',
      price: 3500000,
      status: 'Chờ duyệt',
      views: 180,
      updatedAt: '2025-12-05T11:00:00Z',
      thumbnail: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=60',
    },
  ],
  callLogs: [
    {
      id: 'call-1',
      name: 'Phạm Thảo',
      phone: '0963 123 456',
      room: 'Phòng trọ 20m2 – Hiệp Thành',
      minutesAgo: 12,
      count: 3,
      avatar: 'https://i.pravatar.cc/150?img=47',
    },
    {
      id: 'call-2',
      name: 'Nguyễn Long',
      phone: '0905 222 333',
      room: 'Studio Landmark',
      minutesAgo: 45,
      count: 1,
      avatar: 'https://i.pravatar.cc/150?img=22',
    },
  ],
  accountMenus: [
    { id: 'manage-rooms', label: 'Quản lý tin đăng', icon: '🗂️', navigateTo: 'HostListings' },
    { id: 'customers', label: 'Quản lý khách hàng', icon: '👥', navigateTo: 'HostCustomers' },
    { id: 'finance', label: 'Quản lý tài chính', icon: '💰', navigateTo: 'Finance' },
    { id: 'settings', label: 'Cài đặt', icon: '⚙️', navigateTo: 'Settings' },
    { id: 'logout', label: 'Đăng xuất', icon: '🚪', navigateTo: 'Logout' },
  ],
};
export const hostFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'expired', label: 'Hết hạn' },
  { id: 'expiring', label: 'Sắp hết hạn' },
  { id: 'draft', label: 'Tin nháp' },
];

export const callFilterTabs = [
  { id: 'all', label: 'Tất cả' },
  { id: 'unread', label: 'Chưa đọc' },
  { id: 'by-room', label: 'Theo phòng' },
];
