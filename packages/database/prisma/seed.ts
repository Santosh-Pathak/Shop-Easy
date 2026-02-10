/**
 * Seed script for e-commerce DB.
 * Run: pnpm run db:seed (from api or root)
 * Requires: DATABASE_URL set and migrations applied.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed categories (hierarchical)
  const electronics = await prisma.category.upsert({
    where: { slug: 'electronics' },
    create: { name: 'Electronics', slug: 'electronics' },
    update: {},
  });
  const clothing = await prisma.category.upsert({
    where: { slug: 'clothing' },
    create: { name: 'Clothing', slug: 'clothing' },
    update: {},
  });

  // Seed products with variants
  const product1 = await prisma.product.upsert({
    where: { slug: 'wireless-headphones-pro' },
    create: {
      name: 'Wireless Headphones Pro',
      slug: 'wireless-headphones-pro',
      description: 'High-quality wireless headphones with noise cancellation.',
      categoryId: electronics.id,
      brand: 'SoundMax',
      isActive: true,
      variants: {
        create: [
          { sku: 'WH-PRO-BLK', price: 129.99, comparePrice: 149.99, stock: 50 },
          { sku: 'WH-PRO-WHT', price: 129.99, comparePrice: 149.99, stock: 30 },
        ],
      },
    },
    update: {},
  });

  await prisma.product.upsert({
    where: { slug: 'cotton-tshirt-unisex' },
    create: {
      name: 'Cotton T-Shirt Unisex',
      slug: 'cotton-tshirt-unisex',
      description: 'Soft organic cotton t-shirt, unisex fit.',
      categoryId: clothing.id,
      brand: 'BasicWear',
      isActive: true,
      variants: {
        create: [
          { sku: 'CT-S-M', price: 19.99, stock: 100, attributes: { size: 'S' } },
          { sku: 'CT-M-M', price: 19.99, stock: 100, attributes: { size: 'M' } },
          { sku: 'CT-L-M', price: 19.99, stock: 80, attributes: { size: 'L' } },
        ],
      },
    },
    update: {},
  });

  console.log('Seeded categories:', electronics.slug, clothing.slug);
  console.log('Seeded products:', product1.slug, 'cotton-tshirt-unisex');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
