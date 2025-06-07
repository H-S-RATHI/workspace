exports.up = function(knex) {
  return knex.schema
    // Post shares table
    .createTable('post_shares', function(table) {
      table.uuid('shareId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('postId').notNullable();
      table.uuid('userId').notNullable();
      table.enum('shareType', ['DIRECT', 'STORY', 'EXTERNAL']).notNullable();
      table.string('platform').nullable(); // For external shares (facebook, twitter, etc.)
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      
      table.foreign('postId').references('postId').inTable('posts').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['postId']);
      table.index(['userId']);
    })
    
    // Saved posts table
    .createTable('saved_posts', function(table) {
      table.uuid('saveId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('postId').notNullable();
      table.uuid('userId').notNullable();
      table.timestamp('savedAt').defaultTo(knex.fn.now());
      
      table.foreign('postId').references('postId').inTable('posts').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['postId', 'userId']);
      table.index(['userId', 'savedAt']);
    })
    
    // Reel shares table
    .createTable('reel_shares', function(table) {
      table.uuid('shareId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('reelId').notNullable();
      table.uuid('userId').notNullable();
      table.enum('shareType', ['DIRECT', 'STORY', 'EXTERNAL']).notNullable();
      table.string('platform').nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      
      table.foreign('reelId').references('reelId').inTable('reels').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['reelId']);
      table.index(['userId']);
    })
    
    // Saved reels table
    .createTable('saved_reels', function(table) {
      table.uuid('saveId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('reelId').notNullable();
      table.uuid('userId').notNullable();
      table.timestamp('savedAt').defaultTo(knex.fn.now());
      
      table.foreign('reelId').references('reelId').inTable('reels').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['reelId', 'userId']);
      table.index(['userId', 'savedAt']);
    })
    
    // Shopping cart table
    .createTable('shopping_cart', function(table) {
      table.uuid('cartId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['userId']); // One cart per user
    })
    
    // Cart items table
    .createTable('cart_items', function(table) {
      table.uuid('cartItemId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('cartId').notNullable();
      table.uuid('productId').notNullable();
      table.integer('quantity').notNullable().defaultTo(1);
      table.timestamp('addedAt').defaultTo(knex.fn.now());
      
      table.foreign('cartId').references('cartId').inTable('shopping_cart').onDelete('CASCADE');
      table.foreign('productId').references('productId').inTable('products').onDelete('CASCADE');
      table.unique(['cartId', 'productId']); // One entry per product per cart
      table.index(['cartId']);
    })
    
    // Wishlist table
    .createTable('wishlist', function(table) {
      table.uuid('wishlistId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.uuid('productId').notNullable();
      table.timestamp('addedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.foreign('productId').references('productId').inTable('products').onDelete('CASCADE');
      table.unique(['userId', 'productId']);
      table.index(['userId']);
    })
    
    // Product reviews table
    .createTable('product_reviews', function(table) {
      table.uuid('reviewId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('productId').notNullable();
      table.uuid('userId').notNullable();
      table.uuid('orderId').nullable(); // Link to order if purchased
      table.integer('rating').notNullable(); // 1-5 stars
      table.text('comment').nullable();
      table.json('images').nullable(); // Array of review image URLs
      table.boolean('isVerifiedPurchase').defaultTo(false);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('productId').references('productId').inTable('products').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.foreign('orderId').references('orderId').inTable('orders').onDelete('SET NULL');
      table.unique(['productId', 'userId']); // One review per user per product
      table.index(['productId', 'rating']);
    })
    
    // User interactions table (for recommendation algorithm)
    .createTable('user_interactions', function(table) {
      table.uuid('interactionId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.enum('itemType', ['POST', 'REEL', 'PRODUCT', 'USER']).notNullable();
      table.uuid('itemId').notNullable(); // postId, reelId, productId, or userId
      table.enum('interactionType', ['VIEW', 'LIKE', 'COMMENT', 'SHARE', 'SAVE', 'PURCHASE', 'FOLLOW']).notNullable();
      table.integer('duration').nullable(); // For view interactions (seconds)
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['userId', 'itemType', 'interactionType']);
      table.index(['itemId', 'itemType']);
      table.index(['createdAt']);
    })
    
    // Content categories table
    .createTable('content_categories', function(table) {
      table.uuid('categoryId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('name', 50).notNullable().unique();
      table.string('displayName', 100).notNullable();
      table.text('description').nullable();
      table.string('iconUrl').nullable();
      table.string('color', 7).nullable(); // Hex color code
      table.boolean('isActive').defaultTo(true);
      table.integer('sortOrder').defaultTo(0);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    })
    
    // Post categories junction table
    .createTable('post_categories', function(table) {
      table.uuid('postId').notNullable();
      table.uuid('categoryId').notNullable();
      
      table.foreign('postId').references('postId').inTable('posts').onDelete('CASCADE');
      table.foreign('categoryId').references('categoryId').inTable('content_categories').onDelete('CASCADE');
      table.primary(['postId', 'categoryId']);
    })
    
    // Payment methods table
    .createTable('payment_methods', function(table) {
      table.uuid('paymentMethodId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.enum('type', ['CARD', 'PAYPAL', 'BANK_TRANSFER', 'DIGITAL_WALLET']).notNullable();
      table.string('provider').notNullable(); // stripe, paypal, etc.
      table.string('externalId').notNullable(); // Provider's payment method ID
      table.json('metadata').nullable(); // Last 4 digits, expiry, etc.
      table.boolean('isDefault').defaultTo(false);
      table.boolean('isActive').defaultTo(true);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['userId', 'isActive']);
    })
    
    // Shipping addresses table
    .createTable('shipping_addresses', function(table) {
      table.uuid('addressId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.string('fullName', 100).notNullable();
      table.string('addressLine1', 255).notNullable();
      table.string('addressLine2', 255).nullable();
      table.string('city', 100).notNullable();
      table.string('state', 100).notNullable();
      table.string('postalCode', 20).notNullable();
      table.string('country', 100).notNullable();
      table.string('phoneNumber', 20).nullable();
      table.boolean('isDefault').defaultTo(false);
      table.boolean('isActive').defaultTo(true);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['userId', 'isActive']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('shipping_addresses')
    .dropTableIfExists('payment_methods')
    .dropTableIfExists('post_categories')
    .dropTableIfExists('content_categories')
    .dropTableIfExists('user_interactions')
    .dropTableIfExists('product_reviews')
    .dropTableIfExists('wishlist')
    .dropTableIfExists('cart_items')
    .dropTableIfExists('shopping_cart')
    .dropTableIfExists('saved_reels')
    .dropTableIfExists('reel_shares')
    .dropTableIfExists('saved_posts')
    .dropTableIfExists('post_shares');
};