exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.text('bio').nullable();
    table.string('location', 255).nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('bio');
    table.dropColumn('location');
  });
};
