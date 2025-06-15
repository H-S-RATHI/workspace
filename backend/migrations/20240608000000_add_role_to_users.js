exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    // Add the role column, allowing nulls initially to handle existing rows
    table.string('role', 50).nullable();
  })
  .then(() => {
    // Set a default role for all existing users
    return knex('users').update({ role: 'user' });
  })
  .then(() => {
    // Now that existing rows have a default, alter the column to be not nullable
    // and set a default for new rows moving forward.
    return knex.schema.alterTable('users', function(table) {
      table.string('role', 50).notNullable().defaultTo('user').alter();
    });
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('role');
  });
};
