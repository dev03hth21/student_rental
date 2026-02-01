import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import Button from './Button';

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard/summary', label: 'Tổng quan' },
    { to: '/rooms/pending', label: 'Phòng chờ duyệt' },
    { to: '/rooms/approved', label: 'Phòng đã duyệt' },
    { to: '/rooms/rejected', label: 'Phòng bị từ chối' },
    { to: '/users', label: 'Người dùng' },
    { to: '/reports', label: 'Báo cáo' },
    { to: '/profile', label: 'Hồ sơ' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="brand">
        <img src="/logo.svg" alt="Student Rental" className="brand-logo" />
        <span>Trang quản trị</span>
      </div>
      <nav className="nav-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? 'active' : ''}
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <Button variant="ghost" onClick={handleLogout}>Đăng xuất</Button>
    </header>
  );
}
