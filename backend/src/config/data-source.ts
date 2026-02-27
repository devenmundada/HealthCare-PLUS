import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const AppDataSource = new DataSource({
  type: 'postgres',

  // ✅ Railway / Production
  ...(process.env.DATABASE_URL
    ? {
        url: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        // ✅ Local development fallback
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'healthcare_db',
      }),

  synchronize: false,
  logging: !isProduction,

  // IMPORTANT: dist paths for Railway
  entities: isProduction
    ? ['dist/**/*.js']
    : ['src/**/*.ts'],

  migrations: isProduction
    ? ['dist/migrations/*.js']
    : ['src/migrations/*.ts'],
});
