import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  node_env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  sald: Number(process.env.SALD_NUMBER),
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  access_token_expiresin: process.env.ACCESS_TOKEN_EXPIRESIN,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
  refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRESIN,
};
