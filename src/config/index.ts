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
  jwt_secret: process.env.JWT_SECRET,
  expires_in: process.env.JWT_EXPIRES_IN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  access_token_expiresin: process.env.ACCESS_TOKEN_EXPIRESIN,
  reset_pass_secret: process.env.RESET_PASS_TOKEN,
  reset_pass_token_expires_in: process.env.RESET_PASS_TOKEN_EXPIRES_IN,
  refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
  reset_pass_link: process.env.RESET_PASS_LINK,
  refresh_token_expiresin: process.env.REFRESH_TOKEN_EXPIRESIN,
  interval_time: Number(process.env.INTERVAL_TIME),
  openrouter_api_key: process.env.OPENROUTER_API_KEY,
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  client_url: process.env.CLIENT_URL,
  email: process.env.EMAIL,
  app_pass: process.env.APP_PASS
};
