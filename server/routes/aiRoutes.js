const express = require('express');
const router = express.Router();
const { chatWithFile, getChatHistory } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// Protected routes
router.post('/chat/:fileId', protect, chatWithFile);
router.get('/history/:fileId', protect, getChatHistory);

module.exports = router;
