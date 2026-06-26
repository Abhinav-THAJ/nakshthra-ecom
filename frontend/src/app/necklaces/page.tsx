import CategoryPageTemplate from '@/components/CategoryPageTemplate';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function NecklacesPage() {
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, categoryId: 'necklaces' },
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
      categoryName="Necklaces & Pendants"
      categorySlug="necklaces"
      breadcrumb={['Jewellery']}
      subtitle="From delicate pendants to statement chokers — stunning necklaces for every occasion"
      bannerImage="/col_kaashika.png"
      products={products}
    />
  );
}
