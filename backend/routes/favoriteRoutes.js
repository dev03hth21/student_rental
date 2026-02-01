const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  addFavorite,
  removeFavorite,
  removeFavoriteByRoom,
  getMyFavorites,
} = require('../controllers/favoriteController');

// Yêu cầu đăng nhập + role student cho toàn bộ routes
router.use(protect, authorize('student'));

/**
 * @route   POST /api/favorites
 * @desc    Add room to favorites
 * @access  Private (Student)
 */
router.post('/', addFavorite);

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorites (alias for /my)
 * @access  Private (Student)
 */
router.get('/', getMyFavorites);

/**
 * @route   GET /api/favorites/my
 * @desc    Get user's favorites
 * @access  Private (Student)
 */
router.get('/my', getMyFavorites);

/**
 * @route   DELETE /api/favorites/:roomId
 * @desc    Remove favorite by room ID (alias)
 * @access  Private (Student)
 */
router.delete('/:roomId', removeFavoriteByRoom);

/**
 * @route   DELETE /api/favorites/by-room/:roomId
 * @desc    Remove favorite by room ID
 * @access  Private (Student)
 */
router.delete('/by-room/:roomId', removeFavoriteByRoom);

module.exports = router;
