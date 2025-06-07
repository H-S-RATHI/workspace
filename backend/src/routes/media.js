const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');
const {
  uploadImage,
  uploadVideo,
  generateVideoThumbnail,
  deleteResource,
  uploadMultipleImages,
  createImageVariants,
} = require('../config/cloudinary');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  },
});

// Upload single image
router.post('/upload/image', [
  authenticateToken,
  upload.single('image'),
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No image file provided',
      });
    }

    const { folder = 'posts' } = req.body;
    
    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await uploadImage(base64Image, {
      folder: `social-marketplace/${folder}`,
      public_id: `${req.user.userId}_${Date.now()}`,
    });

    // Create image variants
    const variants = createImageVariants(result.public_id);

    logger.info('Image uploaded successfully', {
      userId: req.user.userId,
      publicId: result.public_id,
      folder,
    });

    res.json({
      success: true,
      image: {
        ...result,
        variants,
      },
      message: 'Image uploaded successfully',
    });

  } catch (error) {
    logger.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload image',
    });
  }
});

// Upload multiple images
router.post('/upload/images', [
  authenticateToken,
  upload.array('images', 10), // Max 10 images
], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No image files provided',
      });
    }

    const { folder = 'posts' } = req.body;
    
    // Convert files to base64
    const base64Images = req.files.map(file => 
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    );
    
    // Upload to Cloudinary
    const uploadPromises = base64Images.map((base64Image, index) => 
      uploadImage(base64Image, {
        folder: `social-marketplace/${folder}`,
        public_id: `${req.user.userId}_${Date.now()}_${index}`,
      })
    );

    const results = await Promise.all(uploadPromises);

    // Create variants for each image
    const imagesWithVariants = results.map(result => ({
      ...result,
      variants: createImageVariants(result.public_id),
    }));

    logger.info('Multiple images uploaded successfully', {
      userId: req.user.userId,
      count: results.length,
      folder,
    });

    res.json({
      success: true,
      images: imagesWithVariants,
      message: `${results.length} images uploaded successfully`,
    });

  } catch (error) {
    logger.error('Multiple images upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload images',
    });
  }
});

// Upload video
router.post('/upload/video', [
  authenticateToken,
  upload.single('video'),
], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No video file provided',
      });
    }

    const { folder = 'reels', generateThumbnail = true } = req.body;
    
    // Convert buffer to base64
    const base64Video = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await uploadVideo(base64Video, {
      folder: `social-marketplace/${folder}`,
      public_id: `${req.user.userId}_${Date.now()}`,
    });

    let thumbnailUrl = null;
    if (generateThumbnail === 'true' || generateThumbnail === true) {
      thumbnailUrl = generateVideoThumbnail(result.public_id);
    }

    logger.info('Video uploaded successfully', {
      userId: req.user.userId,
      publicId: result.public_id,
      duration: result.duration,
      folder,
    });

    res.json({
      success: true,
      video: {
        ...result,
        thumbnailUrl,
      },
      message: 'Video uploaded successfully',
    });

  } catch (error) {
    logger.error('Video upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload video',
    });
  }
});

// Upload from URL
router.post('/upload/from-url', [
  authenticateToken,
  body('url').isURL().withMessage('Valid URL required'),
  body('type').isIn(['image', 'video']).withMessage('Type must be image or video'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { url, type, folder = 'posts' } = req.body;
    
    let result;
    if (type === 'image') {
      result = await uploadImage(url, {
        folder: `social-marketplace/${folder}`,
        public_id: `${req.user.userId}_${Date.now()}`,
      });
      
      result.variants = createImageVariants(result.public_id);
    } else {
      result = await uploadVideo(url, {
        folder: `social-marketplace/${folder}`,
        public_id: `${req.user.userId}_${Date.now()}`,
      });
      
      result.thumbnailUrl = generateVideoThumbnail(result.public_id);
    }

    logger.info('Media uploaded from URL successfully', {
      userId: req.user.userId,
      publicId: result.public_id,
      type,
      folder,
    });

    res.json({
      success: true,
      [type]: result,
      message: `${type} uploaded successfully`,
    });

  } catch (error) {
    logger.error('Upload from URL error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload from URL',
    });
  }
});

// Delete media
router.delete('/delete/:publicId', [
  authenticateToken,
  body('resourceType').optional().isIn(['image', 'video']).withMessage('Resource type must be image or video'),
], async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType = 'image' } = req.body;

    // Verify the public ID belongs to the user (basic security check)
    if (!publicId.includes(req.user.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to delete this resource',
      });
    }

    const result = await deleteResource(publicId, resourceType);

    logger.info('Media deleted successfully', {
      userId: req.user.userId,
      publicId,
      resourceType,
    });

    res.json({
      success: true,
      result,
      message: 'Media deleted successfully',
    });

  } catch (error) {
    logger.error('Media delete error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete media',
    });
  }
});

// Get upload signature for direct client uploads
router.post('/upload/signature', authenticateToken, async (req, res) => {
  try {
    const { folder = 'posts', resourceType = 'image' } = req.body;
    
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp,
      folder: `social-marketplace/${folder}`,
      public_id: `${req.user.userId}_${timestamp}`,
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder,
      publicId: params.public_id,
    });

  } catch (error) {
    logger.error('Upload signature error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate upload signature',
    });
  }
});

module.exports = router;