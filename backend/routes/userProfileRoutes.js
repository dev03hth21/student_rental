/**
 * User Profile Routes
 * Routes for user profile management (student role)
 * Alias routes matching frontend expectations
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { getCurrentUser, updateCurrentUser, deleteMyAccount } = require('../controllers/userController');
const { getRecommendedRooms } = require('../controllers/roomController');

// All routes require authentication as student
router.use(protect, authorize('student'));

/**
 * @route   GET /api/user/profile
 * @desc    Get current user profile
 * @access  Private (Student)
 */
router.get('/profile', getCurrentUser);

/**
 * @route   PUT /api/user/profile
 * @desc    Update current user profile
 * @access  Private (Student)
 */
router.put('/profile', updateCurrentUser);

/**
 * @route   DELETE /api/user/profile
 * @desc    Delete user account
 * @access  Private (Student)
 */
router.delete('/profile', deleteMyAccount);

/**
 * @route   GET /api/user/rooms/recommend
 * @desc    Get recommended rooms for student
 * @access  Private (Student)
 */
router.get('/rooms/recommend', getRecommendedRooms);

/**
 * @route   POST /api/user/feedback
 * @desc    Submit user feedback
 * @access  Private (Student)
 */
router.post('/feedback', async (req, res) => {
  // TODO: Implement feedback storage
  // For now, just log and return success
  console.log('📝 User Feedback:', {
    userId: req.user._id,
    subject: req.body.subject,
    message: req.body.message,
    timestamp: new Date()
  });

  return res.json({
    success: true,
    message: 'Gửi góp ý thành công. Cảm ơn bạn!',
    data: {
      received: true,
      timestamp: new Date()
    }
  });
});

module.exports = router;
