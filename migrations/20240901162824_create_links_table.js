/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("links", function (table) {
    table.increments("link_id").primary(); // Serial Primary Key
    table
      .string("platform", 50)
      .notNullable()
      .checkIn(["GitHub", "LinkedIn", "Facebook", "YouTube", "GitLab"]); // Platform with specific values
    table.text("link").notNullable(); // Link URL
    table
      .integer("user_id")
      .unsigned()
      .references("user_id")
      .inTable("users")
      .onDelete("CASCADE"); // Foreign Key
    table.timestamp("created_at").defaultTo(knex.fn.now()); // Timestamp with default value
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("links");
};
