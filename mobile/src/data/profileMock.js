import { rooms } from './rooms';

const roomRef = (id) => {
  const fallback = rooms[0] || {};
  const room = rooms.find((item) => item.id === id) || fallback;
  return {
    id: room.id,
    title: room.title,
    address: room.address,
    district: room.district,
    price: room.price,
  };
};

export const studentProfileMock = {
  bookings: [
    {
      id: 'bk-1',
      room: roomRef('room-1'),
      status: 'Đã xác nhận',
      date: '12/03/2025',
      action: 'Xem chi tiết hợp đồng',
    },
    {
      id: 'bk-2',
      room: roomRef('room-2'),
      status: 'Đang chờ',
      date: '05/03/2025',
      action: 'Liên hệ chủ trọ',
    },
    {
      id: 'bk-3',
      room: roomRef('room-3'),
      status: 'Đã hủy',
      date: '22/02/2025',
      action: 'Xem lý do',
    },
  ],
  payments: [
    {
      id: 'pm-1',
      room: roomRef('room-1'),
      amount: '4.200.000đ',
      method: 'Chuyển khoản',
      date: '25/02/2025',
      status: 'Đã thanh toán',
    },
    {
      id: 'pm-2',
      room: roomRef('room-2'),
      amount: '3.500.000đ',
      method: 'Ví điện tử',
      date: '25/01/2025',
      status: 'Đã thanh toán',
    },
    {
      id: 'pm-3',
      room: roomRef('room-3'),
      amount: '4.200.000đ',
      method: 'Tiền mặt',
      date: '25/12/2024',
      status: 'Đang xử lý',
    },
  ],
  contracts: [
    {
      id: 'ct-1',
      room: roomRef('room-1'),
      start: '01/02/2025',
      end: '31/01/2026',
      status: 'Đang hiệu lực',
    },
    {
      id: 'ct-2',
      room: roomRef('room-2'),
      start: '01/01/2024',
      end: '31/12/2024',
      status: 'Đã hết hạn',
    },
  ],
  reviews: [
    {
      id: 'rv-1',
      room: roomRef('room-1'),
      rating: 4.5,
      comment: 'Phòng sạch, chủ nhà hỗ trợ nhiệt tình.',
      date: '10/03/2025',
    },
    {
      id: 'rv-2',
      room: roomRef('room-2'),
      rating: 3.8,
      comment: 'Cần cải thiện cách âm.',
      date: '18/02/2025',
    },
  ],
  refunds: [
    {
      id: 'rf-1',
      room: roomRef('room-1'),
      amount: '4.200.000đ',
      status: 'Chờ duyệt chủ nhà',
      createdAt: '20/03/2025',
    },
    {
      id: 'rf-2',
      room: roomRef('room-2'),
      amount: '5.500.000đ',
      status: 'Đang xử lý admin',
      createdAt: '05/03/2025',
    },
    {
      id: 'rf-3',
      room: roomRef('room-3'),
      amount: '2.000.000đ',
      status: 'Đã hoàn tiền',
      createdAt: '28/02/2025',
    },
  ],
  notifications: {
    unread: [
      {
        id: 'nt-1',
        title: 'Phòng yêu thích vừa giảm 300k',
        detail: 'Căn hộ studio gần ĐH Bách Khoa đang chạy ưu đãi tháng 3.',
        time: '2 phút trước',
      },
      {
        id: 'nt-2',
        title: 'Chủ trọ phản hồi đặt lịch',
        detail: 'Anh Tâm đã xác nhận lịch xem phòng ngày 26/03 lúc 9h.',
        time: '1 giờ trước',
      },
    ],
    read: [
      {
        id: 'nt-3',
        title: 'Hóa đơn tháng 3 đã sẵn sàng',
        detail: 'Hệ thống đã tạo hóa đơn điện nước, vui lòng kiểm tra trước 25/03.',
        time: 'Hôm qua',
      },
      {
        id: 'nt-4',
        title: 'Review của bạn đã được duyệt',
        detail: 'Đánh giá cho phòng mini Q10 đã hiển thị công khai.',
        time: '2 ngày trước',
      },
    ],
  },
};

export const ownerHubMock = {
  stats: [
    { id: 'activeRooms', label: 'Phòng đang hoạt động', value: 12, trend: '+8% so với tuần trước' },
    { id: 'newBookings', label: 'Đơn mới trong ngày', value: 3, trend: '+1 so với hôm qua' },
    { id: 'pending', label: 'Chờ duyệt/ẩn', value: 2, trend: 'Cần xử lý' },
  ],
  rooms: [
    { id: 'room-1', data: roomRef('room-1'), status: 'Đang hiển thị', occupancy: '95%', views: 42 },
    { id: 'room-2', data: roomRef('room-2'), status: 'Chờ duyệt', occupancy: '—', views: 12 },
    { id: 'room-3', data: roomRef('room-3'), status: 'Ẩn tạm thời', occupancy: '—', views: 0 },
  ],
  bookings: [
    { id: 'req-1', guest: 'Nguyễn Văn A', phone: '0903 123 456', room: roomRef('room-1'), status: 'Chờ xác nhận', schedule: '26/03 • 09:00' },
    { id: 'req-2', guest: 'Trần Thị B', phone: '0987 654 321', room: roomRef('room-2'), status: 'Đã xác nhận', schedule: '26/03 • 14:00' },
    { id: 'req-3', guest: 'Lê Quốc Cường', phone: '0912 000 888', room: roomRef('room-3'), status: 'Đã huỷ', schedule: '25/03 • 10:00' },
  ],
  tenants: [
    { id: 'tn-1', name: 'Nguyễn Thuý An', room: 'Phòng 302 - Q7', contractEnd: '31/01/2026', status: 'Đang ở' },
    { id: 'tn-2', name: 'Trần Minh Khoa', room: 'Phòng 204 - Q10', contractEnd: '15/11/2025', status: 'Sắp gia hạn' },
    { id: 'tn-3', name: 'Lê Hải Nam', room: 'Phòng 101 - Q5', contractEnd: '01/09/2025', status: 'Chờ đặt cọc' },
  ],
  payouts: [
    { id: 'po-1', amount: '12.600.000đ', period: '01-31/03/2025', status: 'Đã chuyển', method: 'Ngân hàng BIDV' },
    { id: 'po-2', amount: '11.400.000đ', period: '01-29/02/2025', status: 'Đã chuyển', method: 'Ngân hàng BIDV' },
    { id: 'po-3', amount: '13.200.000đ', period: '01-31/01/2025', status: 'Đang xét duyệt', method: 'Ví Momo' },
  ],
  disputes: [
    { id: 'dp-1', tenant: 'Nguyễn Thuý An', topic: 'Hoàn cọc', status: 'Chờ admin', lastUpdate: '21/03/2025' },
    { id: 'dp-2', tenant: 'Trần Minh Khoa', topic: 'Khiếu nại dịch vụ', status: 'Đang thương lượng', lastUpdate: '15/03/2025' },
    { id: 'dp-3', tenant: 'Lê Hải Nam', topic: 'Hư hỏng nội thất', status: 'Đã giải quyết', lastUpdate: '02/03/2025' },
  ],
};
