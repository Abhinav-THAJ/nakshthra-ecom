import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function EarringsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'earrings' },
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
      categoryName="Earrings"
      categorySlug="earrings"
      breadcrumb={['Jewellery']}
      subtitle="From studs to jhumkas — find your perfect pair"
      bannerImage="/product_earrings.png"
      products={products}
    />
  );
}
