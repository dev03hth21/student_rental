import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomDetail, approveRoom, rejectRoom, requestRoomChanges } from '../services/adminRoomService';
import Button from '../components/Button';

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [preview, setPreview] = useState({ open: false, src: '' });

  const statusText = (value) => {
    const map = {
      pending: 'Chờ duyệt',
      approved: 'Đã duyệt',
      rejected: 'Từ chối',
      needs_changes: 'Cần chỉnh sửa',
    };
    return map[value] || value;
  };

  const roomTypeText = (value) => {
    const map = {
      dorm: 'Ký túc xá',
      apartment: 'Căn hộ',
      house: 'Nhà nguyên căn',
      studio: 'Studio',
      shared: 'Phòng chung',
      private: 'Phòng riêng',
      motel: 'Nhà trọ',
    };
    return map[String(value || '').toLowerCase()] || value || '-';
  };

  const formatCurrency = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return v || '-';
    return `${n.toLocaleString('vi-VN')} đ`;
  };

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRoomDetail(roomId);
      setRoom(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Tải chi tiết phòng thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [roomId]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      await approveRoom(roomId);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Duyệt phòng thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const trimmed = note.trim();
    if (!trimmed) {
      setError('Vui lòng nhập lý do từ chối.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await rejectRoom(roomId, trimmed);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Từ chối thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestChanges = async () => {
    const trimmed = note.trim();
    if (!trimmed) {
      setError('Vui lòng mô tả yêu cầu chỉnh sửa.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await requestRoomChanges(roomId, trimmed);
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Gửi yêu cầu chỉnh sửa thất bại');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="center">Đang tải...</div>;
  if (error) return <div className="alert">{error}</div>;
  if (!room) return <div className="alert">Không tìm thấy phòng</div>;

  const images = room.images || room.thumbnails || [];
  const address = typeof room.address === 'string'
    ? room.address
    : room.address?.street || room.address?.city || room.address?.district || '-';
  const status = room.status || 'pending';
  const adminNote = room.adminNote || room.reason;

  return (
    <div>
      <div className="page-header">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
        <span className={`badge ${status}`}>{statusText(status)}</span>
      </div>

      <h1>{room.title || 'Chi tiết phòng'}</h1>
      <p className="muted">Chủ trọ: {room.owner?.fullName || room.ownerId || 'N/A'} · {address}</p>

      <div className="stat-grid" style={{ marginTop: 12 }}>
        <div className="stat-card">
          <div className="stat-title">Giá</div>
          <div className="stat-value">{formatCurrency(room.price)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Diện tích</div>
          <div className="stat-value">{room.area || '-'} m²</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Loại phòng</div>
          <div className="stat-value">{roomTypeText(room.type)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Liên hệ</div>
          <div className="stat-value">{room.contactPhone || '-'}</div>
        </div>
      </div>

      {images.length > 0 && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Hình ảnh</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            {images.map((src) => (
              <img
                key={src}
                src={src}
                alt="room"
                onClick={() => setPreview({ open: true, src })}
                style={{
                  width: 220,
                  height: 160,
                  objectFit: 'cover',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(15,23,42,0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(15,23,42,0.12)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.06)'; }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Mô tả</h3>
        <p style={{ whiteSpace: 'pre-line', marginTop: 8 }}>{room.description || '-'}</p>
      </div>

      {adminNote && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Ghi chú quản trị</h3>
          <p className="muted" style={{ marginTop: 6 }}>{adminNote}</p>
        </div>
      )}

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Duyệt / Từ chối</h3>
        <div className="form">
          <textarea
            rows={3}
            className="input"
            placeholder="Ghi lý do từ chối hoặc yêu cầu chỉnh sửa"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ height: 80 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={handleApprove} disabled={actionLoading}>Duyệt</Button>
            <Button variant="ghost" onClick={handleReject} disabled={actionLoading}>
              Từ chối
            </Button>
            <Button variant="ghost" onClick={handleRequestChanges} disabled={actionLoading}>
              Yêu cầu chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      {preview.open && (
        <div className="modal-backdrop" onClick={() => setPreview({ open: false, src: '' })}>
          <div
            className="modal"
            style={{ maxWidth: 900, padding: 0, overflow: 'hidden', cursor: 'zoom-out' }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={preview.src}
              alt="room preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', maxHeight: '80vh' }}
              onClick={() => setPreview({ open: false, src: '' })}
            />
            <div style={{ padding: '10px 14px', textAlign: 'right' }}>
              <Button variant="ghost" onClick={() => setPreview({ open: false, src: '' })}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
