import React, { useEffect, useState } from 'react';
import { getSummary } from '../services/adminDashboardService';
import Button from '../components/Button';

const StatCard = ({ title, value, note }) => (
  <div className="stat-card">
    <div className="stat-title">{title}</div>
    <div className="stat-value">{value}</div>
    {note && <div style={{ fontSize: 12, color: '#475569' }}>{note}</div>}
  </div>
);

const StackBar = ({ segments = [], total }) => {
  const sum = total || segments.reduce((acc, s) => acc + (s.value || 0), 0) || 1;
  return (
    <div style={{ display: 'flex', width: '100%', height: 10, borderRadius: 999, overflow: 'hidden', background: '#e2e8f0' }}>
      {segments.map((seg) => {
        const width = `${Math.max(3, Math.round(((seg.value || 0) / sum) * 100))}%`;
        return (
          <div key={seg.label} title={`${seg.label}: ${seg.value || 0}`} style={{ width, background: seg.color, transition: 'width 0.3s ease' }} />
        );
      })}
    </div>
  );
};

export default function AdminDashboardSummary() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState({});
  const [period, setPeriod] = useState(30);

  const load = async (p = period) => {
    setLoading(true);
    setError('');
    try {
      const data = await getSummary(p);
      setSummary(data);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Tải tổng quan thất bại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(period);
  }, []);

  const handlePeriod = (days) => {
    setPeriod(days);
    load(days);
  };

  const num = (v) => (typeof v === 'number' ? v : 0);

  return (
    <div>
      <h1>Tổng quan quản trị</h1>
      <p>Tổng quan người dùng, chủ trọ, phòng, đặt phòng, thanh toán và báo cáo.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[7, 30, 90].map((d) => (
          <Button key={d} variant={d === period ? 'primary' : 'ghost'} onClick={() => handlePeriod(d)}>
            {d} ngày
          </Button>
        ))}
      </div>
      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div className="center">Đang tải...</div>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard title="Người dùng" value={num(summary?.users?.total)} note={`${num(summary?.users?.new)} mới`} />
            <StatCard title="Phòng chờ duyệt" value={num(summary?.rooms?.pending)} note={`Đã duyệt ${num(summary?.rooms?.approved)}`} />
            <StatCard title="Đặt phòng" value={num(summary?.bookings?.total)} note={`Chờ xử lý ${num(summary?.bookings?.pending)}`} />
            <StatCard title="Doanh thu" value={summary?.payments?.totalRevenue || 0} note={`Thanh toán ${num(summary?.payments?.total)}`} />
            <StatCard title="Báo cáo chờ xử lý" value={num(summary?.reports?.pending)} note={`Tổng ${num(summary?.reports?.total)}`} />
          </div>

          <div className="stat-grid" style={{ marginTop: 16 }}>
            <div className="stat-card">
              <div className="stat-title">Phân bổ user</div>
              <div style={{ margin: '8px 0 6px', fontWeight: 600 }}>
                {num(summary?.users?.byRole?.students)} SV · {num(summary?.users?.byRole?.owners)} Chủ trọ · {num(summary?.users?.byRole?.admins)} Quản trị
              </div>
              <StackBar
                segments={[
                  { label: 'Sinh viên', value: num(summary?.users?.byRole?.students), color: '#2563eb' },
                  { label: 'Chủ trọ', value: num(summary?.users?.byRole?.owners), color: '#22c55e' },
                  { label: 'Quản trị', value: num(summary?.users?.byRole?.admins), color: '#f97316' },
                ]}
                total={num(summary?.users?.total)}
              />
            </div>

            <div className="stat-card">
              <div className="stat-title">Trạng thái phòng</div>
              <div style={{ margin: '8px 0 6px', fontWeight: 600 }}>
                Chờ duyệt {num(summary?.rooms?.pending)} · Đã duyệt {num(summary?.rooms?.approved)}
              </div>
              <StackBar
                segments={[
                  { label: 'Chờ duyệt', value: num(summary?.rooms?.pending), color: '#f59e0b' },
                  { label: 'Đã duyệt', value: num(summary?.rooms?.approved), color: '#16a34a' },
                ]}
                total={num(summary?.rooms?.pending) + num(summary?.rooms?.approved)}
              />
            </div>

            <div className="stat-card">
              <div className="stat-title">Đặt phòng & Thanh toán</div>
              <div style={{ margin: '8px 0 6px', fontWeight: 600 }}>
                Tổng {num(summary?.bookings?.total)} · Chờ {num(summary?.bookings?.pending)}
              </div>
              <StackBar
                segments={[
                  { label: 'Chờ xử lý', value: num(summary?.bookings?.pending), color: '#f97316' },
                  { label: 'Hoàn tất', value: Math.max(0, num(summary?.bookings?.total) - num(summary?.bookings?.pending)), color: '#0ea5e9' },
                ]}
                total={num(summary?.bookings?.total)}
              />
              <div style={{ marginTop: 10, fontSize: 13, color: '#334155' }}>
                Doanh thu: {summary?.payments?.totalRevenue || 0}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
