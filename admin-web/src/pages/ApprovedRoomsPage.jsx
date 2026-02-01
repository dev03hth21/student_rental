import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import { getApprovedRooms } from '../services/adminRoomService';
import { useNavigate } from 'react-router-dom';

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
    approved: 'Đã duyệt',
    pending: 'Chờ duyệt',
    rejected: 'Từ chối',
    needs_changes: 'Cần chỉnh sửa',
  };
  return map[status] || status;
};

const columns = [
  { label: 'Tiêu đề', accessor: 'title' },
  { label: 'Địa chỉ', accessor: 'address' },
  { label: 'Giá', accessor: 'price' },
  { label: 'Ngày duyệt', accessor: 'approvedAt', render: (row) => formatDate(row.approvedAt) },
];

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
      status: room.status || 'approved',
      reason: room.adminNote,
      approvedAt: room.approvedAt,
    };
  });

export default function ApprovedRoomsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadRooms = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const { rooms, pagination } = await getApprovedRooms({ page: targetPage, limit, q: search });
      setRows(normalizeRooms(rooms));
      setPage(pagination?.page || targetPage);
      setTotalPages(pagination?.totalPages || 1);
      setTotal(pagination?.total || rooms.length);
    } catch (err) {
      setError(err?.response?.data?.message || 'Tải danh sách phòng đã duyệt thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const columnsWithRender = [
    ...columns,
    { label: 'Trạng thái', accessor: 'status', render: (row) => <span className={`badge ${row.status}`}>{statusText(row.status)}</span> },
  ];

  const actions = [
    { label: 'Xem', variant: 'ghost', onClick: (row) => navigate(`/rooms/${row.roomId}`) },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Phòng đã duyệt</h1>
          <p className="muted">Phòng đã duyệt và đang hiển thị cho người dùng.</p>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Tìm theo tiêu đề hoặc địa chỉ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="pill">
          Đã duyệt <span className="small">{total}</span>
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
