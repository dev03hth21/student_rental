/**
 * Admin Routes
 * Complete admin management routes for users, hosts, rooms, and profile
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize, requireSuperAdmin } = require('../middlewares/roleMiddleware');

// Dashboard controllers (legacy)
const {
  getAdminDashboard,
  getRevenueAnalytics,
  getUserAnalytics,
  getSystemAlerts,
} = require('../controllers/adminDashboardController');

// New admin controllers
const {
  // User Management
  getAllUsers,
  getUserById,
  updateUser,
  createAdminUser,
  deleteUser,
  
  // Host Management
  getAllHosts,
  getHostById,
  updateHost,
  deleteHost,
  
  // Room Management
  getAllRooms,
  getRoomById,
  approveRoom,
  rejectRoom,
  deleteRoom,
  
  // Dashboard Summary
  getSummary,
  
  // Admin Profile
  getMyProfile,
  updateMyProfile,
} = require('../controllers/adminController');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// ========================
// DASHBOARD ROUTES
// ========================
router.get('/dashboard/summary', getSummary);
router.get('/summary', getSummary); // Alias used by frontend
router.get('/dashboard', getAdminDashboard); // Legacy - full dashboard
router.get('/dashboard/revenue', getRevenueAnalytics);
router.get('/dashboard/users', getUserAnalytics);
router.get('/dashboard/alerts', getSystemAlerts);

// ========================
// USER MANAGEMENT ROUTES
// ========================
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.post('/users/admin', requireSuperAdmin, createAdminUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// ========================
// HOST MANAGEMENT ROUTES
// ========================
router.get('/hosts', getAllHosts);
router.get('/hosts/:id', getHostById);
router.put('/hosts/:id', updateHost);
router.delete('/hosts/:id', deleteHost);

// ========================
// ROOM MANAGEMENT ROUTES
// ========================
router.get('/rooms', getAllRooms);
router.get('/rooms/:id', getRoomById);
router.put('/rooms/:id/approve', approveRoom);
router.put('/rooms/:id/reject', rejectRoom);
router.delete('/rooms/:id', deleteRoom);

// ========================
// ADMIN PROFILE ROUTES
// ========================
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

module.exports = router;
