/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  return knex("otps")
    .del()
    .then(function () {
      return knex("otps").insert([
        { email: "john.doe@example.com", otp: "123456" },
        { email: "jane.smith@example.com", otp: "654321" },
      ]);
    });
};
