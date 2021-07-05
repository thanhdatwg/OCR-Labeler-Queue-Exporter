import * as dotenv from "dotenv";
dotenv.config();

export const env = {
    UPLOADED_DIRECTORY: process.env.UPLOADED_DIRECTORY,
    EXPORT_DIRECTORY: process.env.EXPORT_DIRECTORY,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PORT: +process.env.POSTGRES_PORT,
    POSTGRES_DB: process.env.POSTGRES_DB,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,  
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: +process.env.REDIS_PORT
};