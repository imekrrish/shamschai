import prisma from '../config/prisma';

export interface ProductVariant {
  weight: string;
  price: number;
  sku: string;
  stock: boolean;
}

export class ProductService {
  static async getAllProducts() {
    const products = await prisma.product.findMany({
      orderBy: [{ featured: 'desc' }, { createdAt: 'asc' }],
    });
    return products;
  }

  static async getProductByIdOrSlug(identifier: string) {
    const slugAlias = identifier === 'masala-chai' || identifier === 'masala' ? 'recipe-01' : identifier;

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: slugAlias },
          { slug: slugAlias },
        ],
      },
    });

    return product;
  }

  static normalizeSize(size: string): string {
    // Match gram and kilogram labels, including the 2 kg pack.
    const cleaned = size.toLowerCase().replace(/\s+/g, '');
    return cleaned.replace(/^(\d+(?:\.\d+)?)kg$/, (_, kg: string) => `${Number(kg) * 1000}g`);
  }

  static async getVariant(slugOrId: string, size: string): Promise<{
    productName: string;
    variant: ProductVariant | null;
    inStock: boolean;
    price: number;
  } | null> {
    const product = await this.getProductByIdOrSlug(slugOrId);
    if (!product) return null;

    const variants = (product.variants as unknown as ProductVariant[]) || [];
    const targetNorm = this.normalizeSize(size);

    const variant = variants.find(v => this.normalizeSize(v.weight) === targetNorm);
    if (!variant) return null;

    return {
      productName: product.name,
      variant,
      inStock: product.stock && variant.stock,
      price: Number(variant.price),
    };
  }

  static async updateProduct(id: string, data: any) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!product) return null;

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        name: data.name ?? product.name,
        subtitle: data.subtitle ?? product.subtitle,
        description: data.description ?? product.description,
        category: data.category ?? product.category,
        variants: data.variants !== undefined ? data.variants : product.variants,
        images: data.images !== undefined ? data.images : product.images,
        flavourNotes: data.flavourNotes !== undefined ? data.flavourNotes : product.flavourNotes,
        ingredients: data.ingredients !== undefined ? data.ingredients : product.ingredients,
        brewInstructions: data.brewInstructions !== undefined ? data.brewInstructions : product.brewInstructions,
        stock: data.stock !== undefined ? Boolean(data.stock) : product.stock,
        featured: data.featured !== undefined ? Boolean(data.featured) : product.featured,
      },
    });

    return updated;
  }

  static async createProduct(data: any) {
    const slug = (data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    
    return prisma.product.create({
      data: {
        slug,
        name: data.name,
        subtitle: data.subtitle || '',
        description: data.description || '',
        category: data.category || 'Signature Blends',
        variants: data.variants || [],
        images: data.images || ['/assets/shams/products/product-lifestyle-v2.png'],
        flavourNotes: data.flavourNotes || [],
        ingredients: data.ingredients || [],
        brewInstructions: data.brewInstructions || [],
        stock: data.stock !== undefined ? Boolean(data.stock) : true,
        featured: data.featured !== undefined ? Boolean(data.featured) : false,
      },
    });
  }

  static async deleteProduct(id: string) {
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!product) return false;

    await prisma.product.delete({
      where: { id: product.id },
    });

    return true;
  }
}
