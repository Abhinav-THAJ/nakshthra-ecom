import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function MangalsutrasPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'mangalsutras' },
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
      categoryName="Mangalsutras"
      categorySlug="mangalsutras"
      breadcrumb={['Jewellery']}
      subtitle="Modern and traditional mangalsutras in gold, diamond & platinum for every bride"
      bannerImage="/product_mangalsutra.png"
      products={products}
    />
  );
}
