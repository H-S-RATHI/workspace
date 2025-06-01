exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.boolean('isBusinessAccount').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('isBusinessAccount');
  });
};
