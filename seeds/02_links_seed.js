/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  return knex("links")
    .del()
    .then(function () {
      return knex("links").insert([
        { platform: "GitHub", link: "https://github.com/johndoe", user_id: 1 },
        {
          platform: "LinkedIn",
          link: "https://linkedin.com/in/johndoe",
          user_id: 1,
        },
      ]);
    });
};
