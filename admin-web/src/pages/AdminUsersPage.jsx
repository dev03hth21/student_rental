import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Button from '../components/Button';
import { listUsers, listHosts, updateUser, createAdminUser } from '../services/adminUserService';

const columns = [
  { label: 'Họ tên', accessor: 'fullName' },
  { label: 'Email', accessor: 'email' },
  { label: 'Số điện thoại', accessor: 'phone' },
  { label: 'Vai trò', accessor: 'role' },
  {
    label: 'Trạng thái',
    accessor: 'status',
    render: (row) => (
      <span className={`badge ${row.status === 'active' ? 'approved' : 'rejected'}`}>
        {row.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
      </span>
    ),
  },
  { label: 'Ngày tạo', accessor: 'createdAt', render: (row) => formatDate(row.createdAt) },
];

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString();
};

const mapUsers = (users = []) =>
  users.map((u) => ({
    id: u._id || u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.isActive === false ? 'inactive' : 'active',
    createdAt: u.createdAt,
  }));

export default function AdminUsersPage() {
  const [tab, setTab] = useState('users');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createModal, setCreateModal] = useState({ open: false, fullName: '', email: '', phone: '', password: '', isSuperAdmin: false, saving: false, err: '' });

  const load = async (target = tab) => {
    setLoading(true);
    setError('');
    try {
      const res = target === 'hosts' ? await listHosts() : await listUsers();
      const items = target === 'hosts' ? res?.hosts || res?.users || [] : res?.users || [];
      setRows(mapUsers(items));
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Tải danh sách người dùng thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
  }, [tab]);

  const toggleActive = async (row) => {
    setLoading(true);
    setError('');
    try {
      await updateUser(row.id, { isActive: row.status === 'inactive' });
      await load(tab);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Cập nhật trạng thái thất bại');
      setLoading(false);
    }
  };

  const actions = [
    {
      label: 'Bật/tắt hoạt động',
      variant: 'ghost',
      onClick: toggleActive,
    },
  ];

  return (
    <div>
      <h1>Người dùng & Chủ trọ</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <Button variant={tab === 'users' ? 'primary' : 'ghost'} onClick={() => setTab('users')}>
          Tất cả người dùng
        </Button>
        <Button variant={tab === 'hosts' ? 'primary' : 'ghost'} onClick={() => setTab('hosts')}>
          Chủ trọ
        </Button>
        <Button variant="ghost" onClick={() => load(tab)} disabled={loading}>
          Làm mới
        </Button>
        <Button variant="ghost" onClick={() => setCreateModal((prev) => ({ ...prev, open: true, err: '' }))}>
          Tạo admin mới
        </Button>
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? <div className="center">Đang tải...</div> : <Table columns={columns} data={rows} actions={actions} />}

      {createModal.open && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 520 }}>
            <h3>Tạo tài khoản admin</h3>
            <p className="muted">Chỉ Super Admin mới tạo được. Nếu không đủ quyền, server sẽ từ chối.</p>
            <div className="form" style={{ marginTop: 8 }}>
              <input
                className="input"
                placeholder="Họ tên"
                value={createModal.fullName}
                onChange={(e) => setCreateModal((p) => ({ ...p, fullName: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Email"
                type="email"
                value={createModal.email}
                onChange={(e) => setCreateModal((p) => ({ ...p, email: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Số điện thoại"
                value={createModal.phone}
                onChange={(e) => setCreateModal((p) => ({ ...p, phone: e.target.value }))}
              />
              <input
                className="input"
                placeholder="Mật khẩu"
                type="password"
                value={createModal.password}
                onChange={(e) => setCreateModal((p) => ({ ...p, password: e.target.value }))}
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={createModal.isSuperAdmin}
                  onChange={(e) => setCreateModal((p) => ({ ...p, isSuperAdmin: e.target.checked }))}
                />
                <span className="small">Đặt làm Super Admin (chỉ dùng khi cần)</span>
              </label>
              {createModal.err && <div className="alert">{createModal.err}</div>}
            </div>
            <div className="modal-actions">
              <Button
                variant="ghost"
                onClick={() => setCreateModal({ open: false, fullName: '', email: '', phone: '', password: '', isSuperAdmin: false, saving: false, err: '' })}
                disabled={createModal.saving}
              >
                Hủy
              </Button>
              <Button
                onClick={async () => {
                  const { fullName, email, phone, password, isSuperAdmin } = createModal;
                  if (!fullName || !email || !phone || !password) {
                    setCreateModal((p) => ({ ...p, err: 'Vui lòng nhập đủ thông tin.' }));
                    return;
                  }
                  setCreateModal((p) => ({ ...p, saving: true, err: '' }));
                  try {
                    await createAdminUser({ fullName, email, phone, password, isSuperAdmin });
                    setCreateModal({ open: false, fullName: '', email: '', phone: '', password: '', isSuperAdmin: false, saving: false, err: '' });
                    await load('users');
                    setTab('users');
                  } catch (err) {
                    setCreateModal((p) => ({ ...p, err: err?.response?.data?.message || err?.message || 'Tạo admin thất bại', saving: false }));
                  }
                }}
                disabled={createModal.saving}
              >
                {createModal.saving ? 'Đang tạo...' : 'Tạo admin'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
