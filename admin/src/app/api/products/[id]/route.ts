import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/products/${params.id}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });
    if (backendRes.ok) {
      const json = await backendRes.json();
      if (json.success) {
        return NextResponse.json(json);
      }
    }
  } catch {
    // fallback
  }

  const product = db.getProductById(params.id);
  if (!product) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();

    try {
      const backendRes = await fetch(`${BACKEND_URL}/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(5000),
      });
      if (backendRes.ok) {
        const json = await backendRes.json();
        if (json.success) {
          db.updateProduct(params.id, json.data);
          return NextResponse.json(json);
        }
      }
    } catch (e) {
      console.warn('Backend proxy update failed, updating local store', e);
    }

    const updated = db.updateProduct(params.id, body);
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
  try {
    await fetch(`${BACKEND_URL}/api/products/${params.id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // ignore
  }

  const success = db.deleteProduct(params.id);
  if (!success) {
    return NextResponse.json(
      { success: false, message: 'Product not found' },
      { status: 404 }
    );
  }
  return NextResponse.json({
    success: true,
    message: 'Product deleted successfully'
  });
}
