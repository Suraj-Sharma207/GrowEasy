import { CorsOptions } from 'cors';
import { env } from './env.config';

export const corsOptions: CorsOptions = {
  origin: env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};
