import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { queryPostgres } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-api';

export const dynamic = 'force-dynamic';

export async function GET() {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const products = await queryPostgres('SELECT * FROM products ORDER BY featured DESC, "createdAt" ASC');
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const body = await req.json();
    const { name, subtitle, description, category, variants, flavourNotes, ingredients, stock, featured } = body;

    if (!name || !variants || variants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product name and at least one pricing variant are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = (await queryPostgres(`INSERT INTO products (id, slug, name, subtitle, description, category, images, variants, "flavourNotes", ingredients, stock, featured)
      VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,$11,$12) RETURNING *`,
      [randomUUID(), slug, name, subtitle || '', description || '', category || 'Signature Blends', JSON.stringify(body.images || ['/assets/shams/products/product-lifestyle-v2.png']), JSON.stringify(variants), JSON.stringify(flavourNotes || []), JSON.stringify(ingredients || []), stock ?? true, featured ?? false]))[0];

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
