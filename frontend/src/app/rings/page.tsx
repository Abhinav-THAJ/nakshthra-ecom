import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function RingsPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'rings' },
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
      categoryName="Rings"
      categorySlug="rings"
      breadcrumb={['Jewellery']}
      subtitle="Explore our stunning collection of gold, platinum & diamond rings"
      bannerImage="/product_ring.png"
      products={products}
    />
  );
}
