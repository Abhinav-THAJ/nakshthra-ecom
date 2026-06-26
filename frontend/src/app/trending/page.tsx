import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function TrendingPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'trending' },
    orderBy: { createdAt: 'desc' }
  });
  
  const products = dbProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    price: Number(p.basePrice),
    oldPrice: Number(p.basePrice) * 1.15,
    image: '/product_solitaire.png',
    rating: 4.8,
    reviews: 12,
    isNew: true,
    deliveryTime: 'Tomorrow'
  }));

  return (
    <CategoryPageTemplate
      categoryName="Trending Now"
      categorySlug="trending"
      breadcrumb={['Jewellery']}
      subtitle="The most loved, most wishlisted jewellery right now — don't miss out!"
      bannerImage="/hero_ashlesha.png"
      products={products}
    />
  );
}
