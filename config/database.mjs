// config/database.mjs
import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import dotenv from "dotenv";

dotenv.config();

// Parse DATABASE_URL into connection options
const getConfig = () => {
  if (process.env.DATABASE_URL) {
    // Parse the DATABASE_URL for Render
    const url = new URL(process.env.DATABASE_URL);
    return {
      database: url.pathname.substring(1), // Remove leading slash
      user: url.user,
      password: url.password,
      host: url.hostname,
      port: parseInt(url.port),
      dialect: PostgresDialect,
        ssl: true,  
        rejectUnauthorized: false, 
    };
  } else {
    // For local development - keep your exact words
    return {
      database: process.env.DB_NAME || "restaurant_management_system_db",
      user: process.env.DB_USER || "sam",
      password: process.env.DB_PASS || "123456",
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
      dialect: PostgresDialect,
        ssl: false
    };
  }
};

export const sequelize = new Sequelize({
  ...getConfig(),
  logging: false,
  clientMinMessages: "notice"
});