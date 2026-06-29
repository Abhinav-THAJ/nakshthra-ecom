import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const categoryLabels: Record<string, string> = {
  rings: 'Rings',
  earrings: 'Earrings',
  bracelets: 'Bracelets & Bangles',
  solitaires: 'Solitaires',
  mangalsutras: 'Mangalsutras',
  necklaces: 'Necklaces & Pendants',
  silver: 'Silver by Shaya',
  gifting: 'Gifting',
  collections: 'Collections',
  trending: 'Trending',
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  // Match categories
  const categories = Object.entries(categoryLabels)
    .filter(([, label]) => label.toLowerCase().includes(q.toLowerCase()))
    .map(([slug, label]) => ({ slug, label }))
    .slice(0, 4);

  // Match products by name
  const dbProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      name: { contains: q, mode: 'insensitive' },
    },
    select: { id: true, name: true, basePrice: true, categoryId: true },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  const products = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.basePrice),
    category: categoryLabels[p.categoryId ?? ''] ?? p.categoryId ?? '',
  }));

  return NextResponse.json({ products, categories });
}
