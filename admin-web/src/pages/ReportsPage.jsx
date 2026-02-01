import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import { listReports, updateReportStatus, getReportDetail } from '../services/adminReportService';

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ xử lý', value: 'pending' },
  { label: 'Đã xử lý', value: 'reviewed' },
];

const statusText = (status) => {
  const map = {
    pending: 'Chờ xử lý',
    reviewed: 'Đã xử lý',
  };
  return map[status] || status;
};

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
};

const columns = [
  { label: 'Phòng', accessor: 'roomTitle' },
  { label: 'Người báo cáo', accessor: 'reporter' },
  { label: 'Lý do', accessor: 'reason' },
  { label: 'Trạng thái', accessor: 'status' },
  { label: 'Ngày tạo', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
];

const normalize = (items = []) => items.map((r) => ({
  id: r._id || r.id,
  roomTitle: r.roomId?.title || 'N/A',
  reporter: r.userId?.fullName || r.userId?.email || 'N/A',
  reason: r.reason,
  status: r.status,
  createdAt: r.createdAt,
}));

export default function ReportsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [detail, setDetail] = useState({ open: false, data: null, loading: false, error: '' });

  const load = async (targetPage = page) => {
    setLoading(true);
    setError('');
    try {
      const { reports, pagination } = await listReports({ status, page: targetPage, limit, q: search });
      setRows(normalize(reports));
      setPage(pagination?.page || targetPage);
      setTotalPages(pagination?.totalPages || 1);
      setTotal(pagination?.total || reports.length);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Tải báo cáo thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, limit]);

  const handleMarkReviewed = async (row) => {
    if (!row?.id || row.status === 'reviewed') return;
    setLoading(true);
    try {
      await updateReportStatus(row.id, 'reviewed');
      await load(page);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cập nhật trạng thái thất bại');
      setLoading(false);
    }
  };

  const openDetail = async (row) => {
    if (!row?.id) return;
    setDetail({ open: true, data: null, loading: true, error: '' });
    try {
      const data = await getReportDetail(row.id);
      setDetail({ open: true, data, loading: false, error: '' });
    } catch (err) {
      setDetail({ open: true, data: null, loading: false, error: err?.response?.data?.message || err?.message || 'Tải chi tiết thất bại' });
    }
  };

  const columnsWithRender = [
    ...columns.map((c) => (c.accessor === 'status' ? {
      ...c,
      render: (row) => <span className={`badge ${row.status === 'pending' ? 'pending' : 'approved'}`}>{statusText(row.status)}</span>,
    } : c)),
  ];

  const actions = [
    { label: 'Xem', variant: 'ghost', onClick: openDetail },
    { label: 'Đánh dấu đã xử lý', variant: 'ghost', onClick: handleMarkReviewed },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Báo cáo</h1>
          <p className="muted">Quản lý báo cáo phòng: chờ xử lý / đã xử lý.</p>
        </div>
        <Button variant="ghost" onClick={() => load(1)} disabled={loading}>
          Làm mới
        </Button>
      </div>

      {error && <div className="alert">{error}</div>}

      <div className="toolbar">
        <select
          className="input"
          style={{ width: 140, padding: '8px 10px', height: 36 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input
          className="search-input"
          placeholder="Tìm theo lý do"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <span className="pill">
          Tổng <span className="small">{total}</span>
        </span>
        <Button variant="ghost" onClick={() => load(1)} disabled={loading}>
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
            onPrev: () => load(Math.max(1, page - 1)),
            onNext: () => load(Math.min(totalPages, page + 1)),
          }}
        />
      )}

      {detail.open && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 640 }}>
            <h3>Chi tiết báo cáo</h3>
            {detail.loading && <div className="center">Đang tải...</div>}
            {detail.error && <div className="alert">{detail.error}</div>}
            {!detail.loading && !detail.error && detail.data && (
              <div className="form" style={{ marginTop: 8 }}>
                <div><strong>Lý do:</strong> {detail.data.reason}</div>
                <div><strong>Trạng thái:</strong> {statusText(detail.data.status)}</div>
                <div><strong>Người báo cáo:</strong> {detail.data.userId?.fullName || detail.data.userId?.email || 'N/A'}</div>
                <div><strong>Phòng:</strong> {detail.data.roomId?.title || 'N/A'}</div>
                <div><strong>Ngày tạo:</strong> {formatDate(detail.data.createdAt)}</div>
                {detail.data.attachmentUrl && (
                  <div>
                    <strong>Ảnh đính kèm:</strong>
                    <div style={{ marginTop: 8 }}>
                      <img src={detail.data.attachmentUrl} alt="attachment" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setDetail({ open: false, data: null, loading: false, error: '' })}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
