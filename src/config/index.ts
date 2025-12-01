import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
    node_env: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    sald: Number(process.env.SALD_NUMBER),
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY ,
    api_secret: process.env.API_SECRET ,
}