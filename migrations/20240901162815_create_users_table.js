/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("users", function (table) {
    table.increments("user_id").primary(); // Serial Primary Key
    table.string("name", 255).notNullable(); // User's name
    table.string("email", 255).unique().notNullable(); // User's email address
    table.text("profile_picture"); // URL or path to the user's profile picture
    table.text("password").notNullable(); // Hashed password
    table.string("reset_password_expires"); // Expiration time for password reset token
    table.string("reset_password_token"); // Token for password reset
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
