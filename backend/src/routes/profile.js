const express = require('express');
const { body, validationResult } = require('express-validator');

const { db } = require('../config/database');
const { authenticateToken, requireBusinessTier } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get user analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get follower growth
    const followerGrowth = await db('followers')
      .where('userId', req.user.userId)
      .where('followedAt', '>=', startDate)
      .select(db.raw('DATE(followed_at) as date'), db.raw('COUNT(*) as new_followers'))
      .groupBy(db.raw('DATE(followed_at)'))
      .orderBy('date');

    // Get post engagement
    const postEngagement = await db('posts')
      .leftJoin('post_likes', 'posts.postId', 'post_likes.postId')
      .leftJoin('post_comments', 'posts.postId', 'post_comments.postId')
      .where('posts.userId', req.user.userId)
      .where('posts.createdAt', '>=', startDate)
      .select(
        'posts.postId',
        'posts.postType',
        'posts.createdAt',
        db.raw('COUNT(DISTINCT post_likes.userId) as likes'),
        db.raw('COUNT(DISTINCT post_comments.commentId) as comments')
      )
      .groupBy('posts.postId', 'posts.postType', 'posts.createdAt')
      .orderBy('posts.createdAt', 'desc');

    // Get total stats
    const [totalFollowers, totalPosts, totalListings] = await Promise.all([
      db('followers').where('userId', req.user.userId).count('* as count').first(),
      db('posts').where('userId', req.user.userId).where('isDeleted', false).count('* as count').first(),
      db('products').where('sellerId', req.user.userId).where('status', 'ACTIVE').count('* as count').first(),
    ]);

    res.json({
      success: true,
      analytics: {
        period,
        totalStats: {
          followers: parseInt(totalFollowers.count),
          posts: parseInt(totalPosts.count),
          listings: parseInt(totalListings.count),
        },
        followerGrowth,
        postEngagement,
      },
    });

  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics',
    });
  }
});

// Get user's posts
router.get('/posts', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.query;
    const targetUserId = userId || req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const posts = await db('posts')
      .join('users', 'posts.userId', 'users.userId')
      .where('posts.userId', targetUserId)
      .where('posts.isDeleted', false)
      .where('users.isDeleted', false)
      .select(
        'posts.postId',
        'posts.postType',
        'posts.caption',
        'posts.mediaUrls',
        'posts.hashtags',
        'posts.createdAt',
        'users.username',
        'users.profilePhotoUrl'
      )
      .orderBy('posts.createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get engagement data
    const postsWithEngagement = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          db('post_likes').where({ postId: post.postId }).count('* as count').first(),
          db('post_comments').where({ postId: post.postId }).count('* as count').first(),
        ]);

        return {
          ...post,
          mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
          hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
          likesCount: parseInt(likesCount.count),
          commentsCount: parseInt(commentsCount.count),
        };
      })
    );

    res.json({
      success: true,
      posts: postsWithEngagement,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get posts',
    });
  }
});

// Business Tools - Inventory Management
router.get('/business/inventory', [authenticateToken, requireBusinessTier], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const { status, lowStock } = req.query;

    let query = db('products')
      .where('sellerId', req.user.userId);

    if (status) {
      query = query.where('status', status);
    }

    if (lowStock === 'true') {
      query = query.where('quantityAvailable', '<', 5);
    }

    const products = await query
      .select('*')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get sales data for each product
    const productsWithSales = await Promise.all(
      products.map(async (product) => {
        const salesData = await db('order_items')
          .join('orders', 'order_items.orderId', 'orders.orderId')
          .where('order_items.productId', product.productId)
          .where('orders.status', 'DELIVERED')
          .select(
            db.raw('SUM(order_items.quantity) as total_sold'),
            db.raw('SUM(order_items.total_price) as total_revenue')
          )
          .first();

        return {
          ...product,
          totalSold: parseInt(salesData.total_sold) || 0,
          totalRevenue: parseFloat(salesData.total_revenue) || 0,
          isLowStock: product.quantityAvailable < 5,
        };
      })
    );

    res.json({
      success: true,
      inventory: productsWithSales,
      pagination: {
        page,
        limit,
        hasMore: products.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get inventory',
    });
  }
});

// Business Tools - Sales Analytics
router.get('/business/sales', [authenticateToken, requireBusinessTier], async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get daily sales data
    const dailySales = await db('orders')
      .join('order_items', 'orders.orderId', 'order_items.orderId')
      .join('products', 'order_items.productId', 'products.productId')
      .where('products.sellerId', req.user.userId)
      .where('orders.placedAt', '>=', startDate)
      .where('orders.status', 'DELIVERED')
      .select(
        db.raw('DATE(orders.placed_at) as date'),
        db.raw('SUM(order_items.total_price) as revenue'),
        db.raw('SUM(order_items.quantity) as units_sold')
      )
      .groupBy(db.raw('DATE(orders.placed_at)'))
      .orderBy('date');

    // Get top products
    const topProducts = await db('order_items')
      .join('orders', 'order_items.orderId', 'orders.orderId')
      .join('products', 'order_items.productId', 'products.productId')
      .where('products.sellerId', req.user.userId)
      .where('orders.placedAt', '>=', startDate)
      .where('orders.status', 'DELIVERED')
      .select(
        'products.productId',
        'products.title',
        db.raw('SUM(order_items.quantity) as units_sold'),
        db.raw('SUM(order_items.total_price) as revenue')
      )
      .groupBy('products.productId', 'products.title')
      .orderBy('revenue', 'desc')
      .limit(10);

    // Get total metrics
    const totalMetrics = await db('orders')
      .join('order_items', 'orders.orderId', 'order_items.orderId')
      .join('products', 'order_items.productId', 'products.productId')
      .where('products.sellerId', req.user.userId)
      .where('orders.placedAt', '>=', startDate)
      .where('orders.status', 'DELIVERED')
      .select(
        db.raw('SUM(order_items.total_price) as total_revenue'),
        db.raw('SUM(order_items.quantity) as total_units'),
        db.raw('COUNT(DISTINCT orders.order_id) as total_orders')
      )
      .first();

    res.json({
      success: true,
      salesAnalytics: {
        period,
        totalMetrics: {
          revenue: parseFloat(totalMetrics.total_revenue) || 0,
          units: parseInt(totalMetrics.total_units) || 0,
          orders: parseInt(totalMetrics.total_orders) || 0,
        },
        dailySales,
        topProducts,
      },
    });

  } catch (error) {
    logger.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get sales analytics',
    });
  }
});

// Update business settings
router.put('/business/settings', [
  authenticateToken,
  requireBusinessTier,
  body('businessName').optional().isLength({ min: 1, max: 100 }),
  body('businessDescription').optional().isLength({ max: 500 }),
  body('businessCategory').optional().notEmpty(),
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

    const { businessName, businessDescription, businessCategory } = req.body;
    const updateData = {
      updatedAt: new Date(),
    };

    if (businessName !== undefined) updateData.businessName = businessName;
    if (businessDescription !== undefined) updateData.businessDescription = businessDescription;
    if (businessCategory !== undefined) updateData.businessCategory = businessCategory;

    await db('users')
      .where({ userId: req.user.userId })
      .update(updateData);

    logger.info(`Business settings updated: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Business settings updated successfully',
    });

  } catch (error) {
    logger.error('Update business settings error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update business settings',
    });
  }
});

// Get user achievements
router.get('/achievements', authenticateToken, async (req, res) => {
  try {
    const userId = req.query.userId || req.user.userId;

    // Get user stats
    const [followerCount, postCount, listingCount] = await Promise.all([
      db('followers').where('userId', userId).count('* as count').first(),
      db('posts').where('userId', userId).where('isDeleted', false).count('* as count').first(),
      db('products').where('sellerId', userId).count('* as count').first(),
    ]);

    const stats = {
      followers: parseInt(followerCount.count),
      posts: parseInt(postCount.count),
      listings: parseInt(listingCount.count),
    };

    // Define achievement criteria
    const achievements = [
      {
        id: 'first_post',
        title: 'First Post',
        description: 'Share your first post',
        icon: '📝',
        unlocked: stats.posts >= 1,
      },
      {
        id: 'social_butterfly',
        title: 'Social Butterfly',
        description: 'Get 100 followers',
        icon: '🦋',
        unlocked: stats.followers >= 100,
      },
      {
        id: 'content_creator',
        title: 'Content Creator',
        description: 'Share 50 posts',
        icon: '🎨',
        unlocked: stats.posts >= 50,
      },
      {
        id: 'marketplace_seller',
        title: 'Marketplace Seller',
        description: 'List your first product',
        icon: '🛍️',
        unlocked: stats.listings >= 1,
      },
      {
        id: 'popular_creator',
        title: 'Popular Creator',
        description: 'Get 1,000 followers',
        icon: '⭐',
        unlocked: stats.followers >= 1000,
      },
    ];

    res.json({
      success: true,
      achievements,
      stats,
    });

  } catch (error) {
    logger.error('Get achievements error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get achievements',
    });
  }
});

module.exports = router;