exports.up = function(knex) {
  return knex.schema
    .createTable('calls', function(table) {
      table.uuid('callId').primary().defaultTo(knex.raw('gen_random_uuid()'));
      table.uuid('callerId').notNullable();
      table.uuid('calleeId').notNullable();
      table.enum('callType', ['VOICE', 'VIDEO']).notNullable();
      table.enum('status', ['INITIATED', 'RINGING', 'ANSWERED', 'ENDED', 'MISSED', 'DECLINED']).defaultTo('INITIATED');
      table.timestamp('startedAt').defaultTo(knex.fn.now());
      table.timestamp('answeredAt');
      table.timestamp('endedAt');
      table.json('webrtcData'); // Store WebRTC session data
      table.string('recordingUrl'); // URL to call recording if enabled
      table.text('endReason'); // Reason for call ending
      
      table.foreign('callerId').references('userId').inTable('users').onDelete('CASCADE');
      table.foreign('calleeId').references('userId').inTable('users').onDelete('CASCADE');
      table.index(['callerId', 'startedAt']);
      table.index(['calleeId', 'startedAt']);
      table.index(['startedAt']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('calls');
};