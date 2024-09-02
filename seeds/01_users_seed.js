/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  return knex("users")
    .del()
    .then(function () {
      return knex("users").insert([
        {
          name: "John Doe",
          email: "john.doe@example.com",
          password: "hashed_password",
        },
        {
          name: "Jane Smith",
          email: "jane.smith@example.com",
          password: "hashed_password",
        },
      ]);
    });
};
