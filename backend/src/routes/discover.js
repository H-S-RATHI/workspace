const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../config/database');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get feed posts
router.get('/feed', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { type = 'for_you' } = req.query; // 'following' or 'for_you'

    let query = db('posts')
      .join('users', 'posts.userId', 'users.userId')
      .where('users.isDeleted', false)
      .where('posts.isDeleted', false);

    // Filter by following if user is authenticated and requests following feed
    if (req.user && type === 'following') {
      const followingIds = await db('followers')
        .where('followerUserId', req.user.userId)
        .pluck('userId');
      
      if (followingIds.length > 0) {
        query = query.whereIn('posts.userId', followingIds);
      } else {
        // If not following anyone, return empty array
        return res.json({
          success: true,
          posts: [],
          pagination: { page, limit, hasMore: false },
        });
      }
    }

    const posts = await query
      .select(
        'posts.postId',
        'posts.userId',
        'posts.postType',
        'posts.caption',
        'posts.mediaUrls',
        'posts.hashtags',
        'posts.location',
        'posts.createdAt',
        'users.username',
        'users.fullName',
        'users.profilePhotoUrl',
        'users.isBusinessAccount'
      )
      .orderBy('posts.createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get engagement data for each post
    const postsWithEngagement = await Promise.all(
      posts.map(async (post) => {
        const [likesCount, commentsCount] = await Promise.all([
          db('post_likes').where({ postId: post.postId }).count('* as count').first(),
          db('post_comments').where({ postId: post.postId }).count('* as count').first(),
        ]);

        // Check if current user liked the post
        let isLiked = false;
        if (req.user) {
          const userLike = await db('post_likes')
            .where({ postId: post.postId, userId: req.user.userId })
            .first();
          isLiked = !!userLike;
        }

        return {
          ...post,
          mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
          hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
          likesCount: parseInt(likesCount.count),
          commentsCount: parseInt(commentsCount.count),
          isLiked,
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
      feedType: type,
    });

  } catch (error) {
    logger.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get feed',
    });
  }
});

// Create new post
router.post('/posts', [
  authenticateToken,
  body('postType').isIn(['PHOTO', 'VIDEO', 'TEXT', 'CAROUSEL']),
  body('caption').optional().isLength({ max: 2000 }),
  body('mediaUrls').optional().isArray({ max: 10 }),
  body('hashtags').optional().isArray({ max: 30 }),
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
      postType,
      caption,
      mediaUrls = [],
      hashtags = [],
      location,
    } = req.body;

    const postId = uuidv4();
    const postData = {
      postId,
      userId: req.user.userId,
      postType,
      caption: caption || null,
      mediaUrls: JSON.stringify(mediaUrls),
      hashtags: JSON.stringify(hashtags),
      location: location || null,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db('posts').insert(postData);

    logger.info(`Post created: ${postId}`, { 
      user: req.user.username,
      postType 
    });

    res.json({
      success: true,
      post: {
        ...postData,
        mediaUrls,
        hashtags,
        username: req.user.username,
        likesCount: 0,
        commentsCount: 0,
        isLiked: false,
      },
      message: 'Post created successfully',
    });

  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post',
    });
  }
});

// Like/Unlike post
router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
    const post = await db('posts')
      .where({ postId, isDeleted: false })
      .first();

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found',
      });
    }

    // Check if already liked
    const existingLike = await db('post_likes')
      .where({ postId, userId: req.user.userId })
      .first();

    if (existingLike) {
      // Unlike
      await db('post_likes')
        .where({ postId, userId: req.user.userId })
        .del();

      res.json({
        success: true,
        message: 'Post unliked',
        isLiked: false,
      });
    } else {
      // Like
      await db('post_likes').insert({
        postId,
        userId: req.user.userId,
        createdAt: new Date(),
      });

      res.json({
        success: true,
        message: 'Post liked',
        isLiked: true,
      });
    }

  } catch (error) {
    logger.error('Like/unlike post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like/unlike post',
    });
  }
});

// Get reels
router.get('/reels', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const reels = await db('reels')
      .join('users', 'reels.userId', 'users.userId')
      .where('users.isDeleted', false)
      .where('reels.isDeleted', false)
      .select(
        'reels.reelId',
        'reels.userId',
        'reels.videoUrl',
        'reels.thumbnailUrl',
        'reels.caption',
        'reels.audioTrack',
        'reels.duration',
        'reels.hashtags',
        'reels.createdAt',
        'users.username',
        'users.fullName',
        'users.profilePhotoUrl'
      )
      .orderBy('reels.createdAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get engagement data for each reel
    const reelsWithEngagement = await Promise.all(
      reels.map(async (reel) => {
        const [likesCount, commentsCount, viewsCount] = await Promise.all([
          db('reel_likes').where({ reelId: reel.reelId }).count('* as count').first(),
          db('reel_comments').where({ reelId: reel.reelId }).count('* as count').first(),
          db('reel_views').where({ reelId: reel.reelId }).count('* as count').first(),
        ]);

        // Check if current user liked the reel
        let isLiked = false;
        if (req.user) {
          const userLike = await db('reel_likes')
            .where({ reelId: reel.reelId, userId: req.user.userId })
            .first();
          isLiked = !!userLike;
        }

        return {
          ...reel,
          hashtags: reel.hashtags ? JSON.parse(reel.hashtags) : [],
          likesCount: parseInt(likesCount.count),
          commentsCount: parseInt(commentsCount.count),
          viewsCount: parseInt(viewsCount.count),
          isLiked,
        };
      })
    );

    res.json({
      success: true,
      reels: reelsWithEngagement,
      pagination: {
        page,
        limit,
        hasMore: reels.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get reels error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get reels',
    });
  }
});

// Create new reel
router.post('/reels', [
  authenticateToken,
  body('videoUrl').isURL().withMessage('Valid video URL required'),
  body('thumbnailUrl').optional().isURL(),
  body('caption').optional().isLength({ max: 2000 }),
  body('duration').isInt({ min: 1, max: 60 }).withMessage('Duration must be 1-60 seconds'),
  body('hashtags').optional().isArray({ max: 30 }),
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
      videoUrl,
      thumbnailUrl,
      caption,
      audioTrack,
      duration,
      hashtags = [],
    } = req.body;

    const reelId = uuidv4();
    const reelData = {
      reelId,
      userId: req.user.userId,
      videoUrl,
      thumbnailUrl: thumbnailUrl || null,
      caption: caption || null,
      audioTrack: audioTrack || null,
      duration: parseInt(duration),
      hashtags: JSON.stringify(hashtags),
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db('reels').insert(reelData);

    logger.info(`Reel created: ${reelId}`, { 
      user: req.user.username,
      duration 
    });

    res.json({
      success: true,
      reel: {
        ...reelData,
        hashtags,
        username: req.user.username,
        likesCount: 0,
        commentsCount: 0,
        viewsCount: 0,
        isLiked: false,
      },
      message: 'Reel created successfully',
    });

  } catch (error) {
    logger.error('Create reel error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create reel',
    });
  }
});

// Search content
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q.trim()}%`;
    const results = {};

    // Search users
    if (type === 'all' || type === 'users') {
      const users = await db('users')
        .where('isDeleted', false)
        .where(function() {
          this.whereILike('username', searchTerm)
              .orWhereILike('fullName', searchTerm);
        })
        .select('userId', 'username', 'fullName', 'profilePhotoUrl', 'isBusinessAccount')
        .limit(type === 'users' ? limit : 10);

      results.users = users;
    }

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await db('posts')
        .join('users', 'posts.userId', 'users.userId')
        .where('posts.isDeleted', false)
        .where('users.isDeleted', false)
        .where(function() {
          this.whereILike('posts.caption', searchTerm)
              .orWhereRaw("posts.hashtags::text ILIKE ?", [`%${q.trim()}%`]);
        })
        .select(
          'posts.postId', 'posts.postType', 'posts.caption', 'posts.mediaUrls',
          'users.username', 'users.profilePhotoUrl'
        )
        .limit(type === 'posts' ? limit : 10);

      results.posts = posts.map(post => ({
        ...post,
        mediaUrls: post.mediaUrls ? JSON.parse(post.mediaUrls) : [],
      }));
    }

    // Search hashtags
    if (type === 'all' || type === 'hashtags') {
      const hashtags = await db('posts')
        .whereRaw("hashtags::text ILIKE ?", [`%${q.trim()}%`])
        .where('isDeleted', false)
        .select(db.raw('DISTINCT jsonb_array_elements_text(hashtags) as hashtag'))
        .whereRaw("jsonb_array_elements_text(hashtags) ILIKE ?", [`%${q.trim()}%`])
        .limit(type === 'hashtags' ? limit : 10);

      results.hashtags = hashtags.map(h => h.hashtag);
    }

    res.json({
      success: true,
      query: q,
      results,
      searchType: type,
    });

  } catch (error) {
    logger.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search content',
    });
  }
});

// Get trending hashtags
router.get('/trending/hashtags', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    
    // Get hashtags from recent posts (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const trendingHashtags = await db('posts')
      .where('createdAt', '>=', weekAgo)
      .where('isDeleted', false)
      .whereNotNull('hashtags')
      .select(db.raw('jsonb_array_elements_text(hashtags) as hashtag'))
      .groupBy('hashtag')
      .count('* as usage_count')
      .orderBy('usage_count', 'desc')
      .limit(limit);

    res.json({
      success: true,
      hashtags: trendingHashtags,
    });

  } catch (error) {
    logger.error('Get trending hashtags error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trending hashtags',
    });
  }
});

module.exports = router;