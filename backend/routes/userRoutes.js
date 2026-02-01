const express = require('express');
const { getCurrentUser, updateCurrentUser, uploadAvatar, uploadIdentityCard, deleteMyAccount } = require('../controllers/userController');
const { getRecentViews } = require('../controllers/viewLogController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Original routes
router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateCurrentUser);
router.post('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/me/id-card', protect, upload.single('idCard'), uploadIdentityCard);
router.delete('/me', protect, deleteMyAccount);
router.get('/me/recent-views', protect, authorize('student'), getRecentViews);

module.exports = router;
