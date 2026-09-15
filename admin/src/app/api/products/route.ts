import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return NextResponse.json({
          success: true,
          count: json.data.length,
          data: json.data,
        });
      }
    }
  } catch {
    // Backend unreachable, fallback to store
  }

  try {
    const products = db.getProducts();
    return NextResponse.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, subtitle, description, category, variants, flavourNotes, ingredients, stock, featured } = body;

    if (!name || !variants || variants.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product name and at least one pricing variant are required' },
        { status: 400 }
      );
    }

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        if (json.success) {
          db.createProduct(json.data);
          return NextResponse.json(json, { status: 201 });
        }
      }
    } catch (e) {
      console.warn('Backend proxy failed, creating in local store', e);
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const product = db.createProduct({
      slug,
      name,
      subtitle: subtitle || '',
      description: description || '',
      category: category || 'Signature Blends',
      images: body.images?.length ? body.images : ['/assets/shams/products/sachet-front.png'],
      variants,
      flavourNotes: flavourNotes || ['AROMATIC', 'RICH'],
      ingredients: ingredients || ['Whole Leaf Tea', 'Cardamom'],
      stock: stock ?? true,
      featured: featured ?? false
    });

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
