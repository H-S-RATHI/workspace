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

// Shopping Cart Management

// Get user's cart
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    // Get or create cart
    let cart = await db('shopping_cart')
      .where('userId', req.user.userId)
      .first();

    if (!cart) {
      const cartId = uuidv4();
      await db('shopping_cart').insert({
        cartId,
        userId: req.user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cart = { cartId, userId: req.user.userId };
    }

    // Get cart items with product details
    const cartItems = await db('cart_items')
      .join('products', 'cart_items.productId', 'products.productId')
      .join('users', 'products.sellerId', 'users.userId')
      .where('cart_items.cartId', cart.cartId)
      .where('products.status', 'ACTIVE')
      .select(
        'cart_items.cartItemId',
        'cart_items.quantity',
        'cart_items.addedAt',
        'products.productId',
        'products.title',
        'products.price',
        'products.currency',
        'products.quantityAvailable',
        'users.username as sellerUsername',
        'users.fullName as sellerName'
      );

    // Get primary images for each product
    const itemsWithImages = await Promise.all(
      cartItems.map(async (item) => {
        const primaryImage = await db('product_images')
          .where({ productId: item.productId, isPrimary: true })
          .select('imageUrl')
          .first();

        return {
          ...item,
          primaryImage: primaryImage?.imageUrl || null,
          totalPrice: parseFloat(item.price) * item.quantity,
        };
      })
    );

    const totalAmount = itemsWithImages.reduce((sum, item) => sum + item.totalPrice, 0);

    res.json({
      success: true,
      cart: {
        cartId: cart.cartId,
        items: itemsWithImages,
        totalItems: itemsWithImages.length,
        totalAmount,
        currency: itemsWithImages[0]?.currency || 'USD',
      },
    });

  } catch (error) {
    logger.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get cart',
    });
  }
});

// Add item to cart
router.post('/cart/items', [
  authenticateToken,
  body('productId').isUUID().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
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

    const { productId, quantity } = req.body;

    // Check if product exists and is available
    const product = await db('products')
      .where({ productId, status: 'ACTIVE' })
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found or not available',
      });
    }

    // Check if user is trying to add their own product
    if (product.sellerId === req.user.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot add your own product to cart',
      });
    }

    // Check quantity availability
    if (quantity > product.quantityAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Requested quantity not available',
      });
    }

    // Get or create cart
    let cart = await db('shopping_cart')
      .where('userId', req.user.userId)
      .first();

    if (!cart) {
      const cartId = uuidv4();
      await db('shopping_cart').insert({
        cartId,
        userId: req.user.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      cart = { cartId };
    }

    // Check if item already in cart
    const existingItem = await db('cart_items')
      .where({ cartId: cart.cartId, productId })
      .first();

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.quantityAvailable) {
        return res.status(400).json({
          success: false,
          error: 'Total quantity would exceed availability',
        });
      }

      await db('cart_items')
        .where('cartItemId', existingItem.cartItemId)
        .update({ quantity: newQuantity });

      res.json({
        success: true,
        message: 'Cart item quantity updated',
        cartItemId: existingItem.cartItemId,
        quantity: newQuantity,
      });
    } else {
      // Add new item
      const cartItemId = uuidv4();
      await db('cart_items').insert({
        cartItemId,
        cartId: cart.cartId,
        productId,
        quantity,
        addedAt: new Date(),
      });

      res.json({
        success: true,
        message: 'Item added to cart',
        cartItemId,
        quantity,
      });
    }

    // Update cart timestamp
    await db('shopping_cart')
      .where('cartId', cart.cartId)
      .update({ updatedAt: new Date() });

  } catch (error) {
    logger.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart',
    });
  }
});

// Update cart item quantity
router.put('/cart/items/:cartItemId', [
  authenticateToken,
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
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

    const { cartItemId } = req.params;
    const { quantity } = req.body;

    // Get cart item with product info
    const cartItem = await db('cart_items')
      .join('shopping_cart', 'cart_items.cartId', 'shopping_cart.cartId')
      .join('products', 'cart_items.productId', 'products.productId')
      .where('cart_items.cartItemId', cartItemId)
      .where('shopping_cart.userId', req.user.userId)
      .select('cart_items.*', 'products.quantityAvailable')
      .first();

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    // Check quantity availability
    if (quantity > cartItem.quantityAvailable) {
      return res.status(400).json({
        success: false,
        error: 'Requested quantity not available',
      });
    }

    // Update quantity
    await db('cart_items')
      .where('cartItemId', cartItemId)
      .update({ quantity });

    // Update cart timestamp
    await db('shopping_cart')
      .where('cartId', cartItem.cartId)
      .update({ updatedAt: new Date() });

    res.json({
      success: true,
      message: 'Cart item updated',
      quantity,
    });

  } catch (error) {
    logger.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item',
    });
  }
});

// Remove item from cart
router.delete('/cart/items/:cartItemId', authenticateToken, async (req, res) => {
  try {
    const { cartItemId } = req.params;

    // Verify ownership
    const cartItem = await db('cart_items')
      .join('shopping_cart', 'cart_items.cartId', 'shopping_cart.cartId')
      .where('cart_items.cartItemId', cartItemId)
      .where('shopping_cart.userId', req.user.userId)
      .select('cart_items.cartId')
      .first();

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found',
      });
    }

    // Remove item
    await db('cart_items')
      .where('cartItemId', cartItemId)
      .del();

    // Update cart timestamp
    await db('shopping_cart')
      .where('cartId', cartItem.cartId)
      .update({ updatedAt: new Date() });

    res.json({
      success: true,
      message: 'Item removed from cart',
    });

  } catch (error) {
    logger.error('Remove cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove cart item',
    });
  }
});

// Clear cart
router.delete('/cart', authenticateToken, async (req, res) => {
  try {
    const cart = await db('shopping_cart')
      .where('userId', req.user.userId)
      .first();

    if (cart) {
      await db('cart_items')
        .where('cartId', cart.cartId)
        .del();

      await db('shopping_cart')
        .where('cartId', cart.cartId)
        .update({ updatedAt: new Date() });
    }

    res.json({
      success: true,
      message: 'Cart cleared',
    });

  } catch (error) {
    logger.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart',
    });
  }
});

// Order Management

// Create order from cart
router.post('/orders', [
  authenticateToken,
  body('shippingAddress').notEmpty().withMessage('Shipping address required'),
  body('shippingMethod').notEmpty().withMessage('Shipping method required'),
  body('paymentMethodId').optional().isUUID(),
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

    const { shippingAddress, shippingMethod, paymentMethodId } = req.body;

    // Get user's cart
    const cart = await db('shopping_cart')
      .where('userId', req.user.userId)
      .first();

    if (!cart) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    // Get cart items
    const cartItems = await db('cart_items')
      .join('products', 'cart_items.productId', 'products.productId')
      .where('cart_items.cartId', cart.cartId)
      .where('products.status', 'ACTIVE')
      .select(
        'cart_items.*',
        'products.price',
        'products.currency',
        'products.quantityAvailable'
      );

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty',
      });
    }

    // Check availability for all items
    for (const item of cartItems) {
      if (item.quantity > item.quantityAvailable) {
        return res.status(400).json({
          success: false,
          error: `Insufficient quantity for product ${item.productId}`,
        });
      }
    }

    // Calculate total
    const totalAmount = cartItems.reduce((sum, item) => 
      sum + (parseFloat(item.price) * item.quantity), 0
    );

    // Create order
    const orderId = uuidv4();
    const orderData = {
      orderId,
      buyerId: req.user.userId,
      totalAmount,
      currency: cartItems[0].currency,
      shippingAddress,
      shippingMethod,
      status: 'PENDING',
      placedAt: new Date(),
      updatedAt: new Date(),
    };

    await db('orders').insert(orderData);

    // Create order items
    const orderItems = cartItems.map(item => ({
      orderItemId: uuidv4(),
      orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: parseFloat(item.price),
      totalPrice: parseFloat(item.price) * item.quantity,
    }));

    await db('order_items').insert(orderItems);

    // Update product quantities
    for (const item of cartItems) {
      await db('products')
        .where('productId', item.productId)
        .decrement('quantityAvailable', item.quantity);
    }

    // Clear cart
    await db('cart_items')
      .where('cartId', cart.cartId)
      .del();

    logger.info(`Order created: ${orderId}`, {
      buyer: req.user.username,
      totalAmount,
      itemCount: orderItems.length,
    });

    res.json({
      success: true,
      order: {
        ...orderData,
        items: orderItems,
      },
      message: 'Order created successfully',
    });

  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order',
    });
  }
});

// Get user's orders
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { status } = req.query;

    let query = db('orders')
      .where('buyerId', req.user.userId);

    if (status) {
      query = query.where('status', status);
    }

    const orders = await query
      .select('*')
      .orderBy('placedAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await db('order_items')
          .join('products', 'order_items.productId', 'products.productId')
          .where('order_items.orderId', order.orderId)
          .select(
            'order_items.*',
            'products.title',
            'products.sellerId'
          );

        return {
          ...order,
          items,
        };
      })
    );

    res.json({
      success: true,
      orders: ordersWithItems,
      pagination: {
        page,
        limit,
        hasMore: orders.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get orders',
    });
  }
});

// Get single order details
router.get('/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await db('orders')
      .where({ orderId, buyerId: req.user.userId })
      .first();

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }

    // Get order items with product details
    const items = await db('order_items')
      .join('products', 'order_items.productId', 'products.productId')
      .join('users', 'products.sellerId', 'users.userId')
      .where('order_items.orderId', orderId)
      .select(
        'order_items.*',
        'products.title',
        'products.description',
        'users.username as sellerUsername',
        'users.fullName as sellerName'
      );

    // Get primary images for each product
    const itemsWithImages = await Promise.all(
      items.map(async (item) => {
        const primaryImage = await db('product_images')
          .where({ productId: item.productId, isPrimary: true })
          .select('imageUrl')
          .first();

        return {
          ...item,
          primaryImage: primaryImage?.imageUrl || null,
        };
      })
    );

    res.json({
      success: true,
      order: {
        ...order,
        items: itemsWithImages,
      },
    });

  } catch (error) {
    logger.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get order details',
    });
  }
});

// Wishlist Management

// Add to wishlist
router.post('/wishlist', [
  authenticateToken,
  body('productId').isUUID().withMessage('Valid product ID required'),
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

    const { productId } = req.body;

    // Check if product exists
    const product = await db('products')
      .where({ productId, status: 'ACTIVE' })
      .first();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found',
      });
    }

    // Check if already in wishlist
    const existing = await db('wishlist')
      .where({ userId: req.user.userId, productId })
      .first();

    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist',
      });
    }

    // Add to wishlist
    await db('wishlist').insert({
      wishlistId: uuidv4(),
      userId: req.user.userId,
      productId,
      addedAt: new Date(),
    });

    res.json({
      success: true,
      message: 'Product added to wishlist',
    });

  } catch (error) {
    logger.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add to wishlist',
    });
  }
});

// Get user's wishlist
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const wishlistItems = await db('wishlist')
      .join('products', 'wishlist.productId', 'products.productId')
      .join('users', 'products.sellerId', 'users.userId')
      .where('wishlist.userId', req.user.userId)
      .where('products.status', 'ACTIVE')
      .select(
        'wishlist.wishlistId',
        'wishlist.addedAt',
        'products.productId',
        'products.title',
        'products.price',
        'products.currency',
        'users.username as sellerUsername'
      )
      .orderBy('wishlist.addedAt', 'desc')
      .limit(limit)
      .offset(offset);

    // Get primary images
    const itemsWithImages = await Promise.all(
      wishlistItems.map(async (item) => {
        const primaryImage = await db('product_images')
          .where({ productId: item.productId, isPrimary: true })
          .select('imageUrl')
          .first();

        return {
          ...item,
          primaryImage: primaryImage?.imageUrl || null,
        };
      })
    );

    res.json({
      success: true,
      wishlist: itemsWithImages,
      pagination: {
        page,
        limit,
        hasMore: wishlistItems.length === limit,
      },
    });

  } catch (error) {
    logger.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wishlist',
    });
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;

    const deleted = await db('wishlist')
      .where({ userId: req.user.userId, productId })
      .del();

    if (deleted === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in wishlist',
      });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist',
    });

  } catch (error) {
    logger.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove from wishlist',
    });
  }
});

module.exports = router;