const cloudinary = require('cloudinary').v2;
const { logger } = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload image to Cloudinary
 * @param {string} filePath - Path to the file or base64 string
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
const uploadImage = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'social-marketplace/images',
      resource_type: 'image',
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    };

    const result = await cloudinary.uploader.upload(filePath, defaultOptions);
    
    logger.info('Image uploaded to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
      size: result.bytes,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary image upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload video to Cloudinary
 * @param {string} filePath - Path to the file or base64 string
 * @param {object} options - Upload options
 * @returns {Promise<object>} Upload result
 */
const uploadVideo = async (filePath, options = {}) => {
  try {
    const defaultOptions = {
      folder: 'social-marketplace/videos',
      resource_type: 'video',
      quality: 'auto',
      ...options,
    };

    const result = await cloudinary.uploader.upload(filePath, defaultOptions);
    
    logger.info('Video uploaded to Cloudinary', {
      public_id: result.public_id,
      url: result.secure_url,
      duration: result.duration,
      size: result.bytes,
    });

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      duration: result.duration,
      size: result.bytes,
    };
  } catch (error) {
    logger.error('Cloudinary video upload error:', error);
    throw new Error('Failed to upload video');
  }
};

/**
 * Generate video thumbnail
 * @param {string} videoPublicId - Public ID of the uploaded video
 * @param {object} options - Thumbnail options
 * @returns {string} Thumbnail URL
 */
const generateVideoThumbnail = (videoPublicId, options = {}) => {
  const defaultOptions = {
    resource_type: 'video',
    format: 'jpg',
    quality: 'auto',
    width: 400,
    height: 600,
    crop: 'fill',
    gravity: 'center',
    ...options,
  };

  return cloudinary.url(videoPublicId, defaultOptions);
};

/**
 * Delete resource from Cloudinary
 * @param {string} publicId - Public ID of the resource
 * @param {string} resourceType - Type of resource (image, video, raw)
 * @returns {Promise<object>} Deletion result
 */
const deleteResource = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    
    logger.info('Resource deleted from Cloudinary', {
      public_id: publicId,
      result: result.result,
    });

    return result;
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete resource');
  }
};

/**
 * Generate optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {object} transformations - Image transformations
 * @returns {string} Optimized image URL
 */
const getOptimizedImageUrl = (publicId, transformations = {}) => {
  const defaultTransformations = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformations,
  };

  return cloudinary.url(publicId, defaultTransformations);
};

/**
 * Upload multiple images
 * @param {Array} files - Array of file paths or base64 strings
 * @param {object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    logger.error('Multiple image upload error:', error);
    throw new Error('Failed to upload multiple images');
  }
};

/**
 * Create image variants (different sizes)
 * @param {string} publicId - Public ID of the original image
 * @returns {object} Object with different image sizes
 */
const createImageVariants = (publicId) => {
  return {
    thumbnail: getOptimizedImageUrl(publicId, { width: 150, height: 150, crop: 'fill' }),
    small: getOptimizedImageUrl(publicId, { width: 400, height: 400, crop: 'limit' }),
    medium: getOptimizedImageUrl(publicId, { width: 800, height: 800, crop: 'limit' }),
    large: getOptimizedImageUrl(publicId, { width: 1200, height: 1200, crop: 'limit' }),
    original: getOptimizedImageUrl(publicId),
  };
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadVideo,
  generateVideoThumbnail,
  deleteResource,
  getOptimizedImageUrl,
  uploadMultipleImages,
  createImageVariants,
};