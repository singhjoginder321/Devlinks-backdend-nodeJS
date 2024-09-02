require("dotenv").config();

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.PG_HOST, // Localhost
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT, // Default PostgreSQL port
    },
    migrations: {
      directory: "./migrations", // Directory for migration files
      tableName: "knex_migrations", // Table to track migrations
    },
    seeds: {
      directory: "./seeds", // Directory for seed files
    },
  },

  staging: {
    client: "pg",
    connection: {
      host: process.env.PG_HOST, // Localhost or your staging server if applicable
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT, // Default PostgreSQL port
    },
    migrations: {
      directory: "./migrations", // Directory for migration files
      tableName: "knex_migrations", // Table to track migrations
    },
    seeds: {
      directory: "./seeds", // Directory for seed files
    },
  },

  production: {
    client: "pg",
    connection: {
      host: process.env.PG_HOST, // Localhost or your production server if applicable
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      port: process.env.PG_PORT, // Default PostgreSQL port
    },
    migrations: {
      directory: "./migrations", // Directory for migration files
      tableName: "knex_migrations", // Table to track migrations
    },
    seeds: {
      directory: "./seeds", // Directory for seed files
    },
  },
};
