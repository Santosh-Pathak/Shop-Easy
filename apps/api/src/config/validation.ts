import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  API_PREFIX: Joi.string().default('api'),

  DATABASE_URL: Joi.string().required().messages({
    'any.required': 'DATABASE_URL is required (e.g. postgresql://user:pass@localhost:5432/ecommerce)',
  }),
  REDIS_URL: Joi.string().optional().default('redis://localhost:6379'),

  JWT_SECRET: Joi.string().optional().default('change-this-secret'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().optional().default('change-this-refresh-secret'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  RATE_LIMIT_TTL: Joi.number().default(60),
  RATE_LIMIT_MAX: Joi.number().default(100),

  LOG_LEVEL: Joi.string().valid('error', 'warn', 'log', 'debug', 'verbose').default('debug'),
});
