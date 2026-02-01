import React, { useEffect, useState } from 'react';
import { getSummary } from '../services/adminDashboardService';

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

export default function DashboardPage() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(30);

  const num = (v) => (typeof v === 'number' ? v : 0);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Bảng điều khiển</h1>
          <p className="muted">Biểu đồ tổng quan thay cho truy cập nhanh.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setPeriod(d);
                load(d);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                border: d === period ? '1px solid #2563eb' : '1px solid #cbd5e1',
                background: d === period ? '#2563eb' : '#fff',
                color: d === period ? '#fff' : '#0f172a',
                cursor: 'pointer',
              }}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading ? (
        <div className="center">Đang tải...</div>
      ) : (
        <div className="stat-grid">
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
            <div className="stat-title">Đặt phòng</div>
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
          </div>

          <div className="stat-card">
            <div className="stat-title">Reports</div>
            <div style={{ margin: '8px 0 6px', fontWeight: 600 }}>
              Chờ xử lý {num(summary?.reports?.pending)} · Tổng {num(summary?.reports?.total)}
            </div>
            <StackBar
              segments={[
                { label: 'Chờ xử lý', value: num(summary?.reports?.pending), color: '#fbbf24' },
                { label: 'Đã xử lý', value: Math.max(0, num(summary?.reports?.total) - num(summary?.reports?.pending)), color: '#22c55e' },
              ]}
              total={num(summary?.reports?.total)}
            />
          </div>

          <div className="stat-card">
            <div className="stat-title">Revenue</div>
            <div className="stat-value" style={{ fontSize: 24 }}>{summary?.payments?.totalRevenue || 0}</div>
            <div style={{ marginTop: 6, color: '#475569', fontSize: 13 }}>Payments: {num(summary?.payments?.total)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
