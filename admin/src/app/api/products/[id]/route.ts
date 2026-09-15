import { NextRequest, NextResponse } from 'next/server';
import { queryPostgres } from '@/lib/db';
import { requireAdmin } from '@/lib/admin-api';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const product = (await queryPostgres('SELECT * FROM products WHERE id=$1 OR slug=$1 LIMIT 1', [params.id]))[0];
  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }
    return NextResponse.json({ success: true, data: product });
  } catch { return NextResponse.json({ success: false, message: 'Failed to load product' }, { status: 500 }); }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const body = await req.json();
    const updated = (await queryPostgres(`UPDATE products SET name=$2, subtitle=$3, description=$4, category=$5, images=$6::jsonb, variants=$7::jsonb, "flavourNotes"=$8::jsonb, ingredients=$9::jsonb, stock=$10, featured=$11, "updatedAt"=NOW() WHERE id=$1 OR slug=$1 RETURNING *`, [params.id, body.name, body.subtitle || '', body.description || '', body.category || 'Signature Blends', JSON.stringify(body.images || []), JSON.stringify(body.variants || []), JSON.stringify(body.flavourNotes || []), JSON.stringify(body.ingredients || []), Boolean(body.stock), Boolean(body.featured)]))[0];
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const denied = requireAdmin(); if (denied) return denied;
  try {
    const deleted = await queryPostgres('DELETE FROM products WHERE id=$1 OR slug=$1 RETURNING id', [params.id]);
  if (!deleted.length) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }
    return NextResponse.json({
    success: true,
    message: 'Product deleted successfully'
    });
  } catch { return NextResponse.json({ success: false, message: 'Failed to remove product' }, { status: 500 }); }
}
