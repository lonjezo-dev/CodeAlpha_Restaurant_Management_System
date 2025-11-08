// config/database.mjs
import { Sequelize, importModels } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));


export const sequelize = new Sequelize({
  dialect: PostgresDialect,
  database: process.env.DB_NAME || "restaurant_management_system_db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "",
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
 

// 👇 Auto SSL switcher
  ssl: false,

  logging: false, // show SQL logs only in dev

  clientMinMessages: "notice",
  models: await importModels(path.join(__dirname, "../model/**/*.model.{ts,mjs}")),
});
