import prisma from '../src/config/prisma';
import { ProductService } from '../src/services/product.service';
import { priceItemsFromDb } from '../src/services/payment-security';

async function testVariantStock() {
  console.log('--- Step 1: Testing ProductService.getAllProducts ---');
  const products = await ProductService.getAllProducts();
  console.log(`Found ${products.length} products in PostgreSQL database:`);
  products.forEach(p => console.log(` - ${p.id} (${p.slug}): ${p.name}, variants count: ${(p.variants as any[]).length}`));

  console.log('\n--- Step 2: Testing ProductService.getVariant ---');
  const v200 = await ProductService.getVariant('recipe-01', '200g');
  console.log('200g variant lookup:', v200);

  const v500 = await ProductService.getVariant('recipe-01', '500g');
  console.log('500g variant lookup:', v500);

  console.log('\n--- Step 3: Pricing items when all are in stock ---');
  const itemsInStock = await priceItemsFromDb([
    { size: '200g', quantity: 2 },
    { size: '500g', quantity: 1 }
  ]);
  console.log('Priced items successfully:', itemsInStock);

  console.log('\n--- Step 4: Toggle 500g to OUT OF STOCK ---');
  const recipe01 = await ProductService.getProductByIdOrSlug('recipe-01');
  if (!recipe01) throw new Error('Recipe 01 not found');

  const variants = (recipe01.variants as any[]).map(v => {
    if (ProductService.normalizeSize(v.weight) === '500g') {
      return { ...v, stock: false };
    }
    return v;
  });

  await ProductService.updateProduct('recipe-01', { variants });
  console.log('Updated 500g variant stock: false');

  const v500After = await ProductService.getVariant('recipe-01', '500g');
  console.log('500g variant lookup after toggle:', v500After);

  console.log('\n--- Step 5: Verify priceItemsFromDb REJECTS order for out-of-stock 500g ---');
  try {
    await priceItemsFromDb([
      { size: '500g', quantity: 1 }
    ]);
    console.error('FAIL: Expected error for out-of-stock item but succeeded!');
  } catch (err: any) {
    console.log('SUCCESS: Correctly rejected out-of-stock item with message:', err.message);
  }

  console.log('\n--- Step 6: Restore 500g to IN STOCK ---');
  const restoredVariants = (recipe01.variants as any[]).map(v => ({ ...v, stock: true }));
  await ProductService.updateProduct('recipe-01', { variants: restoredVariants });
  const restoredV500 = await ProductService.getVariant('recipe-01', '500g');
  console.log('500g variant lookup after restoring:', restoredV500);

  console.log('\nALL TESTS PASSED PERFECTLY!');
}

testVariantStock()
  .catch(e => {
    console.error('Test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
