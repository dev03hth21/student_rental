import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import Button from '../components/Button';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axiosClient.get('/admin/profile');
      const admin = data?.data?.admin;
      setProfile(admin);
      setFullName(admin?.fullName || '');
      setEmail(admin?.email || '');
      setPhone(admin?.phone || '');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Tải hồ sơ thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const payload = { fullName, email, phone };
      if (currentPassword && newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await axiosClient.put('/admin/profile', payload);
      setMessage('Cập nhật thành công');
      setCurrentPassword('');
      setNewPassword('');
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="center">Đang tải...</div>;

  return (
    <div>
      <h1>Hồ sơ quản trị</h1>
      {error && <div className="alert">{error}</div>}
      {message && <div style={{ color: '#16a34a', fontSize: 14 }}>{message}</div>}
      <form className="form" onSubmit={handleSave} style={{ maxWidth: 480 }}>
        <div>
          <label htmlFor="fullName">Họ tên</label>
          <input id="fullName" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="phone">Số điện thoại</label>
          <input id="phone" className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div>
          <label htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input
            id="currentPassword"
            className="input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="newPassword">Mật khẩu mới</label>
          <input
            id="newPassword"
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </form>
      {profile?.statistics && (
        <div className="stat-grid" style={{ marginTop: 20 }}>
          <div className="stat-card">
            <div className="stat-title">Phòng đã duyệt</div>
            <div className="stat-value">{profile.statistics.roomsApproved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Phòng bị từ chối</div>
            <div className="stat-value">{profile.statistics.roomsRejected}</div>
          </div>
          <div className="stat-card">
            <div className="stat-title">Tổng thao tác</div>
            <div className="stat-value">{profile.statistics.totalActions}</div>
          </div>
        </div>
      )}
    </div>
  );
}
