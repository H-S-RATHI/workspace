const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get marketplace products (Shop)
router.get('/products', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { category, minPrice, maxPrice, condition, location, search } = req.query;

    let query = db('products')
      .join('users', 'products.sellerId', 'users.userId')
      .where('products.status', 'ACTIVE')
      .where('users.isDeleted', false);

    // Apply filters
    if (category) {
      query = query.where('products.category', category);
    }
    if (minPrice) {
      query = query.where('products.price', '>=', parseFloat(minPrice));
    }
    if (maxPrice) {
      query = query.where('products.price', '<=', parseFloat(maxPrice));
    }
    if (condition) {
      query = query.where('products.condition', condition);
    }
    if (location) {
      query = query.whereILike('products.locationCity', `%${location}%`);
    }
    if (search) {
      query = query.where(function() {
        this.whereILike('products.title', `%${search}%`)
            .orWhereILike('products.description', `%${search}%`);
      });
    }

    const products = await query
      .select(
        'products.productId',
        'products.title',
        'products.description',
        'products.category',
        'products.brand',
        'products.condition',
        'products.price',
        'products.currency',
        'products.locationCity',
        'products.quantityAvailable',
        'products.trustScore',
        'products.createdAt',
        'users.userId as sellerId',
        'users.username as sellerUsername',
        'users.fullName as sellerName',
        'users.profilePhotoUrl as sellerPhoto'
      )
      .orderBy('products.createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get product images
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await db('product_images')
          .where({ productId: product.productId })
          .select('imageUrl', 'isPrimary')
          .orderBy('isPrimary', 'desc');

        return {
          ...product,
          images,
          primaryImage: images.find(img => img.isPrimary)?.imageUrl || images[0]?.imageUrl,
        };
      })
    );

    res.json({
      success: true,
      products: productsWithImages,
      pagination: {
        page,
        limit,
        hasMore: products.length === limit,
      },
      filters: {
        category,
        minPrice,
        maxPrice,
        condition,
        location,
        search,
      },
    });

  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get products',
    });
  }
});

// Get single product details
router.get('/products/:productId', optionalAuth, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await db('products')
      .join('users', 'products.sellerId', 'users.userId')
      .where('products.productId', productId)
      .where('products.status', 'ACTIVE')
      .where('users.isDeleted', false)
      .select(
        'products.*',
        'users.username as sellerUsername',
        'users.fullName as sellerName',
        'users.profilePhotoUrl as sellerPhoto',
        'users.isBusinessAccount'
      )
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Get product images
    const images = await db('product_images')
      .where({ productId })
      .select('imageUrl', 'isPrimary')
      .orderBy('isPrimary', 'desc');

    // Get seller's other products
    const otherProducts = await db('products')
      .where('sellerId', product.sellerId)
      .where('productId', '!=', productId)
      .where('status', 'ACTIVE')
      .select('productId', 'title', 'price', 'currency')
      .limit(5);

    res.json({
      success: true,
      product: {
        ...product,
        images,
        otherProducts,
      },
    });

  } catch (error) {
    logger.error('Get product details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get product details',
    });
  }
});

// Create new product listing
router.post('/products', [
  authenticateToken,
  body('title').isLength({ min: 1, max: 100 }).withMessage('Title is required'),
  body('description').isLength({ min: 1, max: 2000 }).withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('condition').isIn(['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE']),
  body('price').isFloat({ min: 0.01 }).withMessage('Price must be greater than 0'),
  body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency code required'),
  body('quantityAvailable').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
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

    const {
      title,
      description,
      category,
      brand,
      condition,
      price,
      currency,
      locationCity,
      locationCountry,
      quantityAvailable,
      images = [],
    } = req.body;

    const productId = uuidv4();
    const productData = {
      productId,
      sellerId: req.user.userId,
      title,
      description,
      category,
      brand: brand || null,
      condition,
      price: parseFloat(price),
      currency,
      locationCity: locationCity || null,
      locationCountry: locationCountry || null,
      quantityAvailable: parseInt(quantityAvailable),
      trustScore: 0.0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db('products').insert(productData);

    // Insert product images if provided
    if (images.length > 0) {
      const imageData = images.map((imageUrl, index) => ({
        imageId: uuidv4(),
        productId,
        imageUrl,
        isPrimary: index === 0,
      }));

      await db('product_images').insert(imageData);
    }

    logger.info(`Product created: ${productId}`, { 
      seller: req.user.username,
      title,
      price: `${currency} ${price}` 
    });

    res.json({
      success: true,
      product: {
        ...productData,
        images,
      },
      message: 'Product listed successfully',
    });

  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product listing',
    });
  }
});

// Get user's listings
router.get('/my-listings', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let query = db('products')
      .where('sellerId', req.user.userId);

    if (status) {
      query = query.where('status', status);
    }

    const products = await query
      .select('*')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get images for each product
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        const images = await db('product_images')
          .where({ productId: product.productId })
          .select('imageUrl', 'isPrimary')
          .orderBy('isPrimary', 'desc');

        return {
          ...product,
          images,
          primaryImage: images.find(img => img.isPrimary)?.imageUrl || images[0]?.imageUrl,
        };
      })
    );

    res.json({
      success: true,
      products: productsWithImages,
      pagination: {
        page,
        limit,
        hasMore: products.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get my listings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get listings',
    });
  }
});

// Get deals and promotions
router.get('/deals', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const now = new Date();
    
    const deals = await db('deals')
      .join('products', 'deals.productId', 'products.productId')
      .join('users', 'deals.sellerId', 'users.userId')
      .where('deals.status', 'ACTIVE')
      .where('deals.startAt', '<=', now)
      .where('deals.endAt', '>', now)
      .where('products.status', 'ACTIVE')
      .select(
        'deals.*',
        'products.title as productTitle',
        'products.price as originalPrice',
        'products.currency',
        'users.username as sellerUsername'
      )
      .orderBy('deals.createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Calculate discounted prices
    const dealsWithPricing = deals.map(deal => {
      let discountedPrice = deal.originalPrice;
      
      if (deal.discountPercent) {
        discountedPrice = deal.originalPrice * (1 - deal.discountPercent / 100);
      }

      return {
        ...deal,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        savings: Math.round((deal.originalPrice - discountedPrice) * 100) / 100,
      };
    });

    res.json({
      success: true,
      deals: dealsWithPricing,
      pagination: {
        page,
        limit,
        hasMore: deals.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get deals error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get deals',
    });
  }
});

// Create a deal/promotion
router.post('/deals', [
  authenticateToken,
  body('dealType').isIn(['REFERRAL', 'GROUP_BUY', 'FLASH_SALE', 'SPONSORED']),
  body('productId').isUUID().withMessage('Valid product ID required'),
  body('discountPercent').optional().isInt({ min: 1, max: 90 }),
  body('startAt').isISO8601().withMessage('Valid start date required'),
  body('endAt').isISO8601().withMessage('Valid end date required'),
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

    const {
      dealType,
      productId,
      discountPercent,
      startAt,
      endAt,
      minParticipants,
    } = req.body;

    // Verify user owns the product
    const product = await db('products')
      .where({ productId, sellerId: req.user.userId })
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or not owned by user',
      });
    }

    const dealId = uuidv4();
    const dealData = {
      dealId,
      sellerId: req.user.userId,
      dealType,
      productId,
      discountPercent: discountPercent || null,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      minParticipants: minParticipants || null,
      currentParticipants: 0,
      status: 'SCHEDULED',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db('deals').insert(dealData);

    logger.info(`Deal created: ${dealId}`, { 
      seller: req.user.username,
      dealType,
      productId 
    });

    res.json({
      success: true,
      deal: dealData,
      message: 'Deal created successfully',
    });

  } catch (error) {
    logger.error('Create deal error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create deal',
    });
  }
});

module.exports = router;