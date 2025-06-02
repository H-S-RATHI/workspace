exports.up = function(knex) {
  return knex.schema
    .createTable('status_posts', function(table) {
      table.uuid('statusId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.text('content');
      table.string('mediaUrl');
      table.string('mediaType'); // 'IMAGE', 'VIDEO', 'TEXT'
      table.string('backgroundColor').defaultTo('#3b82f6');
      table.string('textColor').defaultTo('#ffffff');
      table.enum('privacy', ['PUBLIC', 'CONTACTS', 'CLOSE_FRIENDS', 'CUSTOM']).defaultTo('CONTACTS');
      table.json('viewersList'); // Array of userIds who can view (for CUSTOM privacy)
      table.json('mentionedUsers'); // Array of mentioned userIds
      table.timestamp('expiresAt').notNullable(); // Status expires after 24 hours
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['userId', 'createdAt']);
      table.index(['expiresAt']);
    })
    .createTable('status_views', function(table) {
      table.uuid('viewId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('statusId').notNullable();
      table.uuid('viewerId').notNullable();
      table.timestamp('viewedAt').defaultTo(knex.fn.now());
      
      table.foreign('statusId').references('statusId').inTable('status_posts').onDelete('CASCADE');
      table.foreign('viewerId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['statusId', 'viewerId']);
      table.index(['statusId', 'viewedAt']);
    })
    .createTable('status_mentions', function(table) {
      table.uuid('mentionId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('statusId').notNullable();
      table.uuid('mentionedUserId').notNullable();
      table.uuid('mentionerUserId').notNullable();
      table.boolean('notificationSent').defaultTo(false);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      
      table.foreign('statusId').references('statusId').inTable('status_posts').onDelete('CASCADE');
      table.foreign('mentionedUserId').references('userId').inTable('users').onDelete('CASCADE');
      table.foreign('mentionerUserId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['statusId', 'mentionedUserId']);
    })
    .createTable('user_contacts', function(table) {
      table.uuid('contactId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('userId').notNullable();
      table.uuid('contactUserId').notNullable();
      table.string('contactName'); // Custom name for the contact
      table.timestamp('addedAt').defaultTo(knex.fn.now());
      
      table.foreign('userId').references('userId').inTable('users').onDelete('CASCADE');
      table.foreign('contactUserId').references('userId').inTable('users').onDelete('CASCADE');
      table.unique(['userId', 'contactUserId']);
      table.index(['userId']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_contacts')
    .dropTableIfExists('status_mentions')
    .dropTableIfExists('status_views')
    .dropTableIfExists('status_posts');
};