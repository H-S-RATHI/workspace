const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');

const { db } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

const router = express.Router();

// Get user profile
router.get('/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await db('users')
      .where({ userId, isDeleted: false })
      .select(
        'userId', 'username', 'fullName', 'profilePhotoUrl', 
        'bio', 'location', 'isBusinessAccount', 'createdAt'
      )
      .first();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get follower/following counts
    const [followerCount, followingCount] = await Promise.all([
      db('followers').where({ userId }).count('* as count').first(),
      db('followers').where({ followerUserId: userId }).count('* as count').first(),
    ]);

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user.userId !== userId) {
      const followRelation = await db('followers')
        .where({ userId, followerUserId: req.user.userId })
        .first();
      isFollowing = !!followRelation;
    }

    res.json({
      success: true,
      user: {
        ...user,
        followerCount: parseInt(followerCount.count),
        followingCount: parseInt(followingCount.count),
        isFollowing,
        isOwnProfile: req.user.userId === userId,
      },
    });

  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
    });
  }
});

// Update user profile
router.put('/profile', [
  authenticateToken,
  body('fullName').optional().isLength({ min: 2, max: 100 }),
  body('bio').optional().isLength({ max: 150 }),
  body('location').optional().isLength({ max: 100 }),
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

    const { fullName, bio, location } = req.body;
    const updateData = {
      updatedAt: new Date(),
    };

    if (fullName !== undefined) updateData.fullName = fullName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;

    await db('users')
      .where({ userId: req.user.userId })
      .update(updateData);

    logger.info(`User profile updated: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

// Follow/Unfollow user
router.post('/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot follow yourself',
      });
    }

    // Check if target user exists
    const targetUser = await db('users')
      .where({ userId, isDeleted: false })
      .first();

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if already following
    const existingFollow = await db('followers')
      .where({ userId, followerUserId: req.user.userId })
      .first();

    if (existingFollow) {
      // Unfollow
      await db('followers')
        .where({ userId, followerUserId: req.user.userId })
        .del();

      res.json({
        success: true,
        message: 'Unfollowed successfully',
        isFollowing: false,
      });
    } else {
      // Follow
      await db('followers').insert({
        userId,
        followerUserId: req.user.userId,
        followedAt: new Date(),
      });

      res.json({
        success: true,
        message: 'Followed successfully',
        isFollowing: true,
      });
    }

  } catch (error) {
    logger.error('Follow/unfollow error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to follow/unfollow user',
    });
  }
});

// Get followers list
router.get('/followers/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const followers = await db('followers')
      .join('users', 'followers.followerUserId', 'users.userId')
      .where('followers.userId', userId)
      .where('users.isDeleted', false)
      .select(
        'users.userId', 'users.username', 'users.fullName', 
        'users.profilePhotoUrl', 'followers.followedAt'
      )
      .orderBy('followers.followedAt', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('followers')
      .join('users', 'followers.followerUserId', 'users.userId')
      .where('followers.userId', userId)
      .where('users.isDeleted', false)
      .count('* as count')
      .first();

    res.json({
      success: true,
      followers,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit),
      },
    });

  } catch (error) {
    logger.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get followers',
    });
  }
});

// Get following list
router.get('/following/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const following = await db('followers')
      .join('users', 'followers.userId', 'users.userId')
      .where('followers.followerUserId', userId)
      .where('users.isDeleted', false)
      .select(
        'users.userId', 'users.username', 'users.fullName', 
        'users.profilePhotoUrl', 'followers.followedAt'
      )
      .orderBy('followers.followedAt', 'desc')
      .limit(limit)
      .offset(offset);

    const totalCount = await db('followers')
      .join('users', 'followers.userId', 'users.userId')
      .where('followers.followerUserId', userId)
      .where('users.isDeleted', false)
      .count('* as count')
      .first();

    res.json({
      success: true,
      following,
      pagination: {
        page,
        limit,
        total: parseInt(totalCount.count),
        pages: Math.ceil(totalCount.count / limit),
      },
    });

  } catch (error) {
    logger.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get following',
    });
  }
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters',
      });
    }

    const offset = (page - 1) * limit;
    const searchTerm = `%${q.trim()}%`;

    const users = await db('users')
      .where('isDeleted', false)
      .where(function() {
        this.whereILike('username', searchTerm)
            .orWhereILike('fullName', searchTerm)
            .orWhereILike('phoneNumber', searchTerm);
      })
      .select(
        'userId', 'username', 'fullName', 'profilePhotoUrl', 
        'bio', 'isBusinessAccount', 'phoneNumber'
      )
      .orderBy('username')
      .limit(limit)
      .offset(offset);

    // Check follow status for each user
    const usersWithFollowStatus = await Promise.all(
      users.map(async (user) => {
        if (user.userId === req.user.userId) {
          return { ...user, isFollowing: false, isOwnProfile: true };
        }

        const followRelation = await db('followers')
          .where({ userId: user.userId, followerUserId: req.user.userId })
          .first();

        return {
          ...user,
          isFollowing: !!followRelation,
          isOwnProfile: false,
        };
      })
    );

    res.json({
      success: true,
      users: usersWithFollowStatus,
      query: q,
    });

  } catch (error) {
    logger.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search users',
    });
  }
});

module.exports = router;