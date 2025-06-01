exports.up = function(knex) {
  return knex.schema
    // Conversations
    .createTable('conversations', function(table) {
      table.uuid('convoId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.boolean('isGroup').defaultTo(false);
      table.string('groupName', 100).nullable();
      table.string('groupPhotoUrl', 255).nullable();
      table.timestamp('lastMessageAt').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    
    // Conversation Members
    .createTable('conversation_members', function(table) {
      table.uuid('convoId').references('convoId').inTable('conversations').onDelete('CASCADE');
      table.uuid('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.enum('role', ['ADMIN', 'MEMBER']).defaultTo('MEMBER');
      table.timestamp('joinedAt').defaultTo(knex.fn.now());
      table.primary(['convoId', 'userId']);
    })
    
    // Messages
    .createTable('messages', function(table) {
      table.uuid('messageId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('convoId').references('convoId').inTable('conversations').onDelete('CASCADE');
      table.uuid('senderId').references('userId').inTable('users').onDelete('CASCADE');
      table.enum('msgType', ['TEXT', 'IMAGE', 'VOICE', 'LOCATION', 'PAYMENT']).notNullable();
      table.text('contentText').nullable();
      table.string('contentUrl', 255).nullable();
      table.decimal('longitude', 9, 6).nullable();
      table.decimal('latitude', 9, 6).nullable();
      table.uuid('paymentTxnId').nullable(); // Will add foreign key after creating payment_transactions
      table.timestamp('timestamp').defaultTo(knex.fn.now());
      table.enum('status', ['SENT', 'DELIVERED', 'READ']).defaultTo('SENT');
    })
    
    // Products
    .createTable('products', function(table) {
      table.uuid('productId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('sellerId').references('userId').inTable('users').onDelete('CASCADE');
      table.string('title', 100).notNullable();
      table.text('description').notNullable();
      table.string('category', 50).notNullable();
      table.string('brand', 50).nullable();
      table.enum('condition', ['NEW', 'LIKE_NEW', 'VERY_GOOD', 'GOOD', 'ACCEPTABLE']).notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.string('currency', 3).notNullable();
      table.string('locationCity', 50).nullable();
      table.string('locationCountry', 50).nullable();
      table.integer('quantityAvailable').defaultTo(1);
      table.decimal('trustScore', 3, 2).defaultTo(0.00);
      table.enum('status', ['ACTIVE', 'SOLD_OUT', 'ARCHIVED']).defaultTo('ACTIVE');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    
    // Product Images
    .createTable('product_images', function(table) {
      table.uuid('imageId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('productId').references('productId').inTable('products').onDelete('CASCADE');
      table.string('imageUrl', 255).notNullable();
      table.boolean('isPrimary').defaultTo(false);
    })
    
    // Orders
    .createTable('orders', function(table) {
      table.uuid('orderId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('buyerId').references('userId').inTable('users').onDelete('CASCADE');
      table.decimal('totalAmount', 10, 2).notNullable();
      table.string('currency', 3).notNullable();
      table.text('shippingAddress').notNullable();
      table.string('shippingMethod', 50).notNullable();
      table.enum('status', ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURNED', 'REFUNDED']).defaultTo('PENDING');
      table.timestamp('placedAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    
    // Order Items
    .createTable('order_items', function(table) {
      table.uuid('orderItemId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('orderId').references('orderId').inTable('orders').onDelete('CASCADE');
      table.uuid('productId').references('productId').inTable('products');
      table.integer('quantity').notNullable();
      table.decimal('unitPrice', 10, 2).notNullable();
      table.decimal('totalPrice', 10, 2).notNullable();
    })
    
    // Deals
    .createTable('deals', function(table) {
      table.uuid('dealId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('sellerId').references('userId').inTable('users').onDelete('CASCADE');
      table.enum('dealType', ['REFERRAL', 'GROUP_BUY', 'FLASH_SALE', 'SPONSORED']).notNullable();
      table.uuid('productId').references('productId').inTable('products').nullable();
      table.string('couponCode', 20).nullable();
      table.integer('discountPercent').nullable();
      table.timestamp('startAt').notNullable();
      table.timestamp('endAt').notNullable();
      table.integer('minParticipants').nullable();
      table.integer('currentParticipants').defaultTo(0);
      table.enum('status', ['SCHEDULED', 'ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED']).defaultTo('SCHEDULED');
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    
    // Referrals
    .createTable('referrals', function(table) {
      table.uuid('referralId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('dealId').references('dealId').inTable('deals').onDelete('CASCADE');
      table.uuid('referrerId').references('userId').inTable('users').onDelete('CASCADE');
      table.string('referralCode', 20).unique().notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
    })
    
    // Sponsored Coupons
    .createTable('sponsored_coupons', function(table) {
      table.uuid('couponId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('businessId').references('userId').inTable('users').onDelete('CASCADE');
      table.string('businessName', 100).notNullable();
      table.string('dealText', 255).notNullable();
      table.integer('radiusKm').defaultTo(10);
      table.timestamp('startAt').notNullable();
      table.timestamp('endAt').notNullable();
      table.integer('maxUsesPerUser').defaultTo(1);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    })
    
    // Followers
    .createTable('followers', function(table) {
      table.uuid('followerId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.uuid('followerUserId').references('userId').inTable('users').onDelete('CASCADE');
      table.timestamp('followedAt').defaultTo(knex.fn.now());
      
      // Ensure a user can't follow the same user multiple times
      table.unique(['userId', 'followerUserId']);
    })
    
    // User Analytics
    .createTable('user_analytics', function(table) {
      table.uuid('analyticsId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.date('date').notNullable();
      table.integer('followerCount').notNullable().defaultTo(0);
      table.integer('followingCount').notNullable().defaultTo(0);
      table.integer('postCount').notNullable().defaultTo(0);
      table.integer('totalListingCount').notNullable().defaultTo(0);
      table.decimal('revenue', 12, 2).nullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      
      // Only one analytics record per user per day
      table.unique(['userId', 'date']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_analytics')
    .dropTableIfExists('followers')
    .dropTableIfExists('sponsored_coupons')
    .dropTableIfExists('referrals')
    .dropTableIfExists('deals')
    .dropTableIfExists('order_items')
    .dropTableIfExists('orders')
    .dropTableIfExists('product_images')
    .dropTableIfExists('products')
    .dropTableIfExists('messages')
    .dropTableIfExists('conversation_members')
    .dropTableIfExists('conversations');
};
