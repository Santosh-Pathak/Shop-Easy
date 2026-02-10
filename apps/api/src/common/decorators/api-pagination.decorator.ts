import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiPaginationQuery() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 100 }),
    ApiQuery({ name: 'sort', required: false, type: String, example: '-createdAt' }),
    ApiQuery({ name: 'fields', required: false, type: String, example: 'name,email' }),
    ApiQuery({ name: 'search', required: false, type: String, example: 'john' }),
    ApiQuery({
      name: 'searchFields',
      required: false,
      type: String,
      example: '["name","email"]',
    }),
  );
}
