import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import { getPendingRooms, approveRoom, rejectRoom, requestRoomChanges } from '../services/adminRoomService';
import { useNavigate } from 'react-router-dom';

const columns = [
  { label: 'Tiêu đề', accessor: 'title' },
  { label: 'Địa chỉ', accessor: 'address' },
  { label: 'Giá', accessor: 'price' },
  { label: 'Ngày gửi', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
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
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    needs_changes: 'Cần chỉnh sửa',
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
      status: room.status || 'pending',
      reason: room.adminNote,
      createdAt: room.createdAt,
    };
  });

export default function PendingRoomsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [rows, setRows] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, room: null, reason: '' });
  const [requestModal, setRequestModal] = useState({ open: false, room: null, note: '' });
  const [requestModalError, setRequestModalError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const loadRooms = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const { rooms, pagination } = await getPendingRooms({ page: targetPage, limit, q: search });
      setRows(normalizeRooms(rooms));
      setPage(pagination?.page || targetPage);
      setTotalPages(pagination?.totalPages || 1);
      setTotal(pagination?.total || rooms.length);
    } catch (err) {
      setError(err?.response?.data?.message || 'Tải danh sách phòng chờ duyệt thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  const handleApprove = async (row) => {
    if (!row.roomId) return;
    setLoading(true);
    try {
      await approveRoom(row.roomId);
      await loadRooms();
    } catch (err) {
      setError(err?.response?.data?.message || 'Duyệt phòng thất bại');
      setLoading(false);
    }
  };

  const openReject = (row) => {
    setModalError('');
    setRejectModal({ open: true, room: row, reason: '' });
  };

  const closeReject = () => {
    setRejectModal({ open: false, room: null, reason: '' });
  };

  const openRequestEdits = (row) => {
    setRequestModalError('');
    setRequestModal({ open: true, room: row, note: '' });
  };

  const closeRequestEdits = () => {
    setRequestModal({ open: false, room: null, note: '' });
  };

  const handleRejectSubmit = async () => {
    const row = rejectModal.room;
    if (!row?.roomId) return;
    const trimmedReason = rejectModal.reason.trim();
    if (!trimmedReason) {
      setModalError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setLoading(true);
    try {
      await rejectRoom(row.roomId, trimmedReason);
      await loadRooms();
      closeReject();
    } catch (err) {
      setModalError(err?.response?.data?.message || 'Từ chối thất bại');
      setLoading(false);
    }
  };

  const handleRequestSubmit = async () => {
    const row = requestModal.room;
    if (!row?.roomId) return;
    const trimmed = requestModal.note.trim();
    if (!trimmed) {
      setRequestModalError('Vui lòng mô tả nội dung cần chỉnh sửa.');
      return;
    }
    setLoading(true);
    try {
      await requestRoomChanges(row.roomId, trimmed);
      await loadRooms();
      closeRequestEdits();
    } catch (err) {
      setRequestModalError(err?.response?.data?.message || 'Gửi yêu cầu chỉnh sửa thất bại');
      setLoading(false);
    }
  };

  const actions = [
    { label: 'Xem', variant: 'ghost', onClick: (row) => navigate(`/rooms/${row.roomId}`) },
    { label: 'Duyệt', onClick: handleApprove },
    { label: 'Từ chối', variant: 'ghost', onClick: openReject },
    { label: 'Yêu cầu chỉnh sửa', variant: 'ghost', onClick: openRequestEdits },
  ];

  const columnsWithRender = [
    ...columns,
    {
      label: 'Trạng thái',
      accessor: 'status',
      render: (row) => <span className={`badge ${row.status}`}>{statusText(row.status)}</span>,
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Phòng chờ duyệt</h1>
          <p className="muted">Danh sách phòng gửi lên đang chờ xét duyệt.</p>
        </div>
        <Button variant="ghost" onClick={loadRooms} disabled={loading}>
          Làm mới
        </Button>
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
          Chờ duyệt <span className="small">{total}</span>
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

      {rejectModal.open && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Từ chối phòng</h3>
            <p className="muted">Vui lòng ghi lý do để chủ trọ biết cần sửa gì.</p>
            <textarea
              className="input"
              rows={3}
              value={rejectModal.reason}
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Ví dụ: Ảnh mờ hoặc thiếu thông tin cần thiết."
            />
            {modalError && <div className="alert">{modalError}</div>}
            <div className="modal-actions">
              <Button variant="ghost" onClick={closeReject} disabled={loading}>
                Hủy
              </Button>
              <Button onClick={handleRejectSubmit} disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi lý do từ chối'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {requestModal.open && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3>Yêu cầu chỉnh sửa</h3>
            <p className="muted">Thông báo cho chủ trọ cần chỉnh gì trước khi gửi lại.</p>
            <textarea
              className="input"
              rows={3}
              value={requestModal.note}
              onChange={(e) => setRequestModal((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Ví dụ: Bổ sung ảnh rõ của bếp và vệ sinh, ghi diện tích phòng."
            />
            {requestModalError && <div className="alert">{requestModalError}</div>}
            <div className="modal-actions">
              <Button variant="ghost" onClick={closeRequestEdits} disabled={loading}>
                Hủy
              </Button>
              <Button onClick={handleRequestSubmit} disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
