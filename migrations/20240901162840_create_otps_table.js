/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("otps", function (table) {
    table.increments("otp_id").primary(); // Serial Primary Key
    table.string("email", 255).notNullable(); // Email address
    table.text("otp").notNullable(); // OTP Code
    table.timestamp("created_at").defaultTo(knex.fn.now()); // Timestamp with default value
    table.check("created_at >= NOW() - INTERVAL '5 minutes'"); // Check constraint for OTP expiration
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("otps");
};
