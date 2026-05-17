const File = require('../models/File');
const { v4: uuidv4 } = require('uuid');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
  getResourceType,
  getFileType,
} = require('../utils/cloudinaryUpload');

// @desc    Upload files
// @route   POST /api/files/upload
// @access  Private
const uploadFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded',
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const resourceType = getResourceType(file.mimetype);
      const fileType = getFileType(file.mimetype);

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file.buffer, {
        resource_type: resourceType,
        public_id: `cloudvault/${req.user._id}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
      });

      // Save to database
      const newFile = await File.create({
        fileName: file.originalname,
        originalName: file.originalname,
        fileUrl: result.secure_url,
        publicId: result.public_id,
        fileType,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedBy: req.user._id,
        shareToken: uuidv4(),
      });

      uploadedFiles.push(newFile);
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all files for current user
// @route   GET /api/files
// @access  Private
const getFiles = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      type = '',
      sort = '-createdAt',
    } = req.query;

    const query = { uploadedBy: req.user._id };

    // Search filter
    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { originalName: { $regex: search, $options: 'i' } },
      ];
    }

    // Type filter
    if (type && type !== 'all') {
      query.fileType = type;
    }

    const total = await File.countDocuments(query);
    const files = await File.find(query)
      .sort(sort)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('uploadedBy', 'name email avatar');

    // Calculate storage stats
    const stats = await File.aggregate([
      { $match: { uploadedBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalSize: { $sum: '$fileSize' },
          totalFiles: { $sum: 1 },
          images: {
            $sum: { $cond: [{ $eq: ['$fileType', 'image'] }, 1, 0] },
          },
          videos: {
            $sum: { $cond: [{ $eq: ['$fileType', 'video'] }, 1, 0] },
          },
          pdfs: {
            $sum: { $cond: [{ $eq: ['$fileType', 'pdf'] }, 1, 0] },
          },
          documents: {
            $sum: { $cond: [{ $eq: ['$fileType', 'document'] }, 1, 0] },
          },
          archives: {
            $sum: { $cond: [{ $eq: ['$fileType', 'archive'] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: files,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      stats: stats[0] || {
        totalSize: 0,
        totalFiles: 0,
        images: 0,
        videos: 0,
        pdfs: 0,
        documents: 0,
        archives: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single file
// @route   GET /api/files/:id
// @access  Private
const getFileById = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    }).populate('uploadedBy', 'name email avatar');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update file (rename)
// @route   PUT /api/files/:id
// @access  Private
const updateFile = async (req, res, next) => {
  try {
    const { fileName, isPublic } = req.body;

    const file = await File.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    if (fileName) file.fileName = fileName;
    if (typeof isPublic === 'boolean') file.isPublic = isPublic;

    await file.save();

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
const deleteFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // Determine resource type for Cloudinary deletion
    let resourceType = 'raw';
    if (file.fileType === 'image') resourceType = 'image';
    if (file.fileType === 'video') resourceType = 'video';

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(file.publicId, resourceType);
    } catch (cloudErr) {
      console.error('Cloudinary deletion warning:', cloudErr.message);
    }

    // Delete from database
    await File.findByIdAndDelete(file._id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download file (redirect to URL)
// @route   GET /api/files/download/:id
// @access  Private
const downloadFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id,
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    // For Cloudinary, append fl_attachment to force download
    let downloadUrl = file.fileUrl;
    if (downloadUrl.includes('cloudinary')) {
      const parts = downloadUrl.split('/upload/');
      if (parts.length === 2) {
        downloadUrl = parts[0] + '/upload/fl_attachment/' + parts[1];
      }
    }

    res.status(200).json({
      success: true,
      data: {
        url: downloadUrl,
        fileName: file.fileName,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shared file by token
// @route   GET /api/files/shared/:shareToken
// @access  Public
const getSharedFile = async (req, res, next) => {
  try {
    const file = await File.findOne({
      shareToken: req.params.shareToken,
      isPublic: true,
    }).populate('uploadedBy', 'name avatar');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'Shared file not found or is no longer public',
      });
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadFiles,
  getFiles,
  getFileById,
  updateFile,
  deleteFile,
  downloadFile,
  getSharedFile,
};
