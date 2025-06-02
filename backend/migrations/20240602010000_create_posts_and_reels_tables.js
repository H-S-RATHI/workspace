exports.up = function(knex) {
  return knex.schema
    // Posts table
    .createTable('posts', function(table) {
      table.uuid('postId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.enum('postType', ['PHOTO', 'VIDEO', 'TEXT', 'CAROUSEL']).notNullable();
      table.text('caption');
      table.json('mediaUrls'); // Array of media URLs
      table.json('hashtags'); // Array of hashtags
      table.string('location');
      table.boolean('isDeleted').defaultTo(false);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['userId', 'createdAt']);
      table.index(['createdAt']);
    })
    
    // Post likes table
    .createTable('post_likes', function(table) {
      table.uuid('likeId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('postId').notNullable();
      table.uuid('userId').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      
      table.foreign('postId').references('postId').inTable('posts').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['postId', 'userId']);
      table.index(['postId']);
    })
    
    // Post comments table
    .createTable('post_comments', function(table) {
      table.uuid('commentId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('postId').notNullable();
      table.uuid('userId').notNullable();
      table.text('content').notNullable();
      table.uuid('parentCommentId'); // For replies
      table.boolean('isDeleted').defaultTo(false);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('postId').references('postId').inTable('posts').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.foreign('parentCommentId').references('commentId').inTable('post_comments').onDelete('CASCADE');
      table.index(['postId', 'createdAt']);
    })
    
    // Reels table
    .createTable('reels', function(table) {
      table.uuid('reelId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.string('videoUrl').notNullable();
      table.string('thumbnailUrl');
      table.text('caption');
      table.string('audioTrack');
      table.integer('duration').notNullable(); // Duration in seconds
      table.json('hashtags'); // Array of hashtags
      table.boolean('isDeleted').defaultTo(false);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['userId', 'createdAt']);
      table.index(['createdAt']);
    })
    
    // Reel likes table
    .createTable('reel_likes', function(table) {
      table.uuid('likeId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('reelId').notNullable();
      table.uuid('userId').notNullable();
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      
      table.foreign('reelId').references('reelId').inTable('reels').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['reelId', 'userId']);
      table.index(['reelId']);
    })
    
    // Reel comments table
    .createTable('reel_comments', function(table) {
      table.uuid('commentId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('reelId').notNullable();
      table.uuid('userId').notNullable();
      table.text('content').notNullable();
      table.uuid('parentCommentId'); // For replies
      table.boolean('isDeleted').defaultTo(false);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('reelId').references('reelId').inTable('reels').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.foreign('parentCommentId').references('commentId').inTable('reel_comments').onDelete('CASCADE');
      table.index(['reelId', 'createdAt']);
    })
    
    // Reel views table
    .createTable('reel_views', function(table) {
      table.uuid('viewId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('reelId').notNullable();
      table.uuid('userId').notNullable();
      table.timestamp('viewedAt').defaultTo(knex.fn.now());
      
      table.foreign('reelId').references('reelId').inTable('reels').onDelete('CASCADE');
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['reelId', 'userId']);
      table.index(['reelId']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('reel_views')
    .dropTableIfExists('reel_comments')
    .dropTableIfExists('reel_likes')
    .dropTableIfExists('reels')
    .dropTableIfExists('post_comments')
    .dropTableIfExists('post_likes')
    .dropTableIfExists('posts');
};