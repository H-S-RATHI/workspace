exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.string('profilePhotoUrl').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('profilePhotoUrl');
  });
};
