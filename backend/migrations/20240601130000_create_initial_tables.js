exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.uuid('userId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.string('username').unique();
      table.string('email').unique();
      table.string('phoneNumber').unique();
      table.string('fullName').notNullable();
      table.string('passwordHash');
      table.boolean('isVerified').defaultTo(false);
      table.boolean('isActive').defaultTo(true);
      table.boolean('isDeleted').defaultTo(false);
      table.boolean('twoFaEnabled').defaultTo(false);
      table.string('twoFaSecret');
      table.integer('usernameChangesLeft').defaultTo(3);
      table.timestamp('createdAt').defaultTo(knex.fn.now());
      table.timestamp('updatedAt').defaultTo(knex.fn.now());
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('users');
};
