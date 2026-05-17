const express = require('express');
const router = express.Router();
const {
  uploadFiles,
  getFiles,
  getFileById,
  updateFile,
  deleteFile,
  downloadFile,
  getSharedFile,
} = require('../controllers/fileController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public route (must be before /:id)
router.get('/shared/:shareToken', getSharedFile);

// Protected routes
router.post('/upload', protect, upload.array('files', 10), uploadFiles);
router.get('/', protect, getFiles);
router.get('/download/:id', protect, downloadFile);
router.get('/:id', protect, getFileById);
router.put('/:id', protect, updateFile);
router.delete('/:id', protect, deleteFile);

module.exports = router;
