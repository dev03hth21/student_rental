import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import { getRejectedRooms } from '../services/adminRoomService';
import { useNavigate } from 'react-router-dom';

const statusOptions = [
  { label: 'Đã từ chối', value: 'rejected' },
  { label: 'Cần chỉnh sửa', value: 'needs_changes' },
];

const columns = [
  { label: 'Tiêu đề', accessor: 'title' },
  { label: 'Địa chỉ', accessor: 'address' },
  { label: 'Giá', accessor: 'price' },
  { label: 'Ngày từ chối', accessor: 'rejectedAt', render: (row) => formatDate(row.rejectedAt) },
];

const formatPrice = (value) => {
  if (value === undefined || value === null) return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return `${num.toLocaleString('vi-VN')} đ`;
};

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
};

const statusText = (status) => {
  const map = {
    rejected: 'Đã từ chối',
    needs_changes: 'Cần chỉnh sửa',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
  };
  return map[status] || status;
};

const normalizeRooms = (rooms) =>
  (rooms || []).map((room) => {
    const addressValue = typeof room.address === 'string'
      ? room.address
      : room.address?.street || room.address?.city || room.address?.district || '-';

    return {
      id: room._id || room.id,
      roomId: room._id || room.id,
      title: room.title || room.name || room.roomName || 'N/A',
      address: addressValue,
      price: formatPrice(room.price || room.monthlyPrice || room.rent),
      status: room.status || 'rejected',
      reason: room.adminNote || room.reason,
      rejectedAt: room.rejectedAt,
    };
  });

export default function RejectedRoomsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('rejected');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadRooms = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const { rooms, pagination } = await getRejectedRooms({ status, page: targetPage, limit, q: search });
      setRows(normalizeRooms(rooms));
      setPage(pagination?.page || targetPage);
      setTotalPages(pagination?.totalPages || 1);
      setTotal(pagination?.total || rooms.length);
    } catch (err) {
      setError(err?.response?.data?.message || 'Tải danh sách phòng bị từ chối thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, status]);

  const columnsWithRender = [
    ...columns,
    { label: 'Trạng thái', accessor: 'status', render: (row) => <span className={`badge ${row.status}`}>{statusText(row.status)}</span> },
    { label: 'Lý do', accessor: 'reason', render: (row) => row.reason || '-' },
  ];

  const actions = [
    { label: 'Xem', variant: 'ghost', onClick: (row) => navigate(`/rooms/${row.roomId}`) },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Phòng bị từ chối / cần chỉnh sửa</h1>
          <p className="muted">Phòng đã bị từ chối hoặc yêu cầu chỉnh sửa, kèm lý do.</p>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="toolbar">
        <select
          className="input"
          style={{ width: 160, padding: '8px 10px', height: 36 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          className="search-input"
          placeholder="Tìm theo tiêu đề, địa chỉ hoặc lý do"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="pill">
          Đã từ chối <span className="small">{total}</span>
        </span>
        <label className="pill" style={{ gap: 8 }}>
          <span className="small">Số dòng/trang</span>
          <select
            className="input"
            style={{ width: 80, padding: '6px 8px', height: 32 }}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[10, 20, 50].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </label>
        <Button variant="ghost" onClick={() => loadRooms(1)} disabled={loading}>
          Áp dụng
        </Button>
      </div>

      {loading ? (
        <div className="center">Đang tải...</div>
      ) : (
        <Table
          columns={columnsWithRender}
          data={rows}
          actions={actions}
          externalPagination={{
            page,
            totalPages,
            onPrev: () => loadRooms(Math.max(1, page - 1)),
            onNext: () => loadRooms(Math.min(totalPages, page + 1)),
          }}
        />
      )}
    </div>
  );
}
