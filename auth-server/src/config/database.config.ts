// src/config/database.config.ts

import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  databaseUrl: process.env.DATABASE_URL,
}));
