import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function SilverPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'silver' },
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
      categoryName="Silver by Shaya"
      categorySlug="silver"
      breadcrumb={['Jewellery', 'Silver']}
      subtitle="Trendy silver jewellery for everyday wear — by Shaya, a CaratLane brand"
      bannerImage="/col_adaa.png"
      products={products}
    />
  );
}
