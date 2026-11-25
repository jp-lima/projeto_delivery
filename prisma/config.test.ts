import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: "schema.test.prisma",
  migrations: {
    path: "migrations-test",
  },
  datasource: {
    url: env("DATABASE_URL_TEST"),
  },
});
